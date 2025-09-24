import React, { useState, useEffect } from "react";
import {
  getAllMarketingUsers,
  getAllAccountsMusic,
  getAllOfferTypesMusic,
  getAllTrackTypes,
  getAllGenresMusic,
  getAllProjectTypesMusic,
  getAllOrderTypesMusic,
  getAllKuponDiskon,
  getAllKepalaDivisi,
  getAllDataMarketingJoinedById,   // ✅ endpoint baru
  updateDataMarketingJoined,    // ✅ update API
  addMarketingUser,
  addAccountMusic,
  addOfferTypeMusic,
  addTrackType,
  addGenreMusic,
  addProjectTypeMusic,
  addOrderTypeMusic,
  addKuponDiskon,
  addKepalaDivisi,
  getAllAcceptStatus,
  addAcceptStatus
} from "../services/ApiServices";

import CustomDropdown from "../marketing/CustomDropdown";
import BootstrapTooltip from "../components/Tooltip";
import { FaXmark } from "react-icons/fa6";
import '../style/pages/EditMarketingForm.css'
import { useSnackbar } from "../context/Snackbar";
import CustomDropdownEdit from "../marketing/CustomDropdownEdit";

const initialFormState = {
  marketing_id: "",
  buyer_name: "",
  code_order: "",
  order_number: "",
  jumlah_track: "",
  duration: "",
  jumlah_revisi: "",
  deadline: "",
  price_normal: "",
  price_discount: "",
  discount: "",
  basic_price: "",
  gig_link: "",
  reference_link: "",
  required_files: "",
  file_and_chat_link: "",
  detail_project: "",
  input_by: "",
  acc_by: "",
  account: "",
  order_type: "",
  offer_type: "",
  jenis_track: "",
  genre: "",
  project_type: "",
  kupon_diskon_id: "",
  accept_status_id:"",
};

const NewEditDataMarketing = ({ marketingId , onClose, fetchDataMarketing }) => {
  const [dropdownData, setDropdownData] = useState({});
  const [form, setForm] = useState(initialFormState);
  const [loading, setLoading] = useState(true);
  const {showSnackbar} = useSnackbar();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const [inputByNew, setInputByNew] = useState("");
  const [accByNew, setAccByNew] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [accountNew, setAccountNew] = useState("");
  const [offerNew, setOfferNew] = useState("");
  const [newTrack, setNewTrack] = useState("");
  const [newGenre, setNewGenre] = useState("");
  const [newProject, setNewProject] = useState("");
  const [newOrder, setNewOrder] = useState("");
  const [newKupon, setNewKupon] = useState("");

  // ✅ Fetch dropdown + data by id
useEffect(() => {
  const fetchData = async () => {
    try {
      const [
        users,
        accs,
        accounts,
        offers,
        trackTypes,
        genres,
        projectType,
        orderType,
        kuponDiskon,
        statusAccept,
        marketingData,
      ] = await Promise.all([
        getAllMarketingUsers(),
        getAllKepalaDivisi(),
        getAllAccountsMusic(),
        getAllOfferTypesMusic(),
        getAllTrackTypes(),
        getAllGenresMusic(),
        getAllProjectTypesMusic(),
        getAllOrderTypesMusic(),
        getAllKuponDiskon(),
        getAllAcceptStatus(),
        getAllDataMarketingJoinedById(marketingId),
      ]);
      console.log("marketingData:", marketingData.data);

      // 🔽 Simpan semua data dropdown
      setDropdownData({
        users: users.map((u) => ({ id: String(u.id), name: u.nama_marketing })),
        accs: accs.data.map((a) => ({ id: String(a.id), name: a.nama })),
        accounts: accounts.map((ac) => ({ id: String(ac.id), name: ac.nama_account })),
        offers: offers.map((of) => ({ id: String(of.id), name: of.offer_name })),
        trackTypes: trackTypes.map((tt) => ({ id: String(tt.id), name: tt.track_name })),
        genres: genres.map((g) => ({ id: String(g.id), name: g.genre_name })),
        projectType: projectType.map((pt) => ({ id: String(pt.id), name: pt.nama_project })),
        orderType: orderType.map((ot) => ({ id: String(ot.id), name: ot.order_name })),
        kuponDiskon: kuponDiskon.map((kd) => ({ id: String(kd.id), name: kd.nama_kupon })),
        statusAccept: statusAccept.map((s) => ({id: String(s.id), name: s.status_name})),
      });

     if (marketingData?.data) {
      const m = marketingData.data;
      setForm({
        marketing_id: m.marketing_id,
        buyer_name: m.buyer_name || "",
        code_order: m.code_order || "",
        order_number: m.order_number || "",
        jumlah_track: m.jumlah_track || "",
        jumlah_revisi: m.jumlah_revisi || "",
        duration: m.duration || "",
        deadline: m.deadline ? m.deadline.split("T")[0] : "", // biar date input bener
        price_normal: m.price_normal || "",
        price_discount: m.price_discount || "",
        discount: m.discount || "",
        basic_price: m.basic_price || "",
        reference_link: m.reference_link || "",
        required_files: m.required_files || "",
        file_and_chat_link: m.file_and_chat_link || "",
        gig_link: m.gig_link || "",
        detail_project: m.detail_project || "",
       
        input_by: m.input_by ? String(m.input_by) : "",
        acc_by: m.acc_by ? String(m.acc_by) : "",
        account: m.account ? String(m.account) : "",
        order_type: m.order_type ? String(m.order_type) : "",
        offer_type: m.offer_type ? String(m.offer_type) : "",
        jenis_track: m.jenis_track ? String(m.jenis_track) : "",
        genre: m.genre ? String(m.genre) : "",
        project_type: m.project_type ? String(m.project_type) : "",
        kupon_diskon_id: m.kupon_diskon_id ? String(m.kupon_diskon_id) : "",
        accept_status_id: m.accept_status_id ? String(m.accept_status_id): "",
      });
    }

    } catch (error) {
      console.error("❌ Error fetching data:", error);
    }
  };

  if (marketingId) {
    fetchData();
  }
}, [marketingId]);

// const selectedAccBy = dropdownData.accs?.find(a => a.id === form.acc_by) || null;
// const selectedAccBy = dropdownData.accs?.find(
//   (a) => a.id === String(form.acc_by)
// ) || null;
const selectedAccById = form.acc_by;
console.log('data selcted acc:', selectedAccById);



  // Tambah Input By
  const handleAddInputBy = async () => {
    if (!inputByNew.trim()) return;
    const created = await addMarketingUser({ nama_marketing: inputByNew, divisi: "Marketing" });
    const newOption = { id: created.id, name: `${created.nama_marketing} (${created.divisi})` };
    setDropdownData({ ...dropdownData, users: [...dropdownData.users, newOption] });
    setForm({ ...form, input_by: created.id });
    setInputByNew("");
    showSnackbar('Berhasil menambahkan data baru!', 'success');
  };

 // Tambah Acc By
  const handleAddAccBy = async () => {
    if (!accByNew.trim()) return;
    const created = await addKepalaDivisi({ nama: accByNew, divisi: "DESIGN" });
    const newOption = { id: created.id, name: `${created.nama} (${created.divisi})` };
    setDropdownData({ ...dropdownData, accs: [...dropdownData.accs, newOption] });
    setForm({ ...form, acc_by: created.id });
    setAccByNew("");
    showSnackbar('Berhasil menambahkan data baru!', 'success');
  };

  //STATUS ACCEPT 
  const handleStatusAccept = async() =>{
    if(!newStatus.trim()) return;
    const created = await addAcceptStatus({status_name: newStatus});
    const newOption = {id: created.id, name: created.status_name};
    setDropdownData({ ...dropdownData, statusAccept: [...dropdownData.statusAccept, newOption]});
    setForm({ ...form, accept_status_id: created.id });
    setNewStatus("");
    showSnackbar('Berhasil menambahakn data baru!', 'success');
  }

  // Tambah Account
  const handleAddAccount = async () => {
    if (!accountNew.trim()) return;
    const created = await addAccountMusic({ nama_account: accountNew });
    const newOption = { id: created.id, name: created.nama_account };
    setDropdownData({ ...dropdownData, accounts: [...dropdownData.accounts, newOption] });
    setForm({ ...form, account: created.id });
    setAccountNew("");
    showSnackbar('Berhasil menambahkan data baru!', 'success');
  };

  //Tambah offer type
  const handleAddOfferMusic = async () =>{
    if (!offerNew.trim()) return;
    const created = await addOfferTypeMusic({ offer_name: offerNew });
    const newOption = { id: created.id, name: created.offer_name };
    setDropdownData({ ...dropdownData, offers: [...dropdownData.offers, newOption] });
    setForm({ ...form, offers: created.id });
    setOfferNew("");
    showSnackbar('Berhasil menambahkan data baru!', 'success');
  }

  //tambah new track 
  const handleAddTrack = async () =>{
    if (!newTrack.trim()) return;
    const created = await addTrackType({ track_name: newTrack });
    const newOption = { id: created.id, name: created.track_name };
    setDropdownData({ ...dropdownData, trackTypes: [...dropdownData.trackTypes, newOption] });
    setForm({ ...form, trackTypes: created.id });
    setNewTrack("");
    showSnackbar('Berhasil menambahkan data baru!', 'success');
  }

  //tambah genre
   const handleAddGenre = async () =>{
    if (!newGenre.trim()) return;
    const created = await addGenreMusic({ genre_name: newGenre });
    const newOption = { id: created.id, name: created.genre_name };
    setDropdownData({ ...dropdownData, genres: [...dropdownData.genres, newOption] });
    setForm({ ...form, genres: created.id });
    setNewGenre("");
    showSnackbar('Berhasil menambahkan data baru!', 'success');
  }

   //tambah project type
   const handleAddProjectType = async () =>{
    if (!newProject.trim()) return;
    const created = await addProjectTypeMusic({ nama_project: newProject });
    const newOption = { id: created.id, name: created.nama_project };
    setDropdownData({ ...dropdownData, projectType: [...dropdownData.projectType, newOption] });
    setForm({ ...form, projectType: created.id });
    setNewProject("");
    showSnackbar('Berhasil menambahkan data baru!', 'success');
  }

  //tambah order type 
  const handleAddOrderType = async () =>{
    if (!newOrder.trim()) return;
    const created = await addOrderTypeMusic({ order_name: newOrder });
    const newOption = { id: created.id, name: created.order_name };
    setDropdownData({ ...dropdownData, orderType: [...dropdownData.orderType, newOption] });
    setForm({ ...form, orderType: created.id });
    setNewOrder("");
    showSnackbar('Berhasil menambahkan data baru!', 'success');
  }


  //tambah Kupon Diskon 
  const handleAddKupon = async () =>{
    if (!newKupon.trim()) return;
    const created = await addKuponDiskon({ nama_kupon: newKupon });
    const newOption = { id: created.id, name: created.nama_kupon };
    setDropdownData({ ...dropdownData, kuponDiskon: [...dropdownData.kuponDiskon, newOption] });
    setForm({ ...form, kuponDiskon: created.id });
    setNewKupon("");
    showSnackbar('Berhasil menambahkan data baru!', 'success');
  }

  if (!form) return <p>Loading...</p>;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateDataMarketingJoined(marketingId, form);
      showSnackbar('Data Marketing berhasil diperbarui!', 'success');

      // 🔥 Panggil fetch data dari parent biar refresh list
      if (fetchDataMarketing) {
        await fetchDataMarketing();
      }

      // 🔥 Tutup form kalau ada onClose
      if (onClose) {
        onClose();
      }
    } catch (err) {
      console.error("❌ Error update data marketing:", err);
      showSnackbar('Gagal update data marketing', 'error');
    }
  };



  //fungsi untuk mengambil 5 karakter terakhir code order
  const get5LastChar = (codeOrder) => {
    return codeOrder ? codeOrder.slice(-5) :'';
  }

  //fungsi dropdown data accept
  const handleOptionClick = (value) =>{
    setForm((prevData) =>({
        ...prevData,
        is_accepted: value === 'accepted',
    }));
    setIsDropdownOpen(false);
  }


  return (
    <div className="em-container">
      <div className="em-header">
        <div className="em-left">
              <h4 className='font-bold'>EDIT DATA MARKETING</h4>
              {form.genre} | {form.buyer_name} | {form.account_name} | {get5LastChar(form.code_order)}
          </div>
          <div className="em-right">
                {/* <button type="submit">Update</button> */}
                <BootstrapTooltip title="Close Edit" placement='top'>
                    <FaXmark onClick={onClose} className='em-icon'/>
                </BootstrapTooltip>
            </div>
      </div>

      <form onSubmit={handleSubmit} >
        <div className="form-edit">
          <div className="form-content">
            <h4>INFORMASI PESANAN</h4>
            <div className="sec-content">
              {/* Input By */}
              <div className="box-content">
                <label>Input By</label>
                {/* {dropdownData.users?.length > 0 && ( */}
                <CustomDropdownEdit
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
                {/* )} */}
              </div>

              {/* Acc By */}
              <div className="box-content">
                <label>Accept By <span style={{color:'red', fontSize:'6px'}}> ** diisi oleh kadiv</span></label>
                {/* {dropdownData.accs?.length > 0 && ( */}
                  <CustomDropdownEdit
                    options={dropdownData.accs}
                    value={form.acc_by}  // pakai ID string, misal "2"
                    onChange={(val) => setForm({ ...form, acc_by: val })}
                    newItem={accByNew}
                    setNewItem={setAccByNew}
                    addNew={handleAddAccBy}
                    placeholder="Accepted by"
                    searchPlaceholder="Search kadiv..."
                    addPlaceholder="Add new accepted user..."
                  />
                {/* )} */}
              </div>

               {/* ACCEPT STATUS */}
              <div className="box-content">
                <label>Status Accept <span style={{color:'red', fontSize:'6px'}}> ** diisi oleh kadiv</span></label>
                  <CustomDropdownEdit
                    options={dropdownData.statusAccept}
                    value={form.accept_status_id}  // pakai ID string, misal "2"
                    onChange={(val) => setForm({ ...form, accept_status_id: val })}
                    newItem={newStatus}
                    setNewItem={setNewStatus}
                    addNew={handleStatusAccept}
                    placeholder="Status Accept"
                    searchPlaceholder="Search status..."
                    addPlaceholder="Add new status accept"
                  />
              </div>

              {/* Buyer Name */}
              <div className="box-content">
                <label>Buyer Name</label>
                <input
                  type="text"
                  name="buyer_name"
                  value={form.buyer_name}
                  onChange={handleChange}
                  placeholder="Buyer Name"
                />
              </div>

              {/* Account */}
              <div className="box-content">
                <label>Account</label>
                <CustomDropdownEdit
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
            <h4>DETAIL PESANAN</h4>
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
                <label>Order Number</label>
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
                <label>Order Type</label>
                <CustomDropdownEdit
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
                <label>Offer Type</label>
                <CustomDropdownEdit
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
                <label>Jumlah Track</label>
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
                <label>Jenis Track</label>
                <CustomDropdownEdit
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
                <label>Genre <span style={{color:'red', fontSize:'6px'}}> ** diisi oleh kadiv</span></label>
                <CustomDropdownEdit
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
                <label>Project Type</label>
                <CustomDropdownEdit
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
                <label>Jumlah Revisi</label>
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
                <label >Discount %</label>
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
                <label>Kupon Diskon</label>
                <CustomDropdownEdit
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
                <label >Basic Price</label>
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
                <label >GIG Link</label>
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
                <label >Reference Link</label>
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
            <div className="sec-content">
              <div className="box-content">
                <label>Detail Project</label>
                <textarea
                  name="detail_project"
                  value={form.detail_project}
                  onChange={handleChange}
                  placeholder="Deskripsikan detail project..."
                />
              </div>
            </div>
          </div>

        </div>

        {/* kamu bisa copy dropdown lain persis dari DataMarketingForm */}
        {/* tinggal ganti value={form.field} onChange={(val) => setForm({...form, field: val})} */}

        <button type="submit" className="form-submit">
          Update
        </button>
      </form>
    </div>
  );
};

export default NewEditDataMarketing;
