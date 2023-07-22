from pathlib import Path


LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql"
MAX_POSTS = 5000

DATA_DIR = Path("data")
POST_IDS_F = DATA_DIR / "post_ids.jsonl"
POST_CONTENTS_F = DATA_DIR / "post_contents.jsonl"
