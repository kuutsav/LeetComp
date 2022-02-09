# LeetComp

Analyzing compensations mentioned on the Leetcode forums.

---

## Updating data (stores in `Posts.db` under the parent folder)

### Fetching metadata for compensation posts

```python
>>> from leetcomp.services import get_posts_meta_info
>>> get_posts_meta_info()
2022-02-08 13:49:26.219 | INFO     | __main__:get_posts_meta_info:153 - Found 6602 posts(441 pages)
2022-02-08 13:49:37.677 | INFO     | __main__:get_posts_meta_info:162 - 49 posts synced, skipping the rest ...
```

### Updating Posts with the user content

```python
>>> from leetcomp.services import update_posts_content_info
>>> update_posts_content_info()

2022-02-09 13:46 | INFO     | get_posts_meta_info:153 - Found 6628 posts(442 pages)
2022-02-09 13:46 | INFO     | get_posts_meta_info:162 - 32 posts synced, skipping the rest ...
2022-02-09 13:46 | INFO     | update_posts_content_info:177 - Found 32 post ids without content, syncing ...
2022-02-09 13:46 | INFO     | update_posts_content_info:189 - PostID 1757667;   0/32 posts done
2022-02-09 13:46 | INFO     | update_posts_content_info:189 - PostID 1757212;  10/32 posts done
2022-02-09 13:46 | INFO     | update_posts_content_info:189 - PostID 1755933;  20/32 posts done
2022-02-09 13:47 | INFO     | update_posts_content_info:189 - PostID 1754969;  30/32 posts done
2022-02-09 13:47 | INFO     | update_posts_content_info:190 - All posts synced
```

## Parsing results for the ui

```python
>>> from leetcomp.ner_heuristic import parse_posts_and_save_tagged_info
>>> parse_posts_and_save_tagged_info()

2022-02-09 13:49 | INFO     | parse_posts_and_save_tagged_info:191 - Total posts: 6663; N posts dropped: 1380
2022-02-09 13:49 | INFO     | _report:125 - Posts with all the info: 5294
2022-02-09 13:49 | INFO     | _report:126 - Posts with Location: 4981
2022-02-09 13:49 | INFO     | _report:127 - Posts with YOE: 5204
2022-02-09 13:49 | INFO     | _report:128 - Posts from India: 3764
2022-02-09 13:49 | INFO     | _filter_invalid_salaries:154 - Dropped 221/3764 records due to invalid pay
```
