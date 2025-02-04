import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatBar from './ChatPage/ChatBar';
import ChatBody from './ChatPage/ChatBody';
import ChatFooter from './ChatPage/ChatFooter';
import UserList from './ChatPage/UserList';

const ChatPage = ({ socket }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [currentChat, setCurrentChat] = useState('everyone');

  const fetchMessages = async (recipient) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/messages?recipient=${recipient}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    fetchMessages(currentChat);

    const messageHandler = (data) => {
      setMessages((prevMessages) => {
        const messageExists = prevMessages.some(msg => 
          msg._id === data._id || 
          (msg.text === data.text && 
           msg.sender === data.sender && 
           msg.createdAt === data.createdAt)
        );
        
        if (messageExists) {
          return prevMessages;
        }

        const currentUser = sessionStorage.getItem('userName');
        
        const isRelevantMessage = 
          (data.recipient === 'everyone' && currentChat === 'everyone') ||
          (data.sender === currentChat && data.recipient === currentUser) ||
          (data.sender === currentUser && data.recipient === currentChat);

        if (isRelevantMessage) {
          return [...prevMessages, data];
        }
        return prevMessages;
      });
    };
    
    socket.on('messageResponse', messageHandler);

    return () => {
      socket.off('messageResponse', messageHandler);
    };
  }, [socket, navigate, currentChat]);

  const handleSelectUser = (username) => {
    setCurrentChat(username);
  };

  const handleSendMessage = (messageText) => {
    if (!messageText.trim()) return;

    const currentUser = sessionStorage.getItem('userName');
    const messageData = {
      text: messageText,
      name: currentUser,
      sender: currentUser,
      socketID: socket.id,
      recipient: currentChat,
      isPrivate: currentChat !== 'everyone',
      createdAt: new Date().toISOString()
    };
    
    setMessages(prevMessages => [...prevMessages, messageData]);
    
    socket.emit('message', messageData);
  };

  return (
    <div className="chat">
      <div className="chat__sidebar">
        <UserList 
          onSelectUser={handleSelectUser}
          currentChat={currentChat}
        />
      </div>
      <div className="chat__main">
        <div className="chat__header">
          <h2>{currentChat === 'everyone' ? 'Group Chat' : currentChat}</h2>
        </div>
        <ChatBody 
          messages={messages} 
          currentChat={currentChat}
        />
        <ChatFooter onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export default ChatPage;
