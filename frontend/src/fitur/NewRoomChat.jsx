import React, { useEffect, useRef, useState } from 'react'
import { createMessage, deleteMessage, getAllCardChat } from '../services/ApiServices';
import '../style/fitur/NewRoomChat.css'
import { FaXmark } from 'react-icons/fa6';
import { IoArrowUpOutline, IoReturnDownBackSharp, IoTrash } from "react-icons/io5";
import { BsArrowReturnLeft } from "react-icons/bs";
import { useSnackbar } from '../context/Snackbar';

const NewRoomChat=({cardId, userId, onClose})=> {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyMessages, setReplyMessages] = useState({});
  const editorRef = useRef(null);
  const replyEditorRefs = useRef({}); 
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const {showSnackbar} = useSnackbar();

    useEffect(() => {
      fetchChats();
    }, [cardId]);   

    //FETCH ALL CHAT
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

    //SEND MESSAGE
    const handleSendMessage = async () => {
    const html = editorRef.current?.innerHTML;
    if (!html || html === '<br>') return;

    await createMessage(cardId, {
        user_id: userId,
        message: html,
        parent_message_id: null,
    });

    editorRef.current.innerHTML = '';
    fetchChats();
    showSnackbar('Success add a new message', 'success')
    console.log('Success create a new message');
    };

    //CREATE & REPLY
    const handleSendReply = async (parentId) => {
    const html = replyEditorRefs.current[parentId]?.innerHTML;
    if (!html || html === '<br>') return;

    await createMessage(cardId, {
        user_id: userId,
        message: html,
        parent_message_id: parentId,
    });

    replyEditorRefs.current[parentId].innerHTML = '';
    setReplyTo(null);
    fetchChats();
    showSnackbar('Success reply', 'success')
    console.log('Success reply message');
    };

    //DELETE CHAT
    const handleDeleteChat = async (chatId) => {
      try {
        await deleteMessage(chatId);
        fetchChats();
        showSnackbar('Successfully delete chat','success')
      } catch (err) {
        console.error('Delete failed:', err);
        showSnackbar('Failed to delete chat', 'error')
      }
    };
    
    const handleFormat = (command, value = null) => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        // Fokus ke area yang lagi aktif
        document.execCommand(command, false, value);
    };

    //emoji picker function
    const emojiList = [
        "😀", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😍", "😎", "🤩", "😘", "😢", "😭", "😡", "🤔", "👍", "👎", "🙏", "👏", "🔥", "💯", "🎉", "❤️"
        ];

        const insertEmoji = (emoji, target = 'main') => {
        let editor = null;

        if (target === 'main') {
            editor = editorRef.current;
        } else {
            editor = replyEditorRefs.current[target];
        }

        if (editor && editor.isContentEditable) {
            editor.focus(); // Fokus ke editor sebelum insert
            document.execCommand('insertText', false, emoji);
        }

        setShowEmojiPicker(false);
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.emoji-picker') && !e.target.closest('.emoji-picker-wrapper')) {
            setShowEmojiPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    //render chat 
    const renderChats = (chatList, level = 0) => {
    return chatList.map((chat) => (
     <div
        className={`chat-message ${level > 0 ? 'chat-reply' : ''} ${chat.user_id === userId ? 'chat-own' : ''}`}
        key={chat.id}
        style={{ marginLeft: `${level * 30}px` }}
        >

        <div className="chat-header">
            <div className="chat-image">
                 <img
                    className="chat-avatar"
                    src={chat.photo_url || '/default-avatar.png'}
                    alt={chat.username}
                />
                <span className="chat-username">{chat.username}</span>
            </div>
            <div className="chat-user-info">
              {/* <span className="chat-username">{chat.username}</span> */}
              <span className="chat-timestamp">
                {new Date(chat.send_time).toLocaleString()}
              </span>
            </div>
        </div>

       <div
            className={`chat-bubble ${chat.user_id === userId ? 'chat-bubble-own' : 'chat-bubble-other'}`}
            dangerouslySetInnerHTML={{ __html: autoLinkHTML(chat.message) }}
        />

        {/* CHAT REPLY  */}
        <div className="chat-actions">
          {/* Hanya tampilkan tombol Reply jika chat utama (bukan reply) */}
          {chat.parent_message_id === null && (
            <button
              className="chat-reply-btn"
              onClick={() => setReplyTo(replyTo === chat.id ? null : chat.id)}
            >
              {/* {replyTo === chat.id ? 'Cancel' : 'Reply'} */}
                {replyTo === chat.id ? 'Cancel' : <><IoReturnDownBackSharp/> Reply</>}
            </button>
          )}
          <button
            className="chat-reply-btn"
            onClick={() => handleDeleteChat(chat.id)}
          >
            <IoTrash/> Delete
          </button>
        </div>

        {replyTo === chat.id && (
            <div className="chat-reply-form">
                {/* Toolbar untuk reply */}
                <div className="chat-toolbar">
                <button onClick={() => handleFormat('bold')}>
                    <b>B</b>
                </button>
                <button onClick={() => handleFormat('italic')}>
                    <i>I</i>
                </button>
                <button onClick={() => handleFormat('underline')}>
                    <u>U</u>
                </button>
                {/* <button onClick={() => handleFormat('insertText', '😄')}>😄</button> */}
                    <div className="emoji-picker-wrapper">
                        <button onClick={() =>
                            setShowEmojiPicker(showEmojiPicker === chat.id ? null : chat.id)
                        }>
                            😄
                        </button>

                        {showEmojiPicker === chat.id && (
                            <div className="emoji-picker">
                            {emojiList.map((emoji, index) => (
                                <span
                                    key={index}
                                    className="emoji-item"
                                    onClick={() => insertEmoji(emoji, chat.id)}
                                    >
                                    {emoji}
                                </span>

                            ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Editor Reply */}
                <div className="chat-input-box">
                    <div
                        className="chat-editor"
                        contentEditable
                        ref={(el) => (replyEditorRefs.current[chat.id] = el)}
                        placeholder="Write a reply..."
                        suppressContentEditableWarning={true}
                    />

                    <div className='reply-send' onClick={() => handleSendReply(chat.id)}><IoArrowUpOutline/></div>
                </div>
            </div>
        )}



        {chat.replies?.length > 0 && renderChats(chat.replies, level + 1)}
      </div>
    ));
  };

//   AUTO LINK 
    function autoLinkHTML(html) {
        const urlRegex = /(\b(https?|ftp):\/\/[^\s<]+)/gi;

        // Gunakan <a href="..."> untuk URL, tapi hindari mengganggu HTML tag yang sudah ada
        return html.replace(urlRegex, (url) => {
            return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
        });
    }

  if (loading) return <p className="chat-loading">Loading chats...</p>;

    
return (
  <div className="chat-room-container">
    <div className="chat-title">
        <h3>Chat Room</h3>
        <FaXmark onClick={onClose}/>
    </div>
    

    <div className="chat-list">
      {loading ? (
        <p className="chat-loading">Loading chats...</p>
      ) : chats.length === 0 ? (
        <p className="chat-empty">No chats yet.</p>
      ) : (
        renderChats(chats)
      )}
    </div>

    {/* Toolbar Format */}
    <div className="chat-toolbar-container">
        <div className="chat-toolbar">
            <button onClick={() => handleFormat('bold')}>
                <b>B</b>
            </button>
            <button onClick={() => handleFormat('italic')}>
                <i>I</i>
            </button>
            <button onClick={() => handleFormat('underline')}>
                <u>U</u>
            </button>
            {/* <button onClick={() => handleFormat('insertText', '😄')}>😄</button> */}
            <div className="emoji-picker-wrapper">
                <button onClick={() =>
                    setShowEmojiPicker(showEmojiPicker === 'main' ? null : 'main')
                }>
                    😄
                </button>

                {showEmojiPicker === 'main' && (
                    <div className="emoji-picker">
                    {emojiList.map((emoji, index) => (
                        <span
                            key={index}
                            className="emoji-item"
                            onClick={() => insertEmoji(emoji, 'main')}
                            >
                            {emoji}
                        </span>
                    ))}
                    </div>
                )}
            </div>

        </div>

        {/* Input Message */}
        <div className="chat-input-box" >
            <div
                className="chat-editor"
                contentEditable
                ref={(el) => (editorRef.current = el)}
                placeholder="Type your message..."
                suppressContentEditableWarning={true}
            />
            <div className="btn-send" onClick={handleSendMessage}>
                <IoArrowUpOutline/>
            </div>
        </div>
    </div>
   
  </div>
);

}

export default NewRoomChat