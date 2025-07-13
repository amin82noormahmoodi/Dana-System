import { useState, useEffect } from 'react';

const Toast = ({ message, type = 'error', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // نمایش Toast با انیمیشن
    setTimeout(() => setIsVisible(true), 100);

    // شروع Progress Bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(progressInterval);
          return 0;
        }
        return prev - (100 / (duration / 100));
      });
    }, 100);

    // بستن Toast
    const closeTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onClose();
      }, 300); // زمان انیمیشن خروج
    }, duration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(closeTimer);
    };
  }, [duration, onClose]);

  const toastStyles = {
    position: 'fixed',
    top: '20px',
    right: isVisible ? '20px' : '-400px',
    backgroundColor: type === 'error' ? '#ffebee' : '#e8f5e8',
    color: type === 'error' ? '#d32f2f' : '#2e7d32',
    padding: '1rem 1.5rem',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: 1000,
    minWidth: '300px',
    maxWidth: '400px',
    transition: 'right 0.3s ease-in-out',
    direction: 'rtl',
    border: `1px solid ${type === 'error' ? '#ffcdd2' : '#c8e6c9'}`
  };

  const progressBarStyles = {
    position: 'absolute',
    bottom: '0',
    left: '0',
    height: '4px',
    backgroundColor: type === 'error' ? '#d32f2f' : '#2e7d32',
    width: `${progress}%`,
    transition: 'width 0.1s linear',
    borderRadius: '0 0 8px 8px'
  };

  return (
    <div style={toastStyles}>
      <div style={{ fontSize: '1rem', fontWeight: '500' }}>
        {message}
      </div>
      <div style={progressBarStyles}></div>
    </div>
  );
};

export default Toast; 