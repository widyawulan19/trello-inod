import React, { useEffect, useState } from "react";
import { getChatsByCardId } from "../api";

const CardChats = ({ cardId }) => {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const data = await getChatsByCardId(cardId);
        setChats(data);
      } catch (err) {
        console.error("Failed to load chats", err);
      }
    };
    fetchChats();
  }, [cardId]);

  // Recursive render kalau ada replies
  const renderChats = (chatList) => {
    return chatList.map((chat) => (
      <div
        key={chat.id}
        className="p-3 mb-2 border rounded-lg bg-gray-50 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-1">
          <img
            src={chat.photo_url || "https://via.placeholder.com/40"}
            alt={chat.username}
            className="w-8 h-8 rounded-full"
          />
          <div>
            <p className="font-semibold text-sm">{chat.username}</p>
            <p className="text-xs text-gray-500">{chat.send_time}</p>
          </div>
        </div>

        <p className="text-gray-800 mb-2">{chat.message}</p>

        {/* Media render */}
        {chat.medias?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {chat.medias.map((media) => {
              if (media.media_type === "image") {
                return (
                  <img
                    key={media.id}
                    src={media.media_url}
                    alt="chat media"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                );
              } else if (media.media_type === "video") {
                return (
                  <video
                    key={media.id}
                    src={media.media_url}
                    controls
                    className="w-48 rounded-lg"
                  />
                );
              } else if (media.media_type === "audio") {
                return (
                  <audio
                    key={media.id}
                    controls
                    src={media.media_url}
                    className="w-full"
                  />
                );
              } else {
                return (
                  <a
                    key={media.id}
                    href={media.media_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline"
                  >
                    Download File
                  </a>
                );
              }
            })}
          </div>
        )}

        {/* Replies */}
        {chat.replies?.length > 0 && (
          <div className="ml-6 mt-2 border-l pl-3">
            {renderChats(chat.replies)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="space-y-3">
      {chats.length > 0 ? renderChats(chats) : <p>No chats yet.</p>}
    </div>
  );
};

export default CardChats;


// Upload file dari editor (main/reply)
const handleUploadFromEditor = async (e, target = "main", chatId = null) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    setUploading(true);

    // Kalau target reply → upload ke parent chat (chatId), 
    // kalau main → buat message dulu, lalu upload
    let messageId = chatId;

    if (!messageId) {
      // Buat dulu message kosong (supaya ada ID untuk media)
      const res = await createMessage(cardId, {
        user_id: userId,
        message: "", // kosong dulu
        parent_message_id: target !== "main" ? target : null,
      });
      messageId = res.data.id;
    }

    // Upload file
    const uploaded = await uploadChatMedia(messageId, file);

    // Insert ke editor
    let editor =
      target === "main" ? editorRef.current : replyEditorRefs.current[target];

    if (uploaded.media_type === "image") {
      editor.innerHTML += `<img src="${uploaded.media_url}" class="chat-inline-img" />`;
    } else if (uploaded.media_type === "video") {
      editor.innerHTML += `<video src="${uploaded.media_url}" controls class="chat-inline-video"></video>`;
    } else {
      editor.innerHTML += `<a href="${uploaded.media_url}" target="_blank">📎 ${file.name}</a>`;
    }

    setUploading(false);
    showSnackbar("File berhasil diupload!", "success");
  } catch (err) {
    console.error("Upload error:", err);
    setUploading(false);
    showSnackbar("Upload gagal", "error");
  }
};


const handleSendMessage = async () => {
  const html = editorRef.current?.innerHTML;
  if ((!html || html === "<br>") && pendingFiles.length === 0) return;

  try {
    // Buat message baru
    const res = await createMessage(cardId, {
      user_id: userId,
      message: html,
      parent_message_id: null,
    });

    const chatId = res.data.id;

    // Upload semua pending files ke message yang baru dibuat
    for (let file of pendingFiles) {
      await uploadChatMedia(chatId, file.file); 
      // pastikan API uploadChatMedia bisa terima chatId + file
    }

    // Reset editor & files
    editorRef.current.innerHTML = "";
    setPendingFiles([]);

    fetchChats();
    showSnackbar("Success add a new message", "success");
  } catch (err) {
    console.error("Send error:", err);
    showSnackbar("Failed to send message", "error");
  }
};
