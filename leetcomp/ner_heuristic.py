from datetime import datetime
import json
import re
from typing import Any, Dict, List, Pattern, Tuple

from loguru import logger

from leetcomp.models import Posts
from leetcomp.utils import session_scope


LABEL_SPECIFICATION = {
    "RE_COMPANY": re.compile(r"\*?\*?company\s?\*?\*?[:-]-?\s?\*?\*?(?P<label>[&\w\.\-\(\)\,\/\` ]+)"),
    "RE_ROLE": re.compile(r"title\s?(/level)?\s?[:-]-?\s?(?P<label>[&\w\.\-\/\+\#\,\(\)\` ]+)"),
    "RE_YOE": re.compile(
        r"((yrs|years\sof\s)(experience|exp)|yoe|(\\n|\btotal\s)experience)\s?[:-]-?\s?(?P<label>[\w\.\+\~\-\,\/\` ]+)"
    ),
    "RE_YOE_CLEAN": re.compile(r"(\d{1,2}(\.\d{1,2})?)\s?(yrs|years?)?(\s?(\d{1,2})\s?(months))?"),
    "RE_SALARY": re.compile(r"(salary|base|base pay)\s?[:-]-?\s?(?P<label>[\w\,\₹\$\.\/\-\(\)\`\\u20b9&#8377;\~ ]+)"),
    "RE_LOCATION": re.compile(r"location\s?[:-]-?\s?(?P<label>[\w\,\` ]+)"),
    "RE_SALARY_TOTAL": re.compile(
        r"\ntot?al (1st year\s)?(comp[e|a]nsation|comp|ctc)(\sfor 1st year)?(\s?\(\s?(salary|base).+?\))?(?P<label>.+)"
    ),
}

LOCATION_SPECIFICATION = {}

with open("data/locations.json", "r") as f:
    location_data = json.load(f)

for country, cities in location_data.items():
    if cities:
        cities_regex = re.compile(r"[\(\s\,\/\|](?P<city>" + "|".join(cities.keys()) + ")")
    else:
        cities_regex = ""  # type: ignore
    LOCATION_SPECIFICATION[country] = cities_regex


def _preprocess_text(content: str) -> str:
    content = content.lower()
    content = re.sub(r"[\*\t\`]", " ", content)
    content = re.sub(r"\s+", " ", content).strip()
    content = content.split("\n")[0]
    return content


def _find_matches(regex_pattern: Pattern[str], content: str) -> List[str]:
    matches = []
    for match in re.finditer(regex_pattern, content):
        matched_text = match.group("label").strip()
        formatted_text = " ".join([txt.capitalize() for txt in matched_text.split(" ")])
        # matches.append((match.start(), match.end(), formatted_text))
        matches.append(formatted_text)
    return matches


def _get_info_as_flat_list(
    companies: List[str], titles: List[str], yoes: List[str], salaries: List[str], info: Dict[str, Any]
) -> List[Dict[str, Any]]:
    n_info = min([len(companies), len(titles), len(yoes), len(salaries)])
    expanded_info = []
    for _ in range(n_info):
        _info = info.copy()
        _info["company"] = companies[0]
        _info["role"] = titles[0]
        _info["yoe"] = yoes[0]
        _info["salary"] = salaries[0]
        expanded_info.append(_info)
    return expanded_info


def _get_clean_location(title: str, content: str) -> Tuple[str, str]:
    for country, cities_regex in LOCATION_SPECIFICATION.items():
        if cities_regex:
            for match in re.finditer(cities_regex, title):
                city = match.group("city")
                return (city, country)
    for match in re.finditer(LABEL_SPECIFICATION["RE_LOCATION"], content):
        location = "," + match.group("label")
        for country, cities_regex in LOCATION_SPECIFICATION.items():
            if cities_regex:
                for match in re.finditer(cities_regex, location):
                    city = match.group("city")
                    return (city, country)
        for country in LOCATION_SPECIFICATION.keys():
            if re.findall(r"[\(\s\,\/\|]" + country, location):
                return ("", country)
    return ("", "")


def _get_clean_yoe(yoe: str, clean_title: str, role: str) -> float:
    if yoe in {"fresher", "new grad", "n/a"}:
        return 0.0
    if not yoe:
        if "intern" in clean_title or "intern" in role:
            return 0.0
    for m in re.finditer(LABEL_SPECIFICATION["RE_YOE_CLEAN"], yoe):
        groups = m.groups()
        return float(groups[0]) + (int(groups[4]) / 12 if groups[4] else 0)
    return -1.0


def parse_posts_and_save_tagged_info() -> None:
    # fmt: off
    raw_info = []; n_dropped = 0; total_posts = 0; content = {}
    with session_scope() as session:
        for r in session.query(Posts).all():
            total_posts += 1
            info = {"id": r.id, "title": r.title, "voteCount": r.voteCount, "viewCount": r.viewCount,
                    "date": datetime.fromtimestamp(int(r.creationDate)).strftime("%Y-%m-%d")}
            clean_content = _preprocess_text(r.content)
            content[r.id] = clean_content
            companies = _find_matches(LABEL_SPECIFICATION["RE_COMPANY"], clean_content)
            roles = _find_matches(LABEL_SPECIFICATION["RE_ROLE"], clean_content)
            yoes = _find_matches(LABEL_SPECIFICATION["RE_YOE"], clean_content)
            salaries = _find_matches(LABEL_SPECIFICATION["RE_SALARY"], clean_content)
            if companies and roles and yoes and salaries:
                expanded_info = _get_info_as_flat_list(companies, roles, yoes, salaries, info)
                location = _get_clean_location(_preprocess_text(r.title), clean_content)
                if location[1]:
                    for info in expanded_info:
                        info["city"] = location[0]; info["country"] = location[1]
                for info in expanded_info:
                    info["cleanYoe"] = _get_clean_yoe(
                        info["yoe"].lower(), _preprocess_text(r.title).lower(), info["role"].lower()
                    )
                raw_info += expanded_info
            else:
                n_dropped += 1
    # fmt: on
    raw_info = sorted(raw_info, key=lambda x: x["date"], reverse=True)
    with open("posts_info.json", "w") as f:
        json.dump(raw_info, f)

    logger.info(f"Total posts: {total_posts}; N posts dropped: {n_dropped}")
    logger.info(f"Posts with all the info: {len(raw_info)}")
    logger.info(f"Posts with location info: {len([p for p in raw_info if 'city' in p])}")
    logger.info(f"Posts with yoe info: {len([p for p in raw_info if p['cleanYoe'] >= 0])}")


if __name__ == "__main__":
    parse_posts_and_save_tagged_info()
