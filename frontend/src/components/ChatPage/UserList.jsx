import React, { useState, useEffect } from 'react';
import '../../styles/UserList.css';

const UserList = ({ onSelectUser, currentChat }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const response = await fetch('http://localhost:4000/api/users/list', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }

        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    const interval = setInterval(fetchUsers, 60000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
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
    return <div className="user-list__loading">Loading users...</div>;
  }

  return (
    <div className="user-list">
      <div className="user-list__header">
        <h3>Chats</h3>
      </div>
      
      <div 
        className={`user-list__item ${currentChat === 'everyone' ? 'active' : ''}`}
        onClick={() => onSelectUser('everyone')}
      >
        <div className="user-list__avatar group">
          <i className="fas fa-users"></i>
        </div>
        <div className="user-list__info">
          <div className="user-list__name">Group Chat</div>
          <div className="user-list__last-message">Chat with everyone</div>
        </div>
      </div>

      {users.map((user) => (
        <div
          key={user.username}
          className={`user-list__item ${currentChat === user.username ? 'active' : ''}`}
          onClick={() => onSelectUser(user.username)}
        >
          <div className="user-list__avatar">
            {user.username[0].toUpperCase()}
          </div>
          <div className="user-list__info">
            <div className="user-list__name-row">
              <span className="user-list__name">{user.username}</span>
              {user.lastMessage && (
                <span className="user-list__time">
                  {formatTime(user.lastMessage.time)}
                </span>
              )}
            </div>
            <div className="user-list__message-row">
              <span className="user-list__last-message">
                {user.lastMessage ? (
                  <>
                    {user.lastMessage.sender === sessionStorage.getItem('userName') && 'You: '}
                    {user.lastMessage.text}
                  </>
                ) : 'No messages yet'}
              </span>
              {user.unreadCount > 0 && (
                <span className="user-list__unread">{user.unreadCount}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserList;
