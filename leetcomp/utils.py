import json


def print_warning(message: str) -> None:
    print(f"\033[93m{message}\033[0m")


def print_info(message: str) -> None:
    print(f"\033[92m{message}\033[0m")


def dump_jsonl(data: list[dict], fname: str) -> None:
    with open(fname, "a") as f:
        for d in data:
            f.write(json.dumps(d) + "\n")


def load_jsonl(fname: str) -> list[dict]:
    with open(fname, "r") as f:
        data = [json.loads(line) for line in f.readlines() if line.strip()]
    return data
