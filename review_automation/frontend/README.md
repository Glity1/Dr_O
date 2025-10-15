# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# 🤖 AI 리뷰 답변 대시보드

리뷰를 실시간으로 모니터링하고 AI가 생성한 답변을 관리하는 프론트엔드 대시보드입니다.

## ✨ 주요 기능

- 📊 **실시간 통계**: 전체/답변완료/대기 중인 리뷰 수 표시
- 📈 **감성 분석 차트**: 최근 7일간 긍정/부정/중립 리뷰 추이
- 💬 **리뷰 목록**: 최근 리뷰와 AI 생성 답변 확인
- 🔄 **자동 새로고침**: 30초마다 데이터 자동 업데이트
- 🎯 **빠른 액션**: 스크래핑, 답변 생성, 답변 재생성 버튼
- 🏷️ **키워드 표시**: 각 리뷰의 핵심 키워드 태그

## 🚀 시작하기

### 1. 패키지 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 백엔드 API URL을 설정하세요:

```bash
VITE_API_URL=http://localhost:8000
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

### 4. 프로덕션 빌드

```bash
npm run build
```

빌드된 파일은 `dist` 폴더에 생성됩니다.

## 📁 프로젝트 구조

```
frontend/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx          # 메인 대시보드
│   │   ├── StatsCards.jsx         # 통계 카드
│   │   ├── ReviewList.jsx         # 리뷰 목록
│   │   ├── SentimentChart.jsx     # 감성 추이 차트
│   │   └── ActionButtons.jsx      # 액션 버튼
│   ├── services/
│   │   └── api.js                 # API 통신
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── tailwind.config.js
├── package.json
└── README.md
```

## 🔧 기술 스택

- **React 18** - UI 라이브러리
- **Vite** - 빌드 도구
- **Tailwind CSS** - 스타일링
- **Axios** - HTTP 클라이언트
- **Recharts** - 차트 라이브러리
- **Lucide React** - 아이콘

## 📱 화면 구성

### 1. 통계 카드
- 전체 리뷰 / 답변 완료 / 답변 대기
- 긍정 / 부정 / 중립 리뷰 수

### 2. 감성 추이 차트
- 최근 7일간 감성 변화 그래프
- 긍정(초록), 부정(빨강), 중립(회색) 라인

### 3. 리뷰 목록
- 최근 20개 리뷰 표시
- 고객명, 작성일, 리뷰 내용
- AI 생성 답변 및 키워드 태그
- 답변 재생성 버튼

### 4. 액션 버튼
- 리뷰 스크래핑 실행
- AI 답변 생성 실행
- 데이터 새로고침

## 🌐 API 엔드포인트

| 엔드포인트 | 메서드 | 설명 |
|----------|--------|------|
| `/reviews/recent` | GET | 최근 리뷰 조회 |
| `/stats` | GET | 전체 통계 |
| `/stats/sentiment-trend` | GET | 감성 추이 |
| `/scrape` | POST | 스크래핑 실행 |
| `/generate-replies` | POST | 답변 생성 |
| `/reviews/{id}/regenerate-reply` | POST | 답변 재생성 |

## 🔒 CORS 설정

백엔드에서 CORS가 활성화되어 있어야 합니다:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # 프론트엔드 주소
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🎨 커스터마이징

### 색상 변경
`tailwind.config.js`에서 primary 색상을 수정하세요:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#0ea5e9',  // 원하는 색상 코드
      }
    }
  }
}
```

### 자동 새로고침 간격
`Dashboard.jsx`에서 간격을 조정하세요:

```javascript
const interval = setInterval(() => {
  fetchAllData();
}, 30000);  // 30초 (밀리초 단위)
```

## 📝 TODO

- [ ] 페이지네이션 추가
- [ ] 필터링 기능 (날짜, 감성)
- [ ] 검색 기능
- [ ] 다크 모드
- [ ] 반응형 모바일 최적화

## 🐛 문제 해결

### 백엔드 연결 실패
- 백엔드 서버가 실행 중인지 확인 (`python main.py`)
- `.env` 파일의 API URL 확인
- CORS 설정 확인

### 차트가 표시되지 않음
- 최소 2일 이상의 리뷰 데이터 필요
- 브라우저 콘솔에서 에러 확인

## 📄 라이선스

MIT License