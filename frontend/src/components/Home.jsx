import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = ({ socket }) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    socket.on('loginError', (data) => {
      setError(data.message);
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('userName');
      sessionStorage.removeItem('previousMessages');
    });

    return () => {
      socket.off('loginError');
    };
  }, [socket]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const endpoint = isLogin ? '/api/users/login' : '/api/users/register';
      const response = await fetch(`http://localhost:4000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: userName,
          password: password
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('userName', data.username);

      try {
       // https://chatproject-production-212c.up.railway.app/
        const messagesResponse = await fetch('http://localhost:4000/api/messages', {
          headers: {
            'Authorization': `Bearer ${data.token}`
          }
        });
        
        if (!messagesResponse.ok) {
          console.error('Failed to fetch messages');
          sessionStorage.setItem('previousMessages', JSON.stringify([]));
        } else {
          const messages = await messagesResponse.json();
          const messageArray = Array.isArray(messages) ? messages : [];
          sessionStorage.setItem('previousMessages', JSON.stringify(messageArray));
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        sessionStorage.setItem('previousMessages', JSON.stringify([]));
      }

      socket.emit('newUser', { userName: data.username, socketID: socket.id });
      
      setTimeout(() => {
        if (!sessionStorage.getItem('token')) {
          return; 
        }
        navigate('/chat');
      }, 100);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <form className="home__container" onSubmit={handleSubmit}>
      <h2 className="home__header">{isLogin ? 'Sign in' : 'Register'} to Open Chat</h2>
      {error && <p className="error__message">{error}</p>}
      <label htmlFor="username">Username</label>
      <input
        type="text"
        minLength={6}
        name="username"
        id="username"
        className="username__input"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      />
      <label htmlFor="password">Password</label>
      <input
        type="password"
        minLength={6}
        name="password"
        id="password"
        className="password__input"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="home__cta">{isLogin ? 'SIGN IN' : 'REGISTER'}</button>
      <p className="auth__switch" onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Don't have an account? Register" : "Already have an account? Sign in"}
      </p>
    </form>
  );
};

export default Home;
