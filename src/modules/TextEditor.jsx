import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from "@tiptap/extension-text-align"; // Untuk alignment
import Underline from "@tiptap/extension-underline"; 
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import ListItem from "@tiptap/extension-list-item";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import Blockquote from "@tiptap/extension-blockquote";
import CodeBlock from "@tiptap/extension-code-block";
import Link from '@tiptap/extension-link';
import React, { useState , useEffect} from 'react'
import '../style/modules/TextEditor.css'
import { RiDoubleQuotesR } from "react-icons/ri";
import {HiMiniItalic,HiOutlineBold,HiOutlineUnderline,HiOutlineBars3BottomLeft,HiOutlineBars4,HiOutlineBars3BottomRight,HiMiniBars3,HiMiniListBullet,HiNumberedList,HiCodeBracket, HiOutlineArrowUturnRight,HiOutlineArrowUturnLeft, HiOutlineChevronDown,HiOutlineH1, HiOutlineLink} from 'react-icons/hi2'
import OutsideClick from '../hook/OutsideClick';
import BootstrapTooltip from '../components/Tooltip';
import { saveCardDescriptions, getCardDescription } from '../services/ApiServices';
import EmojiPicker from 'emoji-picker-react';

const TextEditor=({cardId})=> {
    const [showHeading, setShowHeading] = useState(false);
    const showHeadingRef = OutsideClick(()=> setShowHeading(false));
    const [description,setDescription] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextStyle,
            Color,
            BulletList,
            OrderedList,
            ListItem,
            Blockquote,
            CodeBlock,
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            Link.configure({
                openOnClick:true,
                autolink:true,
                linkOnPaste:true,
            })
        ],
        content: description,
        onUpdate: ({ editor }) => {
            setDescription(editor.getHTML()); // Setel nilai description setiap kali editor diperbarui
        }
    });
   

    useEffect(() => {
        const fetchCardDescription = async () => {
            try {
                const response = await getCardDescription(cardId);
                if (response.data.success) {
                    setDescription(response.data.description || ''); // Default ke string kosong jika tidak ada data
                    if (editor) {
                        editor.commands.setContent(response.data.description || ''); // Perbarui editor
                    }
                }
            } catch (error) {
                console.error('Gagal mengambil deskripsi:', error);
            }
        };
    
        fetchCardDescription();
    }, [cardId, editor]); // Hanya ambil data saat cardId berubah
    
    useEffect(() => {
        if (editor && description !== null && !editor.getText().trim()) {
            editor.commands.setContent(description);
        }
    }, [editor]); // Set konten hanya sekali saat editor tersedia
    
    // Tambahkan event listener untuk menangkap perubahan teks
    useEffect(() => {
        if (!editor) return;
    
        const updateDescription = () => {
            setDescription(editor.getHTML()); // Gunakan getHTML() untuk menangkap perubahan
        };
    
        editor.on('update', updateDescription);
    
        return () => {
            editor.off('update', updateDescription); // Bersihkan listener saat komponen unmount
        };
    }, [editor]);
    
    
    

    //menyimpan deskripsi ke database
    const handleSave = async() =>{
        if(!editor) return;

        const content = editor.getHTML(); // Ambil teks terbaru dari editor
        setDescription(content); 

        try{
            await saveCardDescriptions(cardId, content);
            alert('Deskripsi berhasil disimpan');
            // **Perbarui editor dengan teks terbaru setelah menyimpan**
            editor.commands.setContent(content);
        }catch(error){
            alert('gagal menyimpan deskripsi')
        }
    }

    //FUNSGI menampilkan showHeading
    const handleShowHeading = (e) => {
        e.stopPropagation();
        setShowHeading((prev)=>!prev)
    }

    //HANDLE PERUBAHAN TEKS
    const handleEditorChange = (value) =>{
        setDescription(value);
    };

    //EMOJI
    const handleEmojiSelect = (emoji) =>{
        if(!editor) return;
        editor.chain().focus().insertContent(emoji.emoji).run();
        setShowEmojiPicker(false)
    }

    
    
      if (!editor) {
        return null;
      }

      return (
        <div className="editor-container">
            <div className="toolbar">
                <div className="t-text">
                    <BootstrapTooltip title='Bold' placement='top'>
                        <button 
                            className={editor.isActive('bold') ? 'active' : ''}
                            onClick={() => editor.chain().focus().toggleBold().run()}>
                            <HiOutlineBold/>
                        {/* Bold */}
                        </button>
                    </BootstrapTooltip>
                    <BootstrapTooltip title='Italic' placement='top'>
                        <button 
                            className={editor.isActive('italic') ? 'active' : ''}
                            onClick={() => editor.chain().focus().toggleItalic().run()}>
                            <HiMiniItalic/>
                        {/* Italic */}
                        </button>
                    </BootstrapTooltip>
                    <BootstrapTooltip title='Underline' placement='top'>
                        <button
                            className={editor.isActive('underline') ? 'active' : ''} 
                            onClick={() => editor.chain().focus().toggleUnderline().run()}>
                        <HiOutlineUnderline/>
                        {/* Underline */}
                        </button>
                    </BootstrapTooltip>
                </div>
                <div className="t-align">
                    <BootstrapTooltip title='Align Left' placement='top'>
                        <button
                            className={editor.isActive('align-left') ? 'active' : ''} 
                            onClick={() => editor.chain().focus().setTextAlign("left").run()}>
                        <HiOutlineBars3BottomLeft/>
                        {/* Left */}
                        </button>
                    </BootstrapTooltip>
                    <BootstrapTooltip title='Align Center' placement='top'>
                        <button 
                            className={editor.isActive('align-center') ? 'active' : ''}
                            onClick={() => editor.chain().focus().setTextAlign("center").run()}>
                        <HiMiniBars3/>
                        {/* Center */}
                        </button>
                    </BootstrapTooltip>
                    <BootstrapTooltip title='Align Right' placement='top'>
                        <button
                            className={editor.isActive('align-right') ? 'active' : ''} 
                            onClick={() => editor.chain().focus().setTextAlign("right").run()}>
                        <HiOutlineBars3BottomRight/>
                        {/* Right */}
                        </button>
                    </BootstrapTooltip>
                    <BootstrapTooltip title='Justify' placement='top'>
                        <button
                            className={editor.isActive('justify') ? 'active' : ''} 
                            onClick={() => editor.chain().focus().setTextAlign("justify").run()}>
                        <HiOutlineBars4/>
                        {/* Justify */}
                        </button>
                    </BootstrapTooltip>
                </div>
                <div className="heading">
                    <BootstrapTooltip title='Heading Option' placement='top'>
                        <button  className='hbtn' onClick={handleShowHeading}><HiOutlineH1/></button>
                    </BootstrapTooltip>
                    {showHeading && (
                        <div className='btn-heading' ref={showHeadingRef}>
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
                <div className="t-bullet">
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
                    <BootstrapTooltip title='Block quote' placement='top'>
                    <button
                        className={editor && editor.isActive('blockquote') ? 'active' : ''} 
                        onClick={() => {
                            if (!editor) return;
                            console.log("Toggle Blockquote Clicked");
                            editor.chain().focus().toggleBlockquote().run();
                        }}
                    >
                        <RiDoubleQuotesR />
                    </button>
                    </BootstrapTooltip>
                   <BootstrapTooltip title='Toggle Code Block' placement='top'>
                    <button
                        className={editor && editor.isActive('codeBlock') ? 'active' : ''} 
                        onClick={() => {
                            if (!editor) return;
                            console.log("Toggle Code Block Clicked");
                            editor.chain().focus().toggleCodeBlock().run();
                        }}
                    >
                        <HiCodeBracket />
                    </button>
                   </BootstrapTooltip>
                   <BootstrapTooltip title='Link' placement='top'>
                        <button 
                            className={editor.isActive('link') ? 'active' : ''}
                            onClick={() => {
                                const url = prompt("Masukkan URL:");
                                if (url) {
                                editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
                                }
                            }}
                            >
                            <HiOutlineLink/>
                        </button>
                   </BootstrapTooltip>
                </div>
                <div className="t-action">
                    <BootstrapTooltip title='Undo' placement='top'>
                        <button
                            className={editor.isActive('undo') ? 'active' : ''} 
                            onClick={() => editor.chain().focus().undo().run()}>
                            <HiOutlineArrowUturnLeft/>
                            {/* Undo */}
                        </button>
                    </BootstrapTooltip>
                    <BootstrapTooltip title='Redo' placement='top'>
                        <button
                            className={editor.isActive('redo') ? 'active' : ''} 
                            onClick={() => editor.chain().focus().redo().run()}>
                            <HiOutlineArrowUturnRight/>
                            {/* Redo */}
                        </button>
                    </BootstrapTooltip>
                    <BootstrapTooltip title='Font Color' placement='top'>
                        <input
                            type="color"
                            onChange={(event) => editor.chain().focus().setColor(event.target.value).run()}
                            // title="Text Color"
                        />
                    </BootstrapTooltip>
                </div>
                <div className="emoji-picker">
                    <BootstrapTooltip title='Emoji' placement='top'>
                        <button onClick={()=> setShowEmojiPicker(prev => !prev)}>😊</button>
                        {showEmojiPicker && (
                            <div className='emoji-picker-box'>
                                {/* <Picker onEmojiClick={handleEmojiSelect}/> */}
                                <EmojiPicker onEmojiClick={handleEmojiSelect}/>
                            </div>
                        )}
                    </BootstrapTooltip>
                </div>
            </div>
    
          {/* Editor */}
          <EditorContent className="custom-editor" editor={editor} value={description} onChange={handleEditorChange}  />
          <button onClick={handleSave} style={{marginTop:'10px'}}>
            SAVE 
          </button>
        </div>
      );
}

export default TextEditor