import React, { useState } from 'react'
import { createCard, updateTitleCard } from '../services/ApiServices';
import '../style/modules/CreateCard.css'
import { HiOutlinePlus, HiOutlineXMark, HiPlus } from 'react-icons/hi2';
import BootstrapTooltip from '../components/Tooltip';
import { useSnackbar } from '../context/Snackbar';

const CreateCard=({listId, onCardCreated, onClose})=> {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const {showSnackbar} = useSnackbar()


    const handleSubmit = async(e)=>{
        e.preventDefault();

        if(!title || !description){
            return;
        }

        try{
            const newCard = {title, description, list_id: listId}
            const response = await createCard(newCard);
            onCardCreated(response.data);
            setTitle('')
            setDescription('')
            showSnackbar('Card created successfully', 'success')
        }catch(error){
            console.error('failed to create card')
            showSnackbar('Failed to create card', 'error')
        }
    }

  return (
    <div className='cf-container'>
        <div className="cf-header">
            <div className="cfh-left">
                {/* <HiOutlinePlus className='cfh-icon'/> */}
                <h5>ADD NEW CARD</h5>
            </div>
            <div className="cfh-right">
                <BootstrapTooltip title='Close' placement='top'>
                    <HiOutlineXMark onClick={onClose}/>
                </BootstrapTooltip>
            </div>
        </div>
        <form onSubmit={handleSubmit} className='create-card-form'>
            <div className="title">
                <label>Card Title</label>
                <input
                    type="text"
                    placeholder="Card Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </div>
            <div className="desc">
                <label>Card Description</label>
                <textarea
                    placeholder="Card Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
            </div>
        <div className="cc-sub-btn">
            <button type="submit">
                <HiPlus/>
                Add card
            </button>
        </div>
        </form>
    </div>
  )
}

export default CreateCard