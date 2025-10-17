FROM node:22-alpine AS builder

WORKDIR /app

# package.json 복사 및 의존성 설치
COPY package*.json ./

RUN npm cache clean --force && npm install --legacy-peer-deps

# 소스 코드 복사
COPY . .

# 빌드 시점에 환경 변수 받기 (중요!)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# 환경 변수 확인 (디버깅용)
RUN echo "Building with VITE_API_URL=$VITE_API_URL"

# 빌드 실행
RUN npm run build

# 프로덕션 이미지
FROM nginx:alpine

# 빌드된 정적 파일 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx 설정 복사
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]