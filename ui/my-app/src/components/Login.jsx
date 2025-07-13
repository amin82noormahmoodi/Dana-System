import { useState, useEffect } from 'react';
import { EyeIcon, EyeSlashIcon } from './Icons';
import Toast from './Toast';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);

  // Force refresh input styling after component mount
  useEffect(() => {
    const inputs = document.querySelectorAll('input[type="text"], input[type="password"]');
    inputs.forEach(input => {
      input.style.fontSize = '1.1rem';
      input.style.zoom = '1';
      input.style.transform = 'scale(1)';
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:8000/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'username': username,
          'password': password,
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        onLogin(data.access_token);
      } else {
        setToast({
          message: 'نام کاربری یا رمز عبور خود را اشتباه وارد کرده‌اید',
          type: 'error'
        });
      }
    } catch (error) {
      setToast({
        message: 'خطا در ارتباط با سرور. لطفاً مجدداً تلاش کنید',
        type: 'error'
      });
    }
  };

  const closeToast = () => {
    setToast(null);
  };

  const inputStyle = {
    padding: '1rem',
    borderRadius: '10px',
    border: '2px solid #e0e0e0',
    fontSize: '1.1rem',
    backgroundColor: 'white',
    color: '#333',
    transition: 'all 0.3s ease',
    width: '100%',
    boxSizing: 'border-box',
    zoom: 1,
    transform: 'scale(1)',
    fontFamily: 'inherit',
    lineHeight: 'normal'
  };

  // Override browser autofill styling and fix font size issues
  const autofillOverride = `
    input:-webkit-autofill,
    input:-webkit-autofill:hover,
    input:-webkit-autofill:focus,
    input:-webkit-autofill:active {
      -webkit-box-shadow: 0 0 0 30px white inset !important;
      -webkit-text-fill-color: #333 !important;
      background-color: white !important;
      color: #333 !important;
      font-size: 1.1rem !important;
      zoom: 1 !important;
      transform: scale(1) !important;
    }
    
    input[type="text"], input[type="password"] {
      font-size: 1.1rem !important;
      zoom: 1 !important;
      transform: scale(1) !important;
      -webkit-appearance: none !important;
      appearance: none !important;
    }
    
    input::placeholder {
      font-size: 1.1rem !important;
      color: #999 !important;
      opacity: 1 !important;
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: autofillOverride }} />
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
          duration={5000}
        />
      )}
      
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100vw',
        direction: 'rtl',
        backgroundColor: 'white',
        margin: 0,
        padding: 0,
        position: 'relative'
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
        
        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
          padding: '4rem',
          width: '500px',
          maxWidth: '90vw',
          backgroundColor: '#f8f9fa',
          border: '1px solid #e0e0e0',
          borderRadius: '16px',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ 
            textAlign: 'center', 
            margin: '0 0 1.5rem 0',
            color: '#333',
            fontSize: '2rem',
            fontWeight: 'bold'
          }}>
            ورود به سیستم
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <label style={{ 
              color: '#666', 
              fontSize: '1.1rem',
              fontWeight: '500'
            }}>
              نام کاربری
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="نام کاربری خود را وارد کنید"
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = '#007bff'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <label style={{ 
              color: '#666', 
              fontSize: '1.1rem',
              fontWeight: '500'
            }}>
              رمز عبور
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="رمز عبور خود را وارد کنید"
                style={{
                  ...inputStyle,
                  paddingLeft: '3rem'
                }}
                onFocus={(e) => e.target.style.borderColor = '#007bff'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#666',
                  transition: 'color 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.color = '#007bff'}
                onMouseOut={(e) => e.target.style.color = '#666'}
              >
                {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            style={{
              padding: '1.2rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              marginTop: '1rem',
              transition: 'background-color 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
          >
            ورود
          </button>
        </form>
      </div>
    </>
  );
};

export default Login; 