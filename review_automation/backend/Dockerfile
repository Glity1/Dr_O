FROM python:3.11-slim

# 작업 디렉토리 설정
WORKDIR /app

# 시스템 의존성 설치
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Python 의존성 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 애플리케이션 코드 복사 (전체 app 디렉토리를 복사)
COPY app/ /app/app/

# entrypoint 스크립트 복사 및 실행 권한 부여
COPY entrypoint.sh /app/
RUN chmod +x /app/entrypoint.sh

# 환경 변수 설정
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# 포트 노출
EXPOSE 8000

# entrypoint로 애플리케이션 실행 (DB 자동 초기화 포함)
ENTRYPOINT ["/app/entrypoint.sh"]