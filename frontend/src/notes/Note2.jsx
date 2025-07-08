// components/CardChats.js
import React, { useEffect, useState } from 'react';
import { getAllCardChat } from '../services/api'; // pastikan path-nya benar

const CardChats = ({ cardId }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await getAllCardChat(cardId);
        setChats(response.data);
      } catch (error) {
        console.error('Error fetching chats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (cardId) fetchChats();
  }, [cardId]);

  const renderChats = (chatList, level = 0) => {
    return chatList.map((chat) => (
      <div key={chat.id} style={{ marginLeft: level * 20, marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img
            src={chat.photo_url || '/default-avatar.png'}
            alt={chat.username}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
          <strong>{chat.username}</strong>
          <span style={{ fontSize: '12px', color: '#888' }}>{new Date(chat.send_time).toLocaleString()}</span>
        </div>
        <p style={{ marginLeft: '40px', marginTop: '4px' }}>{chat.message}</p>

        {chat.replies && chat.replies.length > 0 && renderChats(chat.replies, level + 1)}
      </div>
    ));
  };

  if (loading) return <p>Loading chats...</p>;

  return (
    <div style={{border:'1px solid blue', height:'60vh', overflowY:'auto'}}>
      <h3>💬 Chats</h3>
      {chats.length === 0 ? <p>No chats available.</p> : renderChats(chats)}
    </div>
  );
};

export default CardChats;
