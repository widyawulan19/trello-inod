import React, { useState, useEffect } from "react";
import '../style/pages/Setting.css'
import { HiCheckCircle, HiChevronDown, HiChevronUp, HiCircleStack, HiOutlineCheckCircle, HiXMark } from "react-icons/hi2";
import { MdOutlineCircle } from "react-icons/md";
import { createDataMarketingDesign, getAllDataMarketingDesign } from "../services/ApiServices";

const Setting = ({ card, onSave, onClose }) => {
  const [dataMarketingDesign, setDataMarketingDesign] = useState([]);
      const [filteredData, setFilteredData] = useState([])
  const [openCategory, setOpenCategory] = useState(null);
  const [formData, setFormData] = useState({
    input_by:"",
    acc_by:"",
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
  });

  useEffect(() => {
    if (card) {
      setFormData(card);
    }
  }, [card]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const toggleCategory = (sectionKey) => {
    setOpenCategory((prev) => (prev === sectionKey ? null : sectionKey));
  };
  


  //FETCH DATA MARKETING DESIGN
  const fetchMarketingDesign = async()=>{
    try{
      const response = await getAllDataMarketingDesign()
      setDataMarketingDesign(response.data);
      setFilteredData(response.data)
    }catch(error){
      console.error('Error fetching marketing design data:', error)
    }
  }

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
                  acc_by:"",
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
          { name: "price_normal", label: "Price Normal", type: "number" },
          { name: "price_discount", label: "Price Discount", type: "number" },
          { name: "discount_percentage", label: "Discount Percentage", type: "number" },
        ],
        "5. Reference and File": [
          { name: "reference", label: "Reference", type: "textarea" },
          { name: "file_and_chat", label: "File and Chat", type: "textarea" },
        ],
        "6. Detail Project": [
          { name: "detail_project", label: "Detail Project", type: "textarea" },
        ],
      });
      

  const getLabelByName = (name) => {
    const allFields = Object.values(getFieldsByCategory()).flat();
    const found = allFields.find((field) => field.name === name);
    return found?.label || name;
  };

  const getTypeByName = (name) => {
    const allFields = Object.values(getFieldsByCategory()).flat();
    const found = allFields.find((field) => field.name === name);
    return found?.type || "text"; // default ke 'text' jika tidak ditemukan
  };
  

  
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
  
    // Jika hanya kategori pertama yang lengkap, progres tetap 0%
    if (completed <= 1) return 0;
  
    // Hitung progres tanpa menghitung kategori pertama
    const adjustedCompleted = completed - 1;
    const adjustedTotal = totalCategories - 1;
  
    return Math.round((adjustedCompleted / adjustedTotal) * 100);
  };
  

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="setting-container">
      <div className="sc-main">
        <div className="sc-header">
          <h4>Create Data Marekting Design</h4>
          <HiXMark onClick={onClose}/>
        </div>

        <div className="s-progres" >
          <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-start' }}>
            {getCategoryCompletionStatus().map(
              ({ category, filled, total, isComplete }) => (
                <p
                  key={category}
                  style={{
                    margin: "0px 0",
                    fontWeight: isComplete ? "bold" : "normal",
                    color: isComplete ? "#4caf50" : "#000",
                    width:'25%',
                    // border:'1px solid green',
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'flex-start',
                    fontSize:'10px'
                  }}
                >
                 {isComplete ? <HiCheckCircle size={15}/>:<MdOutlineCircle size={15}/>} {filled}/{total}
                </p>
              )
            )}
          </div>

          <div style={{ marginBottom: "24px", }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
              {/* <span style={{ fontSize: "20px", marginRight: "8px" }}>✅</span> */}
              {/* <strong>Progress Keseluruhan</strong> */}
            </div>
            <div
              style={{
                height: "5px",
                backgroundColor: "#eee",
                borderRadius: "6px",
                overflow: "hidden",
                // border:'1px solid red',
                width:'85%'
                // marginTop:'0px'
              }}
            >
              <div
                style={{
                  width: `${calculateGlobalProgress()}%`,
                  height: "100%",
                  backgroundColor: "#4caf50",
                  transition: "width 0.3s ease-in-out",
                }}
              />
            </div>

            <p style={{ fontSize: "13px", marginTop: "6px", color: "#333" }}>
              {getCategoryCompletionStatus().filter((cat) => cat.isComplete).length} /{" "}
              {getCategoryCompletionStatus().length} kategori lengkap
            </p>
          </div>
        </div>

        
      {/* Form Input */}
      <form onSubmit={handleSubmit} className="form-con">
        {/* INFORMASI PESANAN */}
        <div className="fmd-form-container">
          <div className="fmd-main-info" onClick={() => toggleCategory("info")}>
            <h4>Informasi Pesanan</h4>
            <h4>{openCategory === "info" ? <HiChevronUp/> : <HiChevronDown/>}</h4>
          </div>
          <div className={`fmd-info-content ${openCategory === "info" ? "show" : ""}`}>
            {["input_by","acc_by", "buyer_name", "code_order", "order_number", "account"].map((name) => (
              <div className="box" key={name}>
                <label>{getLabelByName(name)}</label>
                <input
                  type={getTypeByName(name)}
                  name={name}
                  value={formData[name] || ""}
                  onChange={handleChange}
                />
              </div>
            ))}
          </div>

          {/* DETAIL PESANAN */}
          <div className="fmd-main-info" onClick={() => toggleCategory("detail")}>
            <h4>Detail Pesanan</h4>
            <h4>{openCategory === "detail" ? <HiChevronUp/> : <HiChevronDown/>}</h4>
          </div>
          <div className={`fmd-info-content ${openCategory === "detail" ? "show" : ""}`}>
            {["jumlah_design", "jumlah_revisi", "order_type", "project_type", "offer_type","deadline"].map((name) => (
              <div className="box" key={name}>
                <label>{getLabelByName(name)}</label>
                <input type={getTypeByName(name)} name={name} value={formData[name] || ""} onChange={handleChange} />
              </div>
            ))}
            {/* <div className="box">
              <label>Deadline</label>
              <input type="date" name="deadline" value={formData["deadline"] || ""} onChange={handleChange} />
            </div> */}
          </div>

          {/* DETAIL DESIGN */}
          <div className="fmd-main-info" onClick={() => toggleCategory("design")}>
            <h4>Detail Design</h4>
            <h4>{openCategory === "design" ?<HiChevronUp/> : <HiChevronDown/>}</h4>
          </div>
          <div className={`fmd-info-content ${openCategory === "design" ? "show" : ""}`}>
            {["style", "resolution", "required_files"].map((name) => (
              <div className="box" key={name}>
                <label>{getLabelByName(name)}</label>
                <input type={getTypeByName(name)} name={name} value={formData[name] || ""} onChange={handleChange} />
              </div>
            ))}
          </div>

          {/* DETAIL PRICE */}
          <div className="fmd-main-info" onClick={() => toggleCategory("price")}>
            <h4>Detail Price</h4>
            <h4>{openCategory === "price" ? <HiChevronUp/> : <HiChevronDown/> }</h4>
          </div>
          <div className={`fmd-info-content ${openCategory === "price" ? "show" : ""}`}>
            {["price_normal", "price_discount", "discount_percentage"].map((name) => (
              <div className="box" key={name}>
                <label>{getLabelByName(name)}</label>
                <input type={getTypeByName(name)} name={name} value={formData[name] || ""} onChange={handleChange} />
              </div>
            ))}
          </div>

          {/* REFERENCE AND FILE */}
          <div className="fmd-main-info" onClick={() => toggleCategory("file")}>
            <h4>Reference and File</h4>
            <h4>{openCategory === "file" ? <HiChevronUp/> : <HiChevronDown/>}</h4>
          </div>
          <div className={`fmd-info-content ${openCategory === "file" ? "show" : ""}`}>
            {["reference", "file_and_chat"].map((name) => (
              <div className="box" key={name}>
                <label>{getLabelByName(name)}</label>
                <input type={getTypeByName(name)}  name={name} value={formData[name] || ""} onChange={handleChange} />
              </div>
            ))}
          </div>

          {/* DETAIL PROJECT */}
          <div className="fmd-main-info" onClick={() => toggleCategory("project")}>
            <h4>Detail Project</h4>
            <h4>{openCategory === "project" ? <HiChevronUp/> : <HiChevronDown/>}</h4>
          </div>
            <div className={`fmd-info-content ${openCategory === "project" ? "show" : ""}`}>
              <div className="detail-box">
                <label>Detail Project</label>
                <textarea name="detail_project" value={formData["detail_project"] || ""} onChange={handleChange} />
              </div>
            </div>
        </div>

        {/* Submit Button */}
        <div className="btn-fmd">
          <button type="submit">Add Data Marketing</button>
        </div>
      </form>


      </div>
    </div>
  );
};

export default Setting;
