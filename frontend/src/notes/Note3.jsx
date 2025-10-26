// ====== DEFAULT ======

const renderChats = (chatList, level = 0) => chatList.map(chat => (
    <div
      className={`chat-message ${level > 0 ? 'chat-reply' : ''} ${chat.user_id === userId ? 'chat-own' : ''}`}
      key={chat.id}
      style={{ marginLeft: `${level * 30}px` }}
    >
      <div className="chat-header">
        <div className="chat-image">
          <img className="chat-avatar" src={chat.photo_url || '/default-avatar.png'} alt={chat.username}/>
          <span className="chat-username">
            {chat.username} 
          </span>
        </div>
        <span className="chat-timestamp">
          {new Date(chat.send_time).toLocaleString()}
          <p>( {dayjs(chat.send_time).fromNow()} )</p>
        </span>
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


// ====== END DEFAULT ======

const renderChats = (chatList, level = 0) =>
  chatList.map((chat) => (
    <div
      key={chat.id}
      className={`chat-message ${level > 0 ? "chat-reply" : ""} ${
        chat.user_id === userId ? "chat-own" : "chat-other"
      }`}
      style={{ marginLeft: `${level * 30}px` }}
    >
      <div className="chat-header">
        {/* kalau chat own, tampilkan image di kanan */}
        {chat.user_id !== userId && (
          <div className="chat-image">
            <img
              className="chat-avatar"
              src={chat.photo_url || "/default-avatar.png"}
              alt={chat.username}
            />
          </div>
        )}

        <div className="chat-info">
          <span className="chat-username">{chat.username}</span>
          <span className="chat-timestamp">
            {new Date(chat.send_time).toLocaleString()}
            <p>({dayjs(chat.send_time).fromNow()})</p>
          </span>
        </div>

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

      <div className="chat-content">{chat.message}</div>
    </div>
  ));


  <div className="main-boc">
    <div className="box1"></div>
    <div className="box2"></div>
  </div>