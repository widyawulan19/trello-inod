import React, { useEffect, useRef, useState } from 'react';
import ReactQuill from 'react-quill-new';
import "quill/dist/quill.snow.css";
import { createMessage, deleteMessage, getAllCardChat, uploadChatMedia } from '../services/ApiServices';
import '../style/fitur/NewRoomChat.css';
import { FaXmark } from 'react-icons/fa6';
import { IoArrowUpOutline, IoReturnDownBackSharp, IoTrash } from "react-icons/io5";
import { useSnackbar } from '../context/Snackbar';
import bg from '../assets/tele-wallps.png';
import ChatEditor from './ChatEditor';
import { IoIosSend } from "react-icons/io";
import { TiAttachmentOutline } from "react-icons/ti";


const NewRoomChat = ({ cardId, userId, onClose }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [replyMessage, setReplyMessage] = useState({});
  const chatListRef = useRef(null);
  const [replyTo, setReplyTo] = useState(null);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [replyPendingFiles, setReplyPendingFiles] = useState({});
  const { showSnackbar } = useSnackbar();
  const editorRef = useRef(null);
  const mainEditorRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  // fungsi show emoji 
  const handleShowEmoji = () =>{
    setShowEmojiPicker(prev => !prev)
  }

  useEffect(() => {
    fetchChats();
  }, [cardId]);

  useEffect(() => {
    if (chatListRef.current) {
      chatListRef.current.scrollTo({
        top: chatListRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [chats]);

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
    if ((!message || message === "<p><br></p>") && pendingFiles.length === 0) return;
    try {
      const res = await createMessage(cardId, {
        user_id: userId,
        message,
        parent_message_id: null,
      });

      const chatId = res.data.id;
      for (let file of pendingFiles) await uploadChatMedia(chatId, file);

      setMessage('');
      setPendingFiles([]);
      fetchChats();
      showSnackbar("Pesan terkirim!", "success");
    } catch (err) {
      console.error("Send error:", err);
      showSnackbar("Gagal kirim pesan", "error");
    }
  };

  const handleSendReply = async (parentId) => {
    const html = replyMessage[parentId] || "";
    const files = replyPendingFiles[parentId] || [];
    if ((!html || html === "<p><br></p>") && files.length === 0) return;

    try {
      const res = await createMessage(cardId, {
        user_id: userId,
        message: html,
        parent_message_id: parentId,
      });

      const chatId = res.data.id;
      for (let file of files) await uploadChatMedia(chatId, file);

      setReplyMessage(prev => ({ ...prev, [parentId]: "" }));
      setReplyPendingFiles(prev => ({ ...prev, [parentId]: [] }));
      fetchChats();
      showSnackbar("Reply terkirim!", "success");
    } catch (err) {
      console.error("Reply error:", err);
      showSnackbar("Reply gagal", "error");
    }
  };

  const handleDeleteChat = async (chatId) => {
    try {
      await deleteMessage(chatId);
      fetchChats();
      showSnackbar('Chat berhasil dihapus', 'success');
    } catch (err) {
      console.error('Delete failed:', err);
      showSnackbar('Gagal hapus chat', 'error');
    }
  };

  const handleUploadFromEditor = async (e, target = "main") => {
    const file = e.target.files[0];
    if (!file) return;

    if (target === "main") setPendingFiles((prev) => [...prev, file]);
    else setReplyPendingFiles((prev) => ({ ...prev, [target]: [...(prev[target] || []), file] }));

    showSnackbar("File ditambahkan, akan dikirim saat klik kirim", "info");
  };

  function autoLinkHTML(html) {
    if (!html) return "";
    const urlRegex = /(^|[^">])(https?:\/\/[^\s<]+|mailto:[^\s<]+)/g;
    return html.replace(urlRegex, (match, prefix, url) => {
      if (/<a\s/i.test(url)) return match;
      return `${prefix}<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });
  }

  const renderMedia = (medias) => {
    if (!medias || medias.length === 0) return null;
    return (
      <div className="chat-media">
        {medias.map((m) => {
          if (m.media_type === "image") return <img key={m.id} src={m.media_url} alt="chat" className="chat-media-img" />;
          if (m.media_type === "video") return <video key={m.id} src={m.media_url} controls className="chat-media-video" />;
          if (m.media_type === "audio") return <audio key={m.id} src={m.media_url} controls className='chat-media-audio'/>;
          return <a key={m.id} href={m.media_url} target="_blank" rel="noopener noreferrer" className="chat-media-file">📎 File</a>;
        })}
      </div>
    );
  };

  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike', 'code'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
    ],
  };

  const formats = [
  'bold', 'italic', 'underline', 'strike', 'code',
  'list', 'bullet',
  'link', 'image'
];


  const emojiList = ["😀","😄","😁","😆","😅","😂","🤣","😊","😍","😎","🤩","😘","😢","😭","😡","🤔","👍","👎","🙏","👏","🔥","💯","🎉","❤️"];
  const insertEmoji = (emoji, target = "main") => {
    if (target === "main") setMessage(prev => prev + emoji);
    else setReplyMessage(prev => ({ ...prev, [target]: (prev[target] || "") + emoji }));
  };

  const renderChats = (chatList, level = 0) => chatList.map(chat => (
    <div
      className={`chat-message ${level > 0 ? 'chat-reply' : ''} ${chat.user_id === userId ? 'chat-own' : ''}`}
      key={chat.id}
      style={{ marginLeft: `${level * 30}px` }}
    >
      <div className="chat-header">
        <div className="chat-image">
          <img className="chat-avatar" src={chat.photo_url || '/default-avatar.png'} alt={chat.username}/>
          <span className="chat-username">{chat.username}</span>
        </div>
        <span className="chat-timestamp">{new Date(chat.send_time).toLocaleString()}</span>
      </div>

      <div
        className={`chat-bubble ${chat.user_id === userId ? 'chat-bubble-own' : 'chat-bubble-other'}`}
        onClick={(e) => {
          const link = e.target.closest("a");
          if (link) {
            e.preventDefault();
            e.stopPropagation();
            window.open(link.href, "_blank", "noopener,noreferrer");
          }
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: autoLinkHTML(chat.message) }} />
        {renderMedia(chat.medias)}
      </div>

      <div className="chat-actions">
        {chat.parent_message_id === null && (
          <button className="chat-reply-btn" onClick={() => setReplyTo(chat.id)}>
            <IoReturnDownBackSharp/> Reply
          </button>
        )}
        <button className="chat-reply-btn" onClick={() => handleDeleteChat(chat.id)}>
          <IoTrash/> Delete
        </button>
      </div>

      {replyTo === chat.id && (
        <div className="chat-reply-form">
          <ReactQuill
            theme="snow"
            value={replyMessage[chat.id] || ""}
            onChange={(val) => setReplyMessage(prev => ({ ...prev, [chat.id]: val }))}
            modules={modules}
            formats={formats}
            placeholder="Tulis balasan..."
          />
          <label className="upload-btn">📎
            <input type="file" hidden onChange={e => handleUploadFromEditor(e, chat.id)} />
          </label>
          <div className="emoji-picker-wrapper">
            {emojiList.map((emoji, i) => (
              <span key={i} onClick={() => insertEmoji(emoji, chat.id)}>{emoji}</span>
            ))}
          </div>
          <div className="reply-send" onClick={() => handleSendReply(chat.id)}>
            <IoArrowUpOutline/>
          </div>
        </div>
      )}

      {chat.replies?.length > 0 && renderChats(chat.replies, level + 1)}
    </div>
  ));

  if (loading) return <p className="chat-loading">Loading chats...</p>;

  return (
    <div className="chat-room-container" style={{ backgroundColor:'white', backgroundImage: `url(${bg})`, backgroundSize: "cover" }}>
      <div className="chat-title">
        <h3>Chat Room</h3>
        <FaXmark onClick={onClose} style={{cursor:'pointer'}}/>
      </div>

      <div className="chat-list" ref={chatListRef}>
        {chats.length === 0 ? <p className="chat-empty">No chats yet.</p> : renderChats(chats)}
      </div>

    {/* ✅ Toolbar & Editor gabung */}
      <div className="chat-toolbar-container">
        <div className="editor-wrapper">
          <div className="ql-container">
            <ReactQuill
              theme="snow"
              value={message}
              onChange={setMessage}
              modules={modules}
              formats={formats}
              placeholder="Tulis pesan..."
              className="my-editor"
            />
          </div>
          <div className="editor-actions">
            <div className="more-act">
              <label className="upload-btn"><TiAttachmentOutline/>
                <input type="file" hidden onChange={e => handleUploadFromEditor(e, "main")} />
              </label>
              <button className='btn-icon' onClick={handleShowEmoji}>
                😎
              </button>
            </div>
            <div className="act-btn">
              <button className="btn-send" onClick={handleSendMessage}>
                <IoIosSend/>
              </button>
            </div>
            
          </div>
        </div>
         {/* SHOW EMOJI  */}
            {showEmojiPicker && (
              <div className="emoji-picker-fix">
                  {emojiList.map((emoji, i) => (
                    <span key={i} onClick={() => insertEmoji(emoji, 'main')}>{emoji}</span>
                  ))}
              </div>
            )}
        
      </div>
    </div>
  );
};

export default NewRoomChat;
