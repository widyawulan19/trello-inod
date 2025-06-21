import React, { useState } from 'react';
import { uploadFile } from '../services/ApiServices'; // pastikan path-nya sesuai
import '../style/modals/FormUpload.css';
import { HiXMark } from 'react-icons/hi2';
import { IoCloudUploadOutline } from "react-icons/io5";

const FormUpload = ({ cardId, onClose }) => {
  const [file, setFile] = useState(null);         // file yg dipilih
  const [uploadedFile, setUploadedFile] = useState(null); // file yg berhasil diupload

  const handleUploadFile = async () => {
    if (!file) return alert('Pilih file dulu bestie!');

    try {
      const result = await uploadFile(file, cardId); // upload ke server
      setUploadedFile(result); // simpan response
      setFile(null); // reset input
    } catch (error) {
      console.error('Error upload file:', error);
      alert('Upload gagal bestie 😥');
    }
  };

  return (
    <div className='form-upload-container'>
      <div className="form-upload-header">
        <h3>Upload Shot</h3>
        <HiXMark onClick={onClose} className='close-icon'/>
      </div>

      <div className="form-upload-input">
        <IoCloudUploadOutline className='fu-icon'/>
        Drag & Drop to Upload or
        <div className="input-con">
          <label htmlFor="file-upload" className="custom-upload-button">
              browse in your device
            </label>
            <input
              id="file-upload"
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              accept="*"
              style={{ display: 'none' }}
            />
        </div>
      </div>
      
      <div className="button-upload">
        <button onClick={handleUploadFile} style={{ marginLeft: '1rem' }}>
          Upload
        </button>

        {uploadedFile && (
          <div style={{ marginTop: '1rem' }}>
            <strong>Uploaded:</strong><br />
            <a href={uploadedFile.file_url} target="_blank" rel="noreferrer">
              {uploadedFile.file_name}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormUpload;
