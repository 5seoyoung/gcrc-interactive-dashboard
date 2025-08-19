#!/bin/bash

echo "🔧 GCRC 빠른 수정 스크립트 실행 중..."

# 1. 필요한 디렉토리 생성
mkdir -p server/routes
mkdir -p server/services
mkdir -p server/middleware

# 2. package.json에 스크립트 추가
echo "📝 package.json 스크립트 업데이트 중..."

# Frontend-only 모드 스크립트 추가
npm pkg set scripts.client:only="vite"
npm pkg set scripts.build:frontend="vite build"
npm pkg set scripts.preview="vite preview"

# 3. .env 파일 확인 및 생성
if [ ! -f .env ]; then
    echo "⚙️ .env 파일 생성 중..."
    cat > .env << 'EOF'
NODE_ENV=development
PORT=3001
VITE_MOCK_MODE=true
VITE_API_URL=http://localhost:3001/api
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
MOCK_MODE=true
MOCK_DELAY=500
EOF
fi

# 4. Frontend-only 모드 실행을 위한 별도 명령어 생성
echo "🎯 Frontend-only 모드 설정 중..."

# 별도의 package.json 스크립트 생성
npm pkg set scripts.demo="cross-env VITE_MOCK_MODE=true vite"
npm pkg set scripts.demo:build="cross-env VITE_MOCK_MODE=true vite build"

echo "✅ 빠른 수정 완료!"
echo ""
echo "📋 이제 다음 명령어로 실행 가능:"
echo "1. 전체 실행: npm run dev"
echo "2. Frontend만: npm run client:only"
echo "3. 데모 모드: npm run demo"
echo ""
echo "🌐 브라우저에서 http://localhost:5173 접속"