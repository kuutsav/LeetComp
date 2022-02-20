from distutils.command.build import build
from loguru import logger

from leetcomp.inverted_index import build_inverted_index
from leetcomp.ner_heuristic import parse_posts_and_save_tagged_info
from leetcomp.services import get_posts_meta_info, update_posts_content_info


if __name__ == "__main__":
    logger.info("Fetching posts meta info".center(80, "-"))
    new_post_ids = get_posts_meta_info()
    logger.info("Updating posts with content".center(80, "-"))
    update_posts_content_info()
    logger.info("Parsing posts".center(80, "-"))
    parse_posts_and_save_tagged_info(new_post_ids)
    logger.info("Building inverted index".center(80, "-"))
    build_inverted_index()
