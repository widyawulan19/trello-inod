import React, { useRef, useState } from "react";
// import "../style/components/ToolbarFormat.css";

const ToolbarFormat = ({ textareaRef }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const emojiList = ["😀", "😂", "😍", "😎", "😭", "😡", "👍", "❤️", "🎉"];

  const handleFormat = (type) => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    let formatted = selectedText;
    if (type === "bold") {
      formatted = `**${selectedText}**`;
    } else if (type === "italic") {
      formatted = `*${selectedText}*`;
    } else if (type === "underline") {
      formatted = `<u>${selectedText}</u>`;
    }

    const newText =
      textarea.value.substring(0, start) +
      formatted +
      textarea.value.substring(end);

    textarea.value = newText;
    textarea.focus();
    textarea.setSelectionRange(start + formatted.length, start + formatted.length);
  };

  const insertEmoji = (emoji) => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const newText =
      textarea.value.substring(0, start) +
      emoji +
      textarea.value.substring(end);

    textarea.value = newText;
    textarea.focus();
    textarea.setSelectionRange(start + emoji.length, start + emoji.length);
  };

  return (
    <div className="chat-toolbar-container">
      <div className="chat-toolbar">
        <button onClick={() => handleFormat("bold")}>
          <b>B</b>
        </button>
        <button onClick={() => handleFormat("italic")}>
          <i>I</i>
        </button>
        <button onClick={() => handleFormat("underline")}>
          <u>U</u>
        </button>

        <div className="emoji-picker-wrapper">
          <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
            😄
          </button>

          {showEmojiPicker && (
            <div className="emoji-picker">
              {emojiList.map((emoji, index) => (
                <span
                  key={index}
                  className="emoji-item"
                  onClick={() => insertEmoji(emoji)}
                >
                  {emoji}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToolbarFormat;
