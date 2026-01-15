import React, { useEffect, useRef, useState } from 'react';
import ReactQuill from 'react-quill-new';
import "quill/dist/quill.snow.css";
import { createMessage, deleteMessage, getAllCardChat, updateMessage, uploadChatMedia } from '../services/ApiServices';
import '../style/fitur/NewRoomChat.css';
import '../style/fitur/EditChatBox.css';
import '../style/fitur/ReplyChatBox.css';
import { FaXmark } from 'react-icons/fa6';
import { IoArrowUpOutline, IoClose, IoReturnDownBackSharp, IoTrash } from "react-icons/io5";
import { useSnackbar } from '../context/Snackbar';
import bg from '../assets/tele-wallps.png';
import ChatEditor from './ChatEditor';
import { IoIosSave, IoIosSend } from "react-icons/io";
import { TiAttachmentOutline } from "react-icons/ti";
import { BiSolidEditAlt } from "react-icons/bi";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id"; // biar bisa Bahasa Indonesia
import { HiChatBubbleLeftRight } from 'react-icons/hi2';
import { BsFillReplyFill } from 'react-icons/bs';

dayjs.extend(relativeTime);
dayjs.locale("id"); // ubah bahasa ke Indonesia

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
  const quillRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showReplyEmojiPicker, setShowReplyEmojiPicker] = useState(null); // khusus reply
  // EDIT MESSAGE 
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');
  const [showEditEmojiPicker, setShowEditEmojiPicker] = useState(null);
  //preview (optional UI preview outside editor)
  const [imagePreview, setImagePreview] = useState(null);

  const handleImagePreview = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const previewURL = URL.createObjectURL(file);

  const editor = quillRef.current.getEditor();
  const range = editor.getSelection();

  editor.insertEmbed(range.index, "image", previewURL);
};


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

  const handleCancelReply = (parentId) => {
    setReplyTo(null);

    // reset isi reply
    setReplyMessage(prev => ({
      ...prev,
      [parentId]: ""
    }));

    // reset pending file reply (kalau dipakai)
    setReplyPendingFiles(prev => ({
      ...prev,
      [parentId]: []
    }));

    // tutup emoji picker reply
    setShowReplyEmojiPicker(null);
  };


  // fungsi show emoji 
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
      console.log('-> creating message for cardId', cardId);
      const res = await createMessage(cardId, {
        user_id: userId,
        message,
        parent_message_id: null,
      });

      const chatId = res?.data?.id;
      console.log('CHAT ID FE (from createMessage):', chatId);
      console.log('Pending files length:', pendingFiles.length, pendingFiles);

      // If no files, just finish early
      if (!pendingFiles || pendingFiles.length === 0) {
        setMessage('');
        fetchChats();
        showSnackbar('Pesan terkirim!', 'success');
        return;
      }

      // Upload each file and log response / errors separately
      for (let i = 0; i < pendingFiles.length; i++) {
        const file = pendingFiles[i];
        try {
          console.log(`Uploading file ${i}`, file.name, file.type, file.size);
          const uploadRes = await uploadChatMedia(chatId, file);
          console.log('uploadRes for file', i, uploadRes);
        } catch (uploadErr) {
          console.error('Upload failed for file', i, uploadErr);
          showSnackbar(`Gagal upload file ${file.name}`, 'error');
        }
      }

      setMessage('');
      setPendingFiles([]);
      await fetchChats();
      showSnackbar('Pesan + media terkirim!', 'success');
    } catch (err) {
      console.error('Send error:', err);
      showSnackbar('Gagal kirim pesan', 'error');
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

      setReplyTo(null);
      setShowReplyEmojiPicker(null);
      setShowEmojiPicker(false);

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

  // === FIXED: handleUploadFromEditor (ensures preview shows reliably in main editor) ===

  const handleUploadFromEditor = (e, target = "main", fromToolbar = false) => {
    console.log("=== handleUploadFromEditor TERPANGGIL ===", { target });

    if (fromToolbar) {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (ev) => handleUploadFromEditor(ev, target, false); // dari toolbar sudah selesai
      input.click();
      return;
    }

  // CASE 2: Dipanggil dari <input type="file">
  const file = e.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showSnackbar("Hanya file gambar yang bisa dipreview", "error");
    // simpan tetap di pendingFiles jika mau
    if (target === "main") {
      setPendingFiles(prev => [...prev, file]);
    } else {
      setReplyPendingFiles(prev => ({
        ...prev,
        [target]: [...(prev[target] || []), file]
      }));
    }
    e.target.value = "";
    return;
  }

  // Ambil Quill instance
  const quill = mainEditorRef.current?.getEditor?.();
  if (!quill) {
    console.error("Quill belum siap (mainEditorRef null)");
    showSnackbar("Editor belum siap", "error");
    e.target.value = "";
    return;
  }

  // pastikan posisi cursor; jika null insert di akhir
  let range = quill.getSelection();
  if (!range) range = { index: quill.getLength(), length: 0 };

  // Gunakan FileReader → base64 → pasti muncul di preview
  const reader = new FileReader();
  reader.onload = () => {
    try {
      quill.insertEmbed(range.index, "image", reader.result);
      quill.setSelection(range.index + 1);

      // sinkron dengan controlled value
      setMessage(quill.root.innerHTML);

      // simpan file untuk nanti diupload
      if (target === "main") {
        setPendingFiles(prev => [...prev, file]);
      } else {
        setReplyPendingFiles(prev => ({
          ...prev,
          [target]: [...(prev[target] || []), file]
        }));
      }

      console.log("Preview berhasil ditampilkan dan file disimpan.");
    } catch (err) {
      console.error("Insert embed gagal:", err);
      showSnackbar("Gagal menampilkan preview gambar", "error");
    } finally {
      e.target.value = ""; // reset input
    }
  };

  reader.readAsDataURL(file);
};



  useEffect(() => {
    console.log('PENDING FILES UPDATED:', pendingFiles);
  }, [pendingFiles]);

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

  const removeImages = (html) => {
    if (!html) return "";
    return html.replace(/<img[^>]*>/g, ""); // hapus SEMUA tag <img>
  };




  const modules = {
    toolbar: {
      container: [
        ['bold', 'italic', 'underline', 'strike', 'code'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link', 'image'],
      ],
      handlers: {
        // image: () => handleUploadFromEditor()
        image: () => handleUploadFromEditor(null, "main", true)
      }
    }
  };

  const formats = [
    'bold', 'italic', 'underline', 'strike', 'code',
    'list',
    'link', 'image'
  ];

  const emojiList = ["😀","😄","😁","😆","😅","😂","🤣","😊","😍","😎","🤩","😘","😢","😭","😡","🤔","👍","👎","🙏","👏","🔥","💯","🎉","❤️"];
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

  const renderChats = (chatList, level = 0) => chatList.map(chat => (
    <div
      className={`chat-message-wrapper ${level > 0 ? 'is-reply' : ''}`}
      key={chat.id}
    >
      {/* GARIS THREAD */}
      {level > 0 && <div className="reply-thread-line" />}
    

    <div
      className={`chat-message ${level > 0 ? 'chat-reply' : ''} ${chat.user_id === userId ? 'chat-own' : ''}`}
      key={chat.id}
      style={{
        // marginLeft: `${level * 30}px`,
        // backgroundColor: 'red',
        // border: `1px solid ${level > 0 ? 'white' : '#eee'}`,
        boxShadow: level > 0 ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
        padding: '10px',
      }}
    >
      <div className="chat-header" style={{display:'flex', alignItems:'flex-start',justifyContent: chat.user_id === userId ? 'flex-end' : 'flex-start',}}>
        {chat.user_id !== userId && (
          <div className="chat-image">
            <img
              className="chat-avatar"
              src={chat.photo_url || "/default-avatar.png"}
              alt={chat.username}
            />
          </div>
        )}

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
                  className="my-editor-edit"
                />
              </div>

              <div className="editor-actions">
                <div className="more-act">
                  {/* <label className="upload-btn"><TiAttachmentOutline/>
                    <input type="file" accept="image/*" hidden onChange={e => handleUploadFromEditor(e, chat.id)} />
                  </label> */}
                  {/* <label htmlFor="file-upload" className="upload-btn" style={{ cursor: "pointer" }}>
                    <TiAttachmentOutline />
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => handleUploadFromEditor(e, "main")}
                  /> */}
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
            style={{ width:'100%'}}
            onClick={(e) => {
              const link = e.target.closest("a");
              if (link) {
                e.preventDefault();
                e.stopPropagation();
                window.open(link.href, "_blank", "noopener,noreferrer");
              }
            }}
          >
            <span className="chat-username">
              {chat.username} 
            </span> 
            <div dangerouslySetInnerHTML={{ __html: autoLinkHTML(chat.message) }}
              style={{marginTop:'5px'}}
            />
            {/* <div
              dangerouslySetInnerHTML={{ __html: autoLinkHTML(removeImages(chat.message)) }}
              style={{marginTop:'5px'}}
            /> */}

            {chat.updated_at !== chat.created_at && (
              <span  className="edited-label">(edited)</span>
            )}
            {/* {renderMedia(chat.medias)} */}
            {/* {renderMedia(chat.medias, chat.message)} */}
          </div>
        )}

        {chat.user_id === userId && (
          <div className="chat-image">
            <img
              className="chat-avatar"
              src={chat.photo_url || "/default-avatar.png"}
              alt={chat.username}
            />
          </div>
        )}
      </div>

      <div className="chat-actions" style={{border:'1px solid transparent'}}>
        <span className="chat-timestamp" style={{border:'1px solid transparent ', display:'flex', alignItems:'center', justifyContent:'flex-start'}}>
          {new Date(chat.send_time).toLocaleString()}
          <p>( {dayjs(chat.send_time).fromNow()} )</p>
        </span>
        {chat.user_id === userId && (
          <button className="chat-reply-btn" onClick={() => handleEditMessage(chat)}>
            <BiSolidEditAlt /> Edit
          </button>
        )}
        {chat.parent_message_id === null && (
          <button className="chat-reply-btn" onClick={() => setReplyTo(chat.id)}>
            <BsFillReplyFill/> Reply
          </button>
        )}
        <button className="chat-reply-btn" style={{color:'#F87171'}} onClick={() => handleDeleteChat(chat.id)}>
          <IoTrash/> Delete
        </button>
      </div>

      {replyTo === chat.id && (
        <div className="chat-reply-form">
          <div className="editor-wrapper">
            <div className="ql-container">
              <ReactQuill
                ref={mainEditorRef}
                theme="snow"
                value={replyMessage[chat.id] || ""}
                onChange={(val) => setReplyMessage(prev => ({ ...prev, [chat.id]: val }))}
                modules={modules}
                formats={formats}
                placeholder="Tulis balasan..."
                className="my-editor-reply"
              />
            </div>
            <div className="editor-actions">
              {/* <div className="more-act">
                <label className="upload-btn"><TiAttachmentOutline/>
                  <input type="file" accept="image/*" hidden onChange={e => handleUploadFromEditor(e, chat.id)} />
                </label> */}
                 <div className="more-act">
                  {/* <label className="upload-btn" style={{ cursor: "pointer"}}>
                    <TiAttachmentOutline />
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => handleUploadFromEditor(e, "reply")}
                    />
                  </label> */}
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
          {showReplyEmojiPicker === chat.id && (
            <div className="emoji-picker-fix">
              {emojiList.map((emoji, i) => (
                <span key={i} onClick={() => insertEmoji(emoji, chat.id)}>{emoji}</span>
              ))}
            </div>
          )}  

          {/* CANCLE REPLY          */}
          <div className="cancle-reply-box">
            <button className='cancle-reply' onClick={() => handleCancelReply(chat.id)}> <IoClose/> Cancle Reply </button>
          </div>
        </div>
      )}
      {chat.replies?.length > 0 && renderChats(chat.replies, level + 1)}
    </div>
  </div>
  ));

  if (loading) return <p className="chat-loading">Loading chats...</p>;

  return (
    <div className="chat-room-container" 
      style={{ 
        backgroundColor:'white',
      }}>
      <div className="chat-title">
        <div className="ct-left">
          <HiChatBubbleLeftRight/>
          <h3>Chat Room (Comment)</h3>
        </div>
        
        <FaXmark onClick={onClose} className='ct-icon'/>
      </div>

      <div className="chat-list" ref={chatListRef}>
        {chats.length === 0 ? <p className="chat-empty">No chats yet.</p> : renderChats(chats)}
      </div>

      {/* IMAGE PREVIEW MODAL */}
    {imagePreview && (
      <div className="image-preview-modal">
        <img src={imagePreview.url} alt="preview" />

        <button
          className="remove-preview"
          onClick={() => {
            setImagePreview(null);
            setPendingFiles([]);
          }}
        >
          <IoClose />
        </button>
      </div>
    )}


      {/* ✅ Toolbar & Editor gabung */}
      <div className="chat-toolbar-container">
        <div className="editor-wrapper">
          <div className="ql-container">
            <ReactQuill
              ref={mainEditorRef}
              theme="snow"
              value={message}
              onChange={setMessage}
              modules={modules}
              formats={formats}
              placeholder="Tulis pesan..."
              className="my-editor-tool"
            />
          </div>
          <div className="editor-actions">
            <div className="more-act">
              {/* <div className="upload-btn" style={{ cursor: "pointer"}}>
                <TiAttachmentOutline />
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}

                  onChange={(e) => handleUploadFromEditor(e, "main")}
                />
              </div> */}
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
