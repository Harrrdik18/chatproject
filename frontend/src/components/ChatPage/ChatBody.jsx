import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const ChatBody = ({ messages, currentChat }) => {
  const navigate = useNavigate();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const currentUser = sessionStorage.getItem('userName');

  const handleLeaveChat = () => {
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('previousMessages');
    navigate('/');
  };

  return (
    <div className="chat__body">
      <header className="chat__mainHeader">
        <p>Hangout with Colleagues</p>
        <button className="leaveChat__btn" onClick={handleLeaveChat}>
          LEAVE CHAT
        </button>
      </header>

      <div className="message__container">
        {Array.isArray(messages) && messages.map((message) => {
          const sender = message?.sender || currentUser;
          return (
            <div
              key={message._id || `${sender}_${message.text}_${Date.now()}`}
              className={`message ${(sender || '').toLowerCase() === (currentUser || '').toLowerCase() ? 'message__right' : 'message__left'}`}
            >
              <p className="message__sender">
                {sender === currentUser ? 'You' : sender}
              </p>
              <div className="message__content">
                <p>{message?.text || ''}</p>
                <span className="message__time">
                  {new Date(message?.createdAt || Date.now()).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default ChatBody;
