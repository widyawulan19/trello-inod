import React, { useState, useRef } from "react";
import ReactQuill from "react-quill-new";
import "quill/dist/quill.snow.css";
import { FaLink } from "react-icons/fa";
import { ImAttachment } from "react-icons/im";
import '../style/fitur/ChatEditor.css'

export default function ChatEditor() {
  const [value, setValue] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const quillRef = useRef(null);

  const emojiList = ["😀", "😂", "😍", "😎", "😢", "😡", "👍", "🎉"];

  // === UPLOAD FILE HANDLER ===
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      alert(`File selected: ${file.name}`);
    }
  };

  // === INSERT LINK ===
  const insertLink = () => {
    const url = prompt("Masukkan URL:");
    if (url && quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      if (range) {
        quill.format("link", url);
      }
    }
  };

  // === INSERT EMOJI ===
  const insertEmoji = (emoji) => {
    const quill = quillRef.current.getEditor();
    const range = quill.getSelection(true);
    quill.insertText(range.index, emoji);
    quill.setSelection(range.index + emoji.length);
    setShowEmojiPicker(false);
  };

  // === TOOLBAR CONFIGURATION ===
  const modules = {
    toolbar: {
      container: "#toolbar",
      handlers: {
        link: insertLink,
      },
    },
  };

  const formats = [
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "code",
    "link",
  ];

  return (
    <div className="chat-editor-container">
      {/* === CUSTOM TOOLBAR === */}
      <div id="toolbar" className="chat-toolbar-fix">
        <button className="ql-bold"><b>B</b></button>
        <button className="ql-italic"><i>I</i></button>
        <button className="ql-underline"><u>U</u></button>
        <button className="ql-strike"><s>S</s></button>
        <button className="ql-list" value="ordered">1.</button>
        <button className="ql-list" value="bullet">•</button>
        <button className="ql-code-block"><code>{"</>"}</code></button>

        <button onClick={insertLink}><FaLink /></button>

        <label className="upload-btn">
          <ImAttachment />
          <input
            type="file"
            style={{ display: "none" }}
            onChange={handleUpload}
          />
        </label>

        <div className="emoji-picker-wrapper">
          <button
            type="button"
            onClick={() =>
              setShowEmojiPicker(showEmojiPicker ? false : true)
            }
          >
            😄
          </button>
          {showEmojiPicker && (
            <div className="emoji-picker">
              {emojiList.map((emoji, i) => (
                <span key={i} onClick={() => insertEmoji(emoji)}>
                  {emoji}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* === QUILL EDITOR === */}
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={setValue}
        modules={modules}
        formats={formats}
        placeholder="Tulis pesanmu di sini..."
      />
    </div>
  );
}
