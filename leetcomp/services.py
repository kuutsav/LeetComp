from contextlib import contextmanager
import json
import math
import os
import random
import requests
import time
from typing import Any, Dict, List, Set, Tuple, Union

from loguru import logger
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from tqdm import trange

from .models import Base, Posts
from .queries import COMP_POSTS_DATA_QUERY
from .utils import get_today

CACHE_DIR = ".cache"
LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql"
DATA_TYPE = Tuple[List[Dict[str, Union[int, str]]], int, bool]

# sqlite engine
engine = create_engine("sqlite:///posts.db")
Session = sessionmaker()
Session.configure(bind=engine)
Base.metadata.create_all(engine)

# cache dir; removes the data cached before today's date
if not os.path.exists(CACHE_DIR):
    os.mkdir(CACHE_DIR)
else:
    today = get_today()
    for f in os.listdir(CACHE_DIR):
        if not f.startswith(today):
            logger.info(f"Removing old cache {f}")
            os.remove(f"{CACHE_DIR}/{f}")


@contextmanager
def session_scope() -> sessionmaker:
    session = Session()
    try:
        yield session
        session.commit()
    except:
        session.rollback()
        raise
    finally:
        session.close()


def _get_post_ids_in_db() -> Set[str]:
    with session_scope() as session:
        return set([r[0] for r in session.query(Posts.id).all()])


def _validate_comp_posts_response(response: requests.Response) -> None:
    assert response.status_code == 200
    response_json = response.json()
    assert "data" in response_json, f"`data` not in {response_json}"
    assert (
        "categoryTopicList" in response_json["data"]
    ), f"`categoryTopicList` not in {response_json['data']}"


def _get_all_comp_posts(query: str, posts_cache_dir: str) -> Tuple[Dict[str, Any], bool]:
    if os.path.exists(posts_cache_dir):
        with open(posts_cache_dir, "r") as f:
            posts_data = json.load(f)
        used_cache = True
    else:
        response = requests.post(LEETCODE_GRAPHQL_URL, json=query)
        _validate_comp_posts_response(response)
        with open(posts_cache_dir, "w") as f:
            json.dump(response.json(), f)
        posts_data = response.json()
        used_cache = False

    return posts_data, used_cache


def _get_filterted_posts(skip: int = 0, first: int = 15) -> DATA_TYPE:
    COMP_POSTS_DATA_QUERY["variables"]["skip"] = skip
    COMP_POSTS_DATA_QUERY["variables"]["first"] = first
    posts_cache_dir = f"{CACHE_DIR}/{get_today()}_posts_data_{skip}_{first}.json"

    data, used_cache = _get_all_comp_posts(COMP_POSTS_DATA_QUERY, posts_cache_dir)
    data = data["data"]["categoryTopicList"]
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

    return filtered_data, data["totalNum"], used_cache


def _is_post_present_already(data: DATA_TYPE, old_posts: Set[str]) -> bool:
    for d in data:
        if d["id"] in old_posts:
            logger.warning(f"Post {d['id']} present already; skipping ...")
            return True
    return False


def get_and_save_all_comp_posts() -> None:
    stride_size = 15
    start = 0
    old_posts = _get_post_ids_in_db()
    try:
        # fetching the first page separately to get totalNum pages
        data, n_posts, used_cache = _get_filterted_posts(start, stride_size)
        if _is_post_present_already(data, old_posts):
            return
        logger.info(f"Page 0; {len(data)} posts; slept for 0.0s")
        with session_scope() as session:
            session.add_all([Posts(**d) for d in data])
        n_pages = math.ceil(n_posts / stride_size)
        logger.info(f" Found {n_posts} posts({n_pages} pages) ".center(34, "*"))
        # fetching the rest of the pages
        with trange(1, n_pages + 1) as t:
            for page_no in t:
                sleep_for = 0 if used_cache else random.random() + 2
                time.sleep(sleep_for)
                start += stride_size + 1
                data, _, used_cache = _get_filterted_posts(start, stride_size)
                if _is_post_present_already(data, old_posts):
                    return
                t.set_description(f"Page {page_no}")
                t.set_postfix(slept_for=sleep_for)
                with session_scope() as session:
                    session.add_all([Posts(**d) for d in data])
    except KeyboardInterrupt:
        session.commit()
        session.close()
