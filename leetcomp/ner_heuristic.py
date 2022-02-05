from datetime import datetime
import json
import re
from typing import List, Pattern, Tuple

from loguru import logger

from leetcomp.models import Posts
from leetcomp.utils import session_scope


LABEL_SPECIFICATION = {
    "RE_COMPANY": re.compile(r"\*?\*?company\s?\*?\*?[:-]-?\s?\*?\*?(?P<label>[&\w\.\-\(\)\,\/ ]+)"),
    "RE_TITLE": re.compile(r"title\s?(/level)?\s?[:-]-?\s?(?P<label>[&\w\.\-\/\+\#\,\(\) ]+)"),
    "RE_YOE": re.compile(
        r"((yrs|years\sof\s)(experience|exp)|yoe|(\\n|\btotal\s)experience)\s?[:-]-?\s?(?P<label>[\w\.\+\~\-\,\/ ]+)"
    ),
    "RE_SALARY": re.compile(r"(salary|base|base pay)\s?[:-]-?\s?(?P<label>[\w\,\₹\$\.\/\- ]+)\s"),
    "RE_LOCATION": re.compile(r"\slocation\s?[:-]-?\s?(?P<label>[\w\, ]+)"),
    "RE_SALARY_TOTAL": re.compile(
        r"\ntot?al (1st year\s)?(comp[e|a]nsation|comp|ctc)(\sfor 1st year)?(\s?\(\s?(salary|base).+?\))?(?P<label>.+)"
    ),
}


def _preprocess_context_text(content: str) -> str:
    content = content.lower()
    content = re.sub(r"[\*\t]", " ", content)
    content = re.sub(r"\s+", " ", content).strip()
    return content


def _find_matches(regex_pattern: Pattern[str], content: str) -> List[Tuple[int, int, str]]:
    matches = []
    for match in re.finditer(regex_pattern, content):
        matched_text = match.group("label")
        formatted_text = " ".join([txt.capitalize() for txt in matched_text.split(" ")])
        matches.append((match.start(), match.end(), formatted_text))
    return matches


def parse_posts_and_save_tagged_info() -> None:
    raw_info = []
    n_dropped = 0
    total_posts = 0
    with session_scope() as session:
        for r in session.query(Posts).all():
            total_posts += 1
            # fmt: off
            info = {"id": r.id, "title": r.title, "voteCount": r.voteCount, "viewCount": r.viewCount,
                    "date": datetime.fromtimestamp(int(r.creationDate)).strftime("%Y-%m-%d")}
            # fmt: on
            clean_content = _preprocess_context_text(r.content)
            companies = _find_matches(LABEL_SPECIFICATION["RE_COMPANY"], clean_content)
            titles = _find_matches(LABEL_SPECIFICATION["RE_TITLE"], clean_content)
            yoe = _find_matches(LABEL_SPECIFICATION["RE_YOE"], clean_content)
            if companies and titles and yoe:
                info["companies"] = companies
                info["titles"] = titles
                info["yoe"] = yoe
                raw_info.append(info)
            else:
                n_dropped += 1

    raw_info = sorted(raw_info, key=lambda x: x["date"], reverse=True)
    with open("posts_info.json", "w") as f:
        json.dump(raw_info, f)

    logger.info(f"Total posts: {total_posts}; N posts dropped: {n_dropped}")
    logger.info(f"Posts with companies: {len([r for r in raw_info if r['companies']])}")
    logger.info(f"Posts with titles: {len([r for r in raw_info if r['titles']])}")
    logger.info(f"Posts with yoe: {len([r for r in raw_info if r['yoe']])}")


if __name__ == "__main__":
    parse_posts_and_save_tagged_info()
