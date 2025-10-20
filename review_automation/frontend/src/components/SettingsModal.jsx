import { X } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose, onReplayIntro }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">설정</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {/* 인트로 재생 옵션 */}
          <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">인트로 화면</h3>
            <p className="text-sm text-gray-600 mb-4">
              시작 화면의 인트로 애니메이션을 다시 볼 수 있습니다.
            </p>
            <button
              onClick={() => {
                onReplayIntro();
                onClose();
              }}
              className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
            >
              인트로 다시 보기
            </button>
          </div>

          {/* 추가 설정 옵션들 (나중에 확장 가능) */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">알림 설정</h3>
            <p className="text-sm text-gray-600">
              새로운 리뷰와 AI 답변 생성 시 알림을 받습니다.
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-gray-700">알림 활성화</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
              </label>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">테마 설정</h3>
            <p className="text-sm text-gray-600 mb-3">
              화면 표시 모드를 선택합니다.
            </p>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
              <option>밝은 모드</option>
              <option>어두운 모드</option>
              <option>시스템 설정 따르기</option>
            </select>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <p className="text-xs text-gray-500 text-center">
            Dr.O v1.0 - AI 리뷰 분석 플랫폼
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;





