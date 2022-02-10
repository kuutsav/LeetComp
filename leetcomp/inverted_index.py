from collections import defaultdict, Counter
import json
import re
from typing import List

from loguru import logger


TOKEN_CUMULATIVE_PCT_THRESHOLD = 1


def get_alphanumeric_tokens(text: str) -> List[str]:
    return re.findall(r"\w+", text)


def get_subword_tokens(text: str) -> List[str]:
    n = len(text)
    if n < 3:
        return []
    elif n == 3:
        return [text]
    else:
        return [text[j : j + i] for i in range(3, n) for j in range(n - i + 1)] + [text]


def build_inverted_index() -> None:
    inverted_index: defaultdict = defaultdict(list)

    with open("data/posts_info.json", "r") as f:
        data = json.load(f)

    counter: Counter = Counter()
    for d in data:
        texts = (d["company"].lower(), d["role"].lower())
        for text in texts:
            tokens = get_alphanumeric_tokens(text)
            counter.update(tokens)

    total_count = sum([count for _, count in counter.items()])
    cum_sum = 0
    tokens_to_keep = set()
    for token, count in counter.most_common(len(counter)):
        cum_sum += count
        tokens_to_keep.add(token)
        if cum_sum / total_count > TOKEN_CUMULATIVE_PCT_THRESHOLD:
            break

    for i, d in enumerate(data):
        texts = (d["company"].lower(), d["role"].lower())
        for text in texts:
            tokens = get_alphanumeric_tokens(text)
            for token in tokens:
                if token in tokens_to_keep:
                    for subword_token in get_subword_tokens(token):
                        if i not in inverted_index[subword_token]:
                            inverted_index[subword_token].append(i)

    logger.info(f"Keeping {len(tokens_to_keep)}/{len(counter)} tokens")

    with open("data/inverted_index.json", "w") as f:
        json.dump(inverted_index, f)

    with open("js/data.js", "a") as f:
        f.write(f"\n\nvar invertedIndex = {json.dumps(inverted_index)};")


if __name__ == "__main__":
    build_inverted_index()
