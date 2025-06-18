import React, { useEffect, useState } from 'react'
import { getAllUploadFiles, getTotalFile } from '../services/ApiServices';
import '../style/modals/UploadFile.css';
import { BsSoundwave } from "react-icons/bs";
import { IoDocumentTextOutline } from "react-icons/io5";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { BsFiletypeMp3,BsFiletypeMp4,BsFiletypePng,BsFiletypeJpg } from "react-icons/bs";
import { FaRegFilePdf } from "react-icons/fa6";
import { AiOutlineFileUnknown } from "react-icons/ai";
import BootstrapTooltip from '../components/Tooltip';
import { HiAdjustments } from 'react-icons/hi';

const UploadFile=({cardId})=> {
    //STATE
    const [allUploadFile, setAllUploadFile] = useState([]);
    // const cardId = 297;

    //debug
    console.log('Upload file menerima data cardId, ', cardId)

    //FUNCTION
    //fetch upload file
    const fetchAllUploadFile = async() =>{
        try{
            const result = await getAllUploadFiles(cardId);
            setAllUploadFile(result.data);
            console.log(result)
        }catch(error){
            console.error('Error fetching all file:', error)
        }
    } 
    useEffect(()=>{
        fetchAllUploadFile();
    },[])



    const iconType = {
        docx:<><IoDocumentTextOutline /></>,
        xlsx:<><PiMicrosoftExcelLogoFill/></>,
        mp3:<><BsFiletypeMp3/></>,
        wav:<><BsFiletypeMp4/></>,
        mp4:<><BsFiletypeMp4/></>,
        pdf:<><FaRegFilePdf/></>,
        png:<><BsFiletypePng/></>,
        jpg:<><BsFiletypeJpg/></>
    }

    const iconColor = {
        docx:'#C0DCFD',
        xlsx:'#AED0BA',
        mp3:'#D3B5FF',
        wav:'#A69898',
        mp4:'#A69898',
        pdf:'#FC9395',
        png:'#FCE796',
        jpg:'#FCE796'
    }

    //format date
    const formatDate = (isoDate) => {
    const date = new Date(isoDate);

    const options = { month: 'long' }; // Dapatkan nama bulan (June, July, dll)
    const month = date.toLocaleString('en-US', options);
    const day = date.getDate();
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    // Ubah jadi 24 jam tapi tetap tambahkan AM/PM
    hours = hours.toString().padStart(2, '0');

    return `${month} ${day} ${year} at ${hours}.${minutes}${ampm}`;
    };


  return (
    <div className='upload-file-container'>
        {Array.isArray(allUploadFile) && allUploadFile.map((file, index) => (
        <div key={index} className='upload-cont'>
            <div className="upload-cont-prev">
                 <div className="upload-cont-header">
                    <button><HiAdjustments/></button>
                </div>
                <div className='upload-icon' style={{color: iconColor[file.type]}}>
                    {iconType[file.type] || <AiOutlineFileUnknown />} 
                </div>
            </div>
            <div className="upload-cont-body">
                <div className="upload-desc">
                    <h5>{file.file_name}</h5>
                    <p>{formatDate(file.uploaded_at)}</p>
                    <BootstrapTooltip title='View File' placement='top'>
                        <a href={file.file_url} target="_blank" rel="noopener noreferrer">View</a>
                    </BootstrapTooltip>
                </div>
                <div className="upload-user">
                    <img src={file.photo_url} alt={file.username} />
                </div>
                
            </div>
            
        </div>
        ))}
    </div>
  )
}

export default UploadFile

//  <div key={index}>
//             <p>{file.file_name}</p>
//             <a href={file.file_url} target="_blank" rel="noopener noreferrer">Lihat File</a>
//         </div>