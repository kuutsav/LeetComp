from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class Posts(Base):
    __tablename__ = "posts"
    id = Column(String, primary_key=True)
    title = Column(String)
    voteCount = Column(Integer)
    commentCount = Column(Integer)
    viewCount = Column(Integer)
    creationDate = Column(String)
    content = Column(String, default="")
