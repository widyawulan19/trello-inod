import React, { useState } from 'react'
import { createDataMarketingDesign } from '../services/ApiServices'
import { HiOutlineXMark } from 'react-icons/hi2'
import BootstrapTooltip from '../components/Tooltip'
import '../style/pages/FormMarketingDesign.css'

const FormMarketingDesign=({onClose, fetchMarketingDesign})=> {
    const [formData, setFormData] = useState({
        input_by:"",
        buyer_name:"",
        code_order:"",
        jumlah_design:"",
        order_number:"",
        account:"",
        deadline:"",
        jumlah_revisi:"",
        order_type:"",
        offer_type:"",
        style:"",
        resolution:"",
        price_normal:"",
        price_discount:"",
        discount_percentage:"",
        required_files:"",
        project_type:"",
        reference:"",
        file_and_chat:"",
        detail_project:"",
    })

    const handleChange = (e)=>{
        setFormData({...formData, [e.target.name]: e.target.value})
    }
    const handleSubmit = async(e)=>{
        e.preventDefault();
        try{
            const response = await createDataMarketingDesign(formData);
            console.log('Data successfully added:', response.data)
            alert("Data successfully added!");

            setFormData({
                input_by:"",
                buyer_name:"",
                code_order:"",
                jumlah_design:"",
                order_number:"",
                account:"",
                deadline:"",
                jumlah_revisi:"",
                order_type:"",
                offer_type:"",
                style:"",
                resolution:"",
                price_normal:"",
                price_discount:"",
                discount_percentage:"",
                required_files:"",
                project_type:"",
                reference:"",
                file_and_chat:"",
                detail_project:"", 
            })
            fetchMarketingDesign()
        }catch(error){
            console.error('Error adding data:', error)
            alert("failed to add data.")
        }
    }

  return (
    <div className='fmd-container'>
        <div className="fmd-header">
            <h4>CREATE DATA MARKETING DESIGN</h4>
            <BootstrapTooltip title='Close' placement='top'>
                <HiOutlineXMark onClick={onClose} className='fmd-icon'/>
            </BootstrapTooltip>
        </div>
        
        <form onSubmit={handleSubmit}>
            {/* INFORMASI PESANAN  */}
            <div className='fmd-form-container'>
            <div className="fmd-main-info">
                <h4>Informasi Pesanan</h4>
                <div className="fmd-info-content">
                    <div className="box">
                        <label>Input By</label>
                        <input 
                            type="text" 
                            name="input_by" 
                            value={formData.input_by}
                            onChange={handleChange}
                            // required 
                        />
                    </div>
                    <div className="box">
                        <label>Buyer Name</label>
                        <input 
                            type="text" 
                            name="buyer_name" 
                            value={formData.buyer_name}
                            onChange={handleChange}
                            // required 
                        />
                    </div>
                    <div className="box">
                        <label>Code Order</label>
                        <input 
                            type="text" 
                            name="code_order" 
                            value={formData.code_order}
                            onChange={handleChange}
                            // required 
                        />
                    </div>
                    <div className="box">
                        <label>Order Number</label>
                        <input 
                            type="text" 
                            name="order_number" 
                            value={formData.order_number}
                            onChange={handleChange}
                            // required 
                        />
                    </div>
                    <div className="box">
                        <label>Account</label>
                        <input 
                            type="text" 
                            name="account" 
                            value={formData.account}
                            onChange={handleChange}
                            // required 
                        />
                    </div>
                </div>
            </div>
            <div className="fmd-detail-pesan">
                <h4>Detail Pesanan</h4>
                <div className="fmd-info-content">
                    <div className="box">
                        <label>Jumlah Design</label>
                        <input 
                            type="text" 
                            name="jumlah_design" 
                            value={formData.jumlah_design}
                            onChange={handleChange}
                            // required 
                        />
                    </div>
                    <div className="box">
                        <label>Jumlah Revisi</label>
                        <input 
                            type="text" 
                            name="jumlah_revisi" 
                            value={formData.jumlah_revisi}
                            onChange={handleChange}
                            // required 
                        />
                    </div>
                    <div className="box">
                        <label>Order Type</label>
                        <input 
                            type="text" 
                            name="order_type" 
                            value={formData.order_type}
                            onChange={handleChange}
                            // required 
                        />
                    </div>
                    <div className="box">
                        <label>Project Type</label>
                        <input 
                            type="text" 
                            name="project_type" 
                            value={formData.project_type}
                            onChange={handleChange}
                            // required 
                        />
                    </div>
                    <div className="box">
                        <label>Offer Type</label>
                        <input 
                            type="text" 
                            name="offer_type" 
                            value={formData.offer_type}
                            onChange={handleChange}
                            // required 
                        />
                    </div>
                    <div className="box">
                        <label>Deadline</label>
                        <input 
                            type="date" 
                            name="deadline" 
                            value={formData.deadline}
                            onChange={handleChange}
                            // required 
                        />
                    </div>
                </div>
            </div>
            <div className="fmd-detail-design">
                <h4>Detail Design</h4>
                <div className="fmd-info-content">
                    <div className="box">
                        <label>Style</label>
                        <input 
                            type="text" 
                            name="style" 
                            value={formData.style}
                            onChange={handleChange}
                            // required 
                        />
                    </div>
                    <div className="box">
                        <label>Resolution</label>
                        <input 
                            type="text" 
                            name="resolution" 
                            value={formData.resolution}
                            onChange={handleChange}
                            // required 
                        />
                    </div>
                    <div className="box">
                        <label>Required Files</label>
                        <input 
                            type="text" 
                            name="required_files" 
                            value={formData.required_files}
                            onChange={handleChange}
                            // required 
                        />
                    </div>
                </div>
            </div>
            <div className="fmd-detail-price">
                <h4>Detail Price</h4>
                <div className="fmd-info-content">
                    <div className="box">
                        <label>Price Normal</label>
                        <input 
                            type="text" 
                            name="price_normal" 
                            value={formData.price_normal}
                            onChange={handleChange}
                            // required 
                        />
                    </div>
                    <div className="box">
                        <label>Price Discount</label>
                        <input 
                            type="text" 
                            name="price_discount" 
                            value={formData.price_discount}
                            onChange={handleChange}
                            // required 
                        />
                    </div>
                    <div className="box">
                        <label>Discount Precentage</label>
                        <input 
                            type="text" 
                            name="discount_percentage" 
                            value={formData.discount_percentage}
                            onChange={handleChange}
                            // required 
                        />
                    </div>
                </div>
            </div>
            <div className="fmd-reference">
                <h4>Reference and File</h4>
                <div className="fmd-info-content">
                    <div className="box">
                        <label>Reference</label>
                        <input 
                            type="text" 
                            name="reference" 
                            value={formData.reference}
                            onChange={handleChange}
                            // pattern="https?://.*"
                            // required 
                        />
                    </div>
                    <div className="box">
                        <label>File and Chat</label>
                        <input 
                            type="text" 
                            name="file_and_chat" 
                            value={formData.file_and_chat}
                            onChange={handleChange}
                            // required 
                        />
                    </div>
                </div>
            </div>
            <div className="fmd-detail-order">
                <h4>Detail Project</h4>
                <div className="fmd-info-content">
                    <div className="detail-box">
                        <label>Detail Project</label>
                        <textarea
                            name='detail_project'
                            value={formData.detail_project}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </div>
            <div className="btn-fmd">
                <button type='submit'>Add Data Marketing</button>
            </div>
            </div>
        </form>
       
    </div>
  )
}

export default FormMarketingDesign