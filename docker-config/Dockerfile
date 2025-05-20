# backend/Dockerfile

# 1. Node.js 이미지 선택
FROM node:22-slim

# 2. 작업 디렉터리 설정
WORKDIR /usr/src/app

# 3. 의존성 설치 (캐시 최적화)
COPY package*.json ./
RUN npm install --legacy-peer-deps

# 4. 소스 복사
COPY . .

# 5. 포트 노출
EXPOSE 5000

# 6. 환경 변수 설정
ENV NODE_ENV=development

# 7. 개발 모드 실행
CMD ["npm", "run", "dev"]
