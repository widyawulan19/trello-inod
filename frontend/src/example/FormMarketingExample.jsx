import React, { useState, useEffect } from "react";
import { getAllMarketingUsers, addMarketingUser, addDataMarketing, getAllAccountsMusic, addAccountMusic, getAllOfferTypesMusic, addOfferTypeMusic, getAllTrackTypes, addTrackType, getAllGenresMusic, addGenreMusic, getAllProjectTypesMusic, addProjectTypeMusic, getAllOrderTypesMusic, addOrderTypeMusic } from "../services/ApiServices";
import { getAllKepalaDivisi, addKepalaDivisi } from "../services/ApiServices";
import CustomDropdown from "../marketing/CustomDropdown";

const DataMarketingForm = () => {
  const [dropdownData, setDropdownData] = useState({ users: [], accs: [], accounts:[] });
  const [form, setForm] = useState({ buyer_name: "", code_order: "", input_by: "", acc_by: "" });
  const [inputByNew, setInputByNew] = useState("");
  const [accByNew, setAccByNew] = useState("");
  const [accountNew, setAccountNew] = useState("");
  const [offerNew, setOfferNew] = useState("");
  const [newTrack, setNewTrack] = useState("");
  const [newGenre, setNewGenre] = useState("");
  const [newProject, setNewProject] = useState("");
  const [newOrder, setNewOrder] = useState("");

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
      console.log('bentuk data tabel project type:', projectType);
      


      setDropdownData({
        users: users.map(u => ({ id: u.id, name: u.nama_marketing })),
        accs: accsArray.map(a => ({ id: a.id, name: a.nama })),
        accounts: accounts.map(ac => ({ id: ac.id, name: ac.nama_account })),
        offers : offers.map(of => ({ id: of.id, name: of.offer_name })),
        trackTypes: trackTypes.map(tt => ({id: tt.id, name: tt.track_name})),
        genres: genres.map(g => ({id: g.id, name: g.genre_name})),
        projectType: projectType.map(pt => ({id: pt.id, name: pt.nama_project})),
        orderType: orderType.map(ot => ({id: ot.id, name: ot.order_name})),
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
    const created = await addMarketingUser({ nama_marketing: inputByNew, divisi: "Marketing" });
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


  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addDataMarketing(form);
    alert("✅ Data marketing berhasil ditambahkan!");
    setForm({ buyer_name: "", code_order: "", input_by: "", acc_by: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 bg-white rounded shadow w-100">
      <h2 className="text-lg font-bold">Tambah Data Marketing</h2>

      <div className="grid grid-cols-3 gap-4" style={{border:'1px solid blue', height:'80vh', overflowY:'auto'}}>
        
        {/* Input By */}
        <div>
          <label className="block text-sm font-medium">Input By</label>
          <CustomDropdown
            options={dropdownData.users}
            value={form.input_by}
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
        <div>
          <label className="block text-sm font-medium">Accept By</label>
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

        {/* Buyer Name */}
        <div>
          <label className="block text-sm font-medium">Buyer Name</label>
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
        <div>
          <label className="block text-sm font-medium">Account</label>
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


        {/* DETAIL PESANAN  */}
        {/* Code Order */}
        <div>
          <label className="block text-sm font-medium">Code Order</label>
          <input
            type="text"
            name="code_order"
            value={form.code_order}
            onChange={handleChange}
            placeholder="Code Order"
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Order Number */}
        <div>
          <label className="block text-sm font-medium">Order Number</label>
          <input
            type="text"
            name="order_number"
            value={form.order_number}
            onChange={handleChange}
            placeholder="Order Number"
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Order type */}
        <div>
          <label className="block text-sm font-medium">Order Type</label>
          <CustomDropdown
            options={dropdownData.orderType}        // data dari API
            value={form.orderType}
            onChange={(val) => setForm({ ...form, orderType: val })}
            newItem={newOrder}
            setNewItem={setNewOrder}
            addNew={handleAddOrderType}
            placeholder="Pilih Order type"
            searchPlaceholder="Search order type..."
            addPlaceholder="Add new order type..."
          />
        </div>

        {/* Offers type */}
        <div>
          <label className="block text-sm font-medium">Offer Type</label>
          <CustomDropdown
            options={dropdownData.offers}        // data dari API
            value={form.offers}
            onChange={(val) => setForm({ ...form, offers: val })}
            newItem={offerNew}
            setNewItem={setOfferNew}
            addNew={handleAddOfferMusic}
            placeholder="Pilih Offer type"
            searchPlaceholder="Search offer..."
            addPlaceholder="Add new offer..."
          />
        </div>

        {/* Jumlah Track */}
        <div>
          <label className="block text-sm font-medium">Jumlah Track</label>
          <input
            type="text"
            name="jumlah_track"
            value={form.jumlah_track}
            onChange={handleChange}
            placeholder="Jumlah Track"
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Jenis Track */}
        <div>
          <label className="block text-sm font-medium">Jenis Track</label>
          <CustomDropdown
            options={dropdownData.trackTypes}        // data dari API
            value={form.trackTypes}
            onChange={(val) => setForm({ ...form, trackTypes: val })}
            newItem={newTrack}
            setNewItem={setNewTrack}
            addNew={handleAddTrack}
            placeholder="Pilih Track"
            searchPlaceholder="Search track..."
            addPlaceholder="Add new track..."
          />
        </div>

        {/* Genre */}
        <div>
          <label className="block text-sm font-medium">Genre</label>
          <CustomDropdown
            options={dropdownData.genres}        // data dari API
            value={form.genres}
            onChange={(val) => setForm({ ...form, genres: val })}
            newItem={newGenre}
            setNewItem={setNewGenre}
            addNew={handleAddGenre}
            placeholder="Pilih Genre"
            searchPlaceholder="Search genre..."
            addPlaceholder="Add new genre..."
          />
        </div>

        {/* Project Type */}
        <div>
          <label className="block text-sm font-medium">Project Type</label>
          <CustomDropdown
            options={dropdownData.projectType}        // data dari API
            value={form.projectType}
            onChange={(val) => setForm({ ...form, projectType: val })}
            newItem={newProject}
            setNewItem={setNewProject}
            addNew={handleAddProjectType}
            placeholder="Pilih Project type"
            searchPlaceholder="Search Project type..."
            addPlaceholder="Add new project ..."
          />
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium">Duration Needed</label>
          <input
            type="text"
            name="duration"
            value={form.duration}
            onChange={handleChange}
            placeholder="duration needed"
            className="w-full p-2 border rounded"
          />
        </div>

         {/* Jumlah Revisi */}
        <div>
          <label className="block text-sm font-medium">Jumlah Revisi</label>
          <input
            type="text"
            name="jumlah_revisi"
            value={form.jumlah_revisi}
            onChange={handleChange}
            placeholder="Jumlah revisi"
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Deadline */}
        <div>
          <label className="block text-sm font-medium">Deadline</label>
          <input
            type="Date"
            name="deadline"
            value={form.deadline}
            onChange={handleChange}
            placeholder="Deadline"
            className="w-full p-2 border rounded"
          />
        </div>


        {/* INFORMASI HARGA DAN DISKON  */}
        {/* Price Normal */}
        <div>
          <label className="block text-sm font-medium">Price Normal</label>
          <input
            type="text"
            name="price_normal"
            value={form.price_normal}
            onChange={handleChange}
            placeholder="Price normal"
            className="w-full p-2 border rounded"
          />
        </div>

         {/* Price Discount */}
        <div>
          <label className="block text-sm font-medium">Price Discount</label>
          <input
            type="text"
            name="price_discount"
            value={form.price_discount}
            onChange={handleChange}
            placeholder="Price discount"
            className="w-full p-2 border rounded"
          />
        </div>

        {/*  Discount */}
        <div>
          <label className="block text-sm font-medium">Discount %</label>
          <input
            type="text"
            name="discount"
            value={form.discount}
            onChange={handleChange}
            placeholder="discount"
            className="w-full p-2 border rounded"
          />
        </div>

        {/*  Discount */}
        <div>
          <label className="block text-sm font-medium">Kupon Diskon</label>
          <input
            type="text"
            name="kupon_discount_id"
            value={form.kupon_discount_id}
            onChange={handleChange}
            placeholder="kupon discount"
            className="w-full p-2 border rounded"
          />
        </div>

        {/*  Basic Price */}
        <div>
          <label className="block text-sm font-medium">Basic Price</label>
          <input
            type="text"
            name="basic_price"
            value={form.basic_price}
            onChange={handleChange}
            placeholder="basic price"
            className="w-full p-2 border rounded"
          />
        </div>

        {/* REFERENSI DAN FILE PENDUKUNG */}

          <div>
            <label className="block text-sm font-medium">GIG Link</label>
            <input
              type="url"
              name="gig_link"
              value={form.gig_link}
              onChange={handleChange}
              pattern="https?://.*"
              placeholder="https://example.com"
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Reference Link</label>
            <input
              type="url"
              name="reference_link"
              value={form.reference_link}
              onChange={handleChange}
              pattern="https?://.*"
              required
              placeholder="https://example.com"
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Required Files</label>
            <input
              type="text"
              name="required_files"
              value={form.required_files}
              onChange={handleChange}
              placeholder="List of required files"
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">File & Chat</label>
            <input
              type="url"
              name="file_and_chat_link"
              value={form.file_and_chat_link}
              onChange={handleChange}
              pattern="https?://.*"
              required
              placeholder="https://example.com"
              className="w-full p-2 border rounded"
            />
          </div>

        {/* PROJECT DESCRIPTION */}
        <div className="section-desc space-y-4 mt-6">
          <h4 className="text-lg font-semibold">Project Description</h4>
          <div>
            <label className="block text-sm font-medium">Detail Project</label>
            <textarea
              name="detail_project"
              value={form.detail_project}
              onChange={handleChange}
              required
              placeholder="Deskripsikan detail project..."
              className="w-full p-2 border rounded min-h-[100px]"
            />
          </div>
        </div>



        
      </div>

      <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">
        Simpan
      </button>
    </form>
  );
};

export default DataMarketingForm;


