from collections import defaultdict, Counter
import json
import os
import re
from typing import Dict, List, Set, Union

from loguru import logger


DATA_DIR = "data"
JS_DIR = "js"
TOKEN_CUMULATIVE_PCT_THRESHOLD = 1


def _split_text_into_tokens(text: str) -> List[str]:
    return re.findall(r"\w+", text)


def get_alphanumeric_tokens(posts_data: List[Dict[str, Union[float, int, str]]]) -> Counter:
    counter: Counter = Counter()
    for data in posts_data:
        texts = (data["company"].lower(), data["role"].lower())  # type: ignore
        for text in texts:
            tokens = _split_text_into_tokens(text)
            counter.update(tokens)
    return counter


def filter_tokens_by_cumsum(token_counter: Counter) -> Set[str]:
    total_count = sum([count for _, count in token_counter.items()])
    cum_sum = 0
    tokens_to_keep = set()
    for token, count in token_counter.most_common(len(token_counter)):
        cum_sum += count
        tokens_to_keep.add(token)
        if cum_sum / total_count > TOKEN_CUMULATIVE_PCT_THRESHOLD:
            break
    return tokens_to_keep


def get_subword_tokens(text: str) -> List[str]:
    n = len(text)
    if n < 3:
        return []
    elif n == 3:
        return [text]
    else:
        return [text[j : j + i] for i in range(3, n) for j in range(n - i + 1)] + [text]


def _build_inverted_index(
    posts_data: List[Dict[str, Union[float, int, str]]], tokens_to_keep: set
) -> Dict[str, List[int]]:
    inverted_index: defaultdict = defaultdict(list)
    for i, d in enumerate(posts_data):
        texts = (d["company"].lower(), d["role"].lower())  # type: ignore
        for text in texts:
            tokens = _split_text_into_tokens(text)
            for token in tokens:
                if token in tokens_to_keep:
                    for subword_token in get_subword_tokens(token):
                        if i not in inverted_index[subword_token]:
                            inverted_index[subword_token].append(i)
    return inverted_index


def load_posts_data() -> List[Dict[str, Union[float, int, str]]]:
    with open(os.path.join(DATA_DIR, "posts_info.json"), "r") as f:
        posts_data = json.load(f)
    return posts_data


def save_data(inverted_index: Dict[str, List[int]]):
    with open(os.path.join(DATA_DIR, "inverted_index.json"), "w") as f:
        json.dump(inverted_index, f)
    with open(os.path.join(JS_DIR, "data.js"), "a") as f:
        f.write(f"\n\nvar invertedIndex = {json.dumps(inverted_index)};")


def build_inverted_index() -> None:
    posts_data = load_posts_data()
    token_counter = get_alphanumeric_tokens(posts_data)
    tokens_to_keep = filter_tokens_by_cumsum(token_counter)
    inverted_index = _build_inverted_index(posts_data, tokens_to_keep)
    logger.info(f"Keeping {len(tokens_to_keep)}/{len(token_counter)} tokens")
    save_data(inverted_index)


if __name__ == "__main__":
    build_inverted_index()
