from leetcomp.utils import get_today


def test_get_today():
    today = get_today()
    today_splits = today.split("_")
    assert int(today_splits[0]) == 2023
    assert int(today_splits[1]) in set(range(1, 13))
    assert int(today_splits[2]) in set(range(1, 32))
