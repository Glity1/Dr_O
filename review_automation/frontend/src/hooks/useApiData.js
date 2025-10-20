import { useState, useEffect } from 'react';

// 공통 API 데이터 로딩 훅
export const useApiData = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction();
      setData(result);
    } catch (err) {
      console.error('데이터 로딩 실패:', err);
      setError('데이터를 불러오는데 실패했습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
};

// 여러 API를 병렬로 호출하는 훅
export const useMultipleApiData = (apiFunctions, dependencies = []) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await Promise.all(apiFunctions.map(item => {
        if (typeof item === 'function') {
          return item();
        } else if (item && typeof item.fn === 'function') {
          return item.fn();
        }
        return Promise.resolve(null);
      }));
      
      const dataObject = {};
      apiFunctions.forEach((item, index) => {
        let key;
        if (typeof item === 'function') {
          key = item.name || `data${index}`;
        } else if (item && item.key) {
          key = item.key;
        } else {
          key = `data${index}`;
        }
        dataObject[key] = results[index];
      });
      setData(dataObject);
    } catch (err) {
      console.error('데이터 로딩 실패:', err);
      setError('데이터를 불러오는데 실패했습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, dependencies);

  return { data, loading, error, refetch: fetchAllData };
};
