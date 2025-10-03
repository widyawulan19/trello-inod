import React, { useEffect, useState } from 'react';
import { createChecklist, createChecklistItem, deleteChecklist, deleteChecklistItem, getChecklistsWithItemsByCardId, updateCheckItem, updateChecklistName, updateNameItem } from '../services/ApiServices';
import BootstrapTooltip from '../components/Tooltip';
import OutsideClick from '../hook/OutsideClick';
import { MdOutlineCheckBoxOutlineBlank } from "react-icons/md";
import { IoCheckbox , IoCheckboxOutline} from "react-icons/io5";
import { TbCheckbox } from "react-icons/tb";
import { HiOutlineCheck, HiOutlineEllipsisHorizontal, HiOutlinePlus, HiOutlineTrash, HiPlus, HiUserCircle, HiXMark, } from 'react-icons/hi2';
import '../style/modules/Checklist.css';
import { useSnackbar } from '../context/Snackbar';
import { FaXmark } from 'react-icons/fa6';

const Checklist = ({ cardId, fetchCardById ,fetchTotalChecklist}) => {
    const [checklists, setChecklists] = useState([]);
    const [newChecklistName, setNewChecklistName] = useState('');
    const [checklistItems, setChecklistItems] = useState([]);
    const [newItem, setNewItem] = useState({})

    // STATE SHOW
    const [showChecklist, setShowChecklist] = useState(false);
    const showChecklistRef = OutsideClick(() => setShowChecklist(false));
    const [showChecklistSetting, setShowChecklistSetting] = useState({});  // Change to store checklist_id
    const showSettingRef = OutsideClick(() => setShowChecklistSetting(false));
    const [showItemSet, setShowItemSet] = useState({})
    const showItemRef = OutsideClick(()=> setShowItemSet(false));

    // EDIT CHECKLIST
    const [editName, setEditName] = useState(null);
    const [newName, setNewName] = useState('');
    const [editItemName, setEditItemName] = useState(null);
    const [newItemName, setNewItemName] = useState('');
    //SNACKBAR
    const {showSnackbar} = useSnackbar()

    // Fetch checklists
    const fetchCardChecklists = async () => {
        try {
            const response = await getChecklistsWithItemsByCardId(cardId);
            console.log('Fetched checklists:', response);

            if (Array.isArray(response.data)) {
                setChecklists(response.data);
            } else {
                console.error('Unexpected API response format:', response);
                setChecklists([]);
                fetchTotalChecklist();
            }
        } catch (error) {
            console.error('Error fetching checklist data:', error);
            setChecklists([]);
        }
    };

    useEffect(() => {
        fetchCardChecklists();
    }, [cardId]);

    // Add new checklist
    const addNewChecklist = async () => {
        if (!newChecklistName.trim()) {
            return alert('Checklist name cannot be empty');
        }

        try {
            const response = await createChecklist({ card_id: cardId, name: newChecklistName });

            if (response.data) {
                setNewChecklistName('');
                setShowChecklist(false);
                fetchCardChecklists();
                fetchCardById(cardId)
            }
            showSnackbar('Checklist added successfully!','success');
        } catch (error) {
            console.error('Error adding a new checklist:', error);
            showSnackbar('Failed to adding a new checklist:', error);
        }
    };

    // Edit checklist name
    const handleEditName = (e, checklistId, currentName) => {
        e.stopPropagation();
        setEditName(checklistId);
        setNewName(currentName);
    };

    const handleSaveName = async (checklistId) => {
        try {
            await updateChecklistName(checklistId, { name: newName });
            setEditName(null);
            fetchCardChecklists();
            // fetchCardById(cardId)
        } catch (error) {
            console.error('Error updating checklist name:', error);
        }
    };

    const handleKeyPressName = (e, checklistId) => {
        if (e.key === 'Enter') {
            handleSaveName(checklistId);
            e.stopPropagation();
        }
    };

    // Edit item name
    const handleEditItemName = (e, itemId, currentItemName) => {
        e.stopPropagation();
        setEditItemName(itemId);
        setNewItemName(currentItemName);
    };

    const handleSaveItemName = async (itemId) => {
        if (!newItemName.trim()) return;
        try {
            await updateNameItem(itemId, { name: newItemName });
            setEditItemName(null);
            setNewItemName('');
            fetchCardChecklists();
        } catch (error) {
            console.error('Error updating item name:', error);
        }
    };

    const handleKeyPressNameItem = (e, itemId) => {
        if (e.key === 'Enter') {
            handleSaveItemName(itemId);
            e.preventDefault();
        }
    };

    // Show checklist input
    const showChecklistHandler = (e) => {
        e.stopPropagation();
        setShowChecklist((prev) => !prev);
    };

    //close checklist form
    const handleCloseChecklisHandler = () =>{
        setShowChecklist(false);
    }

    const handleShowChecklistSetting = (e, checklistId) => {
        e.stopPropagation();
        setShowChecklistSetting(prev => ({
            ...prev,
            [checklistId]: !prev[checklistId]
        }));
    };

    const handleShowItemSetting = (e, itemId) =>{
        e.stopPropagation();
        setShowItemSet(prev => prev === itemId ? null : itemId)
    }

    //fungsi untuk membuat checklist item
    const addChecklistItem = async (checklistId) =>{
        if(!newItemName[checklistId]) return;

        try{
            const response = await createChecklistItem({
                checklist_id:checklistId,
                name:newItemName[checklistId],
                is_checked:false
            });
            setChecklists((prevChecklists) => {
                return prevChecklists.map((checklist) => {
                    if (checklist.checklist_id === checklistId) {
                        // Add the new item to the current checklist's items
                        return {
                            ...checklist,
                            items: [...checklist.items, response.data],
                        };
                    }
                    return checklist;
                });
            });
            setNewItemName((prev) => ({...prev, [checklistId]:''}))
            fetchCardChecklists(cardId)
            showSnackbar('Successfully added checklist item!', 'success');
        }catch(error){
            console.error('Error adding checklist item', error);
        }
    }

    // Toggle checklist item status
    const toggleChecked = async (itemId, isChecked) => {
        try {
            const updatedStatus = { is_checked: !isChecked };  // Toggle status centang
            
            const response = await updateCheckItem(itemId, updatedStatus);
            if (response.status === 200) {
                setChecklists((prevChecklists) => {
                    return prevChecklists.map((checklist) => ({
                        ...checklist,
                        items: checklist.items?.map((item) => {
                            if (item.item_id === itemId) {
                                return { ...item, is_checked: !isChecked };
                            }
                            return item;
                        })
                    }));
                });
            } else {
                console.error('Failed to update the checklist item.');
            }
        } catch (error) {
            console.error('Error updating check item status:', error);
        }
    };

    //FUNCTION DELETE 
    const handleDeleteChecklist = async(checklistId)=>{
        try{
            await deleteChecklist(checklistId);
            setChecklists((prevChecklists)=>
                prevChecklists.filter((checklist) => checklist.checklist_id !== checklistId)
            )
            showSnackbar('Successfully deleting checklist!', 'success')
        }catch(error){
            console.error('Error deleting checklist!', error)
            showSnackbar('Failed deleting checklist!','error')
        }
    }

    const handleDeleteChecklistItem = async (checklistId, itemId) => {
        try {
            await deleteChecklistItem(itemId);
            setChecklists((prevChecklists) =>
                prevChecklists.map((checklist) =>
                    checklist.checklist_id === checklistId
                        ? { ...checklist, items: checklist.items.filter((item) => item.item_id !== itemId) }
                        : checklist
                )
            );
            showSnackbar('Successfully deleting checklist item!', 'success')
        } catch (error) {
            console.error("Error deleting checklist item", error);
            showSnackbar('Failed deleting checklist item!','error')
        }
    };

    //PROGRESS ITEM
    const getChecklistProgress = (checklist) => {
        if (!checklist.items || checklist.items.length === 0) return 0;
        
        const totalItems = checklist.items.length;
        const completedItems = checklist.items.filter(item => item.is_checked).length;
    
        return Math.round((completedItems / totalItems) * 100);
    };
    

    return (
        <div className='checklist-container'>
            <div className="c-content" onClick={showChecklistHandler}>
                <div className="cc-left">
                    <TbCheckbox className='cc-icon'/>
                    Add Checklist
                </div>
                <div className="cc-right">
                    <BootstrapTooltip title='Add new checklist item' placement='top'>
                        <HiPlus className='ccr-icon'/>
                    </BootstrapTooltip>
                </div>  
            </div>

            {/* SHOW CHECKLIST INPUT */}
            {showChecklist && (
                <div className="from-create">
                    <div className="fc-header">
                        <h5>Checklist</h5>
                        <BootstrapTooltip title='Close' placement='top'>
                            <FaXmark onClick={handleCloseChecklisHandler} className='fc-icon'/>
                        </BootstrapTooltip>
                    </div>
                    <div className="fc-con">
                        <input
                            type="text"
                            placeholder='Add new checklist...'
                            value={newChecklistName}
                            onChange={(e) => setNewChecklistName(e.target.value)}
                        />
                        <button onClick={addNewChecklist}>
                            <HiOutlinePlus style={{color:'white', marginRight:'5px'}}/>
                            Checklist
                        </button>
                    </div>
                </div>
            )}

            {/* SHOW CHECKLISTS */}
            <div className="cs-container">
                {checklists?.length > 0 ? (
                    checklists.map((checklist) => (
                        <div key={checklist.checklist_id} className="cs-content">
                            <div className="cs-title">
                                <div className="tleft">
                                    {editName === checklist.checklist_id ? (
                                        <input
                                            type='text'
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            onBlur={() => handleSaveName(checklist.checklist_id)}
                                            onKeyDown={(e) => handleKeyPressName(e, checklist.checklist_id)}
                                            autoFocus
                                        />
                                    ) : (
                                        <h5 onClick={(e) => handleEditName(e, checklist.checklist_id, checklist.checklist_name)}>
                                            {checklist.checklist_name}
                                        </h5>
                                    )}
                                    <p>{getChecklistProgress(checklist)}%</p>
                                </div>
                                <div className="tright">
                                    <BootstrapTooltip title="Checklist Setting" placement="top">
                                        <button onClick={(e) => handleShowChecklistSetting(e, checklist.checklist_id)}>
                                            <HiOutlineEllipsisHorizontal size={15} />
                                        </button>
                                    </BootstrapTooltip>
                                </div>
                                {showChecklistSetting[checklist.checklist_id] && (
                                    <div className="tright-set" ref={showSettingRef}>
                                        {/* <button>
                                            <HiOutlinePlus className="set-icon" />
                                            Add Item
                                        </button> */}
                                        <button className='set-delete' onClick={()=> handleDeleteChecklist(checklist.checklist_id)}>
                                            <HiOutlineTrash className="set-icon" />
                                            Delete Checklist
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* ITEMS */}
                            <div className="ci-container">
                                {checklist.items?.map((item) => (
                                    <div className='ci-item' key={item.item_id}>
                                        <div className="checkbox">
                                            {item.is_checked ? (
                                                <IoCheckbox
                                                    className='check-icon'
                                                    onClick={() => toggleChecked(item.item_id, item.is_checked)}
                                                    size={15}
                                                />
                                            ) : (
                                                <MdOutlineCheckBoxOutlineBlank
                                                    className='check-icon'
                                                    onClick={() => toggleChecked(item.item_id, item.is_checked)}
                                                    size={15}
                                                />
                                            )}
                                        </div>
                                        {editItemName === item.item_id ? (
                                            <input
                                                className='ci-input'
                                                type='text'
                                                value={newItemName}
                                                onChange={(e) => setNewItemName(e.target.value)}
                                                onBlur={() => handleSaveItemName(item.item_id)}
                                                onKeyDown={(e) => handleKeyPressNameItem(e, item.item_id)}
                                                autoFocus
                                            />
                                        ) : (
                                            <h5 onClick={(e) => handleEditItemName(e, item.item_id, item.item_name)}>
                                                {item.item_name}
                                            </h5>
                                        )}
                                        <div className="ci-buttons" onClick={(e)=> handleShowItemSetting(e, item.item_id)}>
                                            <BootstrapTooltip title='Item Setting' placement='top'>
                                                <button><HiOutlineEllipsisHorizontal className='btn-icon'/></button>
                                            </BootstrapTooltip>
                                        </div>
                                        {showItemSet === item.item_id && (
                                            <div className='item-set' ref={showItemRef}>
                                                {/* <button>
                                                    <HiOutlinePlus className='set-icon'/>
                                                    Add Item 
                                                </button> */}
                                                <button className='set-delete' onClick={() => handleDeleteChecklistItem(checklist.checklist_id,item.item_id)}>
                                                    <HiOutlineTrash className='set-icon'/>
                                                    Delete Item
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {/* FORM CREATE CHECKLIST ITEM  */}
                            <div className="add-checklist-item">
                                <HiOutlinePlus className='add-icon'/>
                                <input
                                    type="text"
                                    placeholder="Add an item..."
                                    value={newItemName[checklist.checklist_id] || ''}
                                    onChange={(e) =>
                                        setNewItemName((prev) => ({
                                            ...prev,
                                            [checklist.checklist_id]: e.target.value,
                                        }))
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') addChecklistItem(checklist.checklist_id);
                                    }}
                                />
                                {/* <button onClick={() => addChecklistItem(checklist.checklist_id)}>Add Item</button> */}
                            </div>

                        </div>
                    ))
                ) : (
                    <p className='c-p'></p>
                )}
            </div>
        </div>
    );
};

export default Checklist;



// <div className="ci-container">
//                                 {checklist.items.map((item) => (
//                                     <div className='ci-item' key={item.item_id}>
//                                         <div className="checkbox">
//                                             {item.is_checked ? (
//                                                 <IoCheckbox
//                                                     className='check-icon'
//                                                     onClick={() => toggleChecked(item.item_id, item.is_checked)}
//                                                     size={20}
//                                                 />
//                                             ) : (
//                                                 <MdOutlineCheckBoxOutlineBlank
//                                                     className='check-icon'
//                                                     onClick={() => toggleChecked(item.item_id, item.is_checked)}
//                                                     size={20}
//                                                 />
//                                             )}
//                                         </div>
//                                         {editItemName === item.item_id ? (
//                                             <input
//                                                 className='ci-input'
//                                                 type='text'
//                                                 value={newItemName}
//                                                 onChange={(e) => setNewItemName(e.target.value)}
//                                                 onBlur={() => handleSaveItemName(item.item_id)}
//                                                 onKeyDown={(e) => handleKeyPressNameItem(e, item.item_id)}
//                                                 autoFocus
//                                             />
//                                         ) : (
//                                             <h5 onClick={(e) => handleEditItemName(e, item.item_id, item.item_name)}>
//                                                 {item.item_name}
//                                             </h5>
//                                         )}
//                                         <div className="ci-buttons" onClick={(e)=> handleShowItemSetting(e, item.item_id)}>
//                                             <BootstrapTooltip title='Item Setting' placement='top'>
//                                                 <button><HiOutlineEllipsisHorizontal className='btn-icon'/></button>
//                                             </BootstrapTooltip>
//                                         </div>
//                                         {showItemSet === item.item_id && (
//                                             <div className='item-set' ref={showItemRef}>
//                                                 <button>
//                                                     <HiOutlinePlus className='set-icon'/>
//                                                     Add Item 
//                                                 </button>
//                                                 <button onClick={() => handleDeleteChecklistItem(checklist.checklist_id,item.item_id)}>
//                                                     <HiOutlineTrash className='set-icon'/>
//                                                     Delete Checklist
//                                                 </button>
//                                             </div>
//                                         )}
//                                     </div>
//                                 ))}
//                             </div>