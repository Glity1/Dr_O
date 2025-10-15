# backend/debug_db.py

import psycopg2
import os

# docker-compose.yml에 정의된 DB 정보를 사용합니다.
DB_NAME = "review_db"
DB_USER = "user"
DB_PASS = "password"
DB_HOST = "db" # localhost가 아닌 'db' 서비스 이름
DB_PORT = "5432"

try:
    print("데이터베이스 연결을 시도합니다...")
    print(f"Host: {DB_HOST}, DB: {DB_NAME}, User: {DB_USER}")

    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASS,
        host=DB_HOST,
        port=DB_PORT
    )

    print("✅ 데이터베이스 연결 성공!")
    conn.close()

except psycopg2.OperationalError as e:
    print("❌ 연결 실패: 네트워크 또는 인증 문제입니다.")
    print(f"   에러: {e}")

except Exception as e:
    print("❌ 예상치 못한 오류가 발생했습니다.")
    print(f"   에러 종류: {type(e).__name__}")
    print(f"   에러 내용: {e}")