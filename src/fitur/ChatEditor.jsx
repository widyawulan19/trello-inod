import React from "react";
import ReactQuill from "react-quill-new";
import "quill/dist/quill.snow.css";
import '../style/fitur/NewRoomChat.css'
import { TiAttachmentOutline } from "react-icons/ti";

const ChatEditor = ({
  value,
  onChange,
  onSend,
  onUpload,
  placeholder = "Tulis pesan...",
  emojiList = [],
  insertEmoji,
  target = "main"
}) => {
  const modules = {
    toolbar: [
      ["bold", "italic", "underline", "strike", "code"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
    ],
  };

  const formats = [
    "bold", "italic", "underline", "strike", "code",
    "list", "bullet", "link", "image",
  ];

  return (
    <div className="chat-editor">
      <div className="ql-container">
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          className="my-editor"
        />
      </div>
      <div className="editor-actions">
        <label className="upload-btn">
          <TiAttachmentOutline />
          <input type="file" hidden onChange={e => onUpload(e, target)} />
        </label>
        <div className="emoji-picker-mini">
          {emojiList.map((emoji, i) => (
            <span key={i} onClick={() => insertEmoji(emoji, target)}>{emoji}</span>
          ))}
        </div>
        {onSend && (
          <button className="btn-send" onClick={onSend}>📤</button>
        )}
      </div>
    </div>
  );
};

export default ChatEditor;
