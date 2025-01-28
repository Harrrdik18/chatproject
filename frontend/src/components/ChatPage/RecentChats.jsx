import React, { useState, useEffect } from 'react';

const RecentChats = ({ onSelectChat }) => {
  const [recentChats, setRecentChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentChats = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const response = await fetch('http://localhost:4000/api/messages/recent', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch recent chats');
        }

        const data = await response.json();
        setRecentChats(data);
      } catch (error) {
        console.error('Error fetching recent chats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentChats();
    // Refresh recent chats every 30 seconds
    const interval = setInterval(fetchRecentChats, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return <div className="recent-chats__loading">Loading recent chats...</div>;
  }

  return (
    <div className="recent-chats">
      <h3 className="recent-chats__title">Recent Chats</h3>
      <div className="recent-chats__list">
        <div 
          className="recent-chats__item"
          onClick={() => onSelectChat('everyone')}
        >
          <div className="recent-chats__item-info">
            <span className="recent-chats__name">Group Chat</span>
            <span className="recent-chats__message">Everyone</span>
          </div>
        </div>
        {recentChats.map((chat) => (
          <div 
            key={chat.username}
            className="recent-chats__item"
            onClick={() => onSelectChat(chat.username)}
          >
            <div className="recent-chats__item-info">
              <span className="recent-chats__name">{chat.username}</span>
              <span className="recent-chats__message">{chat.lastMessage}</span>
            </div>
            <span className="recent-chats__time">
              {formatTime(chat.lastMessageTime)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentChats;
