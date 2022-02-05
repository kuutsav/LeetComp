from contextlib import contextmanager
import datetime

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from leetcomp.models import Base


# sqlite engine
engine = create_engine("sqlite:///posts.db")
Session = sessionmaker()
Session.configure(bind=engine)
Base.metadata.create_all(engine)


def get_today() -> str:
    return datetime.datetime.now().strftime("%Y_%m_%d")


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
