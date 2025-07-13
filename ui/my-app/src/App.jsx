import { useState } from 'react'
import Login from './components/Login'
import Chat from './components/Chat'
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

function App() {
  const [token, setToken] = useState(null);

  const handleLogin = (newToken) => {
    setToken(newToken);
  };

  return (
    <>
      {!token ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Chat token={token} />
      )}
    </>
  );
}

export default App
