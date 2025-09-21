import React, { useState } from 'react';
import { uploadFile } from '../services/ApiServices'; // pastikan path-nya sesuai
import '../style/modals/FormUpload.css';
import { HiXMark } from 'react-icons/hi2';
import { IoCloudUploadOutline, IoDocumentTextOutline } from "react-icons/io5";
import { AiOutlineFileUnknown } from 'react-icons/ai';
import { PiMicrosoftExcelLogoFill } from 'react-icons/pi';
import { FaRegFilePdf } from "react-icons/fa6";
import { BsFiletypeMp3,BsFiletypeMp4,BsFiletypePng,BsFiletypeJpg } from "react-icons/bs";
import { useSnackbar } from '../context/Snackbar';

const FormUpload = ({ cardId, onClose, fetchCardById,fetchAllUploadFile }) => {
  const [file, setFile] = useState(null);         // file yg dipilih
  const [uploadedFile, setUploadedFile] = useState(null); // file yg berhasil diupload
  const [loading, setLoading] = useState(false);
  const {showSnackbar} = useSnackbar();


  const handleUploadFile = async () => {
    if (!file) return alert('Pilih file dulu bestie!');

    try {
      setLoading(true);   // mulai upload
      setUploadedFile(null); // reset hasil sebelumnya
      const result = await uploadFile(file, cardId); // upload ke server
      setUploadedFile(result); // simpan response
      setFile(null); // reset input
      fetchCardById();
      fetchAllUploadFile();
      showSnackbar('Success upload file!', 'success');
    } catch (error) {
      console.error('Error upload file:', error);
      // alert('Upload gagal bestie 😥');
      showSnackbar('Filed to upload file bestie 😥', 'error');
    }finally{
      setLoading(false);
    }
  };

    const iconType = {
      docx: <IoDocumentTextOutline />,
      xlsx: <PiMicrosoftExcelLogoFill />,
      mp3: <BsFiletypeMp3 />,
      wav: <BsFiletypeMp4 />,
      mp4: <BsFiletypeMp4 />,
      pdf: <FaRegFilePdf />,
      png: <BsFiletypePng />,
      jpg: <BsFiletypeJpg />
    };
  
    const iconColor = {
      docx: '#C0DCFD',
      xlsx: '#AED0BA',
      mp3: '#D3B5FF',
      wav: '#A69898',
      mp4: '#A69898',
      pdf: '#FC9395',
      png: '#FCE796',
      jpg: '#FCE796'
    };

  return (
    <div className='form-upload-container'>
      <div className="form-upload-header">
        <h3>Upload Shot</h3>
        <HiXMark onClick={onClose} className='close-icon'/>
      </div>

      <div className="form-upload-input">
        <IoCloudUploadOutline className='fu-icon'/>
        {/* Drag & Drop to Upload or */}
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

      {/* ✅ Preview file sebelum diupload */}
      {file && (
        <div className="preview-section" style={{ marginTop: "1rem" }}>
          <div style={{display:'flex', flexDirection:'row', gap:'5px'}}>
             <strong>File selected:</strong><br />
              <span>{file.name}</span>
          </div>
         

          <div style={{ marginTop: "0.5rem" }}>
            {file.type.startsWith("image/") ? (
              // ✅ Preview image
              <img
                src={URL.createObjectURL(file)}
                alt="preview"
                style={{ maxWidth: "120px", borderRadius: "8px" }}
              />
            ) : (
              // ✅ Preview icon (selain image)
              (() => {
                const ext = file.name.split(".").pop().toLowerCase(); // ambil ekstensi
                const Icon = iconType[ext] || <AiOutlineFileUnknown />; // fallback unknown
                const color = iconColor[ext] || "#ccc";

                return (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color,
                      fontSize: "1.5rem"
                    }}
                  >
                    {Icon} <span style={{ fontSize: "0.9rem", color: "#333" }}>{ext.toUpperCase()} File</span>
                  </div>
                );
              })()
            )}
          </div>
        </div>
      )}

      
      <div className="button-upload">
        <button onClick={handleUploadFile} style={{ marginLeft: '1rem' }}>
          {loading ? 'Uploading...' : 'Upload'}
          {/* Upload */}
        </button>

        {uploadedFile && (
          <div style={{ marginTop: '1rem' }}>
            <strong>Success Uploaded File:</strong><br />
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
