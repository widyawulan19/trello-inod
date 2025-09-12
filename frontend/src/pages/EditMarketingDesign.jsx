import React, { useState, useEffect } from 'react'
import { getDataMarketingDesignById, updateDataMarketingDesign,updateMarketingDesign,getMarketingDesignById } from '../services/ApiServices';
import '../style/pages/EditMarketingDesign.css'
import { HiOutlinePlus, HiOutlineXMark } from 'react-icons/hi2';
import BootstrapTooltip from '../components/Tooltip';
import { IoSave } from 'react-icons/io5';
import { useSnackbar } from '../context/Snackbar';
import { FaXmark } from 'react-icons/fa6';

 const EditMarketingDesign=({marketingDesignId, onClose,fetchMarketingDesign})=> {
    //state
    const {showSnackbar} = useSnackbar();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isAccepted, setIsAccepted] = useState(false);
    const [formData, setFormData] = useState({
        input_by: '',
        buyer_name: '',
        code_order: '',
        jumlah_design: '',
        order_number: '',
        account: '',
        deadline: '',
        jumlah_revisi: '',
        order_type: '',
        offer_type: '',
        style: '',
        resolution: '',
        price_normal: '',
        price_discount: '',
        discount_precentage: '',
        required_files: '',
        project_type: '',
        reference: '',
        file_and_chat: '',
        detail_project: '',
        acc_by:'',
        is_accepted:false,
    })
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    //fungsi dropdown data accepted
    const handleOptionClick = (value) => {
        setFormData((prevData) => ({
            ...prevData,
            is_accepted: value === "accepted",
        }));
        setIsDropdownOpen(false);
    };

    // Fungsi untuk fetch data
    const fetchData = async () => {
        try {
            const response = await getMarketingDesignById(marketingDesignId);
            console.log("Fetched data:", response.data);
            setFormData(response.data[0]);
        } catch (error) {
            setError(error);
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    // useEffect hanya memanggil fetchData
    useEffect(() => {
        if (marketingDesignId) {
            fetchData();
        }
    }, [marketingDesignId]);


    //handle form input change
    const handleChange = (e)=>{
        const {name, value} = e.target;
        setFormData((prevData)=>({
            ...prevData,
            [name]:value,
        }))
    }

    //handle form submit
   const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const updateData = await updateMarketingDesign(marketingDesignId, formData);
            showSnackbar('Data Updated Successfully!', 'success');
            if (fetchMarketingDesign) {
                fetchMarketingDesign();
            }
        } catch (error) {
            console.error('Error updating data:', error);
            showSnackbar('Failed to update data', 'error');
        }
    };

    //fungsi untuk mengambil lima karakter terakhir code order
    const getFiveChar = (codeOrder) => {
        return codeOrder ? codeOrder.slice(-5): '';
    }
    
    //fungsi form data
    const formDate = (isoString) =>{
        const date = new Date(isoString);
        const options = {day :'numeric', month:'long', year:'numeric'};
        return date.toLocaleDateString('id-ID', options)
    }

  return (
    <div className='emd-container'>
        <div className="emd-header">
            <div className="emd-left">
                <h4>EDIT DATA MARKETING DESIGN</h4>
                {formData.style} | {formData.buyer_name} | {formData.account} | {getFiveChar(formData.code_order)}
            </div>
            <div className="emd-right">
                <BootstrapTooltip title='close' placement='top'>
                    <FaXmark onClick={onClose} className='emd-icon'/>
                </BootstrapTooltip>
            </div>
        </div>
       <form onSubmit={handleSubmit}>
        <div className="emd-informasi">
            <h4 className='font-bold'>Informasi Pesanan</h4>
            <div className="emd-content">
                <div className="emd-box">
                    <label>Input By</label>
                    <input
                        type="text"
                        name="input_by"
                        value={formData.input_by}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="emd-box">
                    <label>Accept By</label>
                    <input
                        type="text"
                        name="acc_by"
                        value={formData.acc_by}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="emd-box" >
                    <label>Status Accept</label>
                    <div
                        className={`dropdown-selected ${formData.is_accepted ? 'accepted-status' : 'not-accepted-status'}`}
                        onClick={() => setIsDropdownOpen((prev) => !prev)}
                    >
                        {formData.is_accepted ? "Accepted" : "Not Accepted"}
                    </div>
                    {isDropdownOpen && (
                        <ul className="dropdown-options">
                            <li onClick={() => handleOptionClick("not_accepted")}>Not Accepted</li>
                            <li onClick={() => handleOptionClick("accepted")}>Accepted</li>
                        </ul>
                    )}
                </div>
                <div className="emd-box">
                    <label>Buyer Name</label>
                    <input
                        type="text"
                        name="buyer_name"
                        value={formData.buyer_name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="emd-box">
                    <label>Code Order</label>
                    <input
                        type="text"
                        name="code_order"
                        value={formData.code_order}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="emd-box">
                    <label>Order Number</label>
                    <input
                        type="text"
                        name="order_number"
                        value={formData.order_number}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="emd-box">
                    <label>Account Name</label>
                    <input
                        type="text"
                        name="account"
                        value={formData.account}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>
        </div>
        <div className="emd-informasi">
            <h4 className='font-bold'>Detail Pesanan</h4>
            <div className="emd-content">
                <div className="emd-box">
                    <label>Jumlah Design</label>
                    <input
                        type="text"
                        name="jumlah_design"
                        value={formData.jumlah_design}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="emd-box">
                    <label>Jumlah Revisi</label>
                    <input
                        type="text"
                        name="jumlah_revisi"
                        value={formData.jumlah_revisi}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="emd-box">
                    <label>Order Type</label>
                    <input
                        type="text"
                        name="order_type"
                        value={formData.order_type}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="emd-box">
                    <label>Project Type</label>
                    <input
                        type="text"
                        name="project_type"
                        value={formData.project_type}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="emd-box">
                    <label>Offer Type</label>
                    <input
                        type="text"
                        name="offer_type"
                        value={formData.offer_type}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="emd-box">
                    <label>Deadline Date</label>
                    <input
                        type="datetime-local"
                        name="deadline"
                        value={formData.deadline}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>
        </div>
        <div className="emd-informasi">
            <h4 className='font-bold'>Detail Design</h4>
            <div className="emd-content">
                <div className="emd-box">
                    <label>Style</label>
                    <input
                        type="text"
                        name="style"
                        value={formData.style}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="emd-box">
                    <label>Resolution</label>
                    <input
                        type="text"
                        name="resolution"
                        value={formData.resolution}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="emd-box">
                    <label>Required Files</label>
                    <input
                        type="text"
                        name="required_files"
                        value={formData.required_files}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>
        </div>
        <div className="emd-informasi">
            <h4 className='font-bold'>Detail Price</h4>
            <div className="emd-content">
                <div className="emd-box">
                    <label>Price Normal</label>
                    <input
                        type="text"
                        name="price_normal"
                        value={formData.price_normal}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="emd-box">
                    <label>Price Discount</label>
                    <input
                        type="text"
                        name="price_discount"
                        value={formData.price_discount}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="emd-box">
                    <label>Discount Percentage</label>
                    <input
                        type="text"
                        name="discount_precentage"
                        value={formData.discount_precentage}
                        onChange={handleChange}
                        // required
                    />
                </div>
            </div>
        </div>
        <div className="emd-reference">
            <h4 className='font-bold'>Reference</h4>
            <div className="emd-ref-content">
                <div className="emd-ref-box">
                    <label>Reference</label>
                    <input 
                        type="text" 
                        name='reference'
                        value={formData.reference}
                        onChange={handleChange}
                    />
                </div>
                <div className="emd-ref-box">
                    <label>File and Chat</label>
                    <input 
                        type="text" 
                        name='file_and_chat'
                        value={formData.file_and_chat}
                        onChange={handleChange}
                    />
                </div>
            </div>
        </div>
        <div className="emd-reference">
            <h4 className='font-bold'>Detail Project</h4>
            <div className="emd-ref-content">
                <div className="emd-ref-box">
                    {/* <label>Detail Project</label>  */}
                    <textarea 
                        type="text" 
                        name='detail_project'
                        value={formData.detail_project}
                        onChange={handleChange}
                    />
                </div>
            </div>
        </div>
        <div className="emd-btn">
            <button type='submit'>
                SAVE UPDATE DATA
            </button>
        </div>
       </form>
    </div>
  )
}

export default EditMarketingDesign