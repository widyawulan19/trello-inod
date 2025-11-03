import React, { useEffect, useState } from 'react'
import { deleteFile, getAllUploadFiles } from '../services/ApiServices';
import '../style/modals/UploadFile.css';
import { IoDocumentTextOutline } from "react-icons/io5";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { BsFiletypeMp3,BsFiletypeMp4,BsFiletypePng,BsFiletypeJpg } from "react-icons/bs";
import { FaRegFilePdf } from "react-icons/fa6";
import { AiOutlineFileUnknown } from "react-icons/ai";
import BootstrapTooltip from '../components/Tooltip';
import { HiAdjustments } from 'react-icons/hi';
import OutsideClick from '../hook/OutsideClick';
import { useSnackbar } from '../context/Snackbar';

const UploadFile = ({ cardId, fetchCardById, fetchAllUploadFile, allUploadFile }) => {
  // STATE
  // const [allUploadFile, setAllUploadFile] = useState([]);
  const [showSetting, setShowSetting] = useState(null);
  const settingRef = OutsideClick(() => setShowSetting(null));
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  // fungsi delete by file id
  const handleDeleteFile = async (id) => {
    if (!window.confirm("Yakin mau hapus file ini?")) return;

    try {
      console.log('Deleting file with id:', id);
      setLoading(true);
      await deleteFile(id);
      showSnackbar('Delete file succesfully', 'success');
      fetchCardById();   // refresh data card
      fetchAllUploadFile(); // refresh daftar file
    } catch (error) {
      console.log(error);
      showSnackbar('Failed delete file!', 'error');
    } finally {
      setLoading(false);
    }
  };

  // // fetch upload file
  // const fetchAllUploadFile = async () => {
  //   try {
  //     const result = await getAllUploadFiles(cardId);
  //     setAllUploadFile(result.data);
  //   } catch (error) {
  //     console.error('Error fetching all file:', error);
  //   }
  // };

  // useEffect(() => {
  //   fetchAllUploadFile();
  // }, [cardId]);

  const handleShowSetting = (fileId) => {
    setShowSetting(showSetting === fileId ? null : fileId);
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

  // format date
  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    const options = { month: 'long' };
    const month = date.toLocaleString('en-US', options);
    const day = date.getDate();
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours.toString().padStart(2, '0');

    return `${month} ${day} ${year} at ${hours}.${minutes}${ampm}`;
  };

  return (
    <div className='upload-file-container'>
      {Array.isArray(allUploadFile) && allUploadFile.map((file, index) => (
        <div key={index} className='upload-cont'>
          <div className="upload-cont-prev">
            <div className="upload-cont-header">
              <button onClick={() => handleShowSetting(file.id)}>
                <HiAdjustments />
              </button>
            </div>
            <div className='upload-icon' style={{ color: iconColor[file.type] }}>
              {iconType[file.type] || <AiOutlineFileUnknown />}
            </div>

            {/* hanya tampil kalau cocok */}
            {showSetting === file.id && (
              <div className="file-set" ref={settingRef}>
                <div
                  className="del-btn"
                  onClick={() => handleDeleteFile(file.id)}
                >
                  Delete file
                </div>
              </div>
            )}
          </div>

          <div className="upload-cont-body">
            <div className="upload-desc">
              <h5>{file.file_name}</h5>
              <p>{formatDate(file.uploaded_at)}</p>
              <BootstrapTooltip title='View File' placement='top'>
                <a href={file.file_url} target="_blank" rel="noopener noreferrer">View</a>
              </BootstrapTooltip>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
};

export default UploadFile;
