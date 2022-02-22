import json


def test_parse_posts_and_save_tagged_info(
    mock_session_scope, mock_sleep_for_atleast, mock__get_info_from_posts, mock_ner_heuristic_dirs
):
    from leetcomp.ner_heuristic import parse_posts_and_save_tagged_info
    from leetcomp.services import get_posts_meta_info

    new_post_ids = get_posts_meta_info()
    parse_posts_and_save_tagged_info(new_post_ids)

    # validate metadata
    with open("tests/meta_info.json", "r") as f:
        metadata = json.load(f)
        assert metadata["totalPosts"] == 20
        assert metadata["totalPostsFromIndia"] == 20
        assert metadata["totalPostsWithTotalComp"] == 0
        assert metadata["top20Companies"] == [["Swiggy Title", 20]]
        assert metadata["mostOffersInLastMonth"] == [["Swiggy Title", 20]]

    # validate posts info
    with open("tests/posts_info.json", "r") as f:
        posts_info = json.load(f)
        assert len(posts_info) == 20
