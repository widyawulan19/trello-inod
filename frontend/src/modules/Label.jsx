import React, { useEffect, useState } from 'react'
import { deleteLabels, getAllLabels, getLabelByCard, createLabel, addLabelToCard, updateLabelName, deleteLabelFromLabels } from '../services/ApiServices';
import { HiEllipsisVertical, HiMiniAdjustmentsHorizontal, HiMiniAdjustmentsVertical, HiMiniPencilSquare, HiMiniTag, HiOutlineTrash, HiXMark } from "react-icons/hi2";
import '../style/modules/Labels.css'
import OutsideClick from '../hook/OutsideClick';
import BootstrapTooltip from '../components/Tooltip';
import { useSnackbar } from '../context/Snackbar';

const Label = ({ cardId, fetchCardDetail, labels, setLabels, fetchLabels, onClose }) => {
    const [allLabels, setAllLabels] = useState([]);
    const [newLabel, setNewLabel] = useState({ name: '', color: '', bg_color: '' });
    const showLabelRef = OutsideClick(() => setShowSelectLabel(false));
    const [showSelectLabel, setShowSelectLabel] = useState(false);
    const [showSetting, setShowSetting] = useState(false);
    const refShowSetting = OutsideClick(()=>setShowSetting(false));
    const {showSnackbar} = useSnackbar();
    
    //DEBUG
    console.log('file labels menerima data label:', labels);
    console.log('File ini menerima data fetchCardDetail:', fetchCardDetail)

    useEffect(() => {
        fetchLabels();
        fetchAllLabels();
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

    //FUNGSI MEMBUAT LABEL BARU
    const handleCreateLabel = async (e) => {
        e.preventDefault();
        try {
            const response = await createLabel({ name: newLabel.name });
            setAllLabels([...allLabels, response.data]);
            setNewLabel({ name: '' });
        } catch (error) {
            console.error('Error creating label:', error);
        }
    };

    //FUNGSI DELETE LABEL FROM CARD
    const handleDeleteLabel = async (cardId, labelId) => {
        try {
            await deleteLabels(cardId, labelId);
            setLabels(labels.filter(label => label.id !== labelId));
        } catch (error) {
            console.error('Error deleting label:', error);
        }
    };

    //FUNGSI MEMILIH LABEL UNTUK CARD
    const handleSelectLabel = async (label) => {
        try {
            await addLabelToCard(cardId, label.id);
            setLabels([...labels, label]);
            fetchCardDetail(cardId);
        } catch (error) {
            console.error('Error adding label to card:', error);
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

    const handleShowSetting = (labelId) => {
        if (showSetting === labelId) {
            setShowSetting(null); //
        } else {
            setShowSetting(labelId); 
        }
    }
    
    //FUNGSI DELETE LABEL DARI DAFTAR LABELS
    const handleDeleteLabels = async(labelId) =>{
        try{
            const response = await deleteLabelFromLabels(labelId);
            console.log('Label delete succesfully:', response.data);
            showSnackbar('Label delete successfully','success');
            fetchCardDetail(cardId);
            return response.data;
        }catch(error){
            console.error('Error deleting label from labels',error)
            showSnackbar('Failed deleting label','error')
            throw error;
        }
    }


    return (
        <div className='label-container'>
            <div className="lc-header">
                <h5>
                    <HiMiniTag className='l-icon' />
                    CARD LABELS
                </h5>
                <BootstrapTooltip title='Close' placement='top'>
                    <HiXMark onClick={onClose} className='l-close'/>
                </BootstrapTooltip>
            </div>
           

            {/* LABELS YANG SUDAH DITAMBAHKAN */}
            <div className="sl-container">
                {labels.map(label => (
                    <div
                        key={label.id}
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
                            justifyContent: 'center',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            width: 'fit-content',
                            gap:'5px'
                        }}
                    >
                        {label.name}
                       <HiXMark
                            onClick={()=> handleDeleteLabel(cardId, label.id)}
                            style={{
                                cursor:'pointer',
                            }}
                       />
                    </div>
                ))}
            </div>

            {/* LIST SELECT LABEL */}
            <div className="show-label" ref={showLabelRef}>
                <div className="l-box">
                    {allLabels.map(label => (
                        <div
                            key={label.id}
                            onClick={() => handleSelectLabel(label)}
                            className='lb-content'
                            style={{
                                padding: "4px 5px",
                                fontSize: '10px',
                                cursor: "pointer",
                                backgroundColor: label.bg_color,
                                fontWeight:'bold',
                                color:'#333',
                                borderRadius: '4px',
                                border: '1px solid #fff',
                                marginBottom: '4px',
                                gap:'3px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-start'
                            }}
                        >
                            {label.name}
                            <HiEllipsisVertical className='lbox-icon' onClick={()=> handleShowSetting(label.id)} />
                            
                            {/* SETTING LABEL  */}
                                {showSetting === label.id && (
                                    <div className="set-label" ref={refShowSetting}>
                                        <div className="delete-label-btn" onClick={()=> handleDeleteLabels(label.id)}>
                                            <HiOutlineTrash/>
                                            Delete
                                        </div>
                                    </div>
                                )}
                            {/* END SETTING LABEL  */}
                        </div>
                    ))}
                </div>
                

                {/* FORM CREATE NEW LABEL */}
                <div className='fl-label'>
                    <h5>CREATE NEW LABEL</h5>
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
