import React, { useEffect, useState } from 'react'
import { deleteLabels, getAllLabels, getLabelByCard, createLabel, addLabelToCard, updateLabelName, deleteLabelFromLabels, getAllColor, addColorToBgColorLabel } from '../services/ApiServices';
import { HiEllipsisVertical, HiMiniTag, HiOutlinePencil, HiOutlineTrash, HiXMark } from "react-icons/hi2";
import { FaTags } from "react-icons/fa";
import '../style/modules/Labels.css'
import OutsideClick from '../hook/OutsideClick';
import BootstrapTooltip from '../components/Tooltip';
import { useSnackbar } from '../context/Snackbar';
import { FaXmark } from 'react-icons/fa6';

const Label = ({ cardId, fetchCardDetail, labels, setLabels, fetchLabels, onClose }) => {
    const [allLabels, setAllLabels] = useState([]);
    const [newLabel, setNewLabel] = useState({ name: '', color: '', bg_color: '' });
    const showLabelRef = OutsideClick(() => setShowSelectLabel(false));
    const [showSelectLabel, setShowSelectLabel] = useState(false);
    const [showSetting, setShowSetting] = useState(false);
    const [showColor, setShowColor] = useState(false);
    const refShowSetting = OutsideClick(()=>setShowSetting(false));
    const {showSnackbar} = useSnackbar();
    const [bgColorOption, setBgColorOption] = useState([]);

    
    //DEBUG
    console.log('Labels menerima allLabel:', allLabels);
    // console.log('file labels menerima data label:', labels);
    // console.log('File ini menerima data fetchCardDetail:', fetchCardDetail)

    useEffect(() => {
        fetchLabels();
        fetchAllLabels();
        fetchAllColor();
    }, [cardId]);

    //FUNGSI MENAMPILKAN SEMUA LABEL
    const fetchAllLabels = async () => {
        try {
            const response = await getAllLabels();
            setAllLabels(response.data);
        } catch (error) {
            console.error('Error fetching all labels:', error);
        }
    };

    //FUNGSI UNTUK MENAMPILKAN SEMUA COLOR
    const fetchAllColor = async () =>{
        try{
            const response = await getAllColor();
            setBgColorOption(response.data)
        }catch(error){
            console.error('Error fetching all color:', error);
        }
    }

    //FUNGSI MEMBUAT LABEL BARU
    const handleCreateLabel = async (e) => {
        e.preventDefault();
        try {
            const response = await createLabel({ name: newLabel.name });
            setAllLabels([...allLabels, response.data]);
            setNewLabel({ name: '' });
            fetchAllLabels();
            showSnackbar('successfully created label','success');
        } catch (error) {
            console.error('Error creating label:', error);
            showSnackbar('Failed creating label','error');
        }
    };

    //FUNGSI DELETE LABEL FROM CARD
    const handleDeleteLabel = async (cardId, labelId) => {
        try {
            console.log('Deleting label from card', cardId, labelId);
            await deleteLabels(cardId, labelId);
            setLabels(labels.filter(label => label.id !== labelId));
            showSnackbar('Successfully delete label from card','success');
            fetchLabels(cardId);
        } catch (error) {
            console.error('Error deleting label card:', error);
            showSnackbar('Failed to deleting label to card','error');
        }
    };

    //FUNGSI MEMILIH LABEL UNTUK CARD
    const handleSelectLabel = async (label) => {
        try {
            console.log('Fungsi handle select label mempunyai data label', label);
            await addLabelToCard(cardId, label);
            setLabels([...labels, label]);
            fetchCardDetail(cardId);
            showSnackbar('Successfully adding label to card', 'success');
        } catch (error) {
            console.error('Error adding label to card:', error);
            showSnackbar('Failed adding label to card','error');
        }
    };

    //FUNGSI EDIT NAME LABEL
    const handleUpdateLabelName = async(labelId, newName) =>{
        try{
            const data = {name: newName};
            const response = await updateLabelName(labelId, data);
            console.log('fungsi handle update name menerima label id:', labelId)
            return response.data;
        }catch(error){
            console.error('Error to update label name:', error);
            throw error;
        }
    }

    const handleShowSetting = (labelId,e) => {
        e.stopPropagation();
        if (showSetting === labelId) {
            setShowSetting(null); //
        } else {
            setShowSetting(labelId); 
        }
    }

    const handleShowColors = (labelId, e) =>{
        setShowSetting(false);
        e.stopPropagation();
        if(showColor === labelId){
            setShowColor(null);
        }else{
            setShowColor(labelId)
        }
    }

    const handleCloseColor = (e) =>{
        setShowColor(false);
        e.stopPropagation();
    }
    
    //FUNGSI DELETE LABEL DARI DAFTAR LABELS
    const handleDeleteLabels = async(labelId,e) =>{
        e.stopPropagation();
        try{
            const response = await deleteLabelFromLabels(labelId);
            console.log('Label delete succesfully:', response.data);
            showSnackbar('Label delete successfully','success');
            fetchCardDetail(cardId);
            fetchLabels(cardId);
            fetchAllLabels();
            return response.data;
        }catch(error){
            console.error('Error deleting label from labels',error)
            showSnackbar('Failed deleting label','error')
            throw error;
        }
    }

    //FUNGSI UNTUK HANDLE PERUBAHAN BACKGROUND LABEL
    const handleAssignBgColorToLabel = async (labelId, bgColorId) => {
        try {
            const data = { bg_color_id: bgColorId };
            await addColorToBgColorLabel(labelId, data);
            showSnackbar('Label background updated successfully', 'success');
            fetchAllLabels(); // refresh label list
        } catch (error) {
            console.error('Failed to assign bg color to label:', error);
            showSnackbar('Failed to update label background', 'error');
        }
    };


    return (
        <div className='label-container'>
            <div className="lc-header">
                <h5>
                    <FaTags className='l-icon' />
                    CARD LABELS
                </h5>
                <BootstrapTooltip title='Close' placement='top'>
                    <FaXmark onClick={onClose} className='l-close'/>
                </BootstrapTooltip>
            </div>
           

            {/* LABELS YANG SUDAH DITAMBAHKAN */}

            <div className="labels-main-body">
                <div className='labels-cont'>
                    <h5 style={{
                        fontSize:'13px',
                        fontWeight:'bold',
                        color:'#4F5966',
                        borderBottom:'1px solid #ddd',
                        marginBottom:'5px',
                        paddingBottom:'5px'
                    }}>Active label</h5>
                    <div className="sl-container">
                        {labels.map(label => (
                            <div
                                key={label.label_id}
                                style={{
                                    // backgroundColor: label.bg_color?.replace("rgb", "rgba").replace(")", ", 0.3)"),
                                    backgroundColor: label.bg_color,
                                    // color: label.color,
                                    color:'#333',
                                    padding: "4px",
                                    margin: "2px",
                                    borderRadius: "4px",
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-start',
                                    fontSize: '10px',
                                    fontWeight: 'bold',
                                    width: 'fit-content',
                                    gap:'5px'
                                }}
                            >
                                <p className='slb-p'>{label.label_name}</p>
                                
                            <HiXMark
                                    onClick={()=> handleDeleteLabel(cardId, label.label_id)}
                                    style={{
                                        cursor:'pointer',
                                    }}
                            />
                            </div>
                        ))}
                    </div>
                </div>

                {/* LIST SELECT LABEL */}
                <div className="show-label" ref={showLabelRef}>
                    <h5
                        style={{
                        fontSize:'13px',
                        fontWeight:'bold',
                        color:'#4F5966',
                        borderBottom:'1px solid #ddd',
                        marginBottom:'5px',
                        paddingBottom:'5px'
                    }}
                    >All Label</h5>
                    <div className="l-box">
                        {allLabels.map(label => (
                            <div
                                key={label.id}
                                onClick={() => handleSelectLabel(label.id)}
                                className='lb-content'
                                style={{
                                    backgroundColor: label.bg_color,
                                }}
                            >
                                {label.name}
                                <HiEllipsisVertical className='lbox-icon' onClick={(e)=> handleShowSetting(label.id, e)} />
                                
                                {/* SETTING LABEL  */}
                                    {showSetting === label.id && (
                                        <div className="set-label" ref={refShowSetting}>
                                            <div className="delete-label-btn" onClick={(e)=> handleDeleteLabels(label.id,e)}>
                                                <HiOutlineTrash/>
                                                Delete
                                            </div>
                                            {/* Dropdown pilih warna */}
                                            <div className="color-options" onClick={(e)=> handleShowColors(label.id,e)}>
                                                <HiOutlinePencil/>
                                                Color
                                            </div>
                                        </div>
                                    )}
                                    {showColor === label.id &&  (
                                        <div className="bg-color-list">
                                            <div className='color-label-header'>
                                                <h4>Select Color Labe</h4>
                                                <FaXmark onClick={(e)=> handleCloseColor(e)}/>
                                                {/* <HiXMark onClick={handleCloseColor}/> */}
                                            </div>
                                            <div className="color-label-con">
                                                {bgColorOption.map(color => (
                                                <div
                                                className='color-code'
                                                    key={color.id}
                                                    title={color.name}
                                                    onClick={() => handleAssignBgColorToLabel(label.id, color.id)}
                                                    style={{
                                                    width: '20px',
                                                    height: '20px',
                                                    borderRadius: '3px',
                                                    backgroundColor: color.hex_code,
                                                    cursor: 'pointer',
                                                    // border: '1px solid #ccc'
                                                    }}
                                                />
                                            ))}
                                            </div>
                                        </div>
                                    )}
                                {/* END SETTING LABEL  */}
                            </div>
                        ))}
                    </div>
                    
                </div>

                {/* FORM CREATE NEW LABEL */}
                <div className='fl-label'>
                    <h5
                        style={{
                        fontSize:'13px',
                        fontWeight:'bold',
                        color:'#4F5966',
                        borderBottom:'1px solid #ddd',
                        marginBottom:'5px',
                        paddingBottom:'5px',
                        width:'100%'
                    }}>
                        Create New Label
                    </h5>
                    <div className="form-label">
                        <input
                            type="text"
                            placeholder="Label Name"
                            value={newLabel.name}
                            onChange={(e) => setNewLabel({ ...newLabel, name: e.target.value })}
                            required
                        />
                        <button type="submit" onClick={handleCreateLabel}>CREATE LABEL</button>
                    </div>
                </div>
                
            </div>
        </div>
    );
};

export default Label;
