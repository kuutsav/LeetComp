# LeetComp

Analyzing compensations mentioned on the Leetcode forums.

## Fetching metadata for compensation posts (Posts)

```python
$ ipython

Python 3.8.5 (default, Sep  4 2020, 02:22:02)
Type 'copyright', 'credits' or 'license' for more information
IPython 7.19.0 -- An enhanced Interactive Python. Type '?' for help.

In [1]: from leetcomp.services import get_and_save_all_comp_posts

In [2]: get_and_save_all_comp_posts()
2022-01-28 | INFO | get_and_save_all_comp_posts:122 - Page 0; 15 posts; slept for 0.0s
2022-01-28 | INFO | get_and_save_all_comp_posts:126 - ** Found 6373 posts(399 pages) ***
Page 399: 100%|█████████████████████████| 399/399 [00:01<00:00, 208.78it/s, slept_for=0]
```

## Updating Posts with the user content (text)
