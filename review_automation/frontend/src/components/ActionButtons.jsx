import { useState } from 'react';
import { triggerScraping, triggerReplyGeneration } from '../services/api';

const ActionButtons = ({ onUpdate }) => {
  const [scraping, setScraping] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleScraping = async () => {
    if (!confirm('리뷰 스크래핑을 시작하시겠습니까?')) return;

    setScraping(true);
    try {
      const result = await triggerScraping();
      alert(`${result.message}\n새로운 리뷰: ${result.saved_count}개`);
      if (onUpdate) onUpdate();
    } catch (error) {
      alert('스크래핑 실패: ' + error.message);
    } finally {
      setScraping(false);
    }
  };

  const handleGenerateReplies = async () => {
    if (!confirm('답변 생성을 시작하시겠습니까?')) return;

    setGenerating(true);
    try {
      const result = await triggerReplyGeneration(10);
      alert(`${result.message}\n생성된 답변: ${result.processed_count}개`);
      if (onUpdate) onUpdate();
    } catch (error) {
      alert('답변 생성 실패: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex gap-4 mb-6">
      <button
        onClick={handleScraping}
        disabled={scraping}
        className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 disabled:bg-yellow-300 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow-md font-semibold"
      >
        <span className="font-semibold">
          {scraping ? '스크래핑 중...' : '리뷰 스크래핑'}
        </span>
      </button>

      <button
        onClick={handleGenerateReplies}
        disabled={generating}
        className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-black rounded-lg hover:bg-amber-600 disabled:bg-amber-300 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow-md font-semibold"
      >
        <span className="font-semibold">
          {generating ? '답변 생성 중...' : 'AI 답변 생성'}
        </span>
      </button>

      <button
        onClick={onUpdate}
        className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-sm hover:shadow-md ml-auto font-semibold"
      >
        <span className="font-semibold">새로고침</span>
      </button>
    </div>
  );
};

export default ActionButtons;