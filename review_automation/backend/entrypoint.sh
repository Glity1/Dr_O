#!/bin/bash
set -e

echo "⏳ 데이터베이스 연결 대기 중..."

# 환경 변수 기본값 설정
POSTGRES_HOST=${POSTGRES_HOST:-postgres}
POSTGRES_USER=${POSTGRES_USER:-review_user}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-review_password}
POSTGRES_DB=${POSTGRES_DB:-review_db}

echo "🔍 연결 정보: $POSTGRES_USER@$POSTGRES_HOST:5432/$POSTGRES_DB"

# PostgreSQL이 준비될 때까지 대기 (최대 60초)
counter=0
until PGPASSWORD=$POSTGRES_PASSWORD psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q' 2>/dev/null; do
  echo "⏳ PostgreSQL 대기 중... ($counter/30)"
  sleep 2
  counter=$((counter + 1))
  if [ $counter -gt 30 ]; then
    echo "❌ PostgreSQL 연결 실패 - 타임아웃"
    exit 1
  fi
done

echo "✅ PostgreSQL 연결 성공!"

# 데이터베이스 테이블 초기화
echo "🔧 데이터베이스 테이블 초기화 중..."
cd /app/app && python init_db.py

echo "🚀 애플리케이션 시작..."

# uvicorn 실행
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload