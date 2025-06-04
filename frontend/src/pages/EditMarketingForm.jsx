import React, { useState, useEffect } from 'react';
import { getDataMarketingById,updateDataMarketing } from '../services/ApiServices';
import BootstrapTooltip from '../components/Tooltip';
import { HiOutlineXMark } from 'react-icons/hi2';
import '../style/pages/EditMarketingForm.css'
import { FaXmark } from 'react-icons/fa6';
import { useSnackbar } from '../context/Snackbar';

const EditMarketingForm = ({ marketingId, onClose, fetchDataMarketing }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const {showSnackbar} = useSnackbar()
    const [formData, setFormData] = useState({
        card_id: '',
        input_by: '',
        acc_by: '',
        buyer_name: '',
        code_order: '',
        jumlah_track: '',
        order_number: '',
        account: '',
        deadline: '',
        jumlah_revisi: '',
        order_type: '',
        offer_type: '',
        jenis_track: '',
        genre: '',
        price_normal: '',
        price_discount: '',
        discount: '',
        basic_price: '',
        gig_link: '',
        required_files: '',
        project_type: '',
        duration: '',
        reference_link: '',
        file_and_chat_link: '',
        detail_project: '',
        is_accepted:false,
    });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  //debuging 
  console.log('file edit maerketing form menerima data fetch data:', fetchDataMarketing)

  //fungsi dropdown data accept
  const handleOptionClick = (value) =>{
    setFormData((prevData) =>({
        ...prevData,
        is_accepted: value === 'accepted',
    }));
    setIsDropdownOpen(false);
  }

// Fetch data when the component mounts
const fetchData = async()=>{
    try{
        const response = await getDataMarketingById(marketingId);
        console.log('Fetching data:', response.data)
        setFormData(response.data)
    }catch(error){
        setError(error);
        console.error('Error fetching data marekting:', error)
    }finally{
        setLoading(false);
    }
}

//useEffect untuk memanggil fetchData
useEffect(()=>{
    if(marketingId){
        fetchData();
    }
},[marketingId])

// Handle form input changes
const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData((prevData) => ({
    ...prevData,
    [name]: value,
  }));
};

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const response = await getDataMarketingById(marketingId);
//         setFormData(response.data); // Set form data based on the response from the API
//         // setFormData(false);
//       } catch (error) {
//         setError('Error fetching data');
//         console.error('Error fetching marketing data:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (marketingId) {
//       fetchData();
//     }
//   }, [marketingId]);

  

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const updatedData = await updateDataMarketing(marketingId, formData);
        showSnackbar('Data updated successfully','success');
        if(fetchDataMarketing){
            fetchDataMarketing();
        }
    } catch (error) {
        console.error('Error updating data:', error);
        showSnackbar('Failed to update data!','error');
    }
  };

  //fungsi untuk mengambil 5 karakter terakhir code order
  const get5LastChar = (codeOrder) => {
    return codeOrder ? codeOrder.slice(-5) :'';
  }

  //fungsi format date
    const formatDate = (isoString) => {
        const date = new Date(isoString);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('id-ID', options);
    };

  // Loading or error state display
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className='em-container'>
        <div className="em-header">
            <div className="em-left">
                <h4 className='font-bold'>EDIT DATA MARKETING</h4>
                {formData.genre} | {formData.buyer_name} | {formData.account} | {get5LastChar(formData.code_order)}
            </div>
            <div className="em-right">
                {/* <button type="submit">Update</button> */}
                <BootstrapTooltip title="Close Edit" placement='top'>
                    <FaXmark onClick={onClose} className='em-icon'/>
                </BootstrapTooltip>
            </div>
        </div>

        <form onSubmit={handleSubmit}>
            {/* INFORMASI PESANAN  */}
            <div className="section">
                <h4 className='font-bold'>INFORMASI PESANAN</h4>
                <div className="sec-content">
                    <div className="box">
                        <label>Input By</label>
                        <input
                            type="text"
                            name="input_by"
                            value={formData.input_by}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="box">
                        <label>Accepted By</label>
                        <input
                            type="text"
                            name="acc_by"
                            value={formData.acc_by}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="emd-box">
                        <label>Status Accept</label>
                        <div
                            className={`dropdown-selected ${formData.is_accepted ? 'accepted-status' : 'not-accepted-status'}`}
                            onClick={() => setIsDropdownOpen((prev) => !prev)}
                        >
                            {formData.is_accepted ? "Accepted" : "Not Accepted"}
                        </div>
                        {/* DROPDOWN OPTION  */}
                        {isDropdownOpen && (
                            <ul className="dropdown-options">
                                <li onClick={() => handleOptionClick("not_accepted")}>Not Accepted</li>
                                <li onClick={() => handleOptionClick("accepted")}>Accepted</li>
                            </ul>
                        )}
                        {/* END DROPDOWN OPTION  */}
                    </div>
                    
                    <div className="box">
                        <label>Buyer Name</label>
                        <input
                            type="text"
                            name="buyer_name"
                            value={formData.buyer_name}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="box">
                        <label>Account Name</label>
                        <input
                            type="text"
                            name="account"
                            value={formData.account}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </div>
            {/* END INFORMASI PESANAN */}
            {/* DETAIL PESANAN */}
            <div className="section">
                <h4 className='font-bold'>DETAIL PESANAN</h4>
                <div className="sec-content">
                    <div className="box">
                        <label>Code Order</label>
                        <input
                            type="text"
                            name="code_order"
                            value={formData.code_order}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="box">
                        <label>Order Number</label>
                        <input
                            type="text"
                            name="order_number"
                            value={formData.order_number}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="box">
                        <label>Order Type</label>
                        <input
                            type="text"
                            name="order_type"
                            value={formData.order_type}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="box">
                        <label>Offer Type</label>
                        <input
                            type="text"
                            name="offer_type"
                            value={formData.offer_type}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="box">
                        <label>Jumlah Track</label>
                        <input
                            type="text"
                            name="jumlah_track"
                            value={formData.jumlah_track}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="box">
                        <label>Jenis Track</label>
                        <input
                            type="text"
                            name="jenis_track"
                            value={formData.jenis_track}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="box">
                        <label>Genre </label>
                        <input
                            type="text"
                            name="genre"
                            value={formData.genre}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="box">
                        <label>Project Type</label>
                        <input
                            type="text"
                            name="project_type"
                            value={formData.project_type}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="box">
                        <label>Duration Needed</label>
                        <input
                            type="text"
                            name="duration"
                            value={formData.duration}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="box">
                        <label>Jumlah Revisi</label>
                        <input
                            type="text"
                            name="jumlah_revisi"
                            value={formData.jumlah_revisi}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="box">
                        <label>Deadline Project</label>
                        <input
                            type="text"
                            name="deadline"
                            value={formatDate(formData.deadline)}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </div>
            {/* END DETAIL PESANAN */}

            {/* INFORMASI HARGA */}
            <div className="section">
                <h4 className='font-bold'>INFORMASI HARGA DAN DISKON</h4>
                <div className="sec-content">
                    <div className="box">
                        <label>Price Normal</label>
                        <input
                            type="text"
                            name="price_normal"
                            value={formData.price_normal}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="box">
                        <label>Price Discount</label>
                        <input
                            type="text"
                            name="price_discount"
                            value={formData.price_discount}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="box">
                        <label>Discount %</label>
                        <input
                            type="text"
                            name="discount"
                            value={formData.discount}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="box">
                        <label>Basic Price</label>
                        <input
                            type="text"
                            name="basic_price"
                            value={formData.basic_price}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </div>
            {/* END INFORMASI HARGA  */}

            {/* REFERENSI DAN FILE PENDUKUNG  */}
            <div className="section">
                <h4 className='font-bold'>REFERENSI DAN FILE PENDUKUNG</h4>
                <div className="sec-link-content">
                    <div className="box">
                        <label>GIG Link</label>
                        <input
                            type="url"
                            name="gig_link"
                            value={formData.gig_link}
                            onChange={handleChange}
                            pattern="https?://.*"
                            required
                        />
                    </div>
                    <div className="box">
                        <label>Reference Link</label>
                        <input
                            type="url"
                            name="reference_link"
                            value={formData.reference_link}
                            onChange={handleChange}
                            pattern="https?://.*"
                            required
                        />
                    </div>
                    <div className="box">
                        <label>Require Files </label>
                        <input
                            type="text"
                            name="required_files"
                            value={formData.required_files}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="box">
                        <label>File & Chat</label>
                        <input
                            type="url"
                            name="file_and_chat_link"
                            value={formData.file_and_chat_link}
                            onChange={handleChange}
                            pattern="https?://.*"
                            required
                        />
                    </div>
                </div>
            </div>
            {/* END REFERENSI DAN FILE PENDUKUNG  */}

            {/* PROJECT DESCRIPTION  */}
            <div className="section">
                <h4 className='font-bold'>PROJECT DESCRIPTION</h4>
                <div className="sec-link-content">
                    <div className="box">
                        <label>Detail Project</label>
                        <textarea
                            type="text"
                            name="detail_project"
                            value={formData.detail_project}
                            onChange={handleChange}
                            pattern="https?://.*"
                            required
                        />
                    </div>
                </div>
            </div>
            {/* END PROJECT DESCRIPTION  */}
            <div className="button-update">
                <button type="submit">SAVE UPDATE DATA</button>
            </div>
        </form>

        
    </div>
  );
};

export default EditMarketingForm;
