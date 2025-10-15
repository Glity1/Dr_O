import axios from 'axios';

// 백엔드 API URL (환경에 따라 변경)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 에러 핸들링 인터셉터
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// === API 함수들 ===

// 최근 리뷰 조회
export const getRecentReviews = async (limit = 20, offset = 0) => {
  const response = await api.get('/reviews/recent', {
    params: { limit, offset }
  });
  return response.data;
};

// 답변 대기 중인 리뷰 조회
export const getPendingReviews = async () => {
  const response = await api.get('/reviews/pending');
  return response.data;
};

// 특정 리뷰 조회
export const getReview = async (reviewId) => {
  const response = await api.get(`/reviews/${reviewId}`);
  return response.data;
};

// 통계 데이터 조회
export const getStats = async () => {
  const response = await api.get('/stats');
  return response.data;
};

// 감성 추이 조회
export const getSentimentTrend = async (days = 7) => {
  const response = await api.get('/stats/sentiment-trend', {
    params: { days }
  });
  return response.data;
};

// 스크래핑 실행
export const triggerScraping = async () => {
  const response = await api.post('/scrape');
  return response.data;
};

// 답변 생성 실행
export const triggerReplyGeneration = async (maxCount = 10) => {
  const response = await api.post('/generate-replies', null, {
    params: { max_count: maxCount }
  });
  return response.data;
};

// 답변 재생성
export const regenerateReply = async (reviewId) => {
  const response = await api.post(`/reviews/${reviewId}/regenerate-reply`);
  return response.data;
};

// 최근 로그 조회
export const getRecentLogs = async (limit = 50) => {
  const response = await api.get('/logs/recent', {
    params: { limit }
  });
  return response.data;
};

export default api;