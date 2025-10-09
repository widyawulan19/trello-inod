const handleSendMessage = async () => {
  const html = editorRef.current?.innerHTML || "";
  if (!html.trim() && pendingFiles.length === 0) return;

  try {
    const res = await createMessage(cardId, {
      user_id: userId,
      message: html, // simpan dengan format HTML
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
  if (!html.trim() && files.length === 0) return;

  try {
    const res = await createMessage(cardId, {
      user_id: userId,
      message: html, // simpan dengan format HTML
      parent_message_id: parentId,
    });

    const chatId = res.data.id;
    for (let file of files) {
      await uploadChatMedia(chatId, file);
    }

    replyEditorRefs.current[parentId].innerHTML = "";
    setReplyPendingFiles((prev) => ({ ...prev, [parentId]: [] }));

    fetchChats();
    showSnackbar("Success reply", "success");
  } catch (err) {
    console.error("Reply error:", err);
    showSnackbar("Reply failed", "error");
  }
};
