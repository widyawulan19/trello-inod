import React, { useState } from 'react';

const ChatUi = () => {
  const [message, setMessage] = useState('');
  const [chatList, setChatList] = useState([]);

  const handleSend = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(), // id unik sementara
      user: 'You', // ganti dengan nama user login nanti
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatList([...chatList, newMessage]);
    setMessage('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.chatBox}>
        {chatList.length === 0 ? (
          <div style={styles.emptyState}>Belum ada pesan...</div>
        ) : (
          chatList.map((chat) => (
            <div key={chat.id} style={styles.chatItem}>
              <div style={styles.chatHeader}>
                <strong>{chat.user}</strong> <span style={styles.time}>{chat.time}</span>
              </div>
              <div>{chat.text}</div>
            </div>
          ))
        )}
      </div>

      <div style={styles.inputArea}>
        <input
          type="text"
          placeholder="Ketik pesan..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={styles.input}
          onKeyPress={(e) => { if (e.key === 'Enter') handleSend(); }}
        />
        <button onClick={handleSend} style={styles.button}>Kirim</button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '400px',
    margin: '20px auto',
    border: '1px solid #ccc',
    borderRadius: '8px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '500px'
  },
  chatBox: {
    flex: 1,
    padding: '16px',
    overflowY: 'auto',
    backgroundColor: '#fafafa'
  },
  emptyState: {
    textAlign: 'center',
    color: '#888',
    marginTop: '50px'
  },
  chatItem: {
    marginBottom: '12px',
    padding: '8px',
    backgroundColor: '#fff',
    borderRadius: '6px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
  },
  chatHeader: {
    fontSize: '14px',
    marginBottom: '4px'
  },
  time: {
    fontSize: '12px',
    color: '#aaa',
    marginLeft: '8px'
  },
  inputArea: {
    display: 'flex',
    padding: '12px',
    borderTop: '1px solid #ccc',
    backgroundColor: '#fff'
  },
  input: {
    flex: 1,
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    marginRight: '8px'
  },
  button: {
    padding: '8px 16px',
    backgroundColor: '#4caf50',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};

export default ChatUi;
