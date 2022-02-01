# LeetComp

Analyzing compensations mentioned on the Leetcode forums.

---

## Fetching metadata for compensation posts (Posts)

```python
>>> from leetcomp.services import get_posts_meta_info
>>> get_posts_meta_info()
2022-02-01 19:16:00 | INFO | leetcomp.services:get_posts_meta_info:112 - Found 6462 posts(431 pages)
Page 430: 100%|██████████████████████████████████| 430/431 [20:18<00:02,  2.66s/it, slept_for=0.811]
```

## Updating Posts with the user content (text)
