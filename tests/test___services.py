def test_get_posts_meta_info(mock_session_scope, mock_sleep_for_atleast, mock__get_info_from_posts):
    from leetcomp.services import get_posts_meta_info

    get_posts_meta_info()


def test_update_posts_content_info(mock_session_scope, mock_sleep_for_atleast, mock__get_content_from_post):
    from leetcomp.services import update_posts_content_info

    update_posts_content_info()
