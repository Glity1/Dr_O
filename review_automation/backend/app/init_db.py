# init_db.py - 데이터베이스 초기화
from app.database import engine, Base
from app.models import Review, SystemLog

def init_database():
    """데이터베이스 테이블 생성"""
    print("데이터베이스 테이블 생성 중...")
    Base.metadata.create_all(bind=engine)
    print("✓ 테이블 생성 완료!")
    print("생성된 테이블:", list(Base.metadata.tables.keys()))

def drop_all_tables():
    """모든 테이블 삭제 (주의: 데이터 손실)"""
    confirm = input("정말로 모든 테이블을 삭제하시겠습니까? (yes/no): ")
    if confirm.lower() == 'yes':
        print("모든 테이블 삭제 중...")
        Base.metadata.drop_all(bind=engine)
        print("✓ 테이블 삭제 완료!")
    else:
        print("취소되었습니다.")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "drop":
        drop_all_tables()
    else:
        init_database()
        
# # 1. 기존 테이블 삭제
# python init_db.py drop

# # 입력 프롬프트가 나오면 'yes' 입력

# # 2. 테이블 재생성
# python init_db.py