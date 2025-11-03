import React, { useState } from 'react'
import '../style/pages/LayoutTest.css'

const LayoutTest=()=> {
    const [isChatOpen, setIsChatOpen] = useState(false);

 return (
    <div className={`card-detail-container ${isChatOpen ? 'split-view' : ''}`}>
      <div className="card-detail-left">
        <h2>Card Detail</h2>
        {/* ...isi detail card */}
        <button onClick={() => setIsChatOpen(true)}>Open Chat</button>
      </div>

      {isChatOpen && (
        <div className="card-detail-right">
          <div className="chat-header">
            <h3>Room Chat</h3>
            <button onClick={() => setIsChatOpen(false)}>Close</button>
          </div>
          {/* ...isi chat */}
          <div className="chat-body">Chat messages here...</div>
        </div>
      )}
    </div>
  );
}

export default LayoutTest