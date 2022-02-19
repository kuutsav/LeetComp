# LeetComp

[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)
[![Checked with mypy](http://www.mypy-lang.org/static/mypy_badge.svg)](http://mypy-lang.org/)

Analysing compensations mentioned on the Leetcode forums (https://kuutsav.github.io/LeetComp).

> Note: only supports posts from `India` at the moment

---

## Setup

```bash
# Install poetry following the instructions at https://python-poetry.org/docs or use pip
$ pip install poetry

# Setup the project (from the project root directory)
$ poetry install

# To run the commands for updating the data, go into the venv created by poetry
$ poetry shell

# Tested on python 3.9.7
```

## Updating data

#### 1. Fetching metadata for compensation posts

```python
>>> from leetcomp.services import get_posts_meta_info
>>> get_posts_meta_info()

2022-02-08 | INFO | get_posts_meta_info:153 - Found 6628 posts(442 pages)
2022-02-08 | INFO | get_posts_meta_info:162 - 32 posts synced, skipping the rest ...

# stores in Posts.db under the parent folder
```

#### 2. Updating Posts with the user content

```python
>>> from leetcomp.services import update_posts_content_info
>>> update_posts_content_info()

2022-02-09 | INFO | update_posts_content_info:177 - Found 32 post ids without content, syncing ...
2022-02-09 | INFO | update_posts_content_info:189 - PostID 1757667;   0/32 posts done
2022-02-09 | INFO | update_posts_content_info:189 - PostID 1757212;  10/32 posts done
2022-02-09 | INFO | update_posts_content_info:189 - PostID 1755933;  20/32 posts done
2022-02-09 | INFO | update_posts_content_info:189 - PostID 1754969;  30/32 posts done
2022-02-09 | INFO | update_posts_content_info:190 - All post contents synced

# updates Posts.db
```

#### 3. Parsing results for the ui

```python
>>> from leetcomp.ner_heuristic import parse_posts_and_save_tagged_info
>>> parse_posts_and_save_tagged_info()

2022-02-09 | INFO | parse_posts_and_save_tagged_info:191 - Total posts: 6663
2022-02-09 | INFO | parse_posts_and_save_tagged_info:192 - N posts dropped (missing data): 1380
2022-02-09 | INFO | _report:125 - Posts with all the info: 5294
2022-02-09 | INFO | _report:126 - Posts with Location: 4981
2022-02-09 | INFO | _report:127 - Posts with YOE: 5204
2022-02-09 | INFO | _report:128 - Posts from India: 3764
2022-02-09 | INFO | _filter_invalid_salaries:154 - Dropped 221/3764 records due to invalid pay

# updates js/data.js
```

#### 4. Updating the inverted index

```python
>>> from leetcomp.inverted_index import build_inverted_index
>>> build_inverted_index()

2022-02-09 | INFO | __main__:build_inverted_index:58 - Keeping 1266/1266 tokens

# updates js/data.js
```

## Roadmap

- Automate data refresh using github actions
- Standardize `Company` and `Role`
- Index `Company` and `Role` separately
- Improve page nav
- Global data support
