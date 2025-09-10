import React, { useEffect, useState } from 'react'
import { useSnackbar } from '../context/Snackbar'
import { IoCreate } from 'react-icons/io5';
import BootstrapTooltip from '../components/Tooltip';
import { HiXMark } from 'react-icons/hi2';
import '../style/pages/FormDataMarketing.css'
import { createDataMarketingDesign, createMarketingDesainUser, getAllKepalaDivisiDesign, getAllMarketingDesainUsers } from '../services/ApiServices';
import { create } from '@mui/material/styles/createTransitions';
import CustomDropdownDesign from '../marketing/CustomDropdownDesign';

const FormMarketingDesignExample=()=> {
    // STATE 
    const {showSnackbar} = useSnackbar();
    const [dropdownData, setDropdownData] = useState({ users: [], accs: [], accounts:[] });
     const [form, setForm] = useState({ buyer_name: "", code_order: "", input_by: "", acc_by: "",  kupon_diskon_id: "", accept_status_id: "" });
    const [inputByNew, setInputByNew] = useState("");
    const [accByNew, setAccByNew] = useState("");

    useEffect(()=>{
        const fetchData = async() =>{
            try{
                const users = await getAllMarketingDesainUsers();

                const accArray = await getAllKepalaDivisiDesign();
                console.log('bentuk data tabel marketing acc kadiv:', accArray);

               setDropdownData({ 
                    users: users.data.map(u => ({id: u.id, name: u.nama_marketing})),
                });
            }catch(error){
                console.error('Error fetching dropdown data:', error);
            }
        };
        fetchData();
    },[]);

    // tambah input by 
   const handleAddInputBy = async() =>{
    if(!inputByNew.trim()) return;
    const res = await createMarketingDesainUser({ nama_marketing: inputByNew, divisi: "Marketing Desain" });
    const created = res.data; // ✅ isi user baru
    const newOption = { id: created.id, name: created.nama_marketing };
    setDropdownData(prev => ({ ...prev, users: [...(prev.users || []), newOption] }));
    setForm({ ...form, input_by: created.id });
    setInputByNew("");
    }


    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
      const handleSubmit = async (e) => {
          e.preventDefault();
          try {
            await createDataMarketingDesign(form);
            showSnackbar('Data Marketing berhasil ditambahkan!', 'success');
            // alert("✅ Data marketing berhasil ditambahkan!");
    
            // Reset form
            setForm({
              buyer_name: "",
              code_order: "",
              input_by: "",
              acc_by: "",
              kupon_diskon_id: "",
              accept_status_id: "",
            });
    
            // 🔥 Trigger fetch data parent
            // if (fetchData) {
            //    console.log("🚀 Trigger fetchData from child");
            //   await fetchData();
            // }
    
            // 🔥 Close form
            // if (onClose) {
            //   onClose();
            // }
          } catch (err) {
            console.error("❌ Error submit data marketing:", err);
            // alert("Gagal menyimpan data marketing!");
            showSnackbar('Gagal menyimpan data marketing!', 'error');
          }
        };

  return (
   <div className="fdm-container">
    <div className="fdm-header">
        <div className="fmdh-left">
            <div className="header-icon">
                <IoCreate size={15}/>
            </div>
            <h4>CREATE DATA MARKETING DESIGN</h4>
        </div>

        <BootstrapTooltip title='close' placement='top'>
              <HiXMark className="fdm-icon"  />
          </BootstrapTooltip>
    </div>

    <form>
        <div className="form-new">
            <div className="form-content">
                <h4>INFORMASI PESANAN</h4>
                <div className="sc-content">
                    {/* input by  */}
                    <div className="box-content">
                        <label htmlFor="">Input By</label>
                        <CustomDropdownDesign
                            options={dropdownData.users}
                            value={form.input_by} // harus sama dengan nama column di db
                            onChange={(val) => setForm({ ...form, input_by: val })}
                            newItem={inputByNew}
                            setNewItem={setInputByNew}
                            addNew={handleAddInputBy}
                            placeholder="Pilih Marketing user"
                            searchPlaceholder="Search marketing user..."
                            addPlaceholder="Add new marketing user..."
                        />
                    </div>

                </div>
            </div>
        </div>
    </form>
   </div>
  )
}

export default FormMarketingDesignExample