import React, { useState, useRef } from 'react';
import { summarizeText, summarizeFile } from './services/summaryService';

function App() {
  const [textContent, setTextContent] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [summaryResult, setSummaryResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // 숨겨진 file input을 초기화하기 위한 참조 객체
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ────────────────────────────────────────────────────────
  // [이벤트] 1. 사용자가 텍스트를 직접 입력할 때
  // ────────────────────────────────────────────────────────
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextContent(e.target.value);
    
    // 사용자가 직접 타이핑을 시작하면, 기존에 첨부된 파일은 무시되도록 초기화합니다.
    if (selectedFile) {
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ────────────────────────────────────────────────────────
  // [이벤트] 2. 사용자가 파일을 선택했을 때
  // ────────────────────────────────────────────────────────
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/plain" && !file.name.endsWith('.txt')) {
      alert("텍스트(.txt) 파일만 업로드할 수 있습니다.");
      if (fileInputRef.current) fileInputRef.current.value = ''; // 잘못된 파일 초기화
      return;
    }

    setSelectedFile(file);
    setTextContent(''); // 파일이 우선순위를 가지도록 텍스트 입력창은 비워줍니다.
  };

  // ────────────────────────────────────────────────────────
  // [통합 실행] 3. '실시간 AI 요약 시작' 버튼 클릭 시
  // ────────────────────────────────────────────────────────
  const handleSummarize = async () => {
    if (!selectedFile && !textContent.trim()) {
      alert("요약할 텍스트를 입력하거나 파일을 첨부해주세요!");
      return;
    }

    setIsLoading(true);
    setSummaryResult('');

    try {
      let result = '';
      
      // 파일이 첨부되어 있다면 파일 요약(summarizeFile)을 호출
      if (selectedFile) {
        result = await summarizeFile(selectedFile);
      } 
      // 그 외엔 텍스트 요약(summarizeText)을 호출
      else {
        result = await summarizeText(textContent);
      }
      
      setSummaryResult(result);
    } catch (error) {
      console.error("요약 중 에러 발생:", error);
      setSummaryResult("⚠️ 요약 요청 중 오류가 발생했습니다. 서버 콘솔을 확인해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2 style={{ borderBottom: '3px solid #2a2a2a', paddingBottom: '15px', color: '#1a1a1a', textAlign: 'center' }}>
          AI 요약 서비스
      </h2>

      {/*  텍스트 입력 및 파일 업로드 통합 섹션 */}
      <div style={{ margin: '30px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          
          {/* 좌측 라벨 & 첨부된 파일명 표시 */}
          <label style={{ fontWeight: 'bold', color: '#495057', display: 'flex', alignItems: 'center', gap: '8px' }}>
             본문 입력하기
            {selectedFile && (
              <span style={{ fontSize: '13px', color: '#007bff', fontWeight: 'normal' }}>
                ({selectedFile.name} 준비됨)
              </span>
            )}
          </label>
          
          {/* 우측 파일 첨부 버튼 (기본 input 디자인을 숨기고 예쁘게 꾸밈) */}
          <div>
            <input 
              type="file" 
              accept=".txt" 
              id="file-upload" 
              ref={fileInputRef}
              onChange={handleFileChange} 
              disabled={isLoading}
              style={{ display: 'none' }} 
            />
            <label 
              htmlFor="file-upload" 
              style={{ 
                padding: '6px 12px', background: '#f8f9fa', color: '#495057', 
                borderRadius: '6px', fontSize: '13px', cursor: 'pointer', border: '1px solid #ced4da',
                transition: 'background 0.2s', opacity: isLoading ? 0.5 : 1
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#e9ecef'}
              onMouseOut={(e) => e.currentTarget.style.background = '#f8f9fa'}
            >
              파일 첨부
            </label>
          </div>
        </div>

        <textarea
          rows={12}
          style={{ 
            width: '100%', padding: '15px', boxSizing: 'border-box', borderRadius: '8px', 
            border: '1px solid #ced4da', fontSize: '15px', lineHeight: '1.6', resize: 'vertical',
            background: selectedFile ? '#f1f3f5' : '#fff' // 파일이 선택되면 텍스트 박스 배경을 회색으로 변경
          }}
          placeholder={selectedFile ? "파일이 첨부되었습니다. 텍스트를 직접 입력하시려면 이 창을 클릭해서 타이핑하세요." : "요약하고 싶은 긴 문서나 뉴스 기사를 복사해서 이곳에 붙여넣으세요..."}
          value={textContent}
          onChange={handleTextChange}
          disabled={isLoading}
        />
        
        {/* 통합 요약 버튼 */}
        <button
          onClick={handleSummarize}
          disabled={isLoading}
          style={{
            marginTop: '12px', width: '100%', padding: '14px', 
            background: isLoading ? '#adb5bd' : '#212529',
            color: '#fff', border: 'none', borderRadius: '8px', 
            fontSize: '16px', fontWeight: 'bold', cursor: isLoading ? 'default' : 'pointer'
          }}
        >
          {isLoading ? ' Gemini AI가 글의 흐름을 파악하는 중입니다...' : ' 요약 시작'}
        </button>
      </div>

      <hr style={{ margin: '40px 0', border: '0', borderTop: '1px solid #e9ecef' }} />

      {/* 🎯 결과 출력 보드 */}
      <div>
        <h3 style={{ marginBottom: '15px', color: '#343a40' }}> 요약 결과</h3>
        <div style={{
          minHeight: '180px', background: '#f1f3f5', padding: '25px', borderRadius: '8px',
          border: '1px solid #dee2e6', whiteSpace: 'pre-wrap', lineHeight: '1.8', 
          fontSize: '15.5px', color: '#212529'
        }}>
          {summaryResult || "본문을 입력하거나 파일을 업로드하면 핵심 요약 내용이 이곳에 출력됩니다."}
        </div>
      </div>
    </div>
  );
}

export default App;