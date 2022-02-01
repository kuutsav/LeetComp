import json
import math
import os
import random
import requests
import time
from typing import Any, Dict, List, Set, Tuple, Union

from loguru import logger
from tqdm import trange

from .models import Posts
from .queries import COMP_POSTS_DATA_QUERY, COMP_POST_CONTENT_DATA_QUERY
from .utils import get_today, session_scope


CACHE_DIR = ".cache"
DATA_TYPE = Tuple[List[Dict[str, Union[int, str]]], int, bool]
LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql"


# cache dir; removes the data cached before today's date
if not os.path.exists(CACHE_DIR):
    os.mkdir(CACHE_DIR)
else:
    today = get_today()
    for f in os.listdir(CACHE_DIR):
        if not f.startswith(today) and not f.startswith("post_id"):
            logger.info(f"Removing old cache {f}")
            os.remove(f"{CACHE_DIR}/{f}")


def _get_post_ids_in_db() -> Set[str]:
    with session_scope() as session:
        return set([r.id for r in session.query(Posts.id).all()])


def _validate_comp_posts_response(response: requests.Response) -> None:
    assert response.status_code == 200
    response_json = response.json()
    assert "data" in response_json, f"`data` not in {response_json}"
    assert (
        "categoryTopicList" in response_json["data"]
    ), f"`categoryTopicList` not in {response_json['data']}"


def _validate_post_content_response(response: requests.Response) -> None:
    assert response.status_code == 200
    response_json = response.json()
    assert "data" in response_json, f"`data` not in {response_json}"
    assert "topic" in response_json["data"], f"`topic` not in {response_json['data']}"
    assert (
        "post" in response_json["data"]["topic"]
    ), f"`post` not in {response_json['data']['topic']}"
    assert (
        "content" in response_json["data"]["topic"]["post"]
    ), f"`post` not in {response_json['data']['topic']['post']}"


def _get_all_comp_posts(query: str, posts_cache_path: str) -> Tuple[Dict[str, Any], bool]:
    if os.path.exists(posts_cache_path):
        with open(posts_cache_path, "r") as f:
            posts_data = json.load(f)
        cache_is_used = True
    else:
        response = requests.post(LEETCODE_GRAPHQL_URL, json=query)
        _validate_comp_posts_response(response)
        with open(posts_cache_path, "w") as f:
            json.dump(response.json(), f)
        posts_data = response.json()
        cache_is_used = False

    return posts_data, cache_is_used


def _get_content_from_post_id(query: str, post_content_cache_path: str) -> str:
    if os.path.exists(post_content_cache_path):
        with open(post_content_cache_path, "r") as f:
            post_content = json.load(f)
        cache_is_used = True
    else:
        response = requests.post(LEETCODE_GRAPHQL_URL, json=query)
        _validate_post_content_response(response)
        with open(post_content_cache_path, "w") as f:
            json.dump(response.json(), f)
        post_content = response.json()
        cache_is_used = False

    return post_content, cache_is_used


def _get_info_from_posts(skip: int = 0, first: int = 15) -> DATA_TYPE:
    COMP_POSTS_DATA_QUERY["variables"]["skip"] = skip
    COMP_POSTS_DATA_QUERY["variables"]["first"] = first
    posts_cache_path = f"{CACHE_DIR}/{get_today()}_posts_data_{skip}_{first}.json"

    data, cache_is_used = _get_all_comp_posts(COMP_POSTS_DATA_QUERY, posts_cache_path)
    data = data["data"]["categoryTopicList"]
    if not data or "edges" not in data:
        logger.warning(f"Missing data for skip {skip}, first {first}")
        return [], 0, False

    filtered_data = [
        {
            "id": d["node"]["id"],
            "title": d["node"]["title"],
            "voteCount": d["node"]["post"]["voteCount"],
            "commentCount": d["node"]["commentCount"],
            "viewCount": d["node"]["viewCount"],
            "creationDate": str(d["node"]["post"]["creationDate"]),
        }
        for d in data["edges"]
    ]

    return filtered_data, data["totalNum"], cache_is_used


def _get_content_from_post(post_id: str) -> str:
    COMP_POST_CONTENT_DATA_QUERY["variables"]["topicId"] = int(post_id)
    post_content_cache_path = f"{CACHE_DIR}/post_id_{post_id}.json"

    data, cache_is_used = _get_content_from_post_id(
        COMP_POST_CONTENT_DATA_QUERY, post_content_cache_path
    )
    data = data["data"]["topic"]["post"]["content"]
    if not data:
        logger.warning(f"Missing content for post_id {post_id}")
        return "", False

    return data, cache_is_used


def _get_new_posts(
    data: DATA_TYPE, old_posts: Set[str]
) -> List[Dict[str, Union[int, str]]]:
    return [d for d in data if d["id"] not in old_posts]


def _update_old_post_ids(old_posts: Set[str], new_data: DATA_TYPE):
    for d in new_data:
        old_posts.add(d["id"])


def _get_post_ids_without_content() -> List[str]:
    with session_scope() as session:
        return [r.id for r in session.query(Posts.id).filter(Posts.content == "").all()]


def get_posts_meta_info() -> None:
    n_posts_per_req = 15
    start = 0
    old_post_ids = _get_post_ids_in_db()
    try:
        # fetching the first page separately to get totalNum pages
        data, n_posts, cache_is_used = _get_info_from_posts(start, n_posts_per_req)
        new_data = _get_new_posts(data, old_post_ids)
        with session_scope() as session:
            session.add_all([Posts(**d) for d in new_data])
            _update_old_post_ids(old_post_ids, new_data)
        n_pages = math.ceil(n_posts / n_posts_per_req)
        logger.info(f"Found {n_posts} posts({n_pages} pages)")
        # fetching the rest of the pages
        with trange(1, n_pages + 1) as t:
            for page_no in t:
                sleep_for = 0 if cache_is_used else random.random() + 0.5
                time.sleep(sleep_for)
                start += n_posts_per_req
                data, _, cache_is_used = _get_info_from_posts(start, n_posts_per_req)
                new_data = _get_new_posts(data, old_post_ids)
                with session_scope() as session:
                    session.add_all([Posts(**d) for d in new_data])
                    _update_old_post_ids(old_post_ids, new_data)
                t.set_description(f"Page {page_no}")
                t.set_postfix(slept_for=sleep_for)
    except KeyboardInterrupt:
        session.commit()
        session.close()


def update_posts_content_info() -> None:
    post_ids_without_content = _get_post_ids_without_content()
    try:
        cache_is_used = False
        with trange(len(post_ids_without_content)) as t:
            for ix in t:
                post_id = post_ids_without_content[ix]
                sleep_for = 0 if cache_is_used else random.random() + 0.5
                time.sleep(sleep_for)
                post_content, cache_is_used = _get_content_from_post(post_id)
                with session_scope() as session:
                    post = session.query(Posts).filter(Posts.id == post_id).first()
                    post.content = post_content
                t.set_description(f"PostId {post_id}")
                t.set_postfix(sleep_for=sleep_for)
    except KeyboardInterrupt:
        session.commit()
        session.close()
