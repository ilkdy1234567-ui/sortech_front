// src/services/summaryService.ts
import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/summary';

// Axios 인스턴스를 생성하면 기본 설정을 재사용할 수 있어 편리합니다.
const api = axios.create({
  baseURL: BASE_URL,
});

/**
 * 1. 백엔드에 순수 텍스트 요약을 요청하는 함수 (Axios 버전)
 */
export const summarizeText = async (content: string): Promise<string> => {
  // Axios는 JSON.stringify를 자동으로 해주므로 객체 그대로 넣으면 됩니다.
  const response = await api.post<string>('/text', { content });
  
  // Axios는 성공 시 자동으로 data 프로퍼티에 결과를 담아줍니다.
  return response.data;
};

/**
 * 2. 백엔드에 .txt 파일 업로드 요약을 요청하는 함수 (Axios 버전)
 */
export const summarizeFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  // 멀티파트 파일 전송 시에도 headers를 알아서 세팅해주므로 편합니다.
  const response = await api.post<string>('/file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};