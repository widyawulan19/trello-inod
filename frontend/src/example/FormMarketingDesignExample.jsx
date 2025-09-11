import React, { useEffect, useState } from 'react'
import { useSnackbar } from '../context/Snackbar'
import { addMarketingDesignJoined, addKepalaDivisiDesign, addOfferTypeDesign, addStyleDesign, createAccountDesign, createMarketingDesainUser, getAllAccountDesign, getAllKepalaDivisiDesign, getAllMarketingDesainUsers, getAllOfferTypesDesign, getAllStatusProjectDesign, getAllStyleDesign } from '../services/ApiServices';
import { IoCreate } from 'react-icons/io5';
import BootstrapTooltip from '../components/Tooltip';
import { HiXMark } from 'react-icons/hi2';
import '../style/pages/FormDataMarketing.css';
import CustomDropdownDesign from '../marketing/CustomDropdownDesign';


const FormMarketingDesignExample=()=> {
    const {showSnackbar} = useSnackbar();
    const [dropdownData, setDropdownData] = useState({ users: [], accs: [], statusAccept: [], accounts: [], offers: [], style: [] });
    const [form, setForm] = useState({
        buyer_name: "",
        code_order: "",
        order_number: "",
        jumlah_design: "",
        deadline: "",
        jumlah_revisi: "",
        price_normal: "",
        price_discount: "",
        discount_percentage: "",
        required_files: "",
        file_and_chat: "",
        detail_project: "",
        input_by: "",
        acc_by: "",
        account: "",
        offer_type: "",
        project_type_id: "",
        style_id: "",
        status_project_id: "",
        reference: "",
        resolution: ""
      });

    const [inputByNew, setInputByNew] = useState("");
    const [accByNew, setAccByNew] = useState("");
    const [accountNew, setAccountNew] = useState("");
    const [newOffer, setNewOffer] = useState("");
    const [newStyle, setNewStyle] = useState("");

    useEffect(()=>{
        const fetchData = async () =>{
             try {
                const users = await getAllMarketingDesainUsers();
                const accArray = await getAllKepalaDivisiDesign();
                const statusAccept = await getAllStatusProjectDesign();
                const accounts = await getAllAccountDesign();
                const offers = await getAllOfferTypesDesign();
                const style = await getAllStyleDesign();
        
                setDropdownData({
                  users: users.data.map(u => ({ id: u.id, name: u.nama_marketing })),
                  accs: accArray.data.map(a => ({ id: a.id, name: a.nama })),
                  statusAccept: statusAccept.data.map(s => ({ id: s.id, name: s.status_name })),
                  accounts: accounts.data.map(ac => ({ id: ac.id, name: ac.nama_account })),
                  offers: offers.data.map(of => ({ id: of.id, name: of.offer_name })),
                  style: style.data.map(s => ({ id: s.id, name: s.style_name }))
                });
            } catch (error) {
                console.error('Error fetching dropdown data:', error);
            }
        };
        fetchData();
    },[]);


    // ADD FUNCTION 
        const handleAddInputBy = async () => {
          if (!inputByNew.trim()) return;
          const res = await createMarketingDesainUser({ nama_marketing: inputByNew, divisi: "Marketing Desain" });
          const created = res.data;
          setDropdownData(prev => ({ ...prev, users: [...prev.users, { id: created.id, name: created.nama_marketing }] }));
          setForm({ ...form, input_by: created.id });
          setInputByNew("");
        };
      
        const handleAccBy = async () => {
          if (!accByNew.trim()) return;
          const res = await addKepalaDivisiDesign({ nama: accByNew, divisi: "Marketing Design" });
          const created = res.data;
          setDropdownData(prev => ({ ...prev, accs: [...prev.accs, { id: created.id, name: created.nama }] }));
          setForm({ ...form, acc_by: created.id });
          setAccByNew("");
        };
      
        const handleAddAccount = async () => {
          if (!accountNew.trim()) return;
          const created = await createAccountDesign({ nama_account: accountNew });
          setDropdownData(prev => ({ ...prev, accounts: [...prev.accounts, { id: created.id, name: created.nama_account }] }));
          setForm({ ...form, account: created.id });
          setAccountNew("");
        };
      
        const handleAddOffer = async () => {
          if (!newOffer.trim()) return;
          const created = await addOfferTypeDesign({ offer_name: newOffer });
          setDropdownData(prev => ({ ...prev, offers: [...prev.offers, { id: created.id, name: created.offer_name }] }));
          setForm({ ...form, offer_type: created.id });
          setNewOffer("");
        };
      
        const handleAddStyle = async () => {
          if (!newStyle.trim()) return;
          const res = await addStyleDesign({ style_name: newStyle });
          const created = res.data;
          setDropdownData(prev => ({ ...prev, style: [...prev.style, { id: created.id, name: created.style_name }] }));
          setForm({ ...form, style_id: created.id });
          setNewStyle("");
        };
    // END ADD FUNCTION 

      const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

      const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          await addMarketingDesignJoined(form);
          showSnackbar('Data Marketing Design berhasil ditambahkan!', 'success');
          // reset form
          setForm({
            buyer_name: "",
            code_order: "",
            order_number: "",
            jumlah_design: "",
            deadline: "",
            jumlah_revisi: "",
            price_normal: "",
            price_discount: "",
            discount_percentage: "",
            required_files: "",
            file_and_chat: "",
            detail_project: "",
            input_by: "",
            acc_by: "",
            account: "",
            offer_type: "",
            project_type_id: "",
            style_id: "",
            status_project_id: "",
            reference: "",
            resolution: ""
          });
        } catch (err) {
          console.error("❌ Error submit data marketing:", err);
          showSnackbar('Gagal menyimpan data marketing!', 'error');
        }
      };

  return (
    <div className="fdm-container">
        <div className="fdm-header">
            <div className="dmfh-left">
                <div className="header-icon">
                    <IoCreate size={15}/>
                </div>
                 <h4>CREATE DATA MARKETING DESIGN</h4>
            </div>
            <BootstrapTooltip title='close' placement='top'>
                <HiXMark className="fdm-icon" />
            </BootstrapTooltip>
        </div>

        <form onSubmit={handleSubmit}>
            <div className="form-new">
                <div className="form-content">
                    <h4>INFORMASI PESANAN</h4>
                    <div className="sec-content">
                        {/* Input By */}
                        <div className="box-content">
                            <label>Input By</label>
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