import argparse
import requests
from time import sleep, time

from leetcomp.config import LEETCODE_GRAPHQL_URL, MAX_POSTS, POST_CONTENTS_F, POST_IDS_F
from leetcomp.queries import COMP_POST_CONTENT_DATA_QUERY, COMP_POSTS_DATA_QUERY
from leetcomp.utils import dump_jsonl, load_jsonl, print_info, print_warning


def info_from_posts_data(data: dict) -> list[dict]:
    return [
        {
            "id": int(d["node"]["id"]),
            "title": d["node"]["title"],
            "voteCount": d["node"]["post"]["voteCount"],
            "commentCount": d["node"]["commentCount"],
            "viewCount": d["node"]["viewCount"],
            "creationDate": str(d["node"]["post"]["creationDate"]),
        }
        for d in data["categoryTopicList"]["edges"]
    ]


def get_post_ids(n_posts: int = MAX_POSTS, sleep_per_call: int = 1) -> list[int]:
    post_ids, skip, first = [], 0, 50
    while skip < n_posts:
        COMP_POSTS_DATA_QUERY["variables"]["skip"] = skip
        COMP_POSTS_DATA_QUERY["variables"]["first"] = first
        st = time()
        r = requests.get(LEETCODE_GRAPHQL_URL, json=COMP_POSTS_DATA_QUERY)
        print_info(f"Records {skip}-{skip+first}; {time()-st:.3f}s")
        if r.status_code == 200:
            info = info_from_posts_data(r.json()["data"])
            if skip == 0:
                info = info[1:]
            post_ids += info
        else:
            print_warning("HTTP " + r.status_code)
        skip += first
        sleep(sleep_per_call)

    dump_jsonl(post_ids[::-1], POST_IDS_F)

    return post_ids


def get_post_contents(post_ids: list[int], sleep_per_call: int = 1) -> list[dict[str, str]]:
    post_contents = []
    for post_id in post_ids:
        COMP_POST_CONTENT_DATA_QUERY["variables"]["topicId"] = post_id
        st = time()
        r = requests.get(LEETCODE_GRAPHQL_URL, json=COMP_POST_CONTENT_DATA_QUERY)
        print_info(f"Post id {post_id}; {time()-st:.3f}s")
        if r.status_code == 200:
            try:
                post_contents.append({"id": post_id, "content": r.json()["data"]["topic"]["post"]["content"]})
            except:
                pass
        else:
            print_warning("HTTP " + r.status_code)

        dump_jsonl([post_contents[-1]], POST_CONTENTS_F)
        sleep(sleep_per_call)

    return post_contents


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--sleep_per_call",
        type=int,
        default=1,
        help="Seconds to sleep between each call to the Leetcode APIs. Let's be polite :) ",
    )
    args = parser.parse_args()

    # All the post ids
    post_ids = [d["id"] for d in load_jsonl(POST_IDS_F)]

    # Post ids for which we have the contents already
    post_ids_with_contents = set([d["id"] for d in load_jsonl(POST_CONTENTS_F)])
    print_info(f"Post ids with contents: {len(post_ids_with_contents)}")

    post_ids_without_content = [post_id for post_id in post_ids if post_id not in post_ids_with_contents]
    print_info(f"Post ids without contents: {len(post_ids_without_content)}")

    get_post_contents(post_ids_without_content, sleep_per_call=args.sleep_per_call)
