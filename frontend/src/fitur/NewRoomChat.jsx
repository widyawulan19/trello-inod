import React, { useEffect, useRef, useState } from 'react';
import ReactQuill from 'react-quill-new';
import "quill/dist/quill.snow.css";
import { createMessage, deleteMessage, getAllCardChat, updateMessage, uploadChatMedia } from '../services/ApiServices';
import '../style/fitur/NewRoomChat.css';
import { FaXmark } from 'react-icons/fa6';
import { IoArrowUpOutline, IoClose, IoReturnDownBackSharp, IoTrash } from "react-icons/io5";
import { useSnackbar } from '../context/Snackbar';
import bg from '../assets/tele-wallps.png';
import ChatEditor from './ChatEditor';
import { IoIosSave, IoIosSend } from "react-icons/io";
import { TiAttachmentOutline } from "react-icons/ti";
import { BiSolidEditAlt } from "react-icons/bi";


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
  const [showReplyEmojiPicker, setShowReplyEmojiPicker] = useState(null); // khusus reply
  // EDIT MESSAGE 
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');
  const [showEditEmojiPicker, setShowEditEmojiPicker] = useState(null);


  // SHOW / HIDE EMOJI EDIT
  const handleShowEditEmoji = (chatId) => {
    setShowEditEmojiPicker((prev) => (prev === chatId ? null : chatId));
    setShowEmojiPicker(false);         // tutup emoji main
    setShowReplyEmojiPicker(null);     // tutup emoji reply
  };

  // FUNGSI EDIT MESSAGE 
  const handleEditMessage = (msg) => {
  setEditingMessage(msg.id);
  setEditText(msg.message);
};

  // ✅ Fungsi simpan edit
  const handleSaveEdit = async () => {
    if (!editText.trim()) return;

    try {
      const res = await updateMessage(editingMessage, {
        user_id: userId,
        message: editText,
      });

      if (res.data) {
        setChats((prev) =>
          prev.map((m) => (m.id === editingMessage ? res.data : m))
        );
        setEditingMessage(null);
        setEditText('');
        showSnackbar('Pesan berhasil diedit', 'success');
        fetchChats();
      }
    } catch (error) {
      console.error('Error editing message:', error);
      showSnackbar('Gagal mengedit pesan', 'error');
    }
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditText('');
    setShowEditEmojiPicker(null);
  };

  // fungsi show emoji 
  // const handleShowEmoji = () =>{
  //   setShowEmojiPicker(prev => !prev)
  // }

// untuk main editor
const handleShowEmoji = () => {
  setShowEmojiPicker(prev => !prev);        // toggle on/off
  setShowReplyEmojiPicker(null);            // tutup semua emoji reply
};

// untuk reply editor
const handleShowReplyEmoji = (chatId) => {
  setShowReplyEmojiPicker(prev => (prev === chatId ? null : chatId)); // toggle on/off
  setShowEmojiPicker(false);                // tutup emoji main
};


  // Insert Link modal state
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkModalTarget, setLinkModalTarget] = useState('main'); // 'main' or replyId
  const [linkLabel, setLinkLabel] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const savedRangeRef = useRef(null);

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

  // fungsi bersihin HTML
  // const cleanHTML = (dirty) => {
  //   return DOMPurify.sanitize(dirty, {
  //     FORBID_ATTR: ['style', 'class'],
  //     ALLOWED_TAGS: [
  //     'b', 'strong', 'i', 'em', 'u', 's', 'strike',
  //     'p', 'br', 'div', 'span',
  //     'ul', 'ol', 'li',
  //     'a', 'code', 'pre', 'blockquote'
  //   ],
  //   ALLOWED_ATTR: ['href', 'target', 'rel', 'style'],
  //   });
  // };

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

    // kalau kosong semua, jangan kirim
    if ((!html || html === "<p><br></p>") && files.length === 0) return;

    try {
       // kirim ke backend
      const res = await createMessage(cardId, {
        user_id: userId,
        message: html,
        parent_message_id: parentId,
      });

      const chatId = res.data.id;

       // upload file jika ada
      for (let file of files) await uploadChatMedia(chatId, file);

       // reset input dan file
      setReplyMessage(prev => ({ ...prev, [parentId]: "" }));
      setReplyPendingFiles(prev => ({ ...prev, [parentId]: [] }));


      // 🚀 Tutup editor reply dan emoji picker setelah kirim
      setReplyTo(null);                // tutup editor reply
      setShowReplyEmojiPicker(null);   // tutup emoji picker reply
      setShowEmojiPicker(false);       // tutup emoji picker main (jaga-jaga)


      // refresh chat list 
      fetchChats();

      //notifikasi sukses
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
  // const insertEmoji = (emoji, target = "main") => {
  //   if (target === "main") setMessage(prev => prev + emoji);
  //   else setReplyMessage(prev => ({ ...prev, [target]: (prev[target] || "") + emoji }));
  // };
  const insertEmoji = (emoji, target = "main") => {
    if (target === "main") {
      setMessage(prev => prev + emoji);
    } 
    else if (target === "edit") {
      setEditText(prev => (prev || "") + emoji);
    } 
    else {
      setReplyMessage(prev => ({
        ...prev,
        [target]: (prev[target] || "") + emoji,
      }));
    }
  };



  // const handleInsertLink = (e) => {
  //   e.preventDefault();
  //   if (!linkUrl) { showSnackbar('Masukkan URL dulu', 'error'); return; }

  //   // restore selection
  //   const sel = window.getSelection();
  //   sel.removeAllRanges();
  //   if (savedRangeRef.current) sel.addRange(savedRangeRef.current);

  //   // determine target editor
  //   const target = linkModalTarget;
  //   const editor = target === 'main' ? editorRef.current : replyEditorRefs.current[target];

  //   if (!editor) {
  //     showSnackbar('Editor tidak ditemukan', 'error');
  //     closeLinkModal();
  //     return;
  //   }

  //   // If there's a selection, create link around it
  //   try {
  //     // execCommand createLink will wrap selection. If no selection, it will create an <a> with URL as text in some browsers; we'll handle both.
  //     document.execCommand('createLink', false, linkUrl);

  //     // find the created/updated link inside editor at selection
  //     const currentSel = window.getSelection();
  //     let anchor = null;
  //     if (currentSel.rangeCount > 0) {
  //       const node = currentSel.anchorNode;
  //       anchor = node?.nodeType === 1 ? node.closest('a') : node?.parentElement?.closest?.('a');
  //     }

  //     // if we didn't get anchor, try searching for last inserted <a> inside editor with href
  //     if (!anchor) {
  //       anchor = Array.from(editor.querySelectorAll('a')).reverse().find(a => a.getAttribute('href') === linkUrl);
  //     }

  //     if (anchor) {
  //       // set attributes
  //       anchor.setAttribute('target', '_blank');
  //       anchor.setAttribute('rel', 'noopener noreferrer');
  //       if (linkLabel) anchor.textContent = linkLabel;
  //     } else {
  //       // fallback: insert an <a> node
  //       const a = document.createElement('a');
  //       a.href = linkUrl;
  //       a.target = '_blank';
  //       a.rel = 'noopener noreferrer';
  //       a.textContent = linkLabel || linkUrl;
  //       // insert at caret
  //       if (savedRangeRef.current) {
  //         savedRangeRef.current.deleteContents();
  //         savedRangeRef.current.insertNode(a);
  //       } else {
  //         editor.appendChild(a);
  //       }
  //     }

  //     // focus back
  //     editor.focus();
  //     closeLinkModal();
  //   } catch (err) {
  //     console.error('Insert link failed', err);
  //     showSnackbar('Gagal insert link', 'error');
  //     closeLinkModal();
  //   }
  // };

  // ---------------- end helpers ----------------

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


        {/* ✅ MODE EDIT */}
        {editingMessage === chat.id ? (
          <div className="edit-chat-box">
            <div className="editor-wrapper">
              <div className="ql-container">
                <ReactQuill
                  theme="snow"
                  value={editText}
                  onChange={setEditText}
                  modules={modules}
                  formats={formats}
                  placeholder="Edit pesan..."
                  className="my-editor"
                />
              </div>

              <div className="editor-actions">
                <div className="more-act">
                  <label className="upload-btn"><TiAttachmentOutline/>
                    <input type="file" hidden onChange={e => handleUploadFromEditor(e, chat.id)} />
                  </label>
                  <button className='btn-icon' onClick={() => handleShowEditEmoji(chat.id)}>
                    😎
                  </button>
                </div>
                <div className="act-btn">
                  <button className="btn-send" onClick={() => handleSaveEdit(chat.id)}>
                    <IoIosSend/>
                  </button>
                </div>
              </div>
            </div>

            {/* SHOW EMOJI */}
            {showEditEmojiPicker === chat.id && (
              <div className="emoji-picker-fix">
                {emojiList.map((emoji, i) => (
                  <span key={i} onClick={() => insertEmoji(emoji, "edit")}>{emoji}</span>
                ))}
              </div>
            )}

            <div className="edit-actions">
              <button className='save-edit' onClick={() => handleSaveEdit(chat.id)}><IoIosSave/> Save</button>
              <button className='cancle-edit' onClick={handleCancelEdit}><IoClose/> Cancel</button>
            </div>
          </div>
        ) : (
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
            {chat.updated_at !== chat.created_at && (
              <span className="edited-label">(edited)</span>
            )}
            {renderMedia(chat.medias)}
          </div>
        )}


      <div className="chat-actions">
        {chat.user_id === userId && (
          <button className="chat-reply-btn" onClick={() => handleEditMessage(chat)}>
            <BiSolidEditAlt /> Edit
          </button>
        )}
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
          <div className="editor-wrapper">
            <div className="ql-container">
              <ReactQuill
                theme="snow"
                value={replyMessage[chat.id] || ""}
                onChange={(val) => setReplyMessage(prev => ({ ...prev, [chat.id]: val }))}
                modules={modules}
                formats={formats}
                placeholder="Tulis balasan..."
                className="my-editor"
              />
            </div>
            <div className="editor-actions">
              <div className="more-act">
                <label className="upload-btn"><TiAttachmentOutline/>
                  <input type="file" hidden onChange={e => handleUploadFromEditor(e, chat.id)} />
                </label>
                <button className='btn-icon' onClick={() => handleShowReplyEmoji(chat.id)}>
                  😎
                </button>

              </div>
              <div className="act-btn">
                <button className="btn-send"  onClick={() => handleSendReply(chat.id)}>
                  <IoIosSend/>
                </button>
              </div>
              
            </div>
          </div>
          {/* SHOW EMOJI  */}
              {showReplyEmojiPicker === chat.id && (
                <div className="emoji-picker-fix">
                  {emojiList.map((emoji, i) => (
                    <span key={i} onClick={() => insertEmoji(emoji, chat.id)}>{emoji}</span>
                  ))}
                </div>
              )}          
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


// reply 
{/* <div className="ql-container">
            <ReactQuill
              theme="snow"
              value={replyMessage[chat.id] || ""}
              onChange={(val) => setReplyMessage(prev => ({ ...prev, [chat.id]: val }))}
              modules={modules}
              formats={formats}
              placeholder="Tulis balasan..."
              className="my-editor"
            />
          </div>
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
          </div> */}