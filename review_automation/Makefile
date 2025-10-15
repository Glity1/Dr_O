# Makefile (프로젝트 루트에 위치)
.PHONY: help build up down logs clean test

help:
	@echo "사용 가능한 명령어:"
	@echo "  make build    - Docker 이미지 빌드"
	@echo "  make up       - 서비스 시작"
	@echo "  make down     - 서비스 중지"
	@echo "  make logs     - 로그 확인"
	@echo "  make clean    - 볼륨 및 이미지 정리"
	@echo "  make test     - 테스트 실행"
	@echo "  make dev      - 개발 모드 실행"

build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

clean:
	docker-compose down -v
	docker system prune -f

test:
	docker-compose exec backend pytest

dev:
	docker-compose up

# 데이터베이스 마이그레이션
migrate:
	docker-compose exec backend alembic upgrade head

# 데이터베이스 백업
backup:
	docker-compose exec postgres pg_dump -U review_user review_db > backup_$(shell date +%Y%m%d_%H%M%S).sql

# 초기 설정
init:
	cp .env.example .env
	@echo "Please edit .env file with your API keys"
	make build
	make up
	make migrate