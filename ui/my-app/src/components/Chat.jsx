import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import React from 'react';
import ReactDOM from 'react-dom/client';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

const Chat = ({ token }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [recordingError, setRecordingError] = useState('');
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (window.webkitSpeechRecognition && !recognitionRef.current) {
      const recognitionInstance = new window.webkitSpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'fa-IR';

      recognitionInstance.onstart = () => {
        console.log('شروع تشخیص گفتار');
        setRecordingError('');
        setIsListening(true);
      };

      recognitionInstance.onresult = (event) => {
        console.log('نتیجه دریافت شد:', event);
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join(' ');
        
        console.log('متن کامل:', transcript);
        setQuery(transcript);
        
        // تنظیم ارتفاع textarea
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          const lineHeight = 24;
          const maxLines = 3;
          const maxHeight = lineHeight * maxLines;
          
          if (textareaRef.current.scrollHeight <= maxHeight) {
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
            textareaRef.current.style.overflowY = 'hidden';
          } else {
            textareaRef.current.style.height = maxHeight + 'px';
            textareaRef.current.style.overflowY = 'auto';
          }
        }
      };

      recognitionInstance.onerror = (event) => {
        console.error('خطا در تشخیص گفتار:', event.error);
        switch (event.error) {
          case 'not-allowed':
            setRecordingError('لطفاً دسترسی به میکروفون را فعال کنید');
            setIsListening(false);
            break;
          case 'no-speech':
            setRecordingError('صدایی شنیده نشد');
            break;
          default:
            setRecordingError('خطا در ضبط صدا');
        }
      };

      recognitionInstance.onend = () => {
        console.log('تشخیص گفتار پایان یافت - isListening:', isListening);
        if (isListening) {
          console.log('شروع مجدد خودکار');
          recognitionInstance.start();
        } else {
          console.log('توقف نهایی');
          setIsListening(false);
        }
      };

      recognitionRef.current = recognitionInstance;
      setSpeechSupported(true);
    } else if (!window.webkitSpeechRecognition) {
      console.warn('Speech recognition is not supported in this browser');
      setRecordingError('مرورگر شما از ضبط صدا پشتیبانی نمی‌کند');
    }
  }, [isListening]);

  const toggleListening = () => {
    if (!speechSupported) {
      alert('متأسفانه مرورگر شما از تشخیص گفتار پشتیبانی نمی‌کند');
      return;
    }
    
    if (isListening) {
      // قطع کردن ضبط
      console.log('قطع کردن ضبط');
      setIsListening(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } else {
      // شروع ضبط
      console.log('شروع ضبط');
      setRecordingError('');
      
      // درخواست مجوز میکروفون
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          console.log('مجوز میکروفون دریافت شد');
          if (recognitionRef.current) {
            recognitionRef.current.start();
          }
        })
        .catch((err) => {
          console.error('خطا در دسترسی به میکروفون:', err);
          setRecordingError('دسترسی به میکروفون رد شد. لطفاً از تنظیمات مرورگر اجازه دهید.');
        });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) return;

    // اضافه کردن پیام کاربر
    const userMessage = { type: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);
    
    const currentQuery = query;
    setQuery('');
    setIsLoading(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const response = await fetch('http://localhost:8000/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          query: currentQuery
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        const botMessage = { type: 'bot', content: data.response };
        setMessages(prev => [...prev, botMessage]);
      } else {
        const errorMessage = { type: 'bot', content: 'خطا در دریافت پاسخ' };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage = { type: 'bot', content: 'خطا در ارتباط با سرور' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e) => {
    setQuery(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    
    // Calculate line height (approximately 24px per line)
    const lineHeight = 24;
    const maxLines = 3;
    const maxHeight = lineHeight * maxLines;
    
    if (textarea.scrollHeight <= maxHeight) {
      textarea.style.height = textarea.scrollHeight + 'px';
      textarea.style.overflowY = 'hidden';
    } else {
      textarea.style.height = maxHeight + 'px';
      textarea.style.overflowY = 'auto';
    }
  };
    // Process DOM elements after rendering to find and replace [text] patterns
  const processMessageContainers = () => {
    const messageContainers = document.querySelectorAll('.message-container');
    console.log('Found message containers:', messageContainers.length);
    
    messageContainers.forEach((container, index) => {
      console.log(`Processing container ${index}:`, container);
      
      // Function to process text nodes recursively
      const processTextNodes = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent;
          
          // Check if text contains [text] patterns
          if (text.includes('[') && text.includes(']')) {
            console.log('Found text with brackets:', text);
            
            // Create a container for the new content
            const tempDiv = document.createElement('div');
            tempDiv.style.display = 'contents'; // This makes the div not affect layout
            
            // Split the text and create elements
            const parts = [];
            let lastIndex = 0;
            const bracketRegex = /\[([^\]]+)\]/g;
            let match;
            
            while ((match = bracketRegex.exec(text)) !== null) {
              // Add text before the match
              if (match.index > lastIndex) {
                const textBefore = text.slice(lastIndex, match.index);
                parts.push(document.createTextNode(textBefore));
              }
              
              // Check if the content looks like LaTeX
              const mathContent = match[1];
              const isLikelyLatex = /[\\{}^_]|\\[a-zA-Z]+|[a-zA-Z]_[a-zA-Z0-9]|[a-zA-Z]\^[a-zA-Z0-9]/.test(mathContent);
              
              if (isLikelyLatex) {
                // Create a span for the InlineMath component
                const mathSpan = document.createElement('span');
                parts.push(mathSpan);
                
                // Render InlineMath component into the span
                const root = ReactDOM.createRoot(mathSpan);
                root.render(<InlineMath math={mathContent.trim()} />);
              } else {
                // Keep as regular text
                parts.push(document.createTextNode(`[${mathContent}]`));
              }
              
              lastIndex = match.index + match[0].length;
            }
            
            // Add remaining text
            if (lastIndex < text.length) {
              const textAfter = text.slice(lastIndex);
              parts.push(document.createTextNode(textAfter));
            }
            
            // Replace the original text node with the new content
            parts.forEach(part => tempDiv.appendChild(part));
            node.parentNode.replaceChild(tempDiv, node);
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          // Process child nodes
          Array.from(node.childNodes).forEach(processTextNodes);
        }
      };
      
      // Process all child nodes in the container
      Array.from(container.childNodes).forEach(processTextNodes);
    });
  };

  // Run processing after messages are rendered
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Processing message containers after render...');
      processMessageContainers();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [messages]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      height: '100vh',
      width: '100vw',
      backgroundColor: 'white',
      display: 'flex',
      flexDirection: 'column',
      direction: 'rtl',
      margin: 0,
      padding: 0,
      overflow: 'hidden'
    }}>
      {/* Logo */}
      <div style={{
        position: 'absolute',
        top: '2rem',
        left: '2rem',
        zIndex: 10
      }}>
        <img 
          src="/bonyad_logo.png" 
          alt="Bonyad Logo" 
          style={{
            height: '70px',
            width: 'auto',
            objectFit: 'contain'
          }}
        />
      </div>
      
      {/* Messages Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '4rem 0 1rem 0',
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '160px', // افزایش فاصله از پایین
        '&::-webkit-scrollbar': {
          width: '8px'
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1',
          borderRadius: '10px'
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#d1d5db',
          borderRadius: '10px',
          '&:hover': {
            background: '#9ca3af'
          }
        }
      }}>
        <style>
          {`
            *::-webkit-scrollbar {
              width: 8px;
            }
            *::-webkit-scrollbar-track {
              background: #f1f1f1;
              border-radius: 10px;
            }
            *::-webkit-scrollbar-thumb {
              background: #d1d5db;
              border-radius: 10px;
            }
            *::-webkit-scrollbar-thumb:hover {
              background: #9ca3af;
            }
          `}
        </style>
        <div style={{
          width: '100%',
          maxWidth: '800px',
          padding: '0 2rem'
        }}>
          {messages.length === 0 ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '50vh',
              color: '#666',
              fontSize: '1.1rem'
            }}>
              سوال خود را بپرسید...
            </div>
          ) : (
            messages.map((message, index) => (
              <div key={index} style={{
                marginBottom: '1.5rem'
              }}>
                {message.type === 'user' ? (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{
                      backgroundColor: '#007bff',
                      color: 'white',
                      padding: '0.8rem 1.2rem',
                      borderRadius: '18px',
                      maxWidth: '60%',
                      fontSize: '1rem',
                      lineHeight: '1.4'
                    }}>
                      {message.content}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    marginTop: '0.5rem'
                  }}>
                    <div className='message-container' style={{
                      backgroundColor: '#f8f9fa',
                      color: '#333',
                      padding: '0.8rem 1.2rem',
                      borderRadius: '18px',
                      maxWidth: '80%',
                      fontSize: '1rem',
                      lineHeight: '1.4',
                      border: '1px solid #e9ecef'
                    }}>
                    <ReactMarkdown
  remarkPlugins={[remarkMath]}
  rehypePlugins={[rehypeKatex]}
  components={{
    code: ({ node, inline, className, children, ...props }) => {
      if (inline) {
        return <code style={{ 
          backgroundColor: '#f1f3f4',
          padding: '2px 4px',
          borderRadius: '3px',
          fontFamily: 'monospace',
          fontSize: '0.9em'
        }} {...props}>{children}</code>;
      }
      return (
        <pre style={{ 
          backgroundColor: '#f8f9fa',
          padding: '1rem',
          borderRadius: '6px',
          overflow: 'auto',
          margin: '0.5em 0'
        }}>
          <code {...props}>{children}</code>
        </pre>
      );
    },
    a: ({ node, children, ...props }) => (
      <a style={{ 
        color: '#007bff',
        textDecoration: 'none'
      }} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    ),
    ul: ({ node, children, ...props }) => (
      <ul style={{ paddingRight: '1.5em', margin: '0.5em 0' }} {...props}>
        {children}
      </ul>
    ),
    ol: ({ node, children, ...props }) => (
      <ol style={{ paddingRight: '1.5em', margin: '0.5em 0' }} {...props}>
        {children}
      </ol>
    ),
    h1: ({ node, children, ...props }) => (
      <h1 style={{ fontSize: '1.5em', margin: '0.5em 0' }} {...props}>
        {children}
      </h1>
    ),
    h2: ({ node, children, ...props }) => (
      <h2 style={{ fontSize: '1.3em', margin: '0.5em 0' }} {...props}>
        {children}
      </h2>
    ),
    h3: ({ node, children, ...props }) => (
      <h3 style={{ fontSize: '1.1em', margin: '0.5em 0' }} {...props}>
        {children}
      </h3>
    ),
  }}
>
  {message.content}
</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          
          {isLoading && (
            <div style={{
              display: 'flex',
              justifyContent: 'flex-start',
              marginTop: '0.5rem'
            }}>
              <div style={{
                backgroundColor: '#f8f9fa',
                color: '#666',
                padding: '0.8rem 1.2rem',
                borderRadius: '18px',
                fontSize: '1rem',
                border: '1px solid #e9ecef'
              }}>
                در حال تایپ...
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        display: 'flex',
        justifyContent: 'center',
        padding: '2rem',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,1) 100%)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '800px',
          position: 'relative'
        }}>
          <div style={{
            backgroundColor: '#f7f7f8',
            borderRadius: '26px',
            border: '1px solid #d1d5db',
            padding: '16px 20px 12px 20px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
          }}>
            {/* Text Area */}
            <div style={{
              marginBottom: '8px'
            }}>
              <textarea
                ref={textareaRef}
                value={query}
                onChange={handleTextareaChange}
                onKeyPress={handleKeyPress}
                placeholder="پیام خود را بنویسید..."
                disabled={isLoading}
                style={{
                  width: '100%',
                  border: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '16px',
                  color: '#374151',
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'inherit',
                  lineHeight: '1.5',
                  minHeight: '24px',
                  maxHeight: '72px', // 3 خط
                  overflowY: 'hidden',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d1d5db transparent'
                }}
                rows="1"
              />
            </div>

            {/* Send Button and Microphone */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '8px'
            }}>
              {/* Send Button */}
              <button
                onClick={handleSubmit}
                disabled={!query.trim() || isLoading || isListening}
                style={{
                  backgroundColor: (!query.trim() || isLoading || isListening) ? '#e5e7eb' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '56px',
                  height: '56px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: (!query.trim() || isLoading || isListening) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                  '&:hover': {
                    backgroundColor: (!query.trim() || isLoading || isListening) ? '#e5e7eb' : '#2563eb',
                    transform: (!query.trim() || isLoading || isListening) ? 'none' : 'scale(1.05)'
                  }
                }}
                title={isListening ? 'در حال ضبط - ارسال غیرفعال' : 'ارسال پیام'}
              >
                {isLoading ? (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                  </svg>
                ) : isListening ? (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5">
                    <path d="m22 2-7 20-4-9-9-4z"/>
                    <path d="M22 2 11 13"/>
                  </svg>
                ) : (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m22 2-7 20-4-9-9-4z"/>
                    <path d="M22 2 11 13"/>
                  </svg>
                )}
              </button>
              
              {/* Microphone Button */}
              {speechSupported && (
                <button
                  onClick={toggleListening}
                  disabled={isLoading}
                  style={{
                    backgroundColor: isListening ? '#ef4444' : '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '56px',
                    height: '56px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                    '&:hover': {
                      backgroundColor: isListening ? '#dc2626' : '#4b5563',
                      transform: 'scale(1.05)'
                    }
                  }}
                  title={isListening ? 'توقف ضبط' : 'شروع ضبط صدا'}
                >
                  {isListening ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" rx="2"/>
                      <rect x="14" y="4" width="4" height="16" rx="2"/>
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                      <path d="M12 19v3"/>
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat; 