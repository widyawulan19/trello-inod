import React, { useEffect, useState } from 'react';
import { getAllCardChat, createMessage, deleteMessage } from '../services/api';
import './CardChats.css';

const CardChats = ({ cardId, userId }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyMessages, setReplyMessages] = useState({});

  useEffect(() => {
    fetchChats();
  }, [cardId]);

  const fetchChats = async () => {
    setLoading(true);
    try {
      const res = await getAllCardChat(cardId);
      setChats(res.data);
    } catch (err) {
      console.error('Error fetching chats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    await createMessage(cardId, {
      user_id: userId,
      message,
      parent_message_id: null,
    });
    setMessage('');
    fetchChats();
  };

  const handleSendReply = async (parentId) => {
    const replyMessage = replyMessages[parentId];
    if (!replyMessage?.trim()) return;

    await createMessage(cardId, {
      user_id: userId,
      message: replyMessage,
      parent_message_id: parentId,
    });

    setReplyMessages((prev) => ({ ...prev, [parentId]: '' }));
    setReplyTo(null);
    fetchChats();
  };

  const handleDeleteChat = async (chatId) => {
    try {
      await deleteMessage(chatId);
      fetchChats();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const renderChats = (chatList, level = 0) => {
    return chatList.map((chat) => (
      <div
        className={`chat-message ${level > 0 ? 'chat-reply' : ''}`}
        key={chat.id}
        style={{ marginLeft: `${level * 30}px` }}
      >
        <div className="chat-header">
          <img
            className="chat-avatar"
            src={chat.photo_url || '/default-avatar.png'}
            alt={chat.username}
          />
          <div className="chat-user-info">
            <span className="chat-username">{chat.username}</span>
            <span className="chat-timestamp">
              {new Date(chat.send_time).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="chat-bubble">{chat.message}</div>

        <div className="chat-actions">
          {/* Hanya tampilkan tombol Reply jika chat utama (bukan reply) */}
          {chat.parent_message_id === null && (
            <button
              className="chat-reply-btn"
              onClick={() => setReplyTo(replyTo === chat.id ? null : chat.id)}
            >
              {replyTo === chat.id ? 'Cancel' : 'Reply'}
            </button>
          )}
          <button
            className="chat-delete-btn"
            onClick={() => handleDeleteChat(chat.id)}
          >
            Delete
          </button>
        </div>

        {replyTo === chat.id && (
          <div className="chat-reply-form">
            <textarea
              placeholder="Write a reply..."
              value={replyMessages[chat.id] || ''}
              onChange={(e) =>
                setReplyMessages((prev) => ({
                  ...prev,
                  [chat.id]: e.target.value,
                }))
              }
            />
            <button onClick={() => handleSendReply(chat.id)}>Send Reply</button>
          </div>
        )}

        {chat.replies?.length > 0 && renderChats(chat.replies, level + 1)}
      </div>
    ));
  };

  return (
    <div className="chat-room-container">
      <h3 className="chat-title">💬 Chat Room</h3>
      <div className="chat-list">
        {loading ? (
          <p className="chat-loading">Loading chats...</p>
        ) : chats.length === 0 ? (
          <p className="chat-empty">No chats yet.</p>
        ) : (
          renderChats(chats)
        )}
      </div>

      <div className="chat-input-box">
        <textarea
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default CardChats;
