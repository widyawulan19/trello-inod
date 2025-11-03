// src/modules/TextEditor.jsx
import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Bold } from '@tiptap/extension-bold';
import { Italic } from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import ListItem from "@tiptap/extension-list-item";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import { Link } from '@tiptap/extension-link';
import '../style/modules/TextEditor2.css'
import { HiEllipsisVertical, HiMiniBars3, HiMiniItalic, HiMiniListBullet, HiNumberedList, HiOutlineBars3BottomLeft, HiOutlineBars3BottomRight, HiOutlineBars4, HiOutlineBold, HiOutlineH1, HiOutlineLink, HiOutlineUnderline } from 'react-icons/hi2';
import BootstrapTooltip from '../components/Tooltip';
import EmojiPicker from 'emoji-picker-react';

const TextEditor2 = ({ content, onChange }) => {
    const [showEditor, setShowEditor] = useState(false)
    const [showHeading, setShowHeading] = useState(false)
    const [showAlignText, setShowAlignText] = useState(false)
    const [showMoreAction, setShowMoreActon] = useState(false)
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const editor = useEditor({
      extensions: [
        StarterKit,
        Underline,
        ListItem,
        BulletList,
        OrderedList,
        Bold,
        Italic,
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        Link, // Tambahkan Link extension
      ],
      content: content,
      onUpdate({ editor }) {
        onChange(editor.getHTML());
      },
    });
  
    useEffect(() => {
      if (editor && content !== editor.getHTML()) {
        editor.commands.setContent(content);
      }
    }, [content]);
  
    // Fungsi untuk mengatur perintah bold/italic/link
    const toggleBold = () => {
      editor?.chain().focus().toggleBold().run();
    };
  
    const toggleItalic = () => {
      editor?.chain().focus().toggleItalic().run();
    };
  
    const toggleUnderline = () =>{
        editor?.chain().focus().toggleUnderline().run();
    }

    const toggleLink = () => {
      const url = prompt('Enter the URL:');
      if (url) {
        editor?.chain().focus().setLink({ href: url }).run();
      }
    };

    //show editor
    const handleShowEditor = () =>{
        setShowEditor(!showEditor)
    }
    //show Heading
    const handleShowHeading = () =>{
        setShowHeading(!showHeading)
    }

    //show text align
    const handleTextAlign = () =>{
        setShowAlignText(!showAlignText)
    }

    //show more action
    const handleMoreAction = () =>{
        setShowMoreActon(!showMoreAction)
    }

     //EMOJI
     const handleEmojiSelect = (emoji) =>{
        if(!editor) return;
        editor.chain().focus().insertContent(emoji.emoji).run();
        setShowEmojiPicker(false)
    }
  
    return (
        <div className="text-editor">
          <div className="editor-toolbar" >
            <div className="t-text"> 
                <BootstrapTooltip title='Bold' placement='top'>
                    <button 
                        onClick={toggleBold} 
                        className={`toolbar-button ${editor?.isActive('bold') ? 'active' : ''}`}
                    >
                        <HiOutlineBold />
                    </button>
                </BootstrapTooltip>
                <BootstrapTooltip title='Italic' placement='top'>
                    <button 
                        onClick={toggleItalic} 
                        className={`toolbar-button ${editor?.isActive('italic') ? 'active' : ''}`}
                    >
                        <HiMiniItalic />
                    </button>
                </BootstrapTooltip>
                <BootstrapTooltip title='Underline' placement='top'>
                    <button 
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        className={`toolbar-button ${editor?.isActive('underline') ? 'active' : ''}`}
                    >
                        <HiOutlineUnderline />
                    </button>
                </BootstrapTooltip>
                <BootstrapTooltip title='Link' placement='top'>
                    <button 
                        onClick={toggleLink} 
                        className={`toolbar-button ${editor?.isActive('link') ? 'active' : ''}`}
                    >
                        <HiOutlineLink />
                    </button>
                </BootstrapTooltip>
            </div>
            <div className="t-align">
                <BootstrapTooltip title='Show Text Align' placement='top'>
                    <button onClick={handleTextAlign}>
                        <HiOutlineBars4/>
                    </button>
                </BootstrapTooltip>
                {showAlignText && (
                    <div className='text-align-modal'>
                        <BootstrapTooltip title='Align Left' placement='top'>
                            <button
                                // className={editor.isActive('align-left') ? 'active' : ''} 
                                className={`toolbar-button ${editor?.isActive('align-left') ? 'active' : ''}`}
                                onClick={() => editor.chain().focus().setTextAlign("left").run()}>
                            <HiOutlineBars3BottomLeft/>
                            {/* Left */}
                            </button>
                        </BootstrapTooltip>
                        <BootstrapTooltip title='Align Center' placement='top'>
                            <button 
                                className={`toolbar-button ${editor?.isActive('align-center') ? 'active' : ''}`}
                                onClick={() => editor.chain().focus().setTextAlign("center").run()}>
                            <HiMiniBars3/>
                            {/* Center */}
                            </button>
                        </BootstrapTooltip>
                        <BootstrapTooltip title='Align Right' placement='top'>
                            <button
                                className={`toolbar-button ${editor?.isActive('align-right') ? 'active' : ''}`}
                                onClick={() => editor.chain().focus().setTextAlign("right").run()}>
                            <HiOutlineBars3BottomRight/>
                            {/* Right */}
                            </button>
                        </BootstrapTooltip>
                        <BootstrapTooltip title='Justify' placement='top'>
                            <button
                                className={`toolbar-button ${editor?.isActive('justify') ? 'active' : ''}`}
                                onClick={() => editor.chain().focus().setTextAlign("justify").run()}>
                            <HiOutlineBars4/>
                            {/* Justify */}
                            </button>
                        </BootstrapTooltip>
                    </div>
                )}
            </div>
            <div className="heading">
                <BootstrapTooltip title='Show Heading' placement='top'>
                    <button onClick={handleShowHeading}>
                        <HiOutlineH1/>
                    </button>
                </BootstrapTooltip>
                {showHeading && (
                    <div className='heading-modal'>
                        <BootstrapTooltip title='H1' placement='bottom'>
                            <button 
                                className={editor.isActive('h1') ? 'active' : ''}
                                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                            H1
                            </button>
                        </BootstrapTooltip>
                        <BootstrapTooltip title='H2' placement='bottom'>
                            <button 
                                className={editor.isActive('h2') ? 'active' : ''}
                                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                            H2
                            </button>
                        </BootstrapTooltip>
                        <BootstrapTooltip title='H3' placement='bottom'>
                            <button
                                className={editor.isActive('h3') ? 'active' : ''} 
                                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                            H3
                            </button>
                        </BootstrapTooltip>
                        <BootstrapTooltip title='H4' placement='bottom'>
                            <button
                                className={editor.isActive('h4') ? 'active' : ''} 
                                onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}>
                            H4
                            </button>
                        </BootstrapTooltip>
                        <BootstrapTooltip title='H5' placement='bottom'>
                            <button 
                                className={editor.isActive('h5') ? 'active' : ''}
                                onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}>
                            H5
                            </button>
                        </BootstrapTooltip>
                    </div>
                )}
               
            </div>
            <div className="more">
                <BootstrapTooltip title='More Attribut' placement='top'>
                    <button onClick={handleMoreAction}>
                        <HiEllipsisVertical/>
                    </button>
                </BootstrapTooltip>
                {showMoreAction && (
                    <div className="more-action-modal">
                         <BootstrapTooltip title='Toggle Bullet' placement='top'>
                            <button
                                className={editor.isActive('bulletList') ? 'active' : ''} 
                                onClick={() => editor.chain().focus().toggleBulletList().run()}
                                aria-label="Toggle Bullet"
                            >
                                <HiMiniListBullet/>
                            </button>
                        </BootstrapTooltip>
                        <BootstrapTooltip title='Toggle Numbered List' placement='top'>
                            <button
                                className={editor && editor.isActive('orderedList') ? 'active' : ''} 
                                onClick={() => {
                                    if (!editor) return;
                                    console.log("Toggle Numbered List Clicked");
                                    editor.chain().focus().toggleOrderedList().run();
                                }}
                                aria-label="Toggle Numbered List"
                            >
                                <HiNumberedList />
                            </button>
                        </BootstrapTooltip>
                    </div>
                )}
            </div>
            <div className="emoji">
                <BootstrapTooltip title='Emoji' placement='top'>
                    <button onClick={()=> setShowEmojiPicker(prev => !prev)}>😊</button>
                    {showEmojiPicker && (
                        <div className='emoji-modal'>
                            {/* <Picker onEmojiClick={handleEmojiSelect}/> */}
                            <EmojiPicker onEmojiClick={handleEmojiSelect}/>
                        </div>
                    )}
                </BootstrapTooltip>
            </div>
          </div>
          <div className="editor-container">
             <EditorContent editor={editor}/>
          </div>
        </div>
      );
      
  };
  
  export default TextEditor2;


//   return (
//     <div className="text-editor">
//       <div className="editor-toolbar">
//           <div className="t-text"> 
//               <button onClick={toggleBold} className="toolbar-button"><HiOutlineBold/></button>
//               <button onClick={toggleItalic} className="toolbar-button"><HiMiniItalic/></button>
//               <button onClick={toggleLink} className="toolbar-button"><HiOutlineUnderline/></button>
//           </div>
       
//       </div>
//       <EditorContent editor={editor} />
//     </div>
//   );


{/* <BootstrapTooltip title='Bold' placement='top'>
                  <button 
                    onClick={toggleBold} 
                    className={`toolbar-button ${editor?.isActive('bold') ? 'active' : ''}`}
                  >
                    <HiOutlineBold />
                  </button>
                </BootstrapTooltip> 
      
                <BootstrapTooltip title='Italic' placement='top'>
                  <button 
                    onClick={toggleItalic} 
                    className={`toolbar-button ${editor?.isActive('italic') ? 'active' : ''}`}
                  >
                    <HiMiniItalic />
                  </button>
                </BootstrapTooltip> */}