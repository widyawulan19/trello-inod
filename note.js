//7. put personal note color
app.put('/api/persona-note/:id/bg-color', async(req,res)=>{
  const {id} = req.params;
  const {bg_color} = req.body;

  try{
    await client.query(
      'UPDATE personal_notes SET bg_color = $1 WHERE id = $2',
      [bg_color,id]
    )
    res.json({message:'Color update successfully'});
  }catch(error){
    req.status(500).json({error: 'Failed to update color'});
  }
})

//COLOR NOTE
//1. get all data note color
app.get('/api/note-colors', async(req,res)=>{
  try{
    const result = await client.query('SELECT * FROM notes_color ORDER BY id DESC');
    res.json(result.rows)
  }catch(error){
    res.status(500).json({error: 'Gagal mengambil semua data color note'})
  }
})

//2. add a new data note color 
app.post('/api/note-colors', async(req,res)=>{
  const {color, color_name} = req.body;
  try{
    const result = await client.query(
      `INSERT INTO notes_color (color, color_name)
      VALUES ($1, $2) RETURNING *`,
      [color, color_name]
    );
    res.status(201).json(result.rows[0]);
  }catch(error){
    res.status(500).json({error: err.message});
  }
})

import React, { useRef } from 'react';
import ToolbarFormat from './ToolbarFormat'; // pastikan path-nya sesuai

{editIsiNote === detailNote.id ? (
  <div>
    <ToolbarFormat editorRef={editorRef} />
    <div
      ref={editorRef}
      contentEditable
      suppressContentEditableWarning={true}
      onBlur={() => handleSaveIsi(detailNote.id, editorRef.current.innerHTML)}
      onKeyDown={(e) => handleKeyPressIsi(e, detailNote.id, editorRef.current.innerHTML)}
      dangerouslySetInnerHTML={{ __html: newIsiNote }}
      style={{
        border: '1px solid #ccc',
        padding: '10px',
        borderRadius: '4px',
        minHeight: '100px'
      }}
    />
  </div>
) : (
  <p
    onClick={(e) =>
      handleEditIsiNote(e, detailNote.id, detailNote.isi_note)
    }
    dangerouslySetInnerHTML={{ __html: detailNote.isi_note }}
  />
)}
