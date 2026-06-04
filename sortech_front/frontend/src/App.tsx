import React, { useState, useRef } from 'react';
import { summarizeText, summarizeFile } from './services/summaryService';

function App() {
  const [textContent, setTextContent] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [summaryResult, setSummaryResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // 💡 [추가] 복사 완료 상태를 관리하는 변수
  const [isCopied, setIsCopied] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextContent(e.target.value);
    if (selectedFile) {
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/plain" && !file.name.endsWith('.txt')) {
      alert("텍스트(.txt) 파일만 업로드할 수 있습니다.");
      if (fileInputRef.current) fileInputRef.current.value = ''; 
      return;
    }

    setSelectedFile(file);
    setTextContent(''); 
  };

  const handleSummarize = async () => {
    if (!selectedFile && !textContent.trim()) {
      alert("요약할 텍스트를 입력하거나 파일을 첨부해주세요!");
      return;
    }

    setIsLoading(true);
    setSummaryResult('');
    setIsCopied(false); // 새로운 요약을 시작할 때 복사 상태도 초기화

    try {
      let result = '';
      if (selectedFile) {
        result = await summarizeFile(selectedFile);
      } else {
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

  // 💡 [추가] 복사 버튼을 눌렀을 때 실행되는 함수
  const handleCopy = async () => {
    if (!summaryResult) return;
    
    try {
      // 브라우저 클립보드 API를 사용해 결과 텍스트 복사
      await navigator.clipboard.writeText(summaryResult);
      setIsCopied(true);
      
      // 2초 뒤에 다시 원래 상태('복사하기')로 되돌림
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.error("복사 실패:", err);
      alert("클립보드 복사에 실패했습니다.");
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2 style={{ borderBottom: '3px solid #2a2a2a', paddingBottom: '15px', color: '#1a1a1a', textAlign: 'center' }}>
        AI 요약 서비스
      </h2>

      <div style={{ margin: '30px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          
          <label style={{ fontWeight: 'bold', color: '#495057', display: 'flex', alignItems: 'center', gap: '8px' }}>
            본문 입력하기
            {selectedFile && (
              <span style={{ fontSize: '13px', color: '#007bff', fontWeight: 'normal' }}>
                ({selectedFile.name} 준비됨)
              </span>
            )}
          </label>
          
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
            background: selectedFile ? '#f1f3f5' : '#fff' 
          }}
          placeholder={selectedFile ? "파일이 첨부되었습니다. 텍스트를 직접 입력하시려면 이 창을 클릭해서 타이핑하세요." : "요약하고 싶은 긴 문서나 뉴스 기사를 복사해서 이곳에 붙여넣으세요..."}
          value={textContent}
          onChange={handleTextChange}
          disabled={isLoading}
        />
        
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
          {isLoading ? ' 글의 흐름을 파악하는 중입니다...' : ' 요약 시작'}
        </button>
      </div>

      <hr style={{ margin: '40px 0', border: '0', borderTop: '1px solid #e9ecef' }} />

      {/* 🎯 결과 출력 보드 */}
      <div>
        {/* 💡 [수정] 결과 헤더 부분에 복사 버튼을 가로로 나란히 배치 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0, color: '#343a40' }}>요약 결과</h3>
          
          {/* 요약 결과가 있을 때만 복사 버튼이 나타납니다 */}
          {summaryResult && (
            <button
              onClick={handleCopy}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px', background: '#fff', color: isCopied ? '#20c997' : '#495057', 
                border: `1px solid ${isCopied ? '#20c997' : '#ced4da'}`, 
                borderRadius: '6px', fontSize: '13px', cursor: 'pointer',
                transition: 'all 0.2s', fontWeight: isCopied ? 'bold' : 'normal'
              }}
              onMouseOver={(e) => !isCopied && (e.currentTarget.style.background = '#f8f9fa')}
              onMouseOut={(e) => !isCopied && (e.currentTarget.style.background = '#fff')}
            >
              {isCopied ? '복사됨' : ' 복사'}
            </button>
          )}
        </div>

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