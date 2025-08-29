import React, { useState } from "react";
import { addDataMarketing } from "../services/ApiServices";
import "../style/pages/FormDataMarketing.css";
import { HiOutlineXMark, HiXMark } from "react-icons/hi2";
import BootstrapTooltip from "../components/Tooltip";
import { IoCreate } from "react-icons/io5";
import { FaXmark } from "react-icons/fa6";
import { useSnackbar } from "../context/Snackbar";

const FormDataMarketing = ({ onClose, fetchData }) => {
  const {showSnackbar} = useSnackbar();
  const [formData, setFormData] = useState({
    input_by: "",
    acc_by: "",
    buyer_name: "",
    code_order: "",
    jumlah_track: "",
    order_number: "",
    account: "",
    deadline: "",
    jumlah_revisi: "",
    order_type: "",
    offer_type: "",
    jenis_track: "",
    genre: "",
    price_normal: "",
    price_discount: "",
    discount: "",
    basic_price: "",
    gig_link: "",
    required_files: "",
    project_type: "",
    duration: "",
    reference_link: "",
    file_and_chat_link: "",
    detail_project: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await addDataMarketing(formData);
      console.log("Data successfully added:", response.data);
      showSnackbar("Data added successfully", "success");
      // alert("Data successfully added!");

      setFormData({
        input_by: "",
        acc_by: "",
        buyer_name: "",
        code_order: "",
        jumlah_track: "",
        order_number: "",
        account: "",
        deadline: "",
        jumlah_revisi: "",
        order_type: "",
        offer_type: "",
        jenis_track: "",
        genre: "",
        price_normal: "",
        price_discount: "",
        discount: "",
        basic_price: "",
        gig_link: "",
        required_files: "",
        project_type: "",
        duration: "",
        reference_link: "",
        file_and_chat_link: "",
        detail_project: "",
      });
      fetchData()
    } catch (error) {
      console.error("Error adding data:", error);
      showSnackbar('Failed to add data!','error')
      // alert("Failed to add data.");
    }
  };

  return (
    <div className="fdm-container">
      <div className="fdm-header">
        <div className="fmdh-left">
          <div className="header-icon">
            <IoCreate size={15}/>
          </div>
          <h4> CREATE DATA MARKETING</h4>
        </div>
        
        <BootstrapTooltip title='close' placement='top'>
            <HiXMark onClick={onClose} className="fdm-icon" />
        </BootstrapTooltip>
      </div>

      <form onSubmit={handleSubmit}>
        {/* INFORMASI PESANAN */}
        <div className="section-main">
          <h4>Informasi Pesanan</h4>
          <div className="sec-content">
            <div className="box">
              <label>Input By</label>
              <input
                type="text"
                name="input_by"
                value={formData.input_by}
                onChange={handleChange}
                required
              />
            </div>
            <div className="box">
              <label>Accepted By</label>
              <input
                type="text"
                name="acc_by"
                value={formData.acc_by}
                onChange={handleChange}
                required
              />
            </div>
            <div className="box">
              <label>Buyer Name</label>
              <input
                type="text"
                name="buyer_name"
                value={formData.buyer_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="box">
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

        {/* DETAIL PESANAN */}
        <div className="section-main">
          <h4>Detail Pesanan</h4>
          <div className="sec-content">
            <div className="box">
              <label>Code Order</label>
              <input
                type="text"
                name="code_order"
                value={formData.code_order}
                onChange={handleChange}
                required
              />
            </div>
            <div className="box">
              <label>Order Number</label>
              <input
                type="text"
                name="order_number"
                value={formData.order_number}
                onChange={handleChange}
                required
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
            <div className="box-date">
                <label>Deadline Project</label>
                <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    required
                />
            </div>
            
            {/* <div className="box" style={{border:'1px solid blue', display:'flex', flexDirection:'column', alignItems:'center'}}>
              <label style={{width:'100%'}}>Deadline Project</label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                required
              />
            </div> */}
          </div>
        </div>

        {/* INFORMASI HARGA */}
        <div className="section-main">
          <h4>Informasi Harga dan Diskon</h4>
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

        {/* REFERENSI DAN FILE PENDUKUNG */}
        <div className="section-reference">
          <h4>Referensi dan File Pendukung</h4>
          <div className="sec-link-content">
            <div className="box">
              <label>GIG Link</label>
              <input
                type="url"
                name="gig_link"
                value={formData.gig_link}
                onChange={handleChange}
                pattern="https?://.*"
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
              <label>Required Files</label>
              <input
                type="text"
                name="required_files"
                value={formData.required_files}
                onChange={handleChange}
                // pattern="https?://.*"
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

        {/* PROJECT DESCRIPTION */}
        <div className="section-desc">
          <h4>Project Description</h4>
          <div className="sec-link-content">
            <div className="box">
              <label>Detail Project</label>
              <textarea
                name="detail_project"
                value={formData.detail_project}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="button-update">
          <button type="submit">SUBMIT NEW DATA</button>
        </div>
      </form>
    </div>
  );
};

export default FormDataMarketing;

