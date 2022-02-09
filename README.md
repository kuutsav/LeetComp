# [LeetComp](https://kuutsav.github.io/LeetComp/)

Analyzing compensations mentioned on the Leetcode forums.

> only supports posts from `India` at the moment

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

## Updating data (stores in `Posts.db` under the parent folder)

#### 1. Fetching metadata for compensation posts

```python
>>> from leetcomp.services import get_posts_meta_info
>>> get_posts_meta_info()

2022-02-08 | INFO | get_posts_meta_info:153 - Found 6628 posts(442 pages)
2022-02-08 | INFO | get_posts_meta_info:162 - 32 posts synced, skipping the rest ...
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
```

#### 4. Updating the inverted index

```python
>>> from leetcomp.inverted_index import build_inverted_index
>>> build_inverted_index()

2022-02-09 | INFO | __main__:build_inverted_index:58 - Keeping 1266/1266 tokens
```

## Roadmap

- Standardize `Company` and `Role`
- Add `Total Comp`
- Index `Company` and `Role` separately
- Add more charts, for e.g. chart to salary boxplots by yoe bins
- Add data sorting capabilities
- Trending companies
- Improve page nav
- Global data support
