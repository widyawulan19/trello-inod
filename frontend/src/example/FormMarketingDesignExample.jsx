import React, { useEffect, useState } from 'react'
import { useSnackbar } from '../context/Snackbar'
import { 
  addMarketingDesignJoined, addKepalaDivisiDesign, addOfferTypeDesign, addStyleDesign, 
  createAccountDesign, createMarketingDesainUser, getAllAccountDesign, getAllKepalaDivisiDesign, 
  getAllMarketingDesainUsers, getAllOfferTypesDesign, getAllStatusProjectDesign, 
  getAllStyleDesign, getAllProjectTypesDesign, addProjectTypeDesign , getAllDesignOrderType, addDesignOrderType
} from '../services/ApiServices';
import { IoCreate } from 'react-icons/io5';
import BootstrapTooltip from '../components/Tooltip';
import { HiXMark } from 'react-icons/hi2';
import '../style/pages/FormDataMarketing.css';
import CustomDropdownDesign from '../marketing/CustomDropdownDesign';
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const FormMarketingDesignExample = ({onClose, fetchMarketingDesign}) => {
    const {showSnackbar} = useSnackbar();

    const [dropdownData, setDropdownData] = useState({ 
        users: [], accs: [], statusAccept: [], accounts: [], offers: [], style: [], projectType: [], orderType: []
    });

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
        order_type_id:"",
        reference: "",
        resolution: ""
    });

    const [inputByNew, setInputByNew] = useState("");
    const [accByNew, setAccByNew] = useState("");
    const [accountNew, setAccountNew] = useState("");
    const [newOffer, setNewOffer] = useState("");
    const [newStyle, setNewStyle] = useState("");
    const [newProject, setNewProject] = useState("");
    const [newOrder, setNewOrder] = useState("");

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
                const orderType = await getAllDesignOrderType();
                console.log("data order type:", orderType);
                
                setDropdownData({
                  users: users.data.map(u => ({ id: u.id, name: u.nama_marketing })),
                  accs: accArray.data.map(a => ({ id: a.id, name: a.nama })),
                  statusAccept: statusAccept.data.map(sts => ({ id: sts.id, name: sts.status_name })),
                  accounts: accounts.data.map(ac => ({ id: ac.id, name: ac.nama_account })),
                  offers: offers.data.map(of => ({ id: of.id, name: of.offer_name })),
                  style: style.data.map(s => ({ id: s.id, name: s.style_name })),
                  projectType: projectType.data.map(pt => ({ id: pt.id, name: pt.project_name })),
                  orderType: orderType.data.map(odt => ({ id: odt.id, name: odt.order_name})),
                });
            } catch (error) {
                console.error('Error fetching dropdown data:', error);
            }
        };
        fetchData();
    },[]);

    // ADD FUNCTIONS
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
        setForm({ ...form, project_type_id: created.id });
        setNewProject("");
    };

     const handleAddNewOrderType = async () => {
        if (!newOrder.trim()) return;
        const created = await addDesignOrderType({ order_name: newOrder });
        setDropdownData(prev => ({ ...prev, orderType: [...prev.orderType, { id: created.id, name: created.order_name }] }));
        setForm({ ...form, order_type_id: created.id });
        setNewOrder("");
    };
    // END ADD FUNCTIONS

    const handleChangeQuill = (value) => {
    setForm({ ...form, detail_project: value });
  };

  // konfigurasi toolbar ReactQuill
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"], 
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "blockquote", "code-block"],
      [{ align: [] }],
      ["clean"], // hapus format
    ],
  };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();

        const fieldLabels = {
            buyer_name: "Nama Buyer",
            code_order: "Code Order",
            order_number: "Order Number",
            jumlah_design: "Jumlah Design",
            deadline: "Deadline",
            jumlah_revisi: "Jumlah Revisi",
            price_normal: "Price Normal",
            price_discount: "Price Discount",
            discount_percentage: "discount precentage",
            required_files: "required files",
            file_and_chat: "file and chat",
            detail_project: "detail project",
            input_by: "Input By",
            acc_by: "Accepted By",
            account: "Account",
            offer_type: "Offer Type",
            reference: "Reference",
            resolution: "Resolution"
        };

        const requiredFields = Object.keys(fieldLabels);
        const emptyFields = requiredFields.filter(field => !form[field]);

         if (emptyFields.length > 0) {
            showSnackbar(`Data yang belum diisi: ${emptyFields.join(", ")}`, "error");
            return; // stop submit
        }

        try {
            const payload = {
                buyer_name: form.buyer_name,
                code_order: form.code_order,
                order_number: form.order_number,
                jumlah_design: Number(form.jumlah_design),
                deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
                jumlah_revisi: Number(form.jumlah_revisi),
                price_normal: Number(form.price_normal),
                price_discount: Number(form.price_discount),
                discount_percentage: Number(form.discount_percentage),
                required_files: form.required_files,
                file_and_chat: form.file_and_chat,
                detail_project: form.detail_project,
                input_by: Number(form.input_by),
                acc_by: Number(form.acc_by),
                account: Number(form.account),
                offer_type: Number(form.offer_type),
                project_type_id: Number(form.project_type_id),
                style_id: Number(form.style_id),
                status_project_id: Number(form.status_project_id),
                order_type_id: Number(form.order_type_id),
                reference: form.reference,
                resolution: form.resolution
            };

            await addMarketingDesignJoined(payload);
            showSnackbar('Data Marketing Design berhasil ditambahkan!', 'success');

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
                order_type_id:"",
                reference: "",
                resolution: ""
            });

            if(fetchMarketingDesign){
                console.log("🚀 Trigger fetchData from child");
                await fetchMarketingDesign();
            }
        } catch (err) {
            console.error("❌ Error submit data marketing:", err);
            showSnackbar('Gagal menyimpan data marketing!', 'error');
        }
    };

    return (
        <div className="fdm-container">
            <div className="fdm-header">
                <div className="dmfh-left" style={{ display:'flex', alignItem:'center', justifyContent:'center'}}>
                    <div className="header-icon">
                        <IoCreate size={15}/>
                    </div>
                    <h4>CREATE DATA MARKETING DESIGN</h4>
                </div>
                <BootstrapTooltip title='close' placement='top'>
                    <HiXMark className="fdm-icon" onClick={onClose} />
                </BootstrapTooltip>
            </div>

            <form onSubmit={handleSubmit}>
            <div className="form-new">
                <div className="form-content" style={{marginTop:'5px'}}>
                    <h4 className='h4'>INFORMASI PESANAN</h4>
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
                          <label >Accept By <span style={{color:'red', fontSize:'10px'}}> ** diisi oleh kadiv</span></label>
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
                            <label>Status <span style={{color:'red', fontSize:'10px'}}> ** diisi oleh kadiv</span></label>
                            <CustomDropdownDesign
                                options={dropdownData.statusAccept}  // <- benar-benar dari kepala_divisi
                                value={form.status_project_id}
                                onChange={(val) => setForm({ ...form, status_project_id: val })}
                                placeholder="Status Accept"
                                searchPlaceholder="Search status..."
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
                    <h4 className='h4'>DETAIL PESANAN</h4>
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
                            <CustomDropdownDesign
                                options={dropdownData.orderType}
                                value={form.order_type_id}
                                onChange={(val) => setForm({ ...form, order_type_id: val })}
                                newItem={newOrder}
                                setNewItem={setNewOrder}
                                addNew={handleAddNewOrderType}
                                placeholder="Pilih order type"
                                searchPlaceholder="Search order type..."
                                addPlaceholder="Add new order type..."
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
                                type="date"
                                name="deadline"
                                value={form.deadline ? form.deadline.split("T")[0] : ""}
                                onChange={handleChange}
                                placeholder="Deadline"
                            />
                        </div>

                    </div>
                </div>

                {/* FORM CONTENT  */}
                <div className="form-content">
                    <h4 className='h4'>DETAIL DESIGN</h4>
                    <div className="sec-content">

                        {/* Jumlah Design */}
                        <div className="box-content">
                            <label >Style <span style={{color:'red', fontSize:'10px'}}> ** diisi oleh kadiv</span></label>
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
                    <h4 className='h4'>DETAIL PRICE</h4>
                    <div className="sec-content">
                        <div className="box-content">
                        <label>Price Normal</label>
                        <input 
                            type="text" 
                            name='price_normal'
                            placeholder='Isi "0" jika data kosong'
                            value={form.price_normal}
                            onChange={handleChange}
                            // required
                        />
                        </div>
                        <div className="box-content">
                        <label>Price Discount</label>
                        <input 
                            type="text" 
                            name='price_discount'
                            placeholder='Isi "0" jika data kosong'
                            value={form.price_discount}
                            onChange={handleChange}
                            // required
                        />
                        </div>
                        <div className="box-content">
                        <label>Discount Precentage</label>
                        <input 
                            type="text" 
                            name='discount_percentage'
                            placeholder='Isi "0" jika data kosong'
                            value={form.discount_percentage}
                            onChange={handleChange}
                            // required
                        />
                        </div>
                    </div>
                </div>

                {/* REFERENCE AND FILES  */}
                <div className="form-content">
                    <h4 className='h4'>REFERENCE AND FILES</h4>
                    <div className="sec-content-ref">

                        {/* FILE AND CHAT  */}
                        <div className="box-content">
                            <label>File and Chat</label>
                            <input 
                                type="text" 
                                name='file_and_chat'
                                value={form.file_and_chat}
                                onChange={handleChange}
                                placeholder="https://example.com"
                                // required
                            />
                        </div>

                        {/* REFERENCE  */}
                        <div className="box-content">
                            <label>Reference</label>
                            <textarea
                            className="textarea"
                                type="textarea" 
                                name='reference'
                                value={form.reference}
                                onChange={handleChange}
                                placeholder="https://example.com"
                                // required
                            />
                        </div>
                    </div>
                </div>

                {/* DETAIL PROJECT  */}
                <div className="form-content">
                    <h4 className='h4'>DETAIL PROJECT</h4>
                    <div className="sec-content-detail">

                        {/* REFERENCE  */}
                        <div className="box-content">
                            <ReactQuill
                              className="my-editor"
                              theme="snow"
                              value={form.detail_project}
                              onChange={handleChangeQuill}
                              modules={modules}
                              placeholder="Deskripsikan detail project..."
                              style={{ minHeight: "150px" }}
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

export default FormMarketingDesignExample;
