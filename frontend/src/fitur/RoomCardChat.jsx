import React, { useEffect, useRef, useState } from 'react';
import '../style/fitur/RoomCardChat.css'
import { IoIosSend } from "react-icons/io";
import { createMessage, deleteMessage, getAllCardChat } from '../services/ApiServices';
import { HiArrowUturnDown, HiArrowUturnRight, HiOutlineTrash } from 'react-icons/hi2';
import BootstrapTooltip from '../components/Tooltip';
import TextEditor from '../modules/TextEditor';
import TextEditor2 from '../modules/TextEditor2';
import { useParams } from 'react-router-dom';

const RoomCardChat = ({cards, userId, cardId,assignedUsers,assignableUsers }) => {
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

    return (
      <div
        key={chat.id}
        className='rc-container'
        style={{
          justifyContent: isOwnMessage ? 'flex-end' : 'flex-start'
        }}
      >
        <div className='rc-content'>
        <div className='rc-text-title'>
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
                maxWidth: '60%',
                alignSelf: isOwnMessage ? 'flex-end' : 'flex-start',
                borderBottomRightRadius: isOwnMessage ? '2px' : '16px',
                borderBottomLeftRadius: isOwnMessage ? '16px' : '4px',
                boxShadow: isOwnMessage
                  ? '0px 4px 8px #5e12eb46'
                  : '0px 4px 8px rgba(0, 0, 0, 0.1)',
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
          
  
          {/* {chat.replies?.length > 0 && (
            <div className='rc-reply-cont'>
              {chat.replies.map(renderChat)}
            </div>
          )} */}
          <div className='rep-container'>
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
