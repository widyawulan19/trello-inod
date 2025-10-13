import React, { useEffect, useRef, useState } from 'react';
import { createMessage, deleteMessage, getAllCardChat, uploadChatMedia } from '../services/ApiServices';
import '../style/fitur/NewRoomChat.css';
import { FaLink, FaXmark } from 'react-icons/fa6';
import { IoArrowUpOutline, IoReturnDownBackSharp, IoTrash } from "react-icons/io5";
import { ImAttachment } from "react-icons/im";
import { useSnackbar } from '../context/Snackbar';
import bg from '../assets/tele-wallps.png';
import DOMPurify from "dompurify";

const NewRoomChat = ({ cardId, userId, onClose }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const editorRef = useRef(null);
  const chatListRef = useRef(null);
  const replyEditorRefs = useRef({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { showSnackbar } = useSnackbar();
  const [replyTo, setReplyTo] = useState(null);

  const [pendingFiles, setPendingFiles] = useState([]);
  const [replyPendingFiles, setReplyPendingFiles] = useState({});

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
  const cleanHTML = (dirty) => {
    return DOMPurify.sanitize(dirty, {
      FORBID_ATTR: ['style', 'class'],
      ALLOWED_TAGS: [
        'b', 'strong', 'i', 'em', 'u', 'br', 'p', 'a', 'ul', 'ol', 'li',
      ],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
    });
  };

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
    const html = editorRef.current?.innerHTML || "";
    if ((!html || html === "<br>") && pendingFiles.length === 0) return;

    try {
      const res = await createMessage(cardId, {
        user_id: userId,
        message: html,
        parent_message_id: null,
      });

      const chatId = res.data.id;
      for (let file of pendingFiles) await uploadChatMedia(chatId, file);

      editorRef.current.innerHTML = "";
      setPendingFiles([]);
      fetchChats();
      showSnackbar("Pesan + file terkirim!", "success");
    } catch (err) {
      console.error("Send error:", err);
      showSnackbar("Gagal kirim pesan", "error");
    }
  };

  const handleSendReply = async (parentId) => {
    const html = replyEditorRefs.current[parentId]?.innerHTML || "";
    const files = replyPendingFiles[parentId] || [];
    if ((!html || html === "<br>") && files.length === 0) return;

    try {
      const res = await createMessage(cardId, {
        user_id: userId,
        message: html,
        parent_message_id: parentId,
      });

      const chatId = res.data.id;
      for (let file of files) await uploadChatMedia(chatId, file);

      replyEditorRefs.current[parentId].innerText = "";
      setReplyPendingFiles((prev) => ({ ...prev, [parentId]: [] }));
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

  const handleFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    if (e.key.toLowerCase() === "b") { e.preventDefault(); handleFormat("bold"); }
    if (e.key.toLowerCase() === "i") { e.preventDefault(); handleFormat("italic"); }
    if (e.key.toLowerCase() === "u") { e.preventDefault(); handleFormat("underline"); }
    if (e.shiftKey && e.key.toLowerCase() === "s") { e.preventDefault(); handleFormat("strikeThrough"); }
    if (e.shiftKey && e.key.toLowerCase() === "o") { e.preventDefault(); handleFormat("insertOrderedList"); }
    if (e.shiftKey && e.key.toLowerCase() === "u") { e.preventDefault(); handleFormat("insertUnorderedList"); }
    if (e.key.toLowerCase() === "e") {
      e.preventDefault();
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const codeNode = document.createElement("code");
        range.surroundContents(codeNode);
      }
    }
  };

  useEffect(() => {
    const editor = editorRef.current;
    if (editor) editor.addEventListener("keydown", handleKeyDown);
    return () => editor?.removeEventListener("keydown", handleKeyDown);
  }, []);

  const emojiList = ["😀","😄","😁","😆","😅","😂","🤣","😊","😍","😎","🤩","😘","😢","😭","😡","🤔","👍","👎","🙏","👏","🔥","💯","🎉","❤️"];
  const insertEmoji = (emoji, target = 'main') => {
    let editor = target === 'main' ? editorRef.current : replyEditorRefs.current[target];
    if (editor && editor.isContentEditable) {
      editor.focus();
      document.execCommand('insertText', false, emoji);
    }
    setShowEmojiPicker(false);
  };

  const handleUploadFromEditor = async (e, target = "main") => {
    const file = e.target.files[0];
    if (!file) return;
    if (target === "main") setPendingFiles((prev) => [...prev, file]);
    else setReplyPendingFiles((prev) => ({ ...prev, [target]: [...(prev[target] || []), file] }));

    const fileURL = URL.createObjectURL(file);
    const editor = target === "main" ? editorRef.current : replyEditorRefs.current[target];
    let el;
    if (file.type.startsWith("image/")) el = Object.assign(document.createElement("img"), { src: fileURL, className: "chat-inline-img" });
    else if (file.type.startsWith("video/")) el = Object.assign(document.createElement("video"), { src: fileURL, controls: true, className: "chat-inline-video" });
    else { el = document.createElement("span"); el.textContent = `📎 ${file.name}`; el.style.fontStyle = "italic"; }
    editor.appendChild(el);
    showSnackbar("File ditambahkan, akan dikirim saat klik send", "info");
  };

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

  function autoLinkHTML(html) {
    if (!html) return "";
    const urlRegex = /(^|[^">])(https?:\/\/[^\s<]+|mailto:[^\s<]+)/g;
    return html.replace(urlRegex, (match, prefix, url) => {
      if (/<a\s/i.test(url)) return match;
      return `${prefix}<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });
  }

  // ---------------- Insert Link helpers ----------------
  const openLinkModal = (target = 'main') => {
    // save selection range
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    } else {
      savedRangeRef.current = null;
    }
    setLinkModalTarget(target);
    setLinkLabel('');
    setLinkUrl('');
    setLinkModalOpen(true);
  };

  const closeLinkModal = () => {
    setLinkModalOpen(false);
    setLinkLabel('');
    setLinkUrl('');
    savedRangeRef.current = null;
  };

  const handleInsertLink = (e) => {
    e.preventDefault();
    if (!linkUrl) { showSnackbar('Masukkan URL dulu', 'error'); return; }

    // restore selection
    const sel = window.getSelection();
    sel.removeAllRanges();
    if (savedRangeRef.current) sel.addRange(savedRangeRef.current);

    // determine target editor
    const target = linkModalTarget;
    const editor = target === 'main' ? editorRef.current : replyEditorRefs.current[target];

    if (!editor) {
      showSnackbar('Editor tidak ditemukan', 'error');
      closeLinkModal();
      return;
    }

    // If there's a selection, create link around it
    try {
      // execCommand createLink will wrap selection. If no selection, it will create an <a> with URL as text in some browsers; we'll handle both.
      document.execCommand('createLink', false, linkUrl);

      // find the created/updated link inside editor at selection
      const currentSel = window.getSelection();
      let anchor = null;
      if (currentSel.rangeCount > 0) {
        const node = currentSel.anchorNode;
        anchor = node?.nodeType === 1 ? node.closest('a') : node?.parentElement?.closest?.('a');
      }

      // if we didn't get anchor, try searching for last inserted <a> inside editor with href
      if (!anchor) {
        anchor = Array.from(editor.querySelectorAll('a')).reverse().find(a => a.getAttribute('href') === linkUrl);
      }

      if (anchor) {
        // set attributes
        anchor.setAttribute('target', '_blank');
        anchor.setAttribute('rel', 'noopener noreferrer');
        if (linkLabel) anchor.textContent = linkLabel;
      } else {
        // fallback: insert an <a> node
        const a = document.createElement('a');
        a.href = linkUrl;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = linkLabel || linkUrl;
        // insert at caret
        if (savedRangeRef.current) {
          savedRangeRef.current.deleteContents();
          savedRangeRef.current.insertNode(a);
        } else {
          editor.appendChild(a);
        }
      }

      // focus back
      editor.focus();
      closeLinkModal();
    } catch (err) {
      console.error('Insert link failed', err);
      showSnackbar('Gagal insert link', 'error');
      closeLinkModal();
    }
  };

  // ---------------- end helpers ----------------

  const renderChats = (chatList, level = 0) => chatList.map(chat => (
    <div className={`chat-message ${level > 0 ? 'chat-reply' : ''} ${chat.user_id === userId ? 'chat-own' : ''}`} key={chat.id} style={{ marginLeft: `${level * 30}px` }}>
      <div className="chat-header">
        <div className="chat-image">
          <img className="chat-avatar" src={chat.photo_url || '/default-avatar.png'} alt={chat.username}/>
          <span className="chat-username">{chat.username}</span>
        </div>
        <div className="chat-user-info">
          <span className="chat-timestamp">{new Date(chat.send_time).toLocaleString()}</span>
        </div>
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
        <div dangerouslySetInnerHTML={{ __html: autoLinkHTML(cleanHTML(chat.message || '')) }} />
        {renderMedia(chat.medias)}
      </div>

      <div className="chat-actions">
        {chat.parent_message_id === null && <button className="chat-reply-btn" onClick={() => setReplyTo(chat.id)}><IoReturnDownBackSharp/> Reply</button>}
        <button className="chat-reply-btn" onClick={() => handleDeleteChat(chat.id)}><IoTrash/> Delete</button>
      </div>

      {replyTo === chat.id && (
        <div className="chat-reply-form">
          <div className="chat-toolbar-fix">
            <button onClick={() => handleFormat('bold')}><b>B</b></button>
            <button onClick={() => handleFormat('italic')}><i>I</i></button>
            <button onClick={() => handleFormat('underline')}><u>U</u></button>
            <button onClick={() => handleFormat('strikethrough')}><s>S</s></button>
            <button onClick={() => handleFormat('orderedList')}>1.</button>
            <button onClick={() => handleFormat('unorderedList')}>•</button>
            <button onClick={() => handleFormat('code')}><code>{`</>`}</code></button>
            <button onClick={() => openLinkModal(chat.id)}><FaLink/></button>
            <label className="upload-btn"><ImAttachment/>
              <input type="file" hidden onChange={e => handleUploadFromEditor(e, chat.id)} />
            </label>
            <div className="emoji-picker-wrapper">
              <button onClick={() => setShowEmojiPicker(showEmojiPicker === chat.id ? null : chat.id)}>😄</button>
              {showEmojiPicker === chat.id && <div className="emoji-picker">{emojiList.map((emoji, i) => <span key={i} onClick={() => insertEmoji(emoji, chat.id)}>{emoji}</span>)}</div>}
            </div>
          </div>
          <div className="chat-input-box">
            <div className="chat-editor" contentEditable ref={el => (replyEditorRefs.current[chat.id] = el)} suppressContentEditableWarning={true}/>
            <div className='reply-send' onClick={() => handleSendReply(chat.id)}><IoArrowUpOutline/></div>
          </div>
        </div>
      )}

      {chat.replies?.length > 0 && renderChats(chat.replies, level + 1)}
    </div>
  ));

  if (loading) return <p className="chat-loading">Loading chats...</p>;

  return (
    <div className="chat-room-container" style={{ backgroundColor:'white', backgroundSize: "cover", backgroundRepeat: "no-repeat", backgroundPosition: "center" }}>
      <div className="chat-title">
        <h3>Chat Room</h3>
        <FaXmark onClick={onClose} style={{cursor:'pointer'}}/>
      </div>

      <div className="chat-list" ref={chatListRef}>
        {chats.length === 0 ? <p className="chat-empty">No chats yet.</p> : renderChats(chats)}
      </div>

      <div className="chat-toolbar-container">
        <div className="chat-toolbar-fix">
          <button onClick={() => handleFormat('bold')}><b>B</b></button>
          <button onClick={() => handleFormat('italic')}><i>I</i></button>
          <button onClick={() => handleFormat('underline')}><u>U</u></button>
          <button onClick={() => handleFormat('strikethrough')}><s>S</s></button>
          <button onClick={() => handleFormat('orderedList')}>1.</button>
          <button onClick={() => handleFormat('unorderedList')}>•</button>
          <button onClick={() => handleFormat('code')}><code>{`</>`}</code></button>
          <button onClick={() => openLinkModal('main')}><FaLink/></button>
          <label className="upload-btn"><ImAttachment/>
            <input type="file" style={{ display: "none" }} onChange={e => handleUploadFromEditor(e, "main") } />
          </label>
          <div className="emoji-picker-wrapper">
            <button onClick={() => setShowEmojiPicker(showEmojiPicker === 'main' ? null : 'main')}>😄</button>
            {showEmojiPicker === 'main' && <div className="emoji-picker">{emojiList.map((emoji, i) => <span key={i} onClick={() => insertEmoji(emoji, 'main')}>{emoji}</span>)}</div>}
          </div>
        </div>

        <div className="chat-input-box">
          <div className="chat-editor" contentEditable ref={editorRef} suppressContentEditableWarning={true}/>
          <div className="btn-send" onClick={handleSendMessage}><IoArrowUpOutline/></div>
        </div>
      </div>

      {/* Link modal (simple) */}
      {linkModalOpen && (
        <div className="link-modal-backdrop" onMouseDown={closeLinkModal}>
          <form className="link-modal" onSubmit={handleInsertLink} style={{position:'absolute', right:20, bottom:100, background:'white', padding:12, borderRadius:8, boxShadow:'0 6px 20px rgba(0,0,0,0.15)'}} onMouseDown={e => e.stopPropagation()}>
            <div style={{marginBottom:8}}><strong>Insert Link</strong></div>
            <input placeholder="Label (optional)" value={linkLabel} onChange={e => setLinkLabel(e.target.value)} style={{display:'block',padding:'5px', fontSize:'12px', marginBottom:8, width:300, border:'1px solid #eee', borderRadius:'8px'}} />
            <input placeholder="https://example.com or mailto:..." value={linkUrl} onChange={e => setLinkUrl(e.target.value)} style={{display:'block', marginBottom:8, width:300,border:'1px solid #eee', borderRadius:'8px',padding:'5px', fontSize:'12px',}} />
            <div className='link-button' >
              <button className='btn-cancle' type="button" onClick={closeLinkModal}>Cancel</button>
              <button className='btn-insert' type="submit">Insert</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default NewRoomChat;
