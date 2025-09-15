import React, { useState } from 'react';
import { createDataMarketingDesign } from '../services/ApiServices';
import '../style/pages/NewFormMarketingDesign.css';
import {HiPlus, HiXMark } from 'react-icons/hi2';
import BootstrapTooltip from '../components/Tooltip';
import {GiCircle} from 'react-icons/gi'
import { CiCircleCheck } from "react-icons/ci";
import { useSnackbar } from '../context/Snackbar';
import { IoCreate } from 'react-icons/io5';

const NewFormMarketingDesign = ({ onClose, fetchMarketingDesign }) => {
  const { showSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    input_by: "",
    acc_by: "",
    buyer_name: "",
    code_order: "",
    jumlah_design: "",
    order_number: "",
    account: "",
    deadline: "", 
    jumlah_revisi: "",
    order_type: "",
    offer_type: "",
    style: "",
    resolution: "",
    price_normal: "",
    price_discount: "",
    discount_percentage: "",
    required_files: "",
    project_type: "",
    reference: "",
    file_and_chat: "",
    detail_project: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await createDataMarketingDesign(formData);
      console.log('Data successfully added:', response.data);
      showSnackbar('Data Marketing Design Successfully Added!', 'success');
      setFormData({
        input_by: "",
        acc_by: "",
        buyer_name: "",
        code_order: "",
        jumlah_design: "",
        order_number: "",
        account: "",
        deadline: "",
        jumlah_revisi: "",
        order_type: "",
        offer_type: "",
        style: "",
        resolution: "",
        price_normal: "",
        price_discount: "",
        discount_percentage: "",
        required_files: "",
        project_type: "",
        reference: "",
        file_and_chat: "",
        detail_project: "",
      });
      fetchMarketingDesign();
    } catch (error) {
      console.error('Error adding data:', error);
      showSnackbar('Failed to add data', 'error');
    }
  };


  return (
    <div className='setting-container'>
      <div className="sc-header">
        <div className="sch-left">
          <div className="sch-icon">
             <IoCreate size={15}/>
          </div>
          <h4> CREATE DATA MARKETING DESIGN</h4>
        </div>
        
        <BootstrapTooltip title='Close Form' placement='top'>
          <HiXMark onClick={onClose} className='sch-icon' />
        </BootstrapTooltip>
      </div>

      <form className="sc-body" onSubmit={handleSubmit}>
        {/* INFORMASI PESANAN  */}
        <div className="sc-main-container">
          <h4>Informasi Pesanan</h4>
          <div className="sc-main-box">
            <div className="main-box">
              <label>Input By</label>
              <input 
                type="text" 
                name='input_by'
                value={formData.input_by}
                onChange={handleChange}
                required
              />
            </div>
            <div className="main-box">
              <label>Acc By <span style={{color:'red', fontSize:'6px'}}> ** diisi oleh kadiv</span></label>
              <input 
                type="text" 
                name='acc_by'
                value={formData.acc_by}
                onChange={handleChange}
                required
              />
            </div>
            <div className="main-box">
              <label>Buyer Name</label>
              <input 
                type="text" 
                name='buyer_name'
                value={formData.buyer_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="main-box">
              <label>Code Order</label>
              <input 
                type="text" 
                name='code_order'
                value={formData.code_order}
                onChange={handleChange}
                required
              />
            </div>
            <div className="main-box">
              <label>Order Number</label>
              <input 
                type="text" 
                name='order_number'
                value={formData.order_number}
                onChange={handleChange}
                required
              />
            </div>
            <div className="main-box">
              <label>Account</label>
              <input 
                type="text" 
                name='account'
                value={formData.account}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* DETAIL PESANAN  */}
        <div className="sc-main-container">
          <h4>Detail Pesanan</h4>
          <div className="sc-main-box">
            <div className="main-box">
              <label>Jumlah Design</label>
              <input 
                type="number" 
                name='jumlah_design'
                value={formData.jumlah_design}
                onChange={handleChange}
                required
              />
            </div>
            <div className="main-box">
              <label>Jumlah Revisi</label>
              <input 
                type="number" 
                name='jumlah_revisi'
                value={formData.jumlah_revisi}
                onChange={handleChange}
                required
              />
            </div>
            <div className="main-box">
              <label>Order Type</label>
              <input 
                type="text" 
                name='order_type'
                value={formData.order_type}
                onChange={handleChange}
                required
              />
            </div>
            <div className="main-box">
              <label>Project Type</label>
              <input 
                type="text" 
                name='project_type'
                value={formData.project_type}
                onChange={handleChange}
                required
              />
            </div>
            <div className="main-box">
              <label>Offer Type</label>
              <input 
                type="text" 
                name='offer_type'
                value={formData.offer_type}
                onChange={handleChange}
                required
              />
            </div>
            <div className="main-box">
              <label>Deadline</label>
              <input 
                type="date" 
                name='deadline'
                value={formData.deadline}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* DETAIL DESIGN  */}
        <div className="sc-main-container">
          <h4>Detail Design</h4>
          <div className="sc-main-box">
            <div className="main-box">
              <label>Style <span style={{color:'red', fontSize:'6px'}}> ** diisi oleh kadiv</span></label>
              <input 
                type="text" 
                name='style'
                value={formData.style}
                onChange={handleChange}
                required
              />
            </div>
            <div className="main-box">
              <label>Resolution</label>
              <input 
                type="text" 
                name='resolution'
                value={formData.resolution}
                onChange={handleChange}
                required
              />
            </div>
            <div className="main-box">
              <label>Required File</label>
              <input 
                type="textarea" 
                name='required_files'
                value={formData.required_files}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* DETAIL PRICE  */}
        <div className="sc-main-container">
          <h4>Detail Price</h4>
          <div className="sc-main-box">
            <div className="main-box">
              <label>Price Normal</label>
              <input 
                type="text" 
                name='price_normal'
                value={formData.price_normal}
                onChange={handleChange}
                required
              />
            </div>
            <div className="main-box">
              <label>Price Discount</label>
              <input 
                type="text" 
                name='price_discount'
                value={formData.price_discount}
                onChange={handleChange}
                required
              />
            </div>
            <div className="main-box">
              <label>Discount Precentage</label>
              <input 
                type="text" 
                name='discount_percentage'
                value={formData.discount_percentage}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* REFERENCE AND FILES  */}
        <div className="sc-main-container">
          <h4>Reference and Files</h4>
          <div className="sc-main-box" style={{display:'grid', gridTemplateColumns:'repeat(2,1fr)'}}>
            <div className="main-box">
              <label>Reference</label>
              <input 
                type="textarea" 
                name='reference'
                value={formData.reference}
                onChange={handleChange}
                required
              />
            </div>
            <div className="main-box">
              <label>File and Chat</label>
              <input 
                type="textarea" 
                name='file_and_chat'
                value={formData.file_and_chat}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* DETAILS  */}
        <div className="sc-main-container">
          <h4>Detail Project</h4>
          <div className="sc-main-box" style={{border:'none'}}>
            <div className="main-box-detail">
              <label>Detail Project</label>
              <textarea 
                type="textarea" 
                name='detail_project'
                value={formData.detail_project}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="btn-form">
          <button type='submit'>SUBMIT NEW DATA</button>
        </div>
      </form>
    </div>
  );
};

export default NewFormMarketingDesign;
//082286347194