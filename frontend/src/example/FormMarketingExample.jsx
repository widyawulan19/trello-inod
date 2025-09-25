import React, { useState, useEffect } from "react";
import { getAllMarketingUsers, addMarketingUser, addDataMarketing, getAllAccountsMusic, addAccountMusic, getAllOfferTypesMusic, addOfferTypeMusic, getAllTrackTypes, addTrackType, getAllGenresMusic, addGenreMusic, getAllProjectTypesMusic, addProjectTypeMusic, getAllOrderTypesMusic, addOrderTypeMusic, getAllKuponDiskon, addKuponDiskon,getAllAcceptStatus } from "../services/ApiServices";
import { getAllKepalaDivisi, addKepalaDivisi } from "../services/ApiServices";
import CustomDropdown from "../marketing/CustomDropdown";
import '../style/pages/FormDataMarketing.css'
import { IoCreate } from "react-icons/io5";
import BootstrapTooltip from "../components/Tooltip";
import { HiXMark } from "react-icons/hi2";
import { useSnackbar } from "../context/Snackbar";

const FormMarketingExample = ({onClose, fetchData}) => {
  const {showSnackbar} = useSnackbar();
  const [dropdownData, setDropdownData] = useState({ users: [], accs: [], accounts:[] });
  const [form, setForm] = useState({ buyer_name: "", code_order: "", input_by: "", acc_by: "",  kupon_diskon_id: "", accept_status_id: "" });
  const [inputByNew, setInputByNew] = useState("");
  const [accByNew, setAccByNew] = useState("");
  const [accountNew, setAccountNew] = useState("");
  const [offerNew, setOfferNew] = useState("");
  const [newTrack, setNewTrack] = useState("");
  const [newGenre, setNewGenre] = useState("");
  const [newProject, setNewProject] = useState("");
  const [newOrder, setNewOrder] = useState("");
  const [newKupon, setNewKupon] = useState("");

useEffect(() => {
  const fetchData = async () => {
    try {
      // Fetch Input By
      const users = await getAllMarketingUsers();

      // Fetch Acc By (Kepala Divisi) → ambil data dari .data
      const accsResponse = await getAllKepalaDivisi();
      const accsArray = accsResponse.data;

      // Fetch Account → sudah array
      const accounts = await getAllAccountsMusic();

      //fetch offer music
      const offers = await getAllOfferTypesMusic();
      // console.log('bentuk data offers', offers)

      //fetch track type
      const trackTypes = await getAllTrackTypes();

      //fetch genre
      const genres = await getAllGenresMusic();

      //Fetch project type
      const projectType = await getAllProjectTypesMusic();

      //Fetch Order type music
      const orderType = await getAllOrderTypesMusic();

      //fetch kupon
      const kuponDiskon = await getAllKuponDiskon();

      //fetch status 
      const statusAccept = await getAllAcceptStatus();
      console.log('bentuk data tabel status:', statusAccept);
      

      // BAYU MADUSWARA 


      setDropdownData({
        users: users.map(u => ({ id: u.id, name: u.nama_marketing })),
        accs: accsArray.map(a => ({ id: a.id, name: a.nama })),
        accounts: accounts.map(ac => ({ id: ac.id, name: ac.nama_account })),
        offers : offers.map(of => ({ id: of.id, name: of.offer_name })),
        trackTypes: trackTypes.map(tt => ({id: tt.id, name: tt.track_name})),
        genres: genres.map(g => ({id: g.id, name: g.genre_name})),
        projectType: projectType.map(pt => ({id: pt.id, name: pt.nama_project})),
        orderType: orderType.map(ot => ({id: ot.id, name: ot.order_name})),
        kuponDiskon: kuponDiskon.map(kd => ({ id: kd.id, name: kd.nama_kupon})),
        statusAccept: statusAccept.map(s => ({id: s.id, name: s.status_name})),
      });

    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  };

  fetchData();
}, []);



  // Tambah Input By
  const handleAddInputBy = async () => {
    if (!inputByNew.trim()) return;
    const created = await addMarketingUser({ nama_marketing: inputByNew, divisi: "Marketing Musik" });
    const newOption = { id: created.id, name: `${created.nama_marketing} (${created.divisi})` };
    setDropdownData({ ...dropdownData, users: [...dropdownData.users, newOption] });
    setForm({ ...form, input_by: created.id });
    setInputByNew("");
  };

 // Tambah Acc By
  const handleAddAccBy = async () => {
    if (!accByNew.trim()) return;
    const created = await addKepalaDivisi({ nama: accByNew, divisi: "DESIGN" });
    const newOption = { id: created.id, name: `${created.nama} (${created.divisi})` };
    setDropdownData({ ...dropdownData, accs: [...dropdownData.accs, newOption] });
    setForm({ ...form, acc_by: created.id });
    setAccByNew("");
  };

  // Tambah Account
  const handleAddAccount = async () => {
    if (!accountNew.trim()) return;
    const created = await addAccountMusic({ nama_account: accountNew });
    const newOption = { id: created.id, name: created.nama_account };
    setDropdownData({ ...dropdownData, accounts: [...dropdownData.accounts, newOption] });
    setForm({ ...form, account: created.id });
    setAccountNew("");
  };

  //Tambah offer type
  const handleAddOfferMusic = async () =>{
    if (!offerNew.trim()) return;
    const created = await addOfferTypeMusic({ offer_name: offerNew });
    const newOption = { id: created.id, name: created.offer_name };
    setDropdownData({ ...dropdownData, offers: [...dropdownData.offers, newOption] });
    setForm({ ...form, offers: created.id });
    setOfferNew("");
  }

  //tambah new track 
  const handleAddTrack = async () =>{
    if (!newTrack.trim()) return;
    const created = await addTrackType({ track_name: newTrack });
    const newOption = { id: created.id, name: created.track_name };
    setDropdownData({ ...dropdownData, trackTypes: [...dropdownData.trackTypes, newOption] });
    setForm({ ...form, trackTypes: created.id });
    setNewTrack("");
  }

  //tambah genre
   const handleAddGenre = async () =>{
    if (!newGenre.trim()) return;
    const created = await addGenreMusic({ genre_name: newGenre });
    const newOption = { id: created.id, name: created.genre_name };
    setDropdownData({ ...dropdownData, genres: [...dropdownData.genres, newOption] });
    setForm({ ...form, genres: created.id });
    setNewGenre("");
  }

   //tambah project type
   const handleAddProjectType = async () =>{
    if (!newProject.trim()) return;
    const created = await addProjectTypeMusic({ nama_project: newProject });
    const newOption = { id: created.id, name: created.nama_project };
    setDropdownData({ ...dropdownData, projectType: [...dropdownData.projectType, newOption] });
    setForm({ ...form, projectType: created.id });
    setNewProject("");
  }

  //tambah order type 
  const handleAddOrderType = async () =>{
    if (!newOrder.trim()) return;
    const created = await addOrderTypeMusic({ order_name: newOrder });
    const newOption = { id: created.id, name: created.order_name };
    setDropdownData({ ...dropdownData, orderType: [...dropdownData.orderType, newOption] });
    setForm({ ...form, orderType: created.id });
    setNewOrder("");
  }


  //tambah Kupon Diskon 
  const handleAddKupon = async () =>{
    if (!newKupon.trim()) return;
    const created = await addKuponDiskon({ nama_kupon: newKupon });
    const newOption = { id: created.id, name: created.nama_kupon };
    setDropdownData({ ...dropdownData, kuponDiskon: [...dropdownData.kuponDiskon, newOption] });
    setForm({ ...form, kuponDiskon: created.id });
    setNewKupon("");
  }


  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await addDataMarketing(form);
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
        if (fetchData) {
           console.log("🚀 Trigger fetchData from child");
          await fetchData();
        }

        // 🔥 Close form
        if (onClose) {
          onClose();
        }
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
          <h4>CREATE DATA MARKETING</h4>
        </div>

        <BootstrapTooltip title='close' placement='top'>
              <HiXMark className="fdm-icon" onClick={onClose} />
          </BootstrapTooltip>
      </div>

      <form onSubmit={handleSubmit}>
          <div className="form-new">
            <div className="form-content" style={{marginTop:'5px'}}>
              <h4>INFORMASI PESANAN</h4>
              <div className="sec-content">
                {/* Input By */}
                <div className="box-content">
                  <label>Input By</label>
                  <CustomDropdown
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
                  <label >Accept By <span style={{color:'red', fontSize:'6px'}}> ** diisi oleh kadiv</span></label>
                  <CustomDropdown
                    options={dropdownData.accs}  // <- benar-benar dari kepala_divisi
                    value={form.acc_by}
                    onChange={(val) => setForm({ ...form, acc_by: val })}
                    newItem={accByNew}
                    setNewItem={setAccByNew}
                    addNew={handleAddAccBy}
                    placeholder="Accepted by"
                    searchPlaceholder="Search kadiv..."
                    addPlaceholder="Add new accepted user..."
                  />
                </div>

                {/* STATUS ACCEPT */}
                <div className="box-content">
                  <label>Status <span style={{color:'red', fontSize:'6px'}}> ** diisi oleh kadiv</span></label>
                  <CustomDropdown
                    options={dropdownData.statusAccept}  // <- benar-benar dari kepala_divisi
                    value={form.accept_status_id}
                    onChange={(val) => setForm({ ...form, accept_status_id: val })}
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

                {/* Account */}
                <div className="box-content">
                  <label>Account</label>
                  <CustomDropdown
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
            
            

            {/* DETAIL PESANAN  */}
            <div className="form-content">
              <h4>INFORMASI PESANAN</h4>
              <div className="sec-content">
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

                {/* Order type */}
                <div className="box-content">
                  <label >Order Type</label>
                  <CustomDropdown
                    options={dropdownData.orderType}        // data dari API
                    value={form.order_type}
                    onChange={(val) => setForm({ ...form, order_type: val })}
                    newItem={newOrder}
                    setNewItem={setNewOrder}
                    addNew={handleAddOrderType}
                    placeholder="Pilih Order type"
                    searchPlaceholder="Search order type..."
                    addPlaceholder="Add new order type..."
                  />
                </div>

                {/* Offers type */}
                <div className="box-content">
                  <label >Offer Type</label>
                  <CustomDropdown
                    options={dropdownData.offers}        // data dari API
                    value={form.offer_type}
                    onChange={(val) => setForm({ ...form, offer_type: val })}
                    newItem={offerNew}
                    setNewItem={setOfferNew}
                    addNew={handleAddOfferMusic}
                    placeholder="Pilih Offer type"
                    searchPlaceholder="Search offer..."
                    addPlaceholder="Add new offer..."
                  />
                </div>

                {/* Jumlah Track */}
                <div className="box-content">
                  <label >Jumlah Track</label>
                  <input
                    type="text"
                    name="jumlah_track"
                    value={form.jumlah_track}
                    onChange={handleChange}
                    placeholder="Jumlah Track"
                  />
                </div>

                {/* Jenis Track */}
                <div className="box-content">
                  <label >Jenis Track</label>
                  <CustomDropdown
                    options={dropdownData.trackTypes}        // data dari API
                    value={form.jenis_track}
                    onChange={(val) => setForm({ ...form, jenis_track: val })}
                    newItem={newTrack}
                    setNewItem={setNewTrack}
                    addNew={handleAddTrack}
                    placeholder="Pilih Track"
                    searchPlaceholder="Search track..."
                    addPlaceholder="Add new track..."
                  />
                </div>

                {/* Genre */}
                <div className="box-content">
                  <label >Genre <span style={{color:'red', fontSize:'6px'}}> ** diisi oleh kadiv</span></label>
                  <CustomDropdown
                    options={dropdownData.genres}        // data dari API
                    value={form.genre}
                    onChange={(val) => setForm({ ...form, genre: val })}
                    newItem={newGenre}
                    setNewItem={setNewGenre}
                    addNew={handleAddGenre}
                    placeholder="Pilih Genre"
                    searchPlaceholder="Search genre..."
                    addPlaceholder="Add new genre..."
                  />
                </div>

                {/* Project Type */}
                <div className="box-content">
                  <label >Project Type</label>
                  <CustomDropdown
                    options={dropdownData.projectType}        // data dari API
                    value={form.project_type}
                    onChange={(val) => setForm({ ...form, project_type: val })}
                    newItem={newProject}
                    setNewItem={setNewProject}
                    addNew={handleAddProjectType}
                    placeholder="Pilih Project type"
                    searchPlaceholder="Search Project type..."
                    addPlaceholder="Add new project ..."
                  />
                </div>

                {/* Duration */}
                <div className="box-content">
                  <label>Duration Needed</label>
                  <input
                    type="text"
                    name="duration"
                    value={form.duration}
                    onChange={handleChange}
                    placeholder="duration needed"
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
                    placeholder="Jumlah revisi"
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
                    name="discount"
                    value={form.discount}
                    onChange={handleChange}
                    placeholder="discount"
                  />
                </div>

                {/* KUPON DISKON  */}
                <div className="box-content">
                  <label>KUPON DISKON</label>
                  <CustomDropdown
                    options={dropdownData.kuponDiskon}
                    value={form.kupon_diskon_id}
                    onChange={(val) => setForm({ ...form, kupon_diskon_id: val })}  // ambil id saja
                    newItem={newKupon}
                    setNewItem={setNewKupon}
                    addNew={handleAddKupon}
                    placeholder="Pilih Kupon Diskon"
                    searchPlaceholder="Search Kupon diskon..."
                    addPlaceholder="Add new kupon..."
                  />
                </div>

                {/*  Basic Price */}
                <div className="box-content">
                  <label>Basic Price</label>
                  <input
                    type="text"
                    name="basic_price"
                    value={form.basic_price}
                    onChange={handleChange}
                    placeholder="basic price"
                  />
                </div>
              </div>
            </div>
            

            {/* REFERENSI DAN FILE PENDUKUNG */}
            <div className="form-content">
              <h4>REFERENSI DAN FILE PENDUKUNG</h4>
              <div className="sec-content">
                  <div className="box-content">
                    <label>GIG Link</label>
                    <input
                      type="url"
                      name="gig_link"
                      value={form.gig_link}
                      onChange={handleChange}
                      pattern="(https?://.*)?"
                      placeholder="https://example.com"
                    />
                  </div>

                  <div className="box-content">
                    <label>Reference Link</label>
                    <input
                      type="url"
                      name="reference_link"
                      value={form.reference_link}
                      onChange={handleChange}
                      pattern="(https?://.*)?"
                      placeholder="https://example.com"
                    />
                  </div>

                  <div className="box-content">
                    <label >Required Files</label>
                    <input
                      type="text"
                      name="required_files"
                      value={form.required_files}
                      onChange={handleChange}
                      placeholder="List of required files"
                    />
                  </div>

                  <div className="box-content">
                    <label >File & Chat</label>
                    <input
                      type="url"
                      name="file_and_chat_link"
                      value={form.file_and_chat_link}
                      onChange={handleChange}
                      pattern="(https?://.*)?"
                      placeholder="https://example.com"
                    />
                  </div>
              </div>
              
              </div>
            

            {/* PROJECT DESCRIPTION */}
            <div className="form-content">
              <h4>PROJECT DESCRIPTION</h4>
              <div className="sec-content-detail" style={{border:'1px solid white'}}>
                <div className="box-content">
                  {/* <label>Detail Project</label> */}
                  <textarea
                  className="textarea"
                    name="detail_project"
                    value={form.detail_project}
                    onChange={handleChange}
                    placeholder="Deskripsikan detail project..."
                  />
                </div>
              </div>
            </div>
          </div>

          <button type="submit" className="form-submit">
            Simpan Data
          </button>
        </form>
    </div>
    
  );
};

export default FormMarketingExample;


