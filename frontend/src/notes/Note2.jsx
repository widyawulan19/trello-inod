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


// const handleSendReply = async (parentId) => {
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



// const html = editorRef.current?.innerHTML || "";
// if ((!html || html === "<br>") && pendingFiles.length === 0) return;

// const res = await createMessage(cardId, {
//   user_id: userId,
//   message: html, // simpan HTML biar bold/italic tetap tampil
//   parent_message_id: null,
// });



// const html = replyEditorRefs.current[parentId]?.innerHTML || "";
// ...
// message: html,


// import React, { useRef, useEffect } from "react";

// export default function ChatInput() {
//   const editorRef = useRef(null);

//   // === FORMAT TOOLS ===
//   const handleFormat = (command, value = null) => {
//     document.execCommand(command, false, value);
//     editorRef.current?.focus();
//   };

//   // === SHORTCUT HANDLER ===
//   const handleKeyDown = (e) => {
//     if (!e.ctrlKey && !e.metaKey) return; // hanya tangkap Ctrl/Cmd

//     // Bold: Ctrl + B
//     if (e.key.toLowerCase() === "b") {
//       e.preventDefault();
//       handleFormat("bold");
//     }

//     // Italic: Ctrl + I
//     if (e.key.toLowerCase() === "i") {
//       e.preventDefault();
//       handleFormat("italic");
//     }

//     // Underline: Ctrl + U
//     if (e.key.toLowerCase() === "u") {
//       e.preventDefault();
//       handleFormat("underline");
//     }

//     // Strikethrough: Ctrl + Shift + S
//     if (e.shiftKey && e.key.toLowerCase() === "s") {
//       e.preventDefault();
//       handleFormat("strikeThrough");
//     }

//     // Ordered list: Ctrl + Shift + O
//     if (e.shiftKey && e.key.toLowerCase() === "o") {
//       e.preventDefault();
//       handleFormat("insertOrderedList");
//     }

//     // Unordered list: Ctrl + Shift + U
//     if (e.shiftKey && e.key.toLowerCase() === "u") {
//       e.preventDefault();
//       handleFormat("insertUnorderedList");
//     }

//     // Inline code: Ctrl + E
//     if (e.key.toLowerCase() === "e") {
//       e.preventDefault();
//       // ambil teks yang dipilih lalu bungkus dengan <code>
//       const selection = window.getSelection();
//       if (selection.rangeCount > 0) {
//         const range = selection.getRangeAt(0);
//         const codeNode = document.createElement("code");
//         range.surroundContents(codeNode);
//       }
//     }
//   };

//   useEffect(() => {
//     const editor = editorRef.current;
//     if (editor) editor.addEventListener("keydown", handleKeyDown);
//     return () => editor?.removeEventListener("keydown", handleKeyDown);
//   }, []);

//   return (
//     <div className="p-3 bg-white border rounded-lg shadow">
//       {/* Toolbar */}
//       <div className="flex gap-2 mb-2">
//         <button onClick={() => handleFormat("bold")}><b>B</b></button>
//         <button onClick={() => handleFormat("italic")}><i>I</i></button>
//         <button onClick={() => handleFormat("underline")}><u>U</u></button>
//         <button onClick={() => handleFormat("strikeThrough")}><s>S</s></button>
//         <button onClick={() => handleFormat("insertOrderedList")}>1.</button>
//         <button onClick={() => handleFormat("insertUnorderedList")}>•</button>
//         <button onClick={() => handleFormat("code")}><code>{`</>`}</code></button>
//       </div>

//       {/* Editable area */}
//       <div
//         ref={editorRef}
//         contentEditable
//         suppressContentEditableWarning
//         className="min-h-[120px] border p-2 rounded focus:outline-none"
//         placeholder="Tulis pesanmu..."
//       />
//     </div>
//   );
// }


import React, { useEffect, useState } from 'react';
import { getBoardsByWorkspace } from '../services/ApiServices';
import { useUser } from '../context/UserContext';
import { useParams } from 'react-router-dom';

const BoardList = () => {
  const { workspaceId } = useParams();
  const { user } = useUser(); // pastikan user.id ada
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const data = await getBoardsByWorkspace(workspaceId, user.id);
        setBoards(data);
      } catch (error) {
        console.error('Failed to load boards:', error);
      } finally {
        setLoading(false);
      }
    };

    if (workspaceId && user?.id) {
      fetchBoards();
    }
  }, [workspaceId, user]);

  if (loading) return <p>Loading boards...</p>;

  return (
    <div>
      <h2>Boards in Workspace {workspaceId}</h2>
      {boards.length > 0 ? (
        <ul>
          {boards.map((b) => (
            <li key={b.id}>{b.name}</li>
          ))}
        </ul>
      ) : (
        <p>No boards found.</p>
      )}
    </div>
  );
};

export default BoardList;
