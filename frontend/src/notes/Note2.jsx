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

  const getFieldsByCategory = () => ({
    "1. Informasi Pesanan": [
      { name: "input_by", label: "Input By", type: "text" },
      { name: "acc_by", label: "Acc By", type: "text" },
      { name: "buyer_name", label: "Buyer Name", type: "text" },
      { name: "code_order", label: "Code Order", type: "text" },
      { name: "order_number", label: "Order Number", type: "text" },
      { name: "account", label: "Account", type: "text" },
    ],
    "2. Detail Pesanan": [
      { name: "jumlah_design", label: "Jumlah Design", type: "number" },
      { name: "jumlah_revisi", label: "Jumlah Revisi", type: "number" },
      { name: "order_type", label: "Order Type", type: "text" },
      { name: "project_type", label: "Project Type", type: "text" },
      { name: "offer_type", label: "Offer Type", type: "text" },
      { name: "deadline", label: "Deadline", type: "datetime-local" },
    ],
    "3. Detail Design": [
      { name: "style", label: "Style", type: "text" },
      { name: "resolution", label: "Resolution", type: "text" },
      { name: "required_files", label: "Required Files", type: "textarea" },
    ],
    "4. Detail Price": [
      { name: "price_normal", label: "Price Normal", type: "text" },
      { name: "price_discount", label: "Price Discount", type: "text" },
      { name: "discount_percentage", label: "Discount Percentage", type: "text" },
    ],
    "5. Reference and File": [
      { name: "reference", label: "Reference", type: "textarea" },
      { name: "file_and_chat", label: "File and Chat", type: "textarea" },
    ],
    "6. Detail Project": [
      { name: "detail_project", label: "Detail Project", type: "textarea" },
    ],
  });

  const getCategoryCompletionStatus = () => {
    const categories = getFieldsByCategory();
    const status = [];

    Object.entries(categories).forEach(([category, fields]) => {
      const total = fields.length;
      const filled = fields.filter(
        (field) =>
          formData[field.name] && formData[field.name].toString().trim() !== ""
      ).length;
      const isComplete = filled === total;

      status.push({
        category,
        filled,
        total,
        isComplete,
      });
    });

    return status;
  };

  const calculateGlobalProgress = () => {
    const status = getCategoryCompletionStatus();
    const totalCategories = status.length;
    const completed = status.filter((cat) => cat.isComplete).length;

    if (completed <= 1) return 0;

    const adjustedCompleted = completed - 1;
    const adjustedTotal = totalCategories - 1;

    return Math.round((adjustedCompleted / adjustedTotal) * 100);
  };

  const getLabelByName = (name) => {
    const allFields = Object.values(getFieldsByCategory()).flat();
    const found = allFields.find((field) => field.name === name);
    return found?.label || name;
  };

  const getTypeByName = (name) => {
    const allFields = Object.values(getFieldsByCategory()).flat();
    const found = allFields.find((field) => field.name === name);
    return found?.type || "text";
  };

  return (
    <div className='setting-container'>
      <div className="sc-header">
        
        <h4> <IoCreate size={15}/> CREATE DATA MARKETING DESIGN</h4>
        <BootstrapTooltip title='Close Form' placement='top'>
          <HiXMark onClick={onClose} className='sch-icon' />
        </BootstrapTooltip>
      </div>

      <div className="sc-body">
        <div className="scb-progres">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', width: '100%' }}>
            {getCategoryCompletionStatus().map(({ category, filled, total, isComplete }) => (
              <p key={category}
                style={{
                  margin: "0px",
                  fontWeight: isComplete ? "bold" : "normal",
                  color: isComplete ? "#4caf50" : "#000",
                  width: '25%',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '10px'
                }}>
                {isComplete ? <span><CiCircleCheck size={15}/></span> : <GiCircle size={15} />} {filled}/{total}
              </p>
            ))}
          </div>

          <div>
              <div style={{ height: "5px", backgroundColor: "#eee", borderRadius: "6px", overflow: "hidden", width: '85%' }}>
                <div
                  style={{
                    width: `${calculateGlobalProgress()}%`,
                    height: "100%",
                    backgroundColor: "#4caf50",
                    transition: "width 0.3s ease-in-out",
                  }}
                />
              </div>
              <p style={{ fontSize: "10px", marginTop: "6px", color: "#333", fontWeight: "bold" }}>
                {getCategoryCompletionStatus().filter((cat) => cat.isComplete).length} /{" "}
                {getCategoryCompletionStatus().length} kategori lengkap
              </p>
          </div>
      </div>

        <div className="scb-form">
          <form onSubmit={handleSubmit}>
            <div className="fmd-container">
              {Object.entries(getFieldsByCategory()).map(([category, fields]) => (
                <div key={category} className="category-section">
                  <h4 style={{ marginTop: '20px' }}>{category}</h4>
                  {fields.map(({ name, label, type }) => (
                    <div className="box" key={name}>
                      <label>{label}</label>
                      {type === "textarea" ? (
                        <textarea
                          name={name}
                          value={formData[name] || ""}
                          onChange={handleChange}
                        />
                      ) : (
                        <input
                          type={type}
                          name={name}
                          value={formData[name] || ""}
                          onChange={handleChange}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ))}
              
              <div className="fmd-button">
                <button type="submit">SUBMIT NEW DATA</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewFormMarketingDesign;
