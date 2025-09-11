import React, { useEffect, useState } from 'react'
import { useSnackbar } from '../context/Snackbar'
import { addMarketingDesignJoined, addKepalaDivisiDesign, addOfferTypeDesign, addStyleDesign, createAccountDesign, createMarketingDesainUser, getAllAccountDesign, getAllKepalaDivisiDesign, getAllMarketingDesainUsers, getAllOfferTypesDesign, getAllStatusProjectDesign, getAllStyleDesign, getAllProjectTypesDesign,addProjectTypeDesign } from '../services/ApiServices';
import { IoCreate } from 'react-icons/io5';
import BootstrapTooltip from '../components/Tooltip';
import { HiXMark } from 'react-icons/hi2';
import '../style/pages/FormDataMarketing.css';
import CustomDropdownDesign from '../marketing/CustomDropdownDesign';


const FormMarketingDesignExample=()=> {
    const {showSnackbar} = useSnackbar();
    const [dropdownData, setDropdownData] = useState({ users: [], accs: [], statusAccept: [], accounts: [], offers: [], style: [], projectType: [] });
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
        order_type:"",
        reference: "",
        resolution: ""
      });

    const [inputByNew, setInputByNew] = useState("");
    const [accByNew, setAccByNew] = useState("");
    const [accountNew, setAccountNew] = useState("");
    const [newOffer, setNewOffer] = useState("");
    const [newStyle, setNewStyle] = useState("");
    const [newProject, setNewProject] = useState("");

    useEffect(()=>{
        const fetchData = async () =>{
             try {
                const users = await getAllMarketingDesainUsers();
                const accArray = await getAllKepalaDivisiDesign();
                const statusAccept = await getAllStatusProjectDesign();
                const accounts = await getAllAccountDesign();
                const offers = await getAllOfferTypesDesign();
                const style = await getAllStyleDesign();
                const projectType = await getAllProjectTypesDesign();
                console.log('menampilkan struktur data project type', projectType);
        
                setDropdownData({
                  users: users.data.map(u => ({ id: u.id, name: u.nama_marketing })),
                  accs: accArray.data.map(a => ({ id: a.id, name: a.nama })),
                  statusAccept: statusAccept.data.map(s => ({ id: s.id, name: s.status_name })),
                  accounts: accounts.data.map(ac => ({ id: ac.id, name: ac.nama_account })),
                  offers: offers.data.map(of => ({ id: of.id, name: of.offer_name })),
                  style: style.data.map(s => ({ id: s.id, name: s.style_name })),
                  projectType: projectType.data.map(pt => ({ id: pt.id, name: pt.project_name})),
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

         const handleAddProjectType = async () => {
          if (!newProject.trim()) return;
          const created = await addProjectTypeDesign({ project_name: newProject });
          setDropdownData(prev => ({ ...prev, projectType: [...prev.projectType, { id: created.id, name: created.project_name }] }));
          setForm({ ...form, project_name: created.id });
          setNewOffer("");
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
            resolution: "",
            order_type:"",
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
                                value={form.status_project_id}
                                onChange={(val) => setForm({ ...form, status_project_id: val })}
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
                                className="w-full p-2 border rounded"
                            />
                        </div>

                        {/* Code Order */}
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

                        {/* Order Number */}
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
                                options={dropdownData.accounts}// data dari API
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

                <div className="form-content">
                    <h4>DETAIL PESANAN</h4>
                    <div className="sec-content">
                        {/* Jumlah Design */}
                        <div className="box-content">
                            <label >Jumlah Design</label>
                            <input
                                type="text"
                                name="jumlah_design"
                                value={form.jumlah_design}
                                onChange={handleChange}
                                placeholder="Jumlah Pesanan"
                            />
                        </div>

                        {/* Jumlah Revisi */}
                        <div className="box-content">
                            <label >Jumlah Revisi</label>
                            <input
                                type="text"
                                name="jumlah_revisi"
                                value={form.jumlah_revisi}
                                onChange={handleChange}
                                placeholder="Jumlah Revisi"
                            />
                        </div>

                        {/* Order Number */}
                        <div className="box-content">
                            <label >Order Type</label>
                            <input
                                type="text"
                                name="order_type"
                                value={form.order_type}
                                onChange={handleChange}
                                placeholder="order type"
                            />
                        </div>

                        {/* Project Type  */}
                        <div className="box-content">
                            <label>Project Type</label>
                            <CustomDropdownDesign
                                options={dropdownData.projectType}
                                value={form.project_type_id}
                                onChange={(val) => setForm({ ...form, project_type_id: val })}
                                newItem={newProject}
                                setNewItem={setNewProject}
                                addNew={handleAddProjectType}
                                placeholder="Pilih project type"
                                searchPlaceholder="Search project type..."
                                addPlaceholder="Add new project type..."
                            />
                        </div>


                        {/* Offers type */}
                        <div className="box-content">
                            <label >Offer Type</label>
                            <CustomDropdownDesign
                                options={dropdownData.offers}        // data dari API
                                value={form.offer_type}
                                onChange={(val) => setForm({ ...form, offer_type: val })}
                                newItem={newOffer}
                                setNewItem={setNewOffer}
                                addNew={handleAddOffer}
                                placeholder="Pilih Offer type"
                                searchPlaceholder="Search offer..."
                                addPlaceholder="Add new offer..."
                            />
                        </div>

                        {/* Deadline */}
                        <div className="box-content">
                            <label>Deadline</label>
                            <input
                                type="Date"
                                name="deadline"
                                value={form.deadline}
                                onChange={handleChange}
                                placeholder="Deadline"
                            />
                        </div>
                    </div>
                </div>

                {/* FORM CONTENT  */}
                <div className="form-content">
                    <h4>DETAIL DESIGN</h4>
                    <div className="sec-content">

                        {/* Jumlah Design */}
                        <div className="box-content">
                            <label >Style</label>
                            <CustomDropdownDesign
                              options={dropdownData.style}
                              value={form.style_id}
                              onChange={(val) => setForm({ ...form, style_id: val })}
                              newItem={newStyle}
                              setNewItem={setNewStyle}
                              addNew={handleAddStyle}
                              placeholder="Pilih Style"
                              searchPlaceholder="Search style..."
                              addPlaceholder="Add new style..."
                            />
                        </div>

                        {/* Resolution */}
                        <div className="box-content">
                            <label>Resolution</label>
                            <input
                                type="text"
                                name="resolution"
                                value={form.resolution}
                                onChange={handleChange}
                                placeholder="Resolution"
                            />
                        </div>

                        {/* Resolution */}
                        <div className="box-content">
                            <label>Required File</label>
                            <input
                                type="text"
                                name="required_files"
                                value={form.required_files}
                                onChange={handleChange}
                                placeholder="Required Files"
                            />
                        </div>
                    </div>
                </div>

                {/* DETAIL PRICE  */}
                <div className="form-content">
                    <h4>DETAIL PRICE</h4>
                    <div className="sec-content">
                        <div className="box-content">
                        <label>Price Normal</label>
                        <input 
                            type="text" 
                            name='price_normal'
                            value={form.price_normal}
                            onChange={handleChange}
                            required
                        />
                        </div>
                        <div className="box-content">
                        <label>Price Discount</label>
                        <input 
                            type="text" 
                            name='price_discount'
                            value={form.price_discount}
                            onChange={handleChange}
                            required
                        />
                        </div>
                        <div className="box-content">
                        <label>Discount Precentage</label>
                        <input 
                            type="text" 
                            name='discount_percentage'
                            value={form.discount_percentage}
                            onChange={handleChange}
                            required
                        />
                        </div>
                    </div>
                </div>

                {/* REFERENCE AND FILES  */}
                <div className="form-content">
                    <h4>REFERENCE AND FILES</h4>
                    <div className="sec-content">

                        {/* REFERENCE  */}
                        <div className="box-content">
                            <label>Reference</label>
                            <input 
                                type="textarea" 
                                name='reference'
                                value={form.reference}
                                onChange={handleChange}
                                // required
                            />
                        </div>

                        {/* FILE AND CHAT  */}
                        <div className="box-content">
                            <label>File and Chat</label>
                            <input 
                                type="text" 
                                name='file_and_chat'
                                value={form.file_and_chat}
                                onChange={handleChange}
                                // required
                            />
                        </div>
                    </div>
                </div>

                {/* DETAIL PROJECT  */}
                <div className="form-content">
                    <h4>DETAIL PROJECT</h4>
                    <div className="sec-content">

                        {/* REFERENCE  */}
                        <div className="box-content">
                            <label>Detail Project</label>
                            <textarea 
                                type="text" 
                                name='detail_project'
                                value={form.detail_project}
                                onChange={handleChange}
                                // required
                            />
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