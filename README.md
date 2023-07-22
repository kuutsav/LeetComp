# LeetComp

![example workflow](https://github.com/kuutsav/LeetComp/actions/workflows/test-suite.yml/badge.svg)
[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)
[![Checked with mypy](http://www.mypy-lang.org/static/mypy_badge.svg)](http://mypy-lang.org/)


Analysing compensations mentioned on the Leetcode forums.

> Note: Only supports posts from `India` at the moment.

LeetComp works by regularly fetching new posts from the [leetcode compensations page](https://leetcode.com/discuss/compensation). The `leetcomp` directory contains python scripts to fetch and parse new posts. New posts are updated in `posts.db`, a SQLite database. The parsed posts are updated directly into `js/data.js` which helps power the content in `index.html`.

IMO, this tool can be best used to figure out the "software developer salaries in india" across various experience levels.

---
