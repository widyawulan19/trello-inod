import React, { useEffect, useState } from 'react'
import { useSnackbar } from '../context/Snackbar'
import { IoCreate } from 'react-icons/io5';
import BootstrapTooltip from '../components/Tooltip';
import { HiXMark } from 'react-icons/hi2';
import '../style/pages/FormDataMarketing.css'
import { addKepalaDivisiDesign, addOfferTypeDesign, addStyleDesign, createAccountDesign, createDataMarketingDesign, createMarketingDesainUser, getAllAccountDesign, getAllKepalaDivisiDesign, getAllMarketingDesainUsers,getAllOfferTypesDesign,getAllStatusProjectDesign, getAllStyleDesign } from '../services/ApiServices';
import { create } from '@mui/material/styles/createTransitions';
import CustomDropdownDesign from '../marketing/CustomDropdownDesign';

const FormMarketingDesignExample=()=> {
    // STATE 
    const {showSnackbar} = useSnackbar();
    const [dropdownData, setDropdownData] = useState({ users: [], accs: [],statusAccept:[], accounts:[],offers:[], style:[] });
    const [form, setForm] = useState({ buyer_name: "", code_order: "", input_by: "", acc_by: "",  kupon_diskon_id: "", accept_status_id: "", style:"" });
    const [inputByNew, setInputByNew] = useState("");
    const [accByNew, setAccByNew] = useState("");
    const [accountNew, setAccountNew] = useState("");
    // const [newOrder, setNewOrder] = useState("");
    const [newOffer, setNewOffer] = useState("");
    const [newStyle, setNewStyle] = useState("");

    useEffect(()=>{
        const fetchData = async() =>{
            try{
                const users = await getAllMarketingDesainUsers();
                const accArray = await getAllKepalaDivisiDesign();
                const statusAccept = await getAllStatusProjectDesign();
                const accounts = await getAllAccountDesign();
                const offers = await getAllOfferTypesDesign();
                const style = await getAllStyleDesign();
                console.log('bentuk data tabel style :', style);

               setDropdownData({ 
                    users: users.data.map(u => ({id: u.id, name: u.nama_marketing})),
                    accs: accArray.data.map(a => ({id: a.id, name: a.nama})),
                    statusAccept: statusAccept.data.map(s => ({id: s.id, name: s.status_name})),
                    accounts: accounts.data.map(ac => ({ id: ac.id, name: ac.nama_account })),
                    offers: offers.data.map(of => ({ id: of.id, name: of.offer_name })),
                    style: style.data.map(s => ({ id: s.id, name: s.style_name })),

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

    // tambah offer 
    const handleAddOffer = async () => {
        if (!newOffer.trim()) return;
        const created = await addOfferTypeDesign({ offer_name: newOffer }); // langsung dapat object
        const newOption = { id: created.id, name: created.offer_name };
        setDropdownData(prev => ({ ...prev, offers: [...(prev.offers || []), newOption] }));
        setForm({ ...form, offers: created.id });
        setNewOffer("");
    };


    // tambah style
const handleAddStyle = async () => {
  if (!newStyle.trim()) return;
  try {
    const res = await addStyleDesign({ style_name: newStyle });
    const created = res.data; // hasil insert RETURNING *
    const newOption = { id: created.id, name: created.style_name };

    setDropdownData(prev => ({
      ...prev,
      styles: [...(prev.styles || []), newOption],
    }));

    // update form pakai id baru
    setForm({ ...form, style: created.id });
    setNewStyle("");
  } catch (err) {
    console.error("❌ Error add style:", err);
  }
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

    <form onSubmit={handleSubmit}>
        <div className="form-new">
            <div className="form-content">
                <h4>INFORMASI PESANAN</h4>
                <div className="sec-content">
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

                    {/* DETAIL PESANAN  */}
                    <div className="form-content">
                        <h4>DETAIL PESANAN</h4>
                        {/* jumlah pesanan  */}
                        <div className="sec-content">
                            <div className="box-content">
                                <label>Jumlah Pesanan</label>
                                <input
                                    type="text"
                                    name="jumlah_pesanan"
                                    value={form.jumlah_pesanan}
                                    onChange={handleChange}
                                    placeholder="Jumlah Pesanan"
                                />
                            </div>

                        {/* jumlah revisi  */}
                        {/* <div className="sec-content"> */}
                            <div className="box-content">
                                <label>Jumlah Revisi</label>
                                <input
                                    type="text"
                                    name="jumlah_revisi"
                                    value={form.jumlah_revisi}
                                    onChange={handleChange}
                                    placeholder="Jumlah Revisi"
                                />
                            </div>
                        {/* </div> */}

                        {/* order type harus dirubah jadi dropdown  */}
                        {/* <div className="sec-content"> */}
                            <div className="box-content">
                                <label>Order Type</label>
                                <input
                                    type="text"
                                    name="order_type"
                                    value={form.order_type}
                                    onChange={handleChange}
                                    placeholder="Order Type"
                                />
                            </div>
                        {/* </div> */}

                        {/* offer type */}
                        <div className="box-content">
                            <label>Offer Type</label>
                            <CustomDropdownDesign
                                options={dropdownData.offers}        // data dari API
                                value={form.offer_type}
                                onChange={(val) => setForm({ ...form, offer_type: val })}
                                newItem={newOffer}
                                setNewItem={setNewOffer}
                                addNew={handleAddOffer}
                                placeholder="Pilih Offer"
                                searchPlaceholder="Search offer..."
                                addPlaceholder="Add new offer..."
                            />
                        </div>


                        {/* deadline  */}
                            <div className="box-content">
                                <label>Deadline</label>
                                <input
                                    type="date"
                                    name="deadline"
                                    value={form.Deadline}
                                    onChange={handleChange}
                                    placeholder="deadline"
                                />
                            </div>
                        
                        </div>
                    </div>

                    {/* /DETAIL DESIGN  */}
                    <div className="form-content">
                        <h4>DETAIL DESIGN</h4>
                        <div className="sec-content">
                            {/* style  */}
                            <div className="box-content">
                                <label>Style</label>
                                <div className="box-content">
                                    <label>Style</label>
                                    <CustomDropdownDesign
                                        options={dropdownData.style} // data dari API
                                        value={form.style}
                                        onChange={(val) => setForm({ ...form, style: val })}
                                        newItem={newStyle}
                                        setNewItem={setNewStyle}
                                        addNew={handleAddStyle}
                                        placeholder="Pilih Style"
                                        searchPlaceholder="Search style..."
                                        addPlaceholder="Add new style..."
                                    />
                                    </div>

                            </div>

                            {/* Resolution */}
                            <div className="box-content">
                                <label>Resolution</label>
                                <input
                                    type="text"
                                    name="resolution"
                                    value={form.resolution}
                                    onChange={handleChange}
                                    placeholder="resolution"
                                />
                            </div>

                            {/* File Required */}
                            <div className="box-content">
                                <label >Required File</label>
                                <input
                                    type="text"
                                    name="required_file"
                                    value={form.required_file}
                                    onChange={handleChange}
                                    placeholder="required_file"
                                />
                            </div>
                        </div>
                    </div>
                    {/* END DETAIL DESIGN  */}

                    {/* INFORMASI HARGA DAN DISKON  */}
                    <div className="form-content">
                        <h4>INFORMASI HARGA DAN DISKON</h4>
                        <div className="sec-content">
                             {/* Price Normal */}
                            <div className="box-content">
                                <label >Price Normal</label>
                                <input
                                    type="text"
                                    name="price_normal"
                                    value={form.price_normal}
                                    onChange={handleChange}
                                    placeholder="Price normal"
                                />
                            </div>
                            
                            {/* Price Discount */}
                                <div className="box-content">
                                    <label >Price Discount</label>
                                    <input
                                        type="text"
                                        name="price_discount"
                                        value={form.price_discount}
                                        onChange={handleChange}
                                        placeholder="Price discount"
                                    />
                                </div>

                                {/*  Discount */}
                                <div className="box-content">
                                    <label>Discount %</label>
                                    <input
                                        type="text"
                                        name="discount_precentage"
                                        value={form.discount_precentage}
                                        onChange={handleChange}
                                        placeholder="discount"
                                    />
                                </div>
                        </div>
                    </div>

                    <div className="form-content">
                        <h4>REDERENCE AND FILES</h4>
                        <div className="sec-content">
                            {/*  Reference */}
                                <div className="box-content">
                                    <label>Reference</label>
                                    <input
                                        type="text"
                                        name="reference"
                                        value={form.reference}
                                        onChange={handleChange}
                                        pattern="(https?://.*)?"
                                        placeholder="https://example.com"
                                    />
                                </div>

                                {/*  Reference */}
                                <div className="box-content">
                                    <label>File and Chat</label>
                                    <input
                                        type="text"
                                        name="file_and_chat"
                                        value={form.file_and_chat}
                                        onChange={handleChange}
                                        placeholder='file and chat'
                                    />
                                </div>
                        </div>
                    </div>

                    <div className="form-content">
                        <h4>Detail Project</h4>
                        <div className="sec-content">
                            {/*  Reference */}
                                <div className="box-content">
                                    <label>Detail</label>
                                    <textarea
                                        type="text"
                                        name="detail_project"
                                        value={form.detail_project}
                                        onChange={handleChange}
                                        pattern="(https?://.*)?"
                                        placeholder="https://example.com"
                                    />
                                </div>
                            </div>
                    </div>


                </div>
        </div>
         <div className="btn-form">
          <button type='submit'>SUBMIT NEW DATA</button>
        </div>
    </form>
   </div>
  )
}

export default FormMarketingDesignExample