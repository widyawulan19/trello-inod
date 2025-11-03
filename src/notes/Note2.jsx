<<<<<<< HEAD
<<<<<<< HEAD

// import React, { useEffect, useState } from 'react';
// import { getActivityCard } from '../services/ApiServices';
// import { useUser } from '../context/UserContext';
// import '../style/modules/CardActivity.css';

// const COLOR_BORDER = {
//   updated_title: '#3b82f6',      // blue-500
//   updated_desc: '#6366f1',       // indigo-500
//   remove_label: '#ef4444',       // red-500
//   remove_user: '#ef4444',        // red-500
//   remove_cover: '#ef4444',       // red-500
//   add_user: '#22c55e',           // green-500
//   add_label: '#22c55e',          // green-500
//   add_cover: '#22c55e',          // green-500
//   // updated_cover: '#eab308',   // yellow-500 (optional, uncomment if needed)
//   updated_due: '#a855f7',        // purple-500
//   updated_prio: '#ec4899',       // pink-500
//   updated_status: '#14b8a6',      // teal-500
//   move: '#f59e0b',
//   duplicate:''
// };

// const MESSAGE_ACTIVITY = {
//   updated_title: 'updated title to',
//   updated_desc: 'updated description',
//   remove_label: 'removed label',
//   remove_user: 'removed user',
//   remove_cover: 'removed cover from card',
//   add_user: 'added a user',
//   add_label: 'added a new label',
//   add_cover:'added a new cover',
//   // updated_cover: 'updated cover card',
//   updated_due: 'updated due date',
//   updated_prio: 'updated priority card',
//   updated_status: 'updated status',
//   move: 'moved this card',
//   duplicate: 'duplicate this card'
// };
=======
// // const handleSendMessage = async () => {
// //   const html = editorRef.current?.innerHTML || "";
// //   if (!html.trim() && pendingFiles.length === 0) return;

// //   try {
// //     const res = await createMessage(cardId, {
// //       user_id: userId,
// //       message: html, // simpan dengan format HTML
// //       parent_message_id: null,
// //     });

// //     const chatId = res.data.id;

// //     for (let file of pendingFiles) {
// //       await uploadChatMedia(chatId, file);
// //     }

// //     editorRef.current.innerHTML = "";
// //     setPendingFiles([]);
// //     fetchChats();
// //     showSnackbar("Pesan + file terkirim!", "success");
// //   } catch (err) {
// //     console.error("Send error:", err);
// //     showSnackbar("Gagal kirim pesan", "error");
// //   }
// // };


// // const handleSendReply = async (parentId) => {
// //   const html = replyEditorRefs.current[parentId]?.innerHTML || "";
// //   const files = replyPendingFiles[parentId] || [];
// //   if (!html.trim() && files.length === 0) return;

// //   try {
// //     const res = await createMessage(cardId, {
// //       user_id: userId,
// //       message: html, // simpan dengan format HTML
// //       parent_message_id: parentId,
// //     });

// //     const chatId = res.data.id;
// //     for (let file of files) {
// //       await uploadChatMedia(chatId, file);
// //     }

// //     replyEditorRefs.current[parentId].innerHTML = "";
// //     setReplyPendingFiles((prev) => ({ ...prev, [parentId]: [] }));

// //     fetchChats();
// //     showSnackbar("Success reply", "success");
// //   } catch (err) {
// //     console.error("Reply error:", err);
// //     showSnackbar("Reply failed", "error");
// //   }
// // };
>>>>>>> feature

// const CardActivity = ({ cardId, fetchCardById }) => {
//   const { user } = useUser();
//   const userId = user?.id;
//   const [cardActivities, setCardActivities] = useState([]);
//   const [loading, setLoading] = useState(false);

//   //debug
//   console.log('file card activity menerima fetchcardById', fetchCardById);

<<<<<<< HEAD
//   const fetchCardActivites = async () => {
//     try {
//       setLoading(true);
//       const response = await getActivityCard(cardId);
//       setCardActivities(response.data.activities); // Pastikan sesuai struktur
//     } catch (error) {
//       console.error('Failed to fetch card activity:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (cardId) {
//       fetchCardActivites();
//     }
//   }, [cardId]);

//   return (
//     <div className="ca-container">
//       {loading ? (
//         <p>Loading...</p>
//       ) : cardActivities.length === 0 ? (
//         <p
//           style={{
//             // border:'1px solid red',
//             width:'100%',
//             display:'flex',
//             alignItems:'center',
//             justifyContent:'center',
//             fontSize:'12px'
//           }}
//         >No activity yet.</p>
//       ) : (
//         <ul className="space-y-3">
//           {cardActivities.map((activity) => {
//             const detail = activity.action_detail ? JSON.parse(activity.action_detail) : {};
//             const actionKey = `${activity.action_type}_${activity.entity}`;
//             const borderColor = COLOR_BORDER[activity.action_type] || '#ddd';
//             const messageText = MESSAGE_ACTIVITY[activity.action_type] || `${activity.action_type}`;
            
//             let message = `${activity.username} ${messageText}`;
            


//             if (detail.old_title && detail.new_title) {
//               message += ` "${detail.new_title}"`;
//               // message += ` from "${detail.old_title}" to "${detail.new_title}"`;
//             } else if (detail.new_title) {
//               message += ` "${detail.new_title}"`;
//             }

//             return (
//               <li
//                 key={activity.id}
//                 className='ca-li'
//                 style={{
//                   padding: '0.25rem',
//                   borderLeftWidth: '4px',
//                   borderLeftStyle: 'solid',
//                   borderLeftColor: borderColor,
//                   backgroundColor: '#f8fafc', // slate-50
//                   borderRadius: '0.25rem',
//                 }}
//               >
//                 <p 
//                   style={{
//                     fontSize:'12px',
//                     padding:'0px',
//                     margin:'0px'
//                   }}
//                 className="text-sm">{message}</p>
//                 <p 
//                   style={{
//                     fontSize:'10px',
//                     // border:'1px solid red',
//                     width:'100%',
//                     display:'flex',
//                     alignItems:'center',
//                     justifyContent:'flex-end'
//                   }}
//                 >
//                   {new Date(activity.created_at).toLocaleString()}
//                 </p>
//               </li>
//             );
//           })}
//         </ul>
//       )}
//     </div>
//   );
<<<<<<< HEAD
// };

// export default CardActivity;
=======
// }
=======
// // const html = editorRef.current?.innerHTML || "";
// // if ((!html || html === "<br>") && pendingFiles.length === 0) return;

// // const res = await createMessage(cardId, {
// //   user_id: userId,
// //   message: html, // simpan HTML biar bold/italic tetap tampil
// //   parent_message_id: null,
// // });



// // const html = replyEditorRefs.current[parentId]?.innerHTML || "";
// // ...
// // message: html,


// // import React, { useRef, useEffect } from "react";

// // export default function ChatInput() {
// //   const editorRef = useRef(null);

// //   // === FORMAT TOOLS ===
// //   const handleFormat = (command, value = null) => {
// //     document.execCommand(command, false, value);
// //     editorRef.current?.focus();
// //   };

// //   // === SHORTCUT HANDLER ===
// //   const handleKeyDown = (e) => {
// //     if (!e.ctrlKey && !e.metaKey) return; // hanya tangkap Ctrl/Cmd

// //     // Bold: Ctrl + B
// //     if (e.key.toLowerCase() === "b") {
// //       e.preventDefault();
// //       handleFormat("bold");
// //     }

// //     // Italic: Ctrl + I
// //     if (e.key.toLowerCase() === "i") {
// //       e.preventDefault();
// //       handleFormat("italic");
// //     }

// //     // Underline: Ctrl + U
// //     if (e.key.toLowerCase() === "u") {
// //       e.preventDefault();
// //       handleFormat("underline");
// //     }

// //     // Strikethrough: Ctrl + Shift + S
// //     if (e.shiftKey && e.key.toLowerCase() === "s") {
// //       e.preventDefault();
// //       handleFormat("strikeThrough");
// //     }

// //     // Ordered list: Ctrl + Shift + O
// //     if (e.shiftKey && e.key.toLowerCase() === "o") {
// //       e.preventDefault();
// //       handleFormat("insertOrderedList");
// //     }

// //     // Unordered list: Ctrl + Shift + U
// //     if (e.shiftKey && e.key.toLowerCase() === "u") {
// //       e.preventDefault();
// //       handleFormat("insertUnorderedList");
// //     }

// //     // Inline code: Ctrl + E
// //     if (e.key.toLowerCase() === "e") {
// //       e.preventDefault();
// //       // ambil teks yang dipilih lalu bungkus dengan <code>
// //       const selection = window.getSelection();
// //       if (selection.rangeCount > 0) {
// //         const range = selection.getRangeAt(0);
// //         const codeNode = document.createElement("code");
// //         range.surroundContents(codeNode);
// //       }
// //     }
// //   };

// //   useEffect(() => {
// //     const editor = editorRef.current;
// //     if (editor) editor.addEventListener("keydown", handleKeyDown);
// //     return () => editor?.removeEventListener("keydown", handleKeyDown);
// //   }, []);

// //   return (
// //     <div className="p-3 bg-white border rounded-lg shadow">
// //       {/* Toolbar */}
// //       <div className="flex gap-2 mb-2">
// //         <button onClick={() => handleFormat("bold")}><b>B</b></button>
// //         <button onClick={() => handleFormat("italic")}><i>I</i></button>
// //         <button onClick={() => handleFormat("underline")}><u>U</u></button>
// //         <button onClick={() => handleFormat("strikeThrough")}><s>S</s></button>
// //         <button onClick={() => handleFormat("insertOrderedList")}>1.</button>
// //         <button onClick={() => handleFormat("insertUnorderedList")}>•</button>
// //         <button onClick={() => handleFormat("code")}><code>{`</>`}</code></button>
// //       </div>

// //       {/* Editable area */}
// //       <div
// //         ref={editorRef}
// //         contentEditable
// //         suppressContentEditableWarning
// //         className="min-h-[120px] border p-2 rounded focus:outline-none"
// //         placeholder="Tulis pesanmu..."
// //       />
// //     </div>
// //   );
// // }


// import React, { useEffect, useState } from 'react';
// import { getBoardsByWorkspace } from '../services/ApiServices';
// import { useUser } from '../context/UserContext';
// import { useParams } from 'react-router-dom';

// const BoardList = () => {
//   const { workspaceId } = useParams();
//   const { user } = useUser(); // pastikan user.id ada
//   const [boards, setBoards] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchBoards = async () => {
//       try {
//         const data = await getBoardsByWorkspace(workspaceId, user.id);
//         setBoards(data);
//       } catch (error) {
//         console.error('Failed to load boards:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (workspaceId && user?.id) {
//       fetchBoards();
//     }
//   }, [workspaceId, user]);

//   if (loading) return <p>Loading boards...</p>;

//   return (
//     <div>
//       <h2>Boards in Workspace {workspaceId}</h2>
//       {boards.length > 0 ? (
//         <ul>
//           {boards.map((b) => (
//             <li key={b.id}>{b.name}</li>
//           ))}
//         </ul>
//       ) : (
//         <p>No boards found.</p>
//       )}
//     </div>
//   );
// };

// export default BoardList;
>>>>>>> feature


// // src/pages/BoardPage.js
// import React, { useEffect, useState } from 'react';
// import { getBoardsWorkspace } from '../services/ApiServices';
// import { useParams } from 'react-router-dom';
// import '../style/pages/BoardPage.css';

// const BoardPage = () => {
//   const { workspaceId } = useParams(); // Ambil workspaceId dari URL
//   const [boards, setBoards] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const userId = localStorage.getItem('userId'); // Misal disimpan waktu login

//   useEffect(() => {
//     const fetchBoards = async () => {
//       try {
//         const data = await getBoardsWorkspace(workspaceId, userId);
//         setBoards(data);
//       } catch (error) {
//         console.error('Gagal ambil boards:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (workspaceId && userId) {
//       fetchBoards();
//     }
//   }, [workspaceId, userId]);

//   if (loading) return <p>Loading boards...</p>;

//   return (
//     <div className="board-page">
//       <h2 className="board-title">Boards di Workspace #{workspaceId}</h2>
//       <div className="board-list">
//         {boards.length > 0 ? (
//           boards.map((board) => (
//             <div key={board.id} className="board-card">
//               <h3>{board.name}</h3>
//               <p>{board.description}</p>
//             </div>
//           ))
//         ) : (
          
//         )}
//       </div>
//     </div>
//   );
// };

// export default BoardPage;


import React, { useEffect, useRef, useState } from 'react';
import { createMessage, deleteMessage, getAllCardChat, uploadChatMedia } from '../services/ApiServices';
import '../style/fitur/NewRoomChat.css';
import { FaXmark } from 'react-icons/fa6';
import { IoArrowUpOutline, IoReturnDownBackSharp, IoTrash } from "react-icons/io5";
import { useSnackbar } from '../context/Snackbar';
import bg from '../assets/tele-wallps.png';

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
    const html = editorRef.current?.innerHTML || "";
    if ((!html || html === "<br>") && pendingFiles.length === 0) return;

    try {
      const res = await createMessage(cardId, {
        user_id: userId,
        message: html,
        parent_message_id: null,
      });

      const chatId = res.data.id;

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

  // const handleFormat = (command, value = null) => {
  //   document.execCommand(command, false, value);
  //   editorRef.current?.focus();
  // };

  const handleFormat = (command, target = 'main') => {
    const editor = target === 'main' ? editorRef.current : replyEditorRefs.current[target];
    if (!editor) return;

    editor.focus();
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const parent = range.startContainer.parentNode;

    // Fungsi helper buat ngebungkus teks jadi list item
    const wrapInList = (listTag) => {
      const list = document.createElement(listTag);
      const li = document.createElement('li');
      li.appendChild(range.extractContents());
      list.appendChild(li);
      range.insertNode(list);
    };

    // ========== BOLD / ITALIC / UNDERLINE / STRIKE ==========
    if (['bold', 'italic', 'underline', 'strikethrough'].includes(command)) {
      const tagMap = {
        bold: 'b',
        italic: 'i',
        underline: 'u',
        strikethrough: 's',
      };
      const tag = tagMap[command];
      const el = document.createElement(tag);
      el.appendChild(range.extractContents());
      range.insertNode(el);
      return;
    }

    // ========== ORDERED / UNORDERED LIST ==========
    if (command === 'orderedList' || command === 'unorderedList') {
      const listTag = command === 'orderedList' ? 'ol' : 'ul';

      // Kalau udah di dalam list → ubah balik ke paragraf
      if (parent.tagName === 'LI' && parent.parentNode.tagName === listTag.toUpperCase()) {
        const p = document.createElement('p');
        p.innerHTML = parent.innerHTML;
        parent.parentNode.replaceWith(p);
        return;
      }

      // Kalau bukan list → bungkus jadi list baru
      wrapInList(listTag);
      return;
    }

    // ========== CODE ==========
    if (command === 'code') {
      const codeNode = document.createElement('code');
      try {
        range.surroundContents(codeNode);
      } catch {
        codeNode.textContent = selection.toString();
        range.deleteContents();
        range.insertNode(codeNode);
      }
    }
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

  // function autoLinkHTML(html) {
  //   if (!html) return "";
  //   return html.replace(/(^|[^">])(https?:\/\/[^\s<]+)/g,
  //     (match, prefix, url) => `${prefix}<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
  //   );
  // }
  function autoLinkHTML(html) {
  if (!html) return "";

  // Regex: http, https, mailto
  const urlRegex = /(^|[^">])(https?:\/\/[^\s<]+|mailto:[^\s<]+)/g;

  return html.replace(urlRegex, (match, prefix, url) => {
    // Jangan buat <a> jika sudah ada tag <a>
    if (/<a\s/i.test(url)) return match;
    return `${prefix}<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
  });
}


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

      {/* <div
        className={`chat-bubble ${chat.user_id === userId ? 'chat-bubble-own' : 'chat-bubble-other'}`}
        onClick={e => {
          const link = e.target.closest("a");
          if (link && link.target !== "_blank") {
            window.open(link.href, "_blank", "noopener,noreferrer");
          }
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: autoLinkHTML(chat.message) }} />
        {renderMedia(chat.medias)}
      </div> */}
      <div
  className={`chat-bubble ${chat.user_id === userId ? 'chat-bubble-own' : 'chat-bubble-other'}`}
  onClick={(e) => {
    const link = e.target.closest("a");
    if (link) {
      e.preventDefault(); // cegah browser override default
      e.stopPropagation(); // ⛔ stop event supaya gak bubble ke parent!
      window.open(link.href, "_blank", "noopener,noreferrer");
    }
  }}
>
  <div dangerouslySetInnerHTML={{ __html: autoLinkHTML(chat.message) }} />
  {renderMedia(chat.medias)}
</div>


      <div className="chat-actions">
        {chat.parent_message_id === null && <button className="chat-reply-btn" onClick={() => setReplyTo(chat.id)}><IoReturnDownBackSharp/> Reply</button>}
        <button className="chat-reply-btn" onClick={() => handleDeleteChat(chat.id)}><IoTrash/> Delete</button>
      </div>

      {replyTo === chat.id && (
        <div className="chat-reply-form">
          <div className="chat-toolbar">
            <button onClick={() => handleFormat('bold', chat.id)}><b>B</b></button>
            <button onClick={() => handleFormat('italic', chat.id)}><i>I</i></button>
            <button onClick={() => handleFormat('underline', chat.id)}><u>U</u></button>
            <button onClick={() => handleFormat('strikethrough', chat.id)}><s>S</s></button>
            <button onClick={() => handleFormat('orderedList', chat.id)}>1.</button>
            <button onClick={() => handleFormat('unorderedList', chat.id)}>•</button>
            <button onClick={() => handleFormat('code', chat.id)}><code>{`</>`}</code></button>

            <label className="upload-btn">📎
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
        <div className="chat-toolbar">
          <button onClick={() => handleFormat('bold', 'main')}><b>B</b></button>
          <button onClick={() => handleFormat('italic', 'main')}><i>I</i></button>
          <button onClick={() => handleFormat('underline', 'main')}><u>U</u></button>
          <button onClick={() => handleFormat('strikethrough', 'main')}><s>S</s></button>
          <button onClick={() => handleFormat('orderedList', 'main')}>1.</button>
          <button onClick={() => handleFormat('unorderedList', 'main')}>•</button>
          <button onClick={() => handleFormat('code', 'main')}><code>{`</>`}</code></button>


          <label className="upload-btn">📎
            <input type="file" style={{ display: "none" }} onChange={e => handleUploadFromEditor(e, "main")} />
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
    </div>
  );
};

<<<<<<< HEAD
export default BoardList;
>>>>>>> feature
=======
// export default NewRoomChat;



const [editingMessage, setEditingMessage] = useState(null);
const [editText, setEditText] = useState('');

const handleEditMessage = (msg) => {
  setEditingMessage(msg.id);
  setEditText(msg.message);
};

const handleSaveEdit = async () => {
  if (!editText.trim()) return;

  const res = await updateMessage(editingMessage, {
    user_id: user.id,
    message: editText,
  });

  if (res.data) {
    // Update di frontend tanpa refetch
    setMessages(prev =>
      prev.map(m => m.id === editingMessage ? res.data : m)
    );
    setEditingMessage(null);
    setEditText('');
  }
};



// ✅ Tambahan: import ReactQuill tetap ada karena dipakai di editor edit
import React, { useEffect, useRef, useState } from 'react';
import ReactQuill from 'react-quill-new';
import "quill/dist/quill.snow.css";
import { createMessage, deleteMessage, getAllCardChat, updateMessage, uploadChatMedia } from '../services/ApiServices';
import '../style/fitur/NewRoomChat.css';
import { FaXmark } from 'react-icons/fa6';
import { IoArrowUpOutline, IoReturnDownBackSharp, IoTrash } from "react-icons/io5";
import { useSnackbar } from '../context/Snackbar';
import bg from '../assets/tele-wallps.png';
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // ✅ EDIT MESSAGE FEATURE
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');

  // ✅ Fungsi mulai edit
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
      }
    } catch (error) {
      console.error('Error editing message:', error);
      showSnackbar('Gagal mengedit pesan', 'error');
    }
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditText('');
  };

  // ✅ EMOJI
  const handleShowEmoji = () => {
    setShowEmojiPicker((prev) => !prev);
  };

  useEffect(() => {
    fetchChats();
  }, [cardId]);

  useEffect(() => {
    if (chatListRef.current) {
      chatListRef.current.scrollTo({
        top: chatListRef.current.scrollHeight,
        behavior: "smooth",
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

      setReplyMessage((prev) => ({ ...prev, [parentId]: "" }));
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
      showSnackbar("Chat berhasil dihapus", "success");
    } catch (err) {
      console.error("Delete failed:", err);
      showSnackbar("Gagal hapus chat", "error");
    }
  };

  const handleUploadFromEditor = async (e, target = "main") => {
    const file = e.target.files[0];
    if (!file) return;

    if (target === "main") setPendingFiles((prev) => [...prev, file]);
    else
      setReplyPendingFiles((prev) => ({
        ...prev,
        [target]: [...(prev[target] || []), file],
      }));

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
          if (m.media_type === "image")
            return <img key={m.id} src={m.media_url} alt="chat" className="chat-media-img" />;
          if (m.media_type === "video")
            return <video key={m.id} src={m.media_url} controls className="chat-media-video" />;
          if (m.media_type === "audio")
            return <audio key={m.id} src={m.media_url} controls className="chat-media-audio" />;
          return (
            <a key={m.id} href={m.media_url} target="_blank" rel="noopener noreferrer" className="chat-media-file">
              📎 File
            </a>
          );
        })}
      </div>
    );
  };

  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike', 'code'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
    ],
  };

  const formats = ['bold', 'italic', 'underline', 'strike', 'code', 'list', 'bullet', 'link', 'image'];

  const emojiList = ["😀","😄","😁","😆","😅","😂","🤣","😊","😍","😎","🤩","😘","😢","😭","😡","🤔","👍","👎","🙏","👏","🔥","💯","🎉","❤️"];
  const insertEmoji = (emoji, target = "main") => {
    if (target === "main") setMessage((prev) => prev + emoji);
    else
      setReplyMessage((prev) => ({
        ...prev,
        [target]: (prev[target] || "") + emoji,
      }));
  };

  // ✅ RENDER CHAT DENGAN MODE EDIT
  const renderChats = (chatList, level = 0) =>
    chatList.map((chat) => (
      <div
        className={`chat-message ${level > 0 ? 'chat-reply' : ''} ${chat.user_id === userId ? 'chat-own' : ''}`}
        key={chat.id}
        style={{ marginLeft: `${level * 30}px` }}
      >
        <div className="chat-header">
          <div className="chat-image">
            <img className="chat-avatar" src={chat.photo_url || '/default-avatar.png'} alt={chat.username} />
            <span className="chat-username">{chat.username}</span>
          </div>
          <span className="chat-timestamp">{new Date(chat.send_time).toLocaleString()}</span>
        </div>

        {/* ✅ MODE EDIT */}
        {editingMessage === chat.id ? (
          <div className="edit-chat-box">
            <ReactQuill
              theme="snow"
              value={editText}
              onChange={setEditText}
              modules={modules}
              formats={formats}
            />
            <div className="edit-actions">
              <button onClick={handleSaveEdit}>💾 Save</button>
              <button onClick={handleCancelEdit}>❌ Cancel</button>
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

        {/* ✅ ACTION BUTTONS */}
        <div className="chat-actions">
          {chat.user_id === userId && (
            <button className="chat-reply-btn" onClick={() => handleEditMessage(chat)}>
              ✏️ Edit
            </button>
          )}
          {chat.parent_message_id === null && (
            <button className="chat-reply-btn" onClick={() => setReplyTo(chat.id)}>
              <IoReturnDownBackSharp /> Reply
            </button>
          )}
          <button className="chat-reply-btn" onClick={() => handleDeleteChat(chat.id)}>
            <IoTrash /> Delete
          </button>
        </div>

        {replyTo === chat.id && (
          <div className="chat-reply-form">
            <ReactQuill
              theme="snow"
              value={replyMessage[chat.id] || ""}
              onChange={(val) => setReplyMessage((prev) => ({ ...prev, [chat.id]: val }))}
              modules={modules}
              formats={formats}
              placeholder="Tulis balasan..."
            />
            <label className="upload-btn">
              📎
              <input type="file" hidden onChange={(e) => handleUploadFromEditor(e, chat.id)} />
            </label>
            <div className="emoji-picker-wrapper">
              {emojiList.map((emoji, i) => (
                <span key={i} onClick={() => insertEmoji(emoji, chat.id)}>
                  {emoji}
                </span>
              ))}
            </div>
            <div className="reply-send" onClick={() => handleSendReply(chat.id)}>
              <IoArrowUpOutline />
            </div>
          </div>
        )}

        {chat.replies?.length > 0 && renderChats(chat.replies, level + 1)}
      </div>
    ));

  if (loading) return <p className="chat-loading">Loading chats...</p>;

  return (
    <div className="chat-room-container" style={{ backgroundColor: 'white', backgroundImage: `url(${bg})`, backgroundSize: "cover" }}>
      <div className="chat-title">
        <h3>Chat Room</h3>
        <FaXmark onClick={onClose} style={{ cursor: 'pointer' }} />
      </div>

      <div className="chat-list" ref={chatListRef}>
        {chats.length === 0 ? <p className="chat-empty">No chats yet.</p> : renderChats(chats)}
      </div>

      {/* ✅ Toolbar & Editor */}
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
              <label className="upload-btn">
                <TiAttachmentOutline />
                <input type="file" hidden onChange={(e) => handleUploadFromEditor(e, "main")} />
              </label>
              <button className="btn-icon" onClick={handleShowEmoji}>
                😎
              </button>
            </div>
            <div className="act-btn">
              <button className="btn-send" onClick={handleSendMessage}>
                <IoIosSend />
              </button>
            </div>
          </div>
        </div>

        {/* SHOW EMOJI */}
        {showEmojiPicker && (
          <div className="emoji-picker-fix">
            {emojiList.map((emoji, i) => (
              <span key={i} onClick={() => insertEmoji(emoji, "main")}>
                {emoji}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// export default NewRoomChat;


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

    // notifikasi sukses
    showSnackbar("Reply terkirim!", "success");
  } catch (err) {
    console.error("Reply error:", err);
    showSnackbar("Reply gagal", "error");
  }
};


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
          <label className="upload-btn">
            <TiAttachmentOutline />
            <input
              type="file"
              hidden
              onChange={(e) => handleUploadFromEditor(e, chat.id)}
            />
          </label>

          <button
            className="btn-icon"
            onClick={() => handleShowEditEmoji(chat.id)}
          >
            😎
          </button>
        </div>

        <div className="act-btn">
          <button className="btn-send" onClick={handleSaveEdit}>
            💾
          </button>
          <button className="btn-cancel" onClick={handleCancelEdit}>
            ❌
          </button>
        </div>
      </div>
    </div>

    {/* SHOW EMOJI  */}
    {showEditEmojiPicker === chat.id && (
      <div className="emoji-picker-fix">
        {emojiList.map((emoji, i) => (
          <span key={i} onClick={() => insertEmoji(emoji, "edit")}>{emoji}</span>
        ))}
      </div>
    )}
  </div>
) : null}
>>>>>>> feature
=======
>>>>>>> feature
