from contextlib import contextmanager
import pytest

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from .test_data import content, posts_data
from leetcomp.models import Base


@pytest.fixture
def mock_session_scope(monkeypatch):
    def mock_session():
        # sqlite engine
        engine = create_engine("sqlite:///tests/tmp/test_posts.db")
        Session = sessionmaker()
        Session.configure(bind=engine)
        Base.metadata.create_all(engine)

        @contextmanager
        def session_scope() -> sessionmaker:
            session = Session()
            try:
                yield session
                session.commit()
            except:  # noqa: # type: ignore
                session.rollback()
                raise
            finally:
                session.close()

        return session_scope

    monkeypatch.setattr("leetcomp.utils.session_scope", mock_session())


@pytest.fixture
def mock_sleep_for_atleast(monkeypatch):
    monkeypatch.setattr("leetcomp.services.SLEEP_FOR_ATLEAST", 0)


@pytest.fixture
def mock__get_info_from_posts(monkeypatch):
    def mock_get_info(skip: int, first: int):
        return posts_data, len(posts_data), False

    monkeypatch.setattr("leetcomp.services._get_info_from_posts", mock_get_info)


@pytest.fixture
def mock__get_content_from_post(monkeypatch):
    def mock_get_content(post_id: str):
        return content, False

    monkeypatch.setattr("leetcomp.services._get_content_from_post", mock_get_content)


@pytest.fixture
def mock_get_post_ids_in_db(monkeypatch):
    def mock_get_post_ids():
        return set([d["id"] for d in posts_data])

    monkeypatch.setattr("leetcomp.services.get_post_ids_in_db", mock_get_post_ids)


@pytest.fixture
def mock_ner_heuristic_dirs(monkeypatch):
    monkeypatch.setattr("leetcomp.ner_heuristic.DATA_DIR", "tests/tmp")
    monkeypatch.setattr("leetcomp.ner_heuristic.JS_DIR", "tests/tmp")


@pytest.fixture
def mock_inverted_index_dirs(monkeypatch):
    monkeypatch.setattr("leetcomp.inverted_index.DATA_DIR", "tests/tmp")
    monkeypatch.setattr("leetcomp.inverted_index.JS_DIR", "tests/tmp")
