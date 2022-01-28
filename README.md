# LeetComp

Analyzing compensations mentioned on the Leetcode forums.

## Fetching metadata for compensation posts (Posts)

```python
In [1]: from leetcomp.services import get_and_save_all_comp_posts

In [2]: get_and_save_all_comp_posts()
INFO | get_and_save_all_comp_posts:122 - Page 0; 15 posts; slept for 0.0s
INFO | get_and_save_all_comp_posts:126 - ** Found 6373 posts(425 pages) ***
Page 118:  28%|██████                 | 118/425 [03:50<12:36,  2.47s/it, slept_for=1.31]
```

## Updating Posts with the user content (text)
