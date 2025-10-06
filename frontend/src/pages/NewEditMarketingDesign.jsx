import React, { useEffect, useState } from 'react'
import { useSnackbar } from '../context/Snackbar';
import { addDesignOrderType, addKepalaDivisiDesign, addOfferTypeDesign, addProjectTypeDesign, addStatusProjectDesign, addStyleDesign, createAccountDesign, createMarketingDesainUser, getAllAccountDesign, getAllDesignOrderType, getAllKepalaDivisiDesign, getAllMarketingDesainUsers, getAllOfferTypesDesign, getAllProjectTypesDesign, getAllStatusProjectDesign, getAllStyleDesign, getMarketingDesignById, updateDataMarketingJoined, updateMarketingDesign } from '../services/ApiServices';
import BootstrapTooltip from '../components/Tooltip';
import { FaXmark } from 'react-icons/fa6';
import '../style/pages/EditMarketingForm.css';
// import CustomDropdownDesign from '../marketing/CustomDropdownDesign';
import CustomDropdownDesignEdit from '../marketing/CustomDropdownDesignEdit';
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";


const initialFormState = {
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
    reference: "",
    file_and_chat: "",
    detail_project: "",
    input_by: "",
    acc_by: "",
    account: "",
    offer_type: "",
    order_type_id: "",
    project_type_id: "",
    style_id: "",
    status_project_id: "",
    resolution: "",
    project_number: "",
};

const NewEditMarketingDesign=({marketingDesignId, onClose, fetchMarketingDesign})=> {
  const [dropdownData, setDropdownData] = useState({});
  const [form, setForm] = useState(initialFormState);
  const [loading, setLoading] = useState(true);
  const {showSnackbar} = useSnackbar();

  //debug
console.log('data marketing design:', marketingDesignId);

  const [inputByNew, setInputByNew] = useState("");
  const [accByNew, setAccByNew] = useState("");
  const [accountNew, setAccountNew] = useState("");
  const [offerNew, setOfferNew] = useState("");
  const [newOrder, setNewOrder] = useState("");
  const [newProject, setNewProject] = useState("");
  const [newStyle, setNewStyle] = useState("");
  const [newStatus, setNewStatus] = useState("");


  // fetch dropdown  + data id 
  useEffect(()=>{
    const fetchData = async () =>{
      try{
        const [
          users,
          accs,
          accounts,
          offers,
          orderType,
          projectType,
          style,
          statusProject,
          marketingData,
        ] = await Promise.all([
          getAllMarketingDesainUsers(),
          getAllKepalaDivisiDesign(),
          getAllAccountDesign(),
          getAllOfferTypesDesign(),
          getAllDesignOrderType(),
          getAllProjectTypesDesign(),
          getAllStyleDesign(),
          getAllStatusProjectDesign(),
          getMarketingDesignById(marketingDesignId),
        ]);

        console.log("Data marketing design:", marketingData);

        // menyimpan semua data dropwodn 
        setDropdownData({
          users: users.data.map((u) => ({ id: String(u.id), name: u.nama_marketing })),
          accs: accs.data.map((a) => ({ id: String(a.id), name: a.nama })),
          statusProject: statusProject.data.map((sts) => ({ id: String(sts.id), name: sts.status_name })),
          accounts: accounts.data.map((ac) => ({ id: String(ac.id), name: ac.nama_account })),
          offers: offers.data.map((of) => ({ id: String(of.id), name: of.offer_name })),
          style: style.data.map((s) => ({ id: String(s.id), name: s.style_name })),
          projectType: projectType.data.map((pt) => ({ id: String(pt.id), name: pt.project_name })),
          orderType: orderType.data.map((odt) => ({ id: String(odt.id), name: odt.order_name})),
        });

       // karena hasilnya array berisi 1 object
        if (marketingData?.data) {
          const m = marketingData.data; // ambil object pertama dari hasil endpoint
          setForm({
            marketing_id: m.marketing_design_id,
            buyer_name: m.buyer_name || "",
            code_order: m.code_order || "",
            order_number: m.order_number || "",
            jumlah_design: m.jumlah_design || "",
            deadline: m.deadline ? m.deadline.split("T")[0] : "",
            jumlah_revisi: m.jumlah_revisi || "",
            price_normal: m.price_normal || "",
            price_discount: m.price_discount || "",
            discount_percentage: m.discount_percentage || "",
            required_files: m.required_files || "",
            reference: m.reference || "",
            file_and_chat: m.file_and_chat || "",
            detail_project: m.detail_project || "",
            resolution: m.resolution || "",
            project_number: m.project_number || "",

            // simpan hanya ID, bukan object
            input_by: m.input_by_id ? String(m.input_by_id) : "",
            acc_by: m.acc_by_id ? String(m.acc_by_id) : "",
            account: m.account_id ? String(m.account_id) : "",
            offer_type: m.offer_type_id ? String(m.offer_type_id) : "",
            order_type_id: m.order_type_id ? String(m.order_type_id) : "",
            project_type_id: m.project_type_id ? String(m.project_type_id) : "",
            style_id: m.style_id ? String(m.style_id) : "",
            status_project_id: m.status_project_id ? String(m.status_project_id) : "",
          });
        }
      }catch(error){
        console.error("Error fetching data:", error);
      }
    };

    if(marketingDesignId){
      fetchData();
    }
  }, [marketingDesignId]);

  {console.log("DEBUG value account:", form.account)}
{console.log("DEBUG options accounts:", dropdownData.accounts)}


  // ENDPOIN ADD 

  // Tambah input by 
    const handleAddInputBy = async () => {
        if (!inputByNew.trim()) return;
        const res = await createMarketingDesainUser({ nama_marketing: inputByNew, divisi: "Marketing Desain" });
        const created = res.data;
        setDropdownData(prev => ({ ...prev, users: [...prev.users, { id: created.id, name: created.nama_marketing }] }));
        setForm({ ...form, input_by: created.id });
        setInputByNew("");
        showSnackbar('Berhasil menambahkan data baru!', 'success');
    };

    const handleAccBy = async () => {
        if (!accByNew.trim()) return;
        const res = await addKepalaDivisiDesign({ nama: accByNew, divisi: "Marketing Design" });
        const created = res.data;
        setDropdownData(prev => ({ ...prev, accs: [...prev.accs, { id: created.id, name: created.nama }] }));
        setForm({ ...form, acc_by: created.id });
        setAccByNew("");
        showSnackbar('Berhasil menambahkan data baru!', 'success');
    };

    const handleStatusProject = async() =>{
      if(!newStatus.trim()) return;
      const res = await addStatusProjectDesign({status_name:newStatus});
      const created = res.data;
      setDropdownData(prev => ({ ...prev, statusProject: [...prev.statusProject,{id: created.id, name: created.status_name}]}));
      setForm({ ...form, status_project_id: created.id});
      setNewStatus("");
      showSnackbar('Berhasil menambahkan data baru!', 'success');
    }

    const handleAddAccount = async () => {
        if (!accountNew.trim()) return;
        const res = await createAccountDesign({ nama_account: accountNew });
        const created = res.data;
        setDropdownData(prev => ({ ...prev, accounts: [...prev.accounts, { id: created.id, name: created.nama_account }] }));
        setForm({ ...form, account: created.id });
        setAccountNew("");
        showSnackbar('Berhasil menambahkan data baru!', 'success');
    };

    const handleAddOffer = async () => {
        if (!offerNew.trim()) return;
        const res = await addOfferTypeDesign({ offer_name: offerNew });
        const created = res.data;
        setDropdownData(prev => ({ ...prev, offers: [...prev.offers, { id: created.id, name: created.offer_name }] }));
        setForm({ ...form, offer_type: created.id });
        setOfferNew("");
        showSnackbar('Berhasil menambahkan data baru!', 'success');
    };

    const handleAddStyle = async () => {
        if (!newStyle.trim()) return;
        const res = await addStyleDesign({ style_name: newStyle });
        const created = res.data;
        setDropdownData(prev => ({ ...prev, style: [...prev.style, { id: created.id, name: created.style_name }] }));
        setForm({ ...form, style_id: created.id });
        setNewStyle("");
        showSnackbar('Berhasil menambahkan data baru!', 'success');
    };

    const handleAddProjectType = async () => {
        if (!newProject.trim()) return;
        const res = await addProjectTypeDesign({ project_name: newProject });
        const created = res.data;
        setDropdownData(prev => ({ ...prev, projectType: [...prev.projectType, { id: created.id, name: created.project_name }] }));
        setForm({ ...form, project_type_id: created.id });
        setNewProject("");
        showSnackbar('Berhasil menambahkan data baru!', 'success');
    };

     const handleAddNewOrderType = async () => {
        if (!newOrder.trim()) return;
        const res = await addDesignOrderType({ order_name: newOrder });
        const created = res.data;
        setDropdownData(prev => ({ ...prev, orderType: [...prev.orderType, { id: created.id, name: created.order_name }] }));
        setForm({ ...form, order_type_id: created.id });
        setNewOrder("");
        showSnackbar('Berhasil menambahkan data baru!', 'success');
    };
  // END ENDPOIN ADD 

  if (!form) return <p>Loading...</p>

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
      await updateMarketingDesign(marketingDesignId, form);
      showSnackbar('Data Marketing Design berhasil diperbarui!', 'success');

      if(fetchMarketingDesign){
        await fetchMarketingDesign();
      }

      if(onClose){
        onClose();
      }

    }catch(error){
      console.error('Error update data marketing design:', error);
      showSnackbar('Gagal update data marketing design:','error');
    }
  }

  //fungsi untuk mengambil 5 karakter terakhir code order
  const get5LastChar = (codeOrder) => {
    return codeOrder ? codeOrder.slice(-5) :'';
  }

  const handleChangeQuill = (value) => {
    setForm((prevForm) => ({
      ...prevForm,
      detail_project: value,
    }));
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




  return (
    <div className="em-container">
      <div className="em-header">
        <div className="em-left">
          <h4>EDIT DATA MARKETING DESIGN</h4>
           {/* {form.style_id} | {form.buyer_name} | {form.account_name} | {get5LastChar(form.code_order)} */}
        </div>
        <div className="em-right">
          <BootstrapTooltip title="Close Edit" placement='top'>
               <FaXmark onClick={onClose} className='em-icon'/>
           </BootstrapTooltip>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-edit">

          <div className="form-content">
            <h4 className='h4'>INFORMASI PESANAN</h4>
            <div className="sec-content-edit">

              {/* Project Number */}
              <div className="box-content">
                  <label>Project Number</label>
                  <input
                      type="text"
                      name="project_number"
                      value={form.project_number}
                      onChange={handleChange}
                      placeholder="Project Number"
                      className="w-full p-2 border rounded"
                  />
              </div>

              {/* Input By  */}
              <div className="box-content">
                <label>Input By</label>
                <CustomDropdownDesignEdit
                  options={dropdownData.users}
                  value={form.input_by} // harus sama dengan nama column di db
                  onChange={(val) => setForm({ ...form, input_by: val })}
                  newItem={inputByNew}
                  setNewItem={setInputByNew}
                  addNew={handleAddInputBy}
                  placeholder="Pilih Marketing user"
                  searchPlaceholder="Search marketing user..."
                  addPlaceholder="New marketing user..."
                />
              </div>

              {/* Acc By */}
              <div className="box-content">
                <label >Accept By <span style={{color:'red', fontSize:'10px'}}> ** Periksa oleh kadiv</span></label>
                <CustomDropdownDesignEdit
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
                  <label>Status <span style={{color:'red', fontSize:'10px'}}> ** Periksa oleh kadiv</span></label>
                  <CustomDropdownDesignEdit
                      options={dropdownData.statusProject}  // <- benar-benar dari kepala_divisi
                      value={form.status_project_id}
                      onChange={(val) => setForm({ ...form, status_project_id: val })}
                      newItem={newStatus}
                      setNewItem={setNewStatus}
                      addNew={handleStatusProject}
                      placeholder="Status Accept"
                      searchPlaceholder="Search status..."
                      addPlaceholder="Add new status project..."
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
                  <CustomDropdownDesignEdit
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
            <div className="sec-content-edit">
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
                    <CustomDropdownDesignEdit
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
                    <CustomDropdownDesignEdit
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
                    <CustomDropdownDesignEdit
                        options={dropdownData.offers}        // data dari API
                        value={form.offer_type}
                        onChange={(val) => setForm({ ...form, offer_type: val })}
                        newItem={offerNew}
                        setNewItem={setOfferNew}
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
                <div className="sec-content-edit">

                    {/* Jumlah Design */}
                    <div className="box-content">
                        <label >Style <span style={{color:'red', fontSize:'10px'}}> ** Periksa oleh kadiv</span> </label>
                        <CustomDropdownDesignEdit
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
                <div className="sec-content-edit">
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
                <h4 className='h4'>REFERENCE AND FILES</h4>
                <div className="sec-content-edit-ref">

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
                <h4 className='h4'>DETAIL PROJECT</h4>
                <div className="sec-content" style={{display:'flex',flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
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

            <div className="btn-form">
                <button type='submit'>SUBMIT NEW DATA</button>
            </div>

        </div>
      </form>
    </div>
  )
}

export default NewEditMarketingDesign