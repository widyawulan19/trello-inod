{Array.isArray(summaries) && summaries.map((item) => (
  <div key={item.id}>{item.text}</div>
))}

const { logCardActivity } = require('../helpers/cardActivityLogger'); // pastikan sudah diimport

app.put('/api/cards/:id/title', async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  const userId = req.user.id; // pastikan middleware autentikasi ngisi ini yaa

  try {
    // Ambil data lama dulu buat dicatat di log
    const oldResult = await client.query("SELECT title FROM cards WHERE id = $1", [id]);
    if (oldResult.rows.length === 0) return res.status(404).json({ error: "Card not found" });

    const oldTitle = oldResult.rows[0].title;

    const result = await client.query(
      "UPDATE cards SET title = $1, update_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
      [title, id]
    );

    // ✅ Tambahkan log aktivitas
    await logCardActivity({
      action: 'update',
      card_id: parseInt(id),
      user_id: userId,
      entity: 'title',
      entity_id: null,
      details: {
        old_title: oldTitle,
        new_title: title
      }
    });

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating card title:", error);
    res.status(500).json({ error: error.message });
  }
});



app.get('/api/cards/:cardId/activities', async (req, res) => {
  const { cardId } = req.params;
  try {
    const result = await client.query(`
      SELECT ca.*, u.username
      FROM card_activities ca
      JOIN users u ON ca.user_id = u.id
      WHERE ca.card_id = $1
      ORDER BY ca.created_at DESC
    `, [cardId]);

    res.json({
      message: `Activities for card ID ${cardId}`,
      activities: result.rows,
    });
  } catch (err) {
    console.error('Error fetching activities:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


//1. update title card
app.put('/api/cards/:id/title', async(req,res)=>{
    const {id} = req.params;
    const {title} = req.body;
    const userId = req.user.id;

    console.log('Endpoin update ini menerima data userId:', userId);
    try {
        // Ambil data lama dulu buat dicatat di log
        const oldResult = await client.query("SELECT title FROM cards WHERE id = $1", [id]);
        if (oldResult.rows.length === 0) return res.status(404).json({ error: "Card not found" });
    
        const oldTitle = oldResult.rows[0].title;
    
        const result = await client.query(
          "UPDATE cards SET title = $1, update_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
          [title, id]
        );
    
        // ✅ Tambahkan log aktivitas
        await logCardActivity({
          action: 'update',
          card_id: parseInt(id),
          user_id: userId,
          entity: 'title',
          entity_id: null,
          details: {
            old_title: oldTitle,
            new_title: title
          }
        });
    
        res.json(result.rows[0]);
      } catch (error) {
        console.error("Error updating card title:", error);
        res.status(500).json({ error: error.message });
      }
})




app.put('/api/card-due-date/:id', async (req, res) => {
  const { id } = req.params;
  const { due_date } = req.body;
  const userId = req.user.id; // asumsi ini tersedia dari middleware auth

  try {
    // Cek data lama dulu (opsional, bisa dipakai untuk log detail)
    const existing = await client.query(
      "SELECT * FROM card_due_dates WHERE id = $1",
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Due date not found" });
    }

    const oldDueDate = existing.rows[0].due_date;
    const cardId = existing.rows[0].card_id;

    // Update due_date
    const result = await client.query(
      "UPDATE card_due_dates SET due_date = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [due_date, id]
    );

    const updatedDueDate = result.rows[0].due_date;

    // Log activity
    await client.query(
      `INSERT INTO card_activities (
        card_id,
        user_id,
        action_type,
        entity,
        entity_id,
        action_detail
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        cardId,
        userId,
        'update',              // action_type
        'due',                 // entity
        id,                    // entity_id (ID dari tabel card_due_dates)
        JSON.stringify({
          old_due_date: oldDueDate,
          new_due_date: updatedDueDate
        })
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});



<div className='rc-content' style={{
  border: '1px solid red',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px' // biar rapi aja
}}>
  <div
    className="rc-message-group"
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
    }}
  >
    <div className='rc-text-title'
      style={{
        display:'flex',
        alignItems:'center',
        gap: '6px',
        border:'1px solid green',
        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
        textAlign: isOwnMessage ? 'right' : 'left',
      }}
    >
      <img src={chat.photo_url} alt={chat.username} />
      <strong>{chat.username}</strong>
      <p>{formatChatTime(chat.send_time)}</p>
    </div>

    <div className="rc-box"
      style={{
        backgroundImage: isOwnMessage 
          ? 'linear-gradient(to right, #2575fc, #3963f3, #4c4fe8, #5c38db, #6a11cb)' 
          : 'none',
        backgroundColor: isOwnMessage ? 'transparent' : '#fff',
        color:isOwnMessage ? '#fff': '#333',
        border:`1px solid ${isOwnMessage ? '#6b11cb3f' : '#eee'}`,
        borderRadius:'16px',
        maxWidth: 'fit-content',
        alignSelf: isOwnMessage ? 'flex-end' : 'flex-start',
        borderBottomRightRadius: isOwnMessage ? '2px' : '16px',
        borderBottomLeftRadius: isOwnMessage ? '16px' : '4px',
        boxShadow: isOwnMessage
          ? '0px 4px 8px #5e12eb46'
          : '0px 4px 8px rgba(0, 0, 0, 0.1)',
        display:'flex',
        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
      }}
    >
      <div className='rc-text' style={{border:'1px solid blue'}}>
        <p dangerouslySetInnerHTML={{ __html: parseMessageWithLinks(chat.message) }} />
      </div>
    </div>
  </div>

  <div className='rc-action'>
    <BootstrapTooltip title='Reply' placement='top'>
      <button onClick={() => setReplyToId(chat.id)}><HiArrowUturnRight/> Reply</button>
    </BootstrapTooltip>

    <BootstrapTooltip title='Delete' placement='top'>
      {isOwnMessage && (
        <button onClick={() => handleDelete(chat.id)}><HiOutlineTrash/> Delete</button>
      )}
    </BootstrapTooltip>
  </div>
</div>




import React, { useEffect, useRef, useState } from 'react';
import '../style/fitur/RoomCardChat.css'
import { IoIosSend } from "react-icons/io";
import { createMessage, deleteMessage, getAllCardChat } from '../services/ApiServices';
import { HiArrowUturnDown, HiArrowUturnRight, HiOutlineTrash, HiXMark } from 'react-icons/hi2';
import BootstrapTooltip from '../components/Tooltip';
import TextEditor from '../modules/TextEditor';
import TextEditor2 from '../modules/TextEditor2';
import { useParams } from 'react-router-dom';

const RoomCardChat = ({cards, userId, cardId,onClose,assignedUsers,assignableUsers }) => {
  const {card} = useParams();
  // const [cards, setCards] = useState('')
  const [chats, setChats] = useState([]);
  const [message, setMessage] = useState('');
  const [replyToId, setReplyToId] = useState(null);
  const formRef = useRef(null)

  //debug 
  console.log('Room card menerima data cards:', cards);
  // console.log('Lihat data replyToId', replyToId);
  console.log('melihat data assignableUsers',assignableUsers)

  useEffect(() => {
    if (cardId) {
      fetchChats();
    }
  }, [cardId]);

  const fetchChats = async () => {
    try {
      const res = await getAllCardChat(cardId);
      setChats(res.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const fetchCardById = async()=>{

  }

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await createMessage(cardId, {
        user_id: userId,
        message,
        parent_message_id: replyToId || null,
      });
      setMessage('');
      setReplyToId(null);
      fetchChats();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleDelete = async (chatId) => {
    try {
      await deleteMessage(chatId);
      fetchChats();
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  //FUNGSI PARSE TEXT
  const parseMessageWithLinks = (text) => {
    const urlRegex = /https?:\/\/[^\s]+/g;
    return text.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });
  };
  

  //FUNSI DATE 
  function formatChatTime(sendTimeStr) {
    const sendTime = new Date(sendTimeStr);
    const now = new Date();
  
    // Hapus jam:menit:detik untuk perbandingan hari
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
  
    const sendDate = new Date(sendTime.getFullYear(), sendTime.getMonth(), sendTime.getDate());
  
    const timeString = sendTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  
    if (sendDate.getTime() === today.getTime()) {
      return `Today ${timeString}`;
    } else if (sendDate.getTime() === yesterday.getTime()) {
      return `Yesterday ${timeString}`;
    } else {
      // Format: 05 May 02:00 PM
      const dateString = sendTime.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short'
      });
      return `${dateString} ${timeString}`;
    }
  }
  
 


  //RENDER CHAT
  const renderChat = (chat) => {
    const isOwnMessage = chat.user_id === userId;

    // Cek apakah ini adalah reply
    const repliedChat = chat.parent_message_id
      ? chats.find((msg) => msg.id === chat.parent_message_id)
      : null;

    const repliedUser = repliedChat
      ? assignableUsers.find(user => user.user_id === repliedChat.user_id)
      : null;

    const repliedUsername = repliedUser?.username || 'Unknown';


    return (
      <div
        key={chat.id}
        className='rc-container'
        style={{
          justifyContent: isOwnMessage ? 'flex-end' : 'flex-start', padding:'0px 5px'
        }}
      >
        <div className='rc-content'
          style={{
            // border: '1px solid yellow',
            display: 'flex',
            flexDirection: 'column',
            // alignItems: 'flex-start',
            justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
            width:'80%'

          }}
        >
          <div
            className="rc-message-group"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
            }}
          >
            <div className='rc-text-title'
                style={{
                  display:'flex',
                  alignItems:'center',
                  justifyContent: isOwnMessage ? 'flex-end': 'flex-start',
                  marginBottom:'5px'
                  // border:'1px solid green'
                }}
            >
                    <img src={chat.photo_url} alt={chat.username} />
                    <strong>{chat.username}</strong>
                    <p>
                      {formatChatTime(chat.send_time)}
                    </p>
                  </div>
              <div className="rc-box"
                  style={{
                    // backgroundColor: isOwnMessage ? '#6b11cb3f' : '#fff', 
                    backgroundImage: isOwnMessage 
                      ? 'linear-gradient(to right, #2575fc, #3963f3, #4c4fe8, #5c38db, #6a11cb)' 
                      : 'none',
                    backgroundColor: isOwnMessage ? 'transparent' : '#fff',
                    color:isOwnMessage ? '#fff': '#333',
                    border:`1px solid ${isOwnMessage ? '#6b11cb3f' : '#eee'}`,
                    borderRadius:'16px',
                    padding:'5px',
                    maxWidth: 'fit-content',
                    alignSelf: isOwnMessage ? 'flex-end' : 'flex-start',
                    borderBottomRightRadius: isOwnMessage ? '2px' : '16px',
                    borderBottomLeftRadius: isOwnMessage ? '16px' : '4px',
                    boxShadow: isOwnMessage
                      ? '0px 4px 8px #5e12eb46'
                      : '0px 4px 8px rgba(0, 0, 0, 0.1)',
                    display:'flex',
                    // alignItems:'center',
                    justifyContent: isOwnMessage ? 'flex-end' : 'flex-start' 
                  }}>
                <div className='rc-text'>
                  {/* <p>{chat.message}</p>  */}
                  <p dangerouslySetInnerHTML={{ __html: parseMessageWithLinks(chat.message) }} />
                </div>
              </div>
            <div className='rc-action'>
                <BootstrapTooltip title='Reply' placement='top'>
                  <button onClick={() => setReplyToId(chat.id)}><HiArrowUturnRight/> Reply</button>
                </BootstrapTooltip>
                
                <BootstrapTooltip title='Delete' placement='top'>
                  {isOwnMessage && (
                    <button onClick={() => handleDelete(chat.id)}><HiOutlineTrash/>Delete</button>
                  )}
                </BootstrapTooltip>
              </div>
            </div>
          
  
          {/* {chat.replies?.length > 0 && (
            <div className='rc-reply-cont'>
              {chat.replies.map(renderChat)}
            </div>
          )} */}
          <div className='rep-container' >
          {chat.replies.map((reply) => {
              const isOwnReply = reply.user_id === userId;
              return (
                  <div className='rep-box' key={reply.id}>
                    <div className='rep-title'>
                      <div className="rep-left">
                        <img src={reply.photo_url} alt={reply.username} />
                        <strong style={{fontSize:'12px'}}>{reply.username}</strong>
                      </div>
                        <div className="ref-right">
                          <p>{formatChatTime(reply.send_time)}</p>
                        </div>
                    </div>
                    <div
                      className='rc-reply-box'
                      style={{
                        backgroundColor: isOwnReply ? '#6b11cb3f' : '#FFFFFF',
                        border: `1px solid ${isOwnReply ? '#6b11cb3f' : '#CCC'}`,
                        // background:'#f5f5f5',
                        padding: 5,
                        margin:'5px',
                        // fontSize:'10px',
                        // borderLeft:'0.1px solid #333',
                        // marginLeft:25,
                        boxShadow:'0px 4px 8px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      <p style={{margin:'0px', fontSize:'10px'}}
                      dangerouslySetInnerHTML={{ __html: parseMessageWithLinks(reply.message) }} 
                      />
                      {/* <p style={{margin:'0px', fontSize:'12px'}}>{reply.message}</p> */}
                    </div>
                  </div>
              );
            })}
            </div>

        </div>
        
      </div>
    );
  };
  

  return (
    <div className='main-rcc' >
      <div className='main-conver' >
        <div className="main-cover-header">
          <h4>Room Chat</h4>
          <HiXMark onClick={onClose}/>
        </div>
        {chats.map(renderChat)}
      </div>

      {/* Form hanya menangani submit, tidak membungkus editor */}
      <div className="rep-editor">
        <form
          className='form-chat'
          ref={formRef}
          onSubmit={handleSend}
          // style={{ display: 'none' }} // Sembunyikan atau tampilkan sesuai kebutuhan
        >
          {replyToId && (() => {
            const repliedChat = chats.find(chat => chat.id === replyToId || chat.replies?.some(reply => reply.id === replyToId));
            const repliedUserId = repliedChat?.id === replyToId
              ? repliedChat.user_id
              : repliedChat?.replies?.find(reply => reply.id === replyToId)?.user_id;

            const username = assignableUsers.find(user => user.user_id === repliedUserId)?.username || `User ID: ${repliedUserId}`;

            return (
              <div className='reply-alert'>
                <div className="rep">
                  <HiArrowUturnRight/>
                  <strong>Replying to :</strong> 
                  {username}
                </div>
                <button
                  type="button"
                  className='rep-btn'
                  onClick={() => setReplyToId(null)}
                >
                  Cancel
                </button>
              </div>
            );
          })()}
        </form>


        {/* TextEditor2 di luar form */}
        <div className='editor-wrapper'>
          <div className="text-editor" >
            <TextEditor2 value={message} onChange={setMessage} />
          </div>
          
          <div className="ew-content">
            <button
              type="button"
              onClick={() => formRef.current?.requestSubmit()}
            >
              <IoIosSend className='ew-icon'/>
              {/* Send */}
            </button>
          </div>
        </div>    
      </div>
      

       
    </div>
  );
};

export default RoomCardChat;


app.delete('/api/delete-cover/:cardId', async (req, res) => {
    const { cardId } = req.params;
    const userId = req.user.id; // pastikan kamu pakai middleware auth untuk dapat req.user

    try {
        // Ambil dulu data cover sebelum dihapus
        const coverResult = await client.query(
            "SELECT * FROM card_cover WHERE card_id = $1",
            [cardId]
        );

        if (coverResult.rowCount === 0) {
            return res.status(404).json({ message: "No cover found for this card." });
        }

        const cover = coverResult.rows[0]; // Data cover sebelum dihapus

        // Hapus cover
        await client.query(
            "DELETE FROM card_cover WHERE card_id = $1",
            [cardId]
        );

        // Log aktivitas penghapusan cover
        await logCardActivity({
            card_id: parseInt(cardId),
            user_id: userId,
            action: "delete",
            entity: "cover",
            entity_id: cover.id, // Ini id cover yang dihapus
            details: {
                message: "Cover removed from card"
            }
        });

        res.json({ message: "Cover removed successfully." });
    } catch (error) {
        console.error("Error deleting cover:", error);
        res.status(500).json({ error: error.message });
    }
});



//10vw
{
  // acc,
  // status,
  // order Number,
  // account,
  // deadline,
  // order_type,
  // offer_type,
  // jenis_track,
  // genre,
  // price normal,
  // price discount,
  // discount,
  // basic price,
}

//12vw
{
  // input,
  // buyer name,
  // coder order,

  // project type,
  // duration,
}

