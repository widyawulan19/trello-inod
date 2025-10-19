import React, { useEffect, useRef, useState } from 'react'
import { createMessage, deleteMessage, getAllCardChat, uploadChatMedia } from '../services/ApiServices';
import '../style/fitur/NewRoomChat.css'
import { FaXmark } from 'react-icons/fa6';
import { IoArrowUpOutline, IoReturnDownBackSharp, IoTrash } from "react-icons/io5";
import { useSnackbar } from '../context/Snackbar';
import bg from '../assets/tele-wallps.png';

const NewRoomChat=({cardId, userId, onClose})=> {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const editorRef = useRef(null);
  const chatListRef = useRef(null);
  const replyEditorRefs = useRef({}); 
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const {showSnackbar} = useSnackbar();
  const [replyTo, setReplyTo] = useState(null);

  // === FILE STATES ===
  const [pendingFiles, setPendingFiles] = useState([]); // untuk main
  const [replyPendingFiles, setReplyPendingFiles] = useState({}); // untuk tiap reply (by parentId)

// useEffect(() => {
//   const handleLinkClick = (e) => {
//     const link = e.target.closest("a");
//     if (link) {
//       e.preventDefault(); // cegah default behavior yang mungkin diblokir
//       window.open(link.href, "_blank", "noopener,noreferrer");
//     }
//   };

//   const chatContainer = chatListRef.current;
//   chatContainer?.addEventListener("click", handleLinkClick);

//   return () => chatContainer?.removeEventListener("click", handleLinkClick);
// }, [chats]); // <- penting pakai [chats] supaya link baru juga kebaca


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


  // === FETCH ALL CHAT ===
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

  // === SEND MESSAGE (MAIN) ===
const handleSendMessage = async () => {
  const html = editorRef.current?.innerHTML || "";
  // const linkedHtml = autoLinkHTML(html);
  if ((!html || html === "<br>") && pendingFiles.length === 0) return;

  try {
    const res = await createMessage(cardId, {
    user_id: userId,
    message: html, // simpan HTML biar bold/italic tetap tampil
    // message: linkedHtml,
    parent_message_id: null,
  });


    const chatId = res.data.id;

    // Upload file dan simpan URL di server
    for (let file of pendingFiles) {
      await uploadChatMedia(chatId, file);
    }

    editorRef.current.innerHTML = "";
    setPendingFiles([]);
    fetchChats();
    showSnackbar("Pesan + file terkirim!", "success");
  } catch (err) {
    console.error("Send error:", err);
    showSnackbar("Gagal kirim pesan", "error");
  }
};
// const handleSendMessage = async () => {
//   const html = editorRef.current?.innerHTML || "";
//   if (!html.trim() && pendingFiles.length === 0) return;

//   try {
//     const res = await createMessage(cardId, {
//       user_id: userId,
//       message: html, // simpan dengan format HTML
//       parent_message_id: null,
//     });

//     const chatId = res.data.id;

//     for (let file of pendingFiles) {
//       await uploadChatMedia(chatId, file);
//     }

//     editorRef.current.innerHTML = "";
//     setPendingFiles([]);
//     fetchChats();
//     showSnackbar("Pesan + file terkirim!", "success");
//   } catch (err) {
//     console.error("Send error:", err);
//     showSnackbar("Gagal kirim pesan", "error");
//   }
// };



  // === SEND REPLY ===
  const handleSendReply = async (parentId) => {
    // const html = replyEditorRefs.current[parentId]?.innerHTML;
    // const textOnly = replyEditorRefs.current[parentId]?.innerText;
    const html = replyEditorRefs.current[parentId]?.innerHTML || "";
    const files = replyPendingFiles[parentId] || [];

    if ((!html || html === "<br>") && files.length === 0) return;
    // if(!textOnly && replyPendingFiles.length === 0) return;

    try {
      const res = await createMessage(cardId, {
        user_id: userId,
        message: html,
        // message:textOnly,
        parent_message_id: parentId,
      });

      const chatId = res.data.id;

      // Upload semua file reply
      for (let file of files) {
        await uploadChatMedia(chatId, file);
      }

      // Reset reply editor & files
      // replyEditorRefs.current[parentId].innerHTML = "";
        replyEditorRefs.current[parentId].innerText = "";
      setReplyPendingFiles((prev) => ({ ...prev, [parentId]: [] }));

      fetchChats();
      showSnackbar("Success reply", "success");
    } catch (err) {
      console.error("Reply error:", err);
      showSnackbar("Reply failed", "error");
    }
  };
//   const handleSendReply = async (parentId) => {
//   const html = replyEditorRefs.current[parentId]?.innerHTML || "";
//   const files = replyPendingFiles[parentId] || [];
//   if (!html.trim() && files.length === 0) return;

//   try {
//     const res = await createMessage(cardId, {
//       user_id: userId,
//       message: html, // simpan dengan format HTML
//       parent_message_id: parentId,
//     });

//     const chatId = res.data.id;
//     for (let file of files) {
//       await uploadChatMedia(chatId, file);
//     }

//     replyEditorRefs.current[parentId].innerHTML = "";
//     setReplyPendingFiles((prev) => ({ ...prev, [parentId]: [] }));

//     fetchChats();
//     showSnackbar("Success reply", "success");
//   } catch (err) {
//     console.error("Reply error:", err);
//     showSnackbar("Reply failed", "error");
//   }
// };


  // === DELETE CHAT ===
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

  // === FORMAT TOOLS ===
  // const handleFormat = (command, value = null) => {
  //   document.execCommand(command, false, value);
  // };
  // === FORMAT TOOLS ===
    const handleFormat = (command, value = null) => {
      document.execCommand(command, false, value);
      editorRef.current?.focus();
    };
  
    // === SHORTCUT HANDLER ===
    const handleKeyDown = (e) => {
      if (!e.ctrlKey && !e.metaKey) return; // hanya tangkap Ctrl/Cmd
  
      // Bold: Ctrl + B
      if (e.key.toLowerCase() === "b") {
        e.preventDefault();
        handleFormat("bold");
      }
  
      // Italic: Ctrl + I
      if (e.key.toLowerCase() === "i") {
        e.preventDefault();
        handleFormat("italic");
      }
  
      // Underline: Ctrl + U
      if (e.key.toLowerCase() === "u") {
        e.preventDefault();
        handleFormat("underline");
      }
  
      // Strikethrough: Ctrl + Shift + S
      if (e.shiftKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleFormat("strikeThrough");
      }
  
      // Ordered list: Ctrl + Shift + O
      if (e.shiftKey && e.key.toLowerCase() === "o") {
        e.preventDefault();
        handleFormat("insertOrderedList");
      }
  
      // Unordered list: Ctrl + Shift + U
      if (e.shiftKey && e.key.toLowerCase() === "u") {
        e.preventDefault();
        handleFormat("insertUnorderedList");
      }
  
      // Inline code: Ctrl + E
      if (e.key.toLowerCase() === "e") {
        e.preventDefault();
        // ambil teks yang dipilih lalu bungkus dengan <code>
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

  // === EMOJI ===
  const emojiList = ["😀","😄","😁","😆","😅","😂","🤣","😊","😍","😎","🤩","😘","😢","😭","😡","🤔","👍","👎","🙏","👏","🔥","💯","🎉","❤️"];
  const insertEmoji = (emoji, target = 'main') => {
    let editor = target === 'main' ? editorRef.current : replyEditorRefs.current[target];
    if (editor && editor.isContentEditable) {
      editor.focus();
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

  // === UPLOAD FILE DARI EDITOR (MAIN/REPLY) ===
const handleUploadFromEditor = async (e, target = "main") => {
  const file = e.target.files[0];
  if (!file) return;

  // Tambah ke pending files
  if (target === "main") {
    setPendingFiles((prev) => [...prev, file]);
  } else {
    setReplyPendingFiles((prev) => ({
      ...prev,
      [target]: [...(prev[target] || []), file],
    }));
  }

  // Preview sementara di editor (hanya untuk UI)
  const fileURL = URL.createObjectURL(file);
  const editor =
    target === "main" ? editorRef.current : replyEditorRefs.current[target];

  let el;
  if (file.type.startsWith("image/")) {
    el = document.createElement("img");
    el.src = fileURL;
    el.className = "chat-inline-img";
  } else if (file.type.startsWith("video/")) {
    el = document.createElement("video");
    el.src = fileURL;
    el.controls = true;
    el.className = "chat-inline-video";
  } else {
    el = document.createElement("span");
    el.textContent = `📎 ${file.name}`;
    el.style.fontStyle = "italic";
  }

  // append hanya untuk preview sementara, bukan untuk dikirim
  editor.appendChild(el);

  showSnackbar("File ditambahkan, akan dikirim saat klik send", "info");
};




  // === RENDER MEDIA ===
  const renderMedia = (medias) => {
    if (!medias || medias.length === 0) return null;
    return (
      <div className="chat-media">
        {medias.map((m) => {
          if (m.media_type === "image") return <img key={m.id} src={m.media_url} alt="chat" className="chat-media-img" />;
          if (m.media_type === "video") return <video key={m.id} src={m.media_url} controls className="chat-media-video" />;
          if (m.media_type === "audio") return <audio key={m.id} src={m.media_url} controls className='chat-media-audio'/>;
          return <a key={m.id} href={m.media_url} target="_blank" rel="noreferrer" className="chat-media-file">📎 File</a>;
        })}
      </div>
    );
  };

  // === RENDER CHATS ===
  const renderChats = (chatList, level = 0) => {
    return chatList.map((chat) => (
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
          <div className="chat-user-info">
            <span className="chat-timestamp">{new Date(chat.send_time).toLocaleString()}</span>
          </div>
        </div>

        {/* bubble */}
        {/* <div className={`chat-bubble ${chat.user_id === userId ? 'chat-bubble-own' : 'chat-bubble-other'}`}>
          <div dangerouslySetInnerHTML={{ __html: autoLinkHTML(chat.message) }} />
          {renderMedia(chat.medias)}
        </div> */}

        <div
          className={`chat-bubble ${chat.user_id === userId ? 'chat-bubble-own' : 'chat-bubble-other'}`}
          onClick={(e) => {
            const link = e.target.closest("a");
            if (link && link.target !== "_blank") {
              window.open(link.href, "_blank", "noopener,noreferrer");
            }
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: autoLinkHTML(chat.message) }} />
          {renderMedia(chat.medias)}
        </div>


        {/* actions */}
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

        {/* reply form */}
        {replyTo === chat.id && (
          <div className="chat-reply-form">
            <div className="chat-toolbar">
              {/* <button onClick={() => handleFormat('bold')}><b>B</b></button>
              <button onClick={() => handleFormat('italic')}><i>I</i></button>
              <button onClick={() => handleFormat('underline')}><u>U</u></button> */}

              <button onClick={() => handleFormat('bold')}><b>B</b></button>
              <button onClick={() => handleFormat('italic')}><i>I</i></button>
              <button onClick={() => handleFormat('underline')}><u>U</u></button>
              <button onClick={() => handleFormat('strikethrough')}><s>S</s></button>
              <button onClick={() => handleFormat('orderedList')}>1.</button>
              <button onClick={() => handleFormat('unorderedList')}>•</button>
              <button onClick={() => handleFormat('code')}>
                <code>{`</>`}</code>
              </button>

              <label className="upload-btn">
                📎
                <input type="file" hidden onChange={(e) => handleUploadFromEditor(e, chat.id)} />
              </label>
              <div className="emoji-picker-wrapper">
                <button onClick={() => setShowEmojiPicker(showEmojiPicker === chat.id ? null : chat.id)}>😄</button>
                {showEmojiPicker === chat.id && (
                  <div className="emoji-picker">
                    {emojiList.map((emoji, i) => (
                      <span key={i} className="emoji-item" onClick={() => insertEmoji(emoji, chat.id)}>{emoji}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="chat-input-box">
              <div className="chat-editor" contentEditable ref={(el) => (replyEditorRefs.current[chat.id] = el)} suppressContentEditableWarning={true}/>
              <div className='reply-send' onClick={() => handleSendReply(chat.id)}><IoArrowUpOutline/></div>
            </div>
          </div>
        )}

        {chat.replies?.length > 0 && renderChats(chat.replies, level + 1)}
      </div>
    ));
  };

  // === AUTO LINK ===
//   function autoLinkHTML(html) {
//   if (!html) return "";

//   // Jangan ubah kalau sudah ada <a> tag di dalam HTML
//   // Ini hanya menautkan URL plain text yang *tidak* diapit <a ...>
//   return html.replace(
//     /(^|[^">])(https?:\/\/[^\s<]+)/g,
//     (match, prefix, url) => `${prefix}<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
//   );
// }
function autoLinkHTML(html) {
  if (!html) return "";

  // Cari URL plain text yang belum dibungkus <a>
  return html.replace(
    /(^|[^">])(https?:\/\/[^\s<]+)/g,
    (match, prefix, url) => {
      // pastiin selalu ada target dan rel
      return `${prefix}<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    }
  );
}
  if (loading) return <p className="chat-loading">Loading chats...</p>;



  return (
    <div className="chat-room-container"
      style={{
        backgroundColor:'white',
        // backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <div className="chat-title">
        <h3>Chat Room</h3>
        <FaXmark onClick={onClose} style={{cursor:'pointer'}}/>
      </div>

      <div className="chat-list" ref={chatListRef}>
        {chats.length === 0 ? <p className="chat-empty">No chats yet.</p> : renderChats(chats)}
      </div>

      {/* Toolbar Main */}
      <div className="chat-toolbar-container">
        <div className="chat-toolbar">
          <button onClick={() => handleFormat('bold')}><b>B</b></button>
          <button onClick={() => handleFormat('italic')}><i>I</i></button>
          <button onClick={() => handleFormat('underline')}><u>U</u></button>
          <button onClick={() => handleFormat('strikethrough')}><s>S</s></button>
          <button onClick={() => handleFormat('orderedList')}>1.</button>
          <button onClick={() => handleFormat('unorderedList')}>•</button>
          <button onClick={() => handleFormat('code')}>
            <code>{`</>`}</code>
          </button>
          <label className="upload-btn">
            📎
            <input type="file" style={{ display: "none" }} onChange={(e) => handleUploadFromEditor(e, "main")} />
          </label>
          <div className="emoji-picker-wrapper">
            <button onClick={() => setShowEmojiPicker(showEmojiPicker === 'main' ? null : 'main')}>😄</button>
            {showEmojiPicker === 'main' && (
              <div className="emoji-picker">
                {emojiList.map((emoji, i) => (
                  <span key={i} className="emoji-item" onClick={() => insertEmoji(emoji, 'main')}>{emoji}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* input main */}
        <div className="chat-input-box" >
          <div className="chat-editor" contentEditable ref={editorRef} suppressContentEditableWarning={true}/>
          <div className="btn-send" onClick={handleSendMessage}><IoArrowUpOutline/></div>
        </div>
      </div>
    </div>
  );
}

export default NewRoomChat;




return (
  <li
    key={activity.id}
    className="ca-li"
    style={{
      padding: '0.25rem',
      borderLeftWidth: '4px',
      borderLeftStyle: 'solid',
      borderLeftColor: borderColor,
      backgroundColor: '#f8fafc',
      borderRadius: '0.25rem'
    }}
  >
    <p style={{ fontSize: '12px', margin: 0 }}>{messageElement}</p>

    {activity.actionDescription && (
      <p style={{ fontSize: '11px', margin: '2px 0 0 16px', color: '#64748b' }}>
        {activity.actionDescription}
      </p>
    )}

    <p
      style={{
        fontSize: '10px',
        textAlign: 'right',
        margin: 0
      }}
    >
      {new Date(activity.created_at).toLocaleString()}
    </p>
  </li>
);




const fetchCardActivities = async () => {
  try {
    setLoading(true);
    const response = await getActivityCardTesting(cardId);

    const activitiesWithUser = response.activities.map(act => ({
      ...act,
      username:
        act.action_detail?.updatedBy?.username ||
        act.movedby ||
        'Unknown',
      detail: act.action_detail || {},
    }));

    setCardActivities(activitiesWithUser);
  } catch (error) {
    console.error('Failed to fetch card activity:', error);
  } finally {
    setLoading(false);
  }
};


} else if (activity.action_type === 'updated_status' && detail.to) {
  messageElement = (
    <>
      <span className="font-semibold">{username}</span> updated status from{' '}
      <span className="text-red-500">"{detail.from || '-'}"</span> to{' '}
      <span className="text-green-600">"{detail.to}"</span>
      {detail.description && (
        <>
          <br />
          <span className="text-gray-500 text-[11px]">
            Description: {detail.description}
          </span>
        </>
      )}
    </>
  );
}
