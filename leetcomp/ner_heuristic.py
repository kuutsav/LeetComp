from collections import Counter
import re

from .models import Posts
from .utils import session_scope


LABEL_SPECIFICATION = {
    "RE_COMPANY": re.compile(r"\*?\*?company\s?\*?\*?[:-]-?\s?\*?\*?(?P<label>[&\w\.\-\(\)\,\/ ]+)"),
    "RE_TITLE": re.compile(r"title\s?(/level)?\s?[:-]-?\s?(?P<label>[&\w\.\-\/\+\# ]+)"),
    "RE_YOE": re.compile(r"((yrs|years\sof\s)(experience|exp)|yoe)\s?[:-]-?\s?(?P<label>[\w\.\+\~\-\, ]+)"),
    "RE_SALARY": re.compile(r"(salary|base|base pay)\s?[:-]-?\s?(?P<label>[\w\,\₹\$\.\/\- ]+)\s"),
    "RE_LOCATION": re.compile(r"\slocation\s?[:-]-?\s?(?P<label>[\w\, ]+)"),
    "RE_SALARY_TOTAL": re.compile(
        r"\ntot?al (1st year\s)?(comp[e|a]nsation|comp|ctc)(\sfor 1st year)?(\s?\(\s?(salary|base).+?\))?(?P<label>.+)"
    ),
}


def label_entities_in_post_contents() -> None:
    companies = []
    with session_scope() as session:
        n = 0
        fail = 0
        for r in session.query(Posts).all():
            content = r.content.lower()
            content = re.sub(r"[\*\t]", " ", content)
            content = re.sub(r"\s+", " ", content).strip()
            company = re.findall(LABEL_SPECIFICATION["RE_COMPANY"], content)
            if company:
                companies += [c.strip() for c in company]
                n += 1
            else:
                fail += 1
    print(n, fail)
    cc = Counter(companies)
    print(len(cc))
    for c, n in cc.most_common(len(cc)):
        if n > 10:
            print(c, n)
