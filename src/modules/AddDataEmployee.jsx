import { useState } from "react";
import { addEmployeeData } from "../services/ApiServices"; // Import API service
import '../style/modules/AddDataEmployee.css'
import { HiOutlineXMark } from "react-icons/hi2";
import BootstrapTooltip from "../components/Tooltip";

const AddDataEmployee = ({onClose}) => {
  const [formData, setFormData] = useState({
    // user_id: "",
    name: "",
    nomor_wa: "",
    divisi: "",
    shift: "",
    jabatan: "",
    work_days: "",
    off_days: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await addEmployeeData(formData);
      setMessage("Employee added successfully!");
      console.log("Success:", response.data);
      setFormData({
        // user_id: "",
        name: "",
        nomor_wa: "",
        divisi: "",
        shift: "",
        jabatan: "",
        work_days: "",
        off_days: "",
      });
    } catch (error) {
      setMessage("Failed to add employee.");
      console.error("Error:", error);
    }
  };

  return (
    <div className="add-container">
        <div className="ac-header">
            <h4>Add New Data</h4>
            <BootstrapTooltip title='Close Form' placement='top'>
                <HiOutlineXMark onClick={onClose} className="ac-icon"/>
            </BootstrapTooltip>
        </div>
     
      {message && <p>{message}</p>}
      <div className="ac-form">
        <div className="info-pribadi">
            <p>INFORMASI PRIBADI</p>
            <div className="ac-content">
                <div className="ac-box">
                    <label>Name</label>
                    <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="ac-box">
                    <label>Nomor Telephone</label>
                    <input
                        type="text"
                        name="nomor_wa"
                        placeholder="Nomor WA"
                        value={formData.nomor_wa}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>
        </div>
        <div className="info-kepegawaian">
            <p>INFORMASI KEPEGAWAIAN</p>
            <div className="ac-content">
                <div className="ac-box">
                    <label>Divisi</label>
                    <input
                        type="text"
                        name="divisi"
                        placeholder="Divisi"
                        value={formData.divisi}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="ac-box">
                    <label>Jabatan</label>
                    <input
                        type="text"
                        name="jabatan"
                        placeholder="Jabatan"
                        value={formData.jabatan}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>
        </div>
        <div className="info-jadwal">
            <p>INFORMASI JADWAL</p>
            <div className="ac-content">
                <div className="ac-box">
                    <label>Shift</label>
                    <input
                        type="text"
                        name="shift"
                        placeholder="Shift"
                        value={formData.shift}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="ac-box">
                    <label>Work Days</label>
                    <input
                        type="text"
                        name="work_days"
                        placeholder="Work Days (e.g. Monday,Tuesday)"
                        value={formData.work_days}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="ac-box">
                    <label>Off Days</label>
                    <input
                        type="text"
                        name="off_days"
                        placeholder="Off Days (e.g. Saturday,Sunday)"
                        value={formData.off_days}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AddDataEmployee;

// <form onSubmit={handleSubmit}>
//         <input
//           type="text"
//           name="user_id"
//           placeholder="User ID"
//           value={formData.user_id}
//           onChange={handleChange}
//           required
//         />
//         <input
//           type="text"
//           name="name"
//           placeholder="Name"
//           value={formData.name}
//           onChange={handleChange}
//           required
//         />
//         <input
//           type="text"
//           name="nomor_wa"
//           placeholder="Nomor WA"
//           value={formData.nomor_wa}
//           onChange={handleChange}
//           required
//         />
//          <input
//           type="text"
//           name="divisi"
//           placeholder="Divisi"
//           value={formData.divisi}
//           onChange={handleChange}
//           required
//         />
//         <input
//           type="text"
//           name="shift"
//           placeholder="Shift"
//           value={formData.shift}
//           onChange={handleChange}
//           required
//         />
//         <input
//           type="text"
//           name="jabatan"
//           placeholder="Jabatan"
//           value={formData.jabatan}
//           onChange={handleChange}
//           required
//         />
//         <input
//           type="text"
//           name="work_days"
//           placeholder="Work Days (e.g. Monday,Tuesday)"
//           value={formData.work_days}
//           onChange={handleChange}
//           required
//         />
//         <input
//           type="text"
//           name="off_days"
//           placeholder="Off Days (e.g. Saturday,Sunday)"
//           value={formData.off_days}
//           onChange={handleChange}
//           required
//         />
//         <button type="submit">Add Employee</button>
//       </form>