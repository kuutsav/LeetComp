import datetime


def get_today() -> str:
    return datetime.datetime.now().strftime("%Y_%m_%d")
