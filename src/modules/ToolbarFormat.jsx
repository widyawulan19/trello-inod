import React, { useState, useEffect } from 'react';

const emojiList = ["😀", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😍", "😎", "🤩", "😘", "😢", "😭", "😡", "🤔", "👍", "👎", "🙏", "👏", "🔥", "💯", "🎉", "❤️"];

const ToolbarFormat = ({ editorRef }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleFormat = (command, value = null) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, value);
  };

  const insertEmoji = (emoji) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('insertText', false, emoji);
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

  return (
    <div className="chat-toolbar">
      <button onClick={() => handleFormat('bold')}><b>B</b></button>
      <button onClick={() => handleFormat('italic')}><i>I</i></button>
      <button onClick={() => handleFormat('underline')}><u>U</u></button>
      <div className="emoji-picker-wrapper">
        <button onClick={() => setShowEmojiPicker(prev => !prev)}>😄</button>
        {showEmojiPicker && (
          <div className="emoji-picker">
            {emojiList.map((emoji, idx) => (
              <span key={idx} onClick={() => insertEmoji(emoji)}>{emoji}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolbarFormat;
