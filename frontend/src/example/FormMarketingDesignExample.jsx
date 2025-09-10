import React, { useEffect, useState } from 'react'
import { useSnackbar } from '../context/Snackbar'
import { IoCreate } from 'react-icons/io5';
import BootstrapTooltip from '../components/Tooltip';
import { HiXMark } from 'react-icons/hi2';
import '../style/pages/FormDataMarketing.css'
import { addKepalaDivisiDesign, createAccountDesign, createDataMarketingDesign, createMarketingDesainUser, getAllAccountDesign, getAllKepalaDivisiDesign, getAllMarketingDesainUsers,getAllStatusProjectDesign } from '../services/ApiServices';
import { create } from '@mui/material/styles/createTransitions';
import CustomDropdownDesign from '../marketing/CustomDropdownDesign';

const FormMarketingDesignExample=()=> {
    // STATE 
    const {showSnackbar} = useSnackbar();
    const [dropdownData, setDropdownData] = useState({ users: [], accs: [], accounts:[] });
    const [form, setForm] = useState({ buyer_name: "", code_order: "", input_by: "", acc_by: "",  kupon_diskon_id: "", accept_status_id: "" });
    const [inputByNew, setInputByNew] = useState("");
    const [accByNew, setAccByNew] = useState("");
    const [accountNew, setAccountNew] = useState("");

    useEffect(()=>{
        const fetchData = async() =>{
            try{
                const users = await getAllMarketingDesainUsers();
                const accArray = await getAllKepalaDivisiDesign();
                const statusAccept = await getAllStatusProjectDesign();
                const accounts = await getAllAccountDesign();
                console.log('bentuk data tabel marketing account:', accounts);

               setDropdownData({ 
                    users: users.data.map(u => ({id: u.id, name: u.nama_marketing})),
                    accs: accArray.data.map(a => ({id: a.id, name: a.nama})),
                    statusAccept: statusAccept.data.map(s => ({id: s.id, name: s.status_name})),
                    accounts: accounts.data.map(ac => ({ id: ac.id, name: ac.nama_account })),
                    
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
    };

    // tambah acc by
    const handleAccBy = async() =>{
        if(!accByNew.trim()) return;
        const res = await addKepalaDivisiDesign({ nama: accByNew, divisi: "Marketing Design" });
        const created = res.data; // ✅ isi user baru
        const newOption = { id: created.id, name: created.nama };
        setDropdownData(prev => ({ ...prev, accs: [...(prev.accs || []), newOption] }));
        setForm({ ...form, acc_by: created.id });
        setAccByNew("");
    }; 

    // tambah account
    const handleAddAccount = async () => {
        if (!accountNew.trim()) return;
        const created = await createAccountDesign({ nama_account: accountNew }); // langsung dapat object
        const newOption = { id: created.id, name: created.nama_account };
        setDropdownData(prev => ({ ...prev, accounts: [...(prev.accounts || []), newOption] }));
        setForm({ ...form, account: created.id });
        setAccountNew("");
    };

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

                    {/* Acc By */}
                    <div className="box-content">
                        <label >Accept By</label>
                        <CustomDropdownDesign
                            options={dropdownData.accs}  // <- benar-benar dari kepala_divisi
                            value={form.acc_by}
                            onChange={(val) => setForm({ ...form, acc_by: val })}
                            newItem={accByNew}
                            setNewItem={setAccByNew}
                            addNew={handleAccBy}
                            placeholder="Accepted by"
                            searchPlaceholder="Search kadiv..."
                            addPlaceholder="Add new accepted user..."
                        />
                    </div>

                    {/* STATUS ACCEPT */}
                    <div className="box-content">
                    <label>Status</label>
                    <CustomDropdownDesign
                        options={dropdownData.statusAccept}  // <- benar-benar dari kepala_divisi
                        value={form.accept_status_id}
                        onChange={(val) => setForm({ ...form, accept_status_id: val })}
                        // newItem={accByNew}
                        // setNewItem={setAccByNew}
                        // addNew={handleAddAccBy}
                        placeholder="Status Accept"
                        searchPlaceholder="Search status..."
                        // addPlaceholder="Add new accepted user..."
                    />
                    </div>

                    {/* Buyer Name */}
                    <div className="box-content">
                        <label >Buyer Name</label>
                        <input
                            type="text"
                            name="buyer_name"
                            value={form.buyer_name}
                            onChange={handleChange}
                            placeholder="Buyer Name"
                        />
                    </div>

                    {/* Buyer Name */}
                    <div className="box-content">
                        <label >Code Order</label>
                        <input
                            type="text"
                            name="code_order"
                            value={form.code_order}
                            onChange={handleChange}
                            placeholder="Code Order"
                        />
                    </div>

                    {/* Buyer Name */}
                    <div className="box-content">
                        <label >Order Number</label>
                        <input
                            type="text"
                            name="order_number"
                            value={form.order_number}
                            onChange={handleChange}
                            placeholder="Order Number"
                        />
                    </div>

                    {/* Account */}
                    <div className="box-content">
                      <label>Account</label>
                      <CustomDropdownDesign
                        options={dropdownData.accounts}        // data dari API
                        value={form.account}
                        onChange={(val) => setForm({ ...form, account: val })}
                        newItem={accountNew}
                        setNewItem={setAccountNew}
                        addNew={handleAddAccount}
                        placeholder="Pilih Account"
                        searchPlaceholder="Search account..."
                        addPlaceholder="Add new account..."
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