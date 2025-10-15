# database.py - 데이터베이스 연결 설정
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# 환경변수에서 DB 접속 정보 가져오기
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://user:password@localhost/review_db"
)

# SQLAlchemy 엔진 생성
engine = create_engine(DATABASE_URL)

# 세션 생성을 위한 factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ⭐ 모델의 베이스 클래스 - 이게 필수!
Base = declarative_base()

# DB 세션을 가져오는 의존성 함수 (FastAPI에서 사용)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()