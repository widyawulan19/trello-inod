import React, { useState } from "react";
import { addDataMarketing } from "../services/ApiServices";
import "../style/pages/FormDataMarketing.css";
import { HiOutlineXMark, HiXMark } from "react-icons/hi2";
import BootstrapTooltip from "../components/Tooltip";
import { IoCreate } from "react-icons/io5";
import { FaXmark } from "react-icons/fa6";
import { useSnackbar } from "../context/Snackbar";

const FormDataMarketing = ({ onClose, fetchData }) => {
  const {showSnackbar} = useSnackbar();
  const [formData, setFormData] = useState({
    input_by: "",
    acc_by: "",
    buyer_name: "",
    code_order: "",
    jumlah_track: "",
    order_number: "",
    account: "",
    deadline: "",
    jumlah_revisi: "",
    order_type: "",
    offer_type: "",
    jenis_track: "",
    genre: "",
    price_normal: "",
    price_discount: "",
    discount: "",
    basic_price: "",
    gig_link: "",
    required_files: "",
    project_type: "",
    duration: "",
    reference_link: "",
    file_and_chat_link: "",
    detail_project: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await addDataMarketing(formData);
      console.log("Data successfully added:", response.data);
      showSnackbar("Data added successfully", "success");
      // alert("Data successfully added!");

      setFormData({
        input_by: "",
        acc_by: "",
        buyer_name: "",
        code_order: "",
        jumlah_track: "",
        order_number: "",
        account: "",
        deadline: "",
        jumlah_revisi: "",
        order_type: "",
        offer_type: "",
        jenis_track: "",
        genre: "",
        price_normal: "",
        price_discount: "",
        discount: "",
        basic_price: "",
        gig_link: "",
        required_files: "",
        project_type: "",
        duration: "",
        reference_link: "",
        file_and_chat_link: "",
        detail_project: "",
      });
      fetchData()
    } catch (error) {
      console.error("Error adding data:", error);
      showSnackbar('Failed to add data!','error')
      // alert("Failed to add data.");
    }
  };

  return (
    <div className="fdm-container">
      <div className="fdm-header">
        <div className="fmdh-left">
          <div className="header-icon">
            <IoCreate size={15}/>
          </div>
          <h4> CREATE DATA MARKETING</h4>
        </div>
        
        <BootstrapTooltip title='close' placement='top'>
            <HiXMark onClick={onClose} className="fdm-icon" />
        </BootstrapTooltip>
      </div>

      <form onSubmit={handleSubmit}>
        {/* INFORMASI PESANAN */}
        <div className="section-main">
          <h4>Informasi Pesanan</h4>
          <div className="sec-content">
            <div className="box">
              <label>Input By</label>
              <input
                type="text"
                name="input_by"
                value={formData.input_by}
                onChange={handleChange}
                required
              />
            </div>
            <div className="box">
              <label>Accepted By</label>
              <input
                type="text"
                name="acc_by"
                value={formData.acc_by}
                onChange={handleChange}
                required
              />
            </div>
            <div className="box">
              <label>Buyer Name</label>
              <input
                type="text"
                name="buyer_name"
                value={formData.buyer_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="box">
              <label>Account Name</label>
              <input
                type="text"
                name="account"
                value={formData.account}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* DETAIL PESANAN */}
        <div className="section-main">
          <h4>Detail Pesanan</h4>
          <div className="sec-content">
            <div className="box">
              <label>Code Order</label>
              <input
                type="text"
                name="code_order"
                value={formData.code_order}
                onChange={handleChange}
                required
              />
            </div>
            <div className="box">
              <label>Order Number</label>
              <input
                type="text"
                name="order_number"
                value={formData.order_number}
                onChange={handleChange}
                required
              />
            </div>
            <div className="box">
              <label>Order Type</label>
              <input
                type="text"
                name="order_type"
                value={formData.order_type}
                onChange={handleChange}
              />
            </div>
            <div className="box">
              <label>Offer Type</label>
              <input
                type="text"
                name="offer_type"
                value={formData.offer_type}
                onChange={handleChange}
              />
            </div>
            <div className="box">
                <label>Jumlah Track</label>
                <input
                    type="text"
                    name="jumlah_track"
                    value={formData.jumlah_track}
                    onChange={handleChange}
                />
            </div>
            <div className="box">
                <label>Jenis Track</label>
                <input
                    type="text"
                    name="jenis_track"
                    value={formData.jenis_track}
                    onChange={handleChange}
                />
            </div>
            <div className="box">
                <label>Genre </label>
                <input
                    type="text"
                    name="genre"
                    value={formData.genre}
                    onChange={handleChange}
                />
            </div>
            <div className="box">
                <label>Project Type</label>
                <input
                    type="text"
                    name="project_type"
                    value={formData.project_type}
                    onChange={handleChange}
                />
            </div>
            <div className="box">
                <label>Duration Needed</label>
                <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                />
            </div>
            <div className="box">
                <label>Jumlah Revisi</label>
                <input
                    type="text"
                    name="jumlah_revisi"
                    value={formData.jumlah_revisi}
                    onChange={handleChange}
                />
            </div>
            <div className="box-date">
                <label>Deadline Project</label>
                <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    required
                />
            </div>
            
            {/* <div className="box" style={{border:'1px solid blue', display:'flex', flexDirection:'column', alignItems:'center'}}>
              <label style={{width:'100%'}}>Deadline Project</label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                required
              />
            </div> */}
          </div>
        </div>

        {/* INFORMASI HARGA */}
        <div className="section-main">
          <h4>Informasi Harga dan Diskon</h4>
          <div className="sec-content">
            <div className="box">
              <label>Price Normal</label>
              <input
                type="text"
                name="price_normal"
                value={formData.price_normal}
                onChange={handleChange}
              />
            </div>
            <div className="box">
                <label>Price Discount</label>
                <input
                    type="text"
                    name="price_discount"
                    value={formData.price_discount}
                    onChange={handleChange}
                />
            </div>
            <div className="box">
              <label>Discount %</label>
              <input
                type="text"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
              />
            </div>
            <div className="box">
               <label>Basic Price</label>
               <input
                   type="text"
                   name="basic_price"
                   value={formData.basic_price}
                   onChange={handleChange}
               />
            </div>
          </div>
        </div>

        {/* REFERENSI DAN FILE PENDUKUNG */}
        <div className="section-reference">
          <h4>Referensi dan File Pendukung</h4>
          <div className="sec-link-content">
            <div className="box">
              <label>GIG Link</label>
              <input
                type="url"
                name="gig_link"
                value={formData.gig_link}
                onChange={handleChange}
                pattern="https?://.*"
              />
            </div>
            <div className="box">
                <label>Reference Link</label>
                <input
                    type="url"
                    name="reference_link"
                    value={formData.reference_link}
                    onChange={handleChange}
                    pattern="https?://.*"
                    required
                />
            </div>
            <div className="box">
              <label>Required Files</label>
              <input
                type="text"
                name="required_files"
                value={formData.required_files}
                onChange={handleChange}
                // pattern="https?://.*"
              />
            </div>
            <div className="box">
                <label>File & Chat</label>
                <input
                    type="url"
                    name="file_and_chat_link"
                    value={formData.file_and_chat_link}
                    onChange={handleChange}
                    pattern="https?://.*"
                    required
                />
            </div>
          </div>
        </div>

        {/* PROJECT DESCRIPTION */}
        <div className="section-desc">
          <h4>Project Description</h4>
          <div className="sec-link-content">
            <div className="box">
              <label>Detail Project</label>
              <textarea
                name="detail_project"
                value={formData.detail_project}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="button-update">
          <button type="submit">SUBMIT NEW DATA</button>
        </div>
      </form>
    </div>
  );
};

// export default FormDataMarketing;



import React, { useEffect, useState } from "react";
import { getJoinedDataMarketing } from "../services/ApiServices";

const DataMarketingTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getJoinedDataMarketing();
        setData(result);
      } catch (error) {
        console.error("❌ Gagal ambil data marketing:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p>Loading data marketing...</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border border-collapse border-gray-300 table-auto">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-2 py-1 border">ID</th>
            <th className="px-2 py-1 border">Buyer</th>
            <th className="px-2 py-1 border">Order Code</th>
            <th className="px-2 py-1 border">Order Number</th>
            <th className="px-2 py-1 border">Track</th>
            <th className="px-2 py-1 border">Duration</th>
            <th className="px-2 py-1 border">Revisi</th>
            <th className="px-2 py-1 border">Deadline</th>
            <th className="px-2 py-1 border">Harga Normal</th>
            <th className="px-2 py-1 border">Diskon</th>
            <th className="px-2 py-1 border">Harga Diskon</th>
            <th className="px-2 py-1 border">Input By</th>
            <th className="px-2 py-1 border">Acc By</th>
            <th className="px-2 py-1 border">Account</th>
            <th className="px-2 py-1 border">Order Type</th>
            <th className="px-2 py-1 border">Offer Type</th>
            <th className="px-2 py-1 border">Track Type</th>
            <th className="px-2 py-1 border">Genre</th>
            <th className="px-2 py-1 border">Project Type</th>
            <th className="px-2 py-1 border">Kupon Diskon</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item) => (
              <tr key={item.marketing_id}>
                <td className="px-2 py-1 border">{item.marketing_id}</td>
                <td className="px-2 py-1 border">{item.buyer_name}</td>
                <td className="px-2 py-1 border">{item.code_order}</td>
                <td className="px-2 py-1 border">{item.order_number}</td>
                <td className="px-2 py-1 border">{item.jumlah_track}</td>
                <td className="px-2 py-1 border">{item.duration}</td>
                <td className="px-2 py-1 border">{item.jumlah_revisi}</td>
                <td className="px-2 py-1 border">{item.deadline?.slice(0, 10)}</td>
                <td className="px-2 py-1 border">{item.price_normal}</td>
                <td className="px-2 py-1 border">{item.discount}</td>
                <td className="px-2 py-1 border">{item.price_discount}</td>
                <td className="px-2 py-1 border">{item.input_by_name}</td>
                <td className="px-2 py-1 border">{item.acc_by_name}</td>
                <td className="px-2 py-1 border">{item.account_name}</td>
                <td className="px-2 py-1 border">{item.order_type_name}</td>
                <td className="px-2 py-1 border">{item.offer_type_name}</td>
                <td className="px-2 py-1 border">{item.track_type_name}</td>
                <td className="px-2 py-1 border">{item.genre_name}</td>
                <td className="px-2 py-1 border">{item.project_type_name}</td>
                <td className="px-2 py-1 border">{item.kupon_diskon_name}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="20" className="px-2 py-1 text-center border">
                Tidak ada data marketing
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// export default DataMarketingTable;


// ✅ Endpoint get data marketing + join by ID
app.get("/api/data-marketing/joined/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query(
      `
      SELECT 
        dm.marketing_id,
        dm.buyer_name,
        dm.code_order,
        dm.order_number,
        dm.jumlah_track,
        dm.duration,
        dm.jumlah_revisi,
        dm.deadline,
        dm.price_normal,
        dm.price_discount,
        dm.discount,
        dm.basic_price,
        dm.gig_link,
        dm.reference_link,
        dm.required_files,
        dm.file_and_chat_link,
        dm.detail_project,
        dm.create_at,
        dm.update_at,

        -- JOIN ke tabel lain (nama bukan id)
        mu.nama_marketing AS input_by_name,
        kd.nama AS acc_by_name,
        am.nama_account AS account_name,
        ot.order_name AS order_type_name,
        oft.offer_name AS offer_type_name,
        tt.track_name AS track_type_name,
        g.genre_name AS genre_name,
        pt.nama_project AS project_type_name,
        k.nama_kupon AS kupon_diskon_name

      FROM data_marketing dm
      LEFT JOIN marketing_musik_user mu ON mu.id = dm.input_by
      LEFT JOIN kepala_divisi kd ON kd.id = dm.acc_by
      LEFT JOIN account_music am ON am.id = dm.account
      LEFT JOIN music_order_type ot ON ot.id = dm.order_type
      LEFT JOIN offer_type_music oft ON oft.id = dm.offer_type
      LEFT JOIN track_types tt ON tt.id = dm.jenis_track
      LEFT JOIN genre_music g ON g.id = dm.genre
      LEFT JOIN project_type pt ON pt.id = dm.project_type
      LEFT JOIN kupon_diskon k ON k.id = dm.kupon_diskon_id
      WHERE dm.marketing_id = $1
      LIMIT 1;
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Data marketing not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error get joined data marketing by ID:", err);
    res.status(500).json({ error: "Failed to fetch joined data by id" });
  }
});


import React, { useEffect, useState } from "react";
import { getJoinedDataMarketingById } from "../services/ApiServices";

const DataMarketingDetail = ({ id }) => {
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const result = await getJoinedDataMarketingById(id);
        setDetail(result);
      } catch (error) {
        console.error("❌ Gagal ambil detail data marketing:", error);
      }
    };

    fetchDetail();
  }, [id]);

  if (!detail) return <p>Loading detail...</p>;

  return (
    <div className="p-4 border rounded">
      <h2 className="mb-2 text-lg font-bold">Detail Marketing #{detail.marketing_id}</h2>
      <p><b>Buyer:</b> {detail.buyer_name}</p>
      <p><b>Order Code:</b> {detail.code_order}</p>
      <p><b>Account:</b> {detail.account_name}</p>
      <p><b>Input By:</b> {detail.input_by_name}</p>
      <p><b>Acc By:</b> {detail.acc_by_name}</p>
      <p><b>Kupon:</b> {detail.kupon_diskon_name || "-"}</p>
    </div>
  );
};

// export default DataMarketingDetail;

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
  getDataMarketingById,   // ✅ endpoint baru
  updateDataMarketing,    // ✅ update API
  addMarketingUser,
  addAccountMusic,
  addOfferTypeMusic,
  addTrackType,
  addGenreMusic,
  addProjectTypeMusic,
  addOrderTypeMusic,
  addKuponDiskon,
  addKepalaDivisi
} from "../services/ApiServices";

import CustomDropdown from "../marketing/CustomDropdown";

// const EditDataMarketingForm = ({ marketingId }) => {
  const [dropdownData, setDropdownData] = useState({});
  const [form, setForm] = useState(null);

  const [inputByNew, setInputByNew] = useState("");
  const [accByNew, setAccByNew] = useState("");
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
        const [users, accs, accounts, offers, trackTypes, genres, projectType, orderType, kuponDiskon, marketing] = await Promise.all([
          getAllMarketingUsers(),
          getAllKepalaDivisi(),
          getAllAccountsMusic(),
          getAllOfferTypesMusic(),
          getAllTrackTypes(),
          getAllGenresMusic(),
          getAllProjectTypesMusic(),
          getAllOrderTypesMusic(),
          getAllKuponDiskon(),
          getDataMarketingById(marketingId), // fetch data marketing by id
        ]);

        setDropdownData({
          users: users.map((u) => ({ id: u.id, name: u.nama_marketing })),
          accs: accs.data.map((a) => ({ id: a.id, name: a.nama })),
          accounts: accounts.map((ac) => ({ id: ac.id, name: ac.nama_account })),
          offers: offers.map((of) => ({ id: of.id, name: of.offer_name })),
          trackTypes: trackTypes.map((tt) => ({ id: tt.id, name: tt.track_name })),
          genres: genres.map((g) => ({ id: g.id, name: g.genre_name })),
          projectType: projectType.map((pt) => ({ id: pt.id, name: pt.nama_project })),
          orderType: orderType.map((ot) => ({ id: ot.id, name: ot.order_name })),
          kuponDiskon: kuponDiskon.map((kd) => ({ id: kd.id, name: kd.nama_kupon })),
        });

        // ✅ set form awal dengan data dari API
        setForm(marketing);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [marketingId]);

  if (!form) return <p>Loading...</p>;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateDataMarketing(marketingId, form);
      alert("✅ Data marketing berhasil diperbarui!");
    } catch (err) {
      alert("❌ Gagal update data marketing");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 bg-white rounded shadow w-100">
      <h2 className="text-lg font-bold">Edit Data Marketing</h2>

      {/* contoh: Buyer Name */}
      <div>
        <label className="block text-sm font-medium">Buyer Name</label>
        <input
          type="text"
          name="buyer_name"
          value={form.buyer_name || ""}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
      </div>

      {/* contoh: Input By pakai dropdown */}
      <div>
        <label className="block text-sm font-medium">Input By</label>
        <CustomDropdown
          options={dropdownData.users}
          value={form.input_by}
          onChange={(val) => setForm({ ...form, input_by: val })}
          newItem={inputByNew}
          setNewItem={setInputByNew}
          addNew={addMarketingUser}
          placeholder="Pilih Marketing user"
        />
      </div>

      {/* kamu bisa copy dropdown lain persis dari DataMarketingForm */}
      {/* tinggal ganti value={form.field} onChange={(val) => setForm({...form, field: val})} */}

      <button type="submit" className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700">
        Update
      </button>
    </form>
  );
// };

// export default EditDataMarketingForm;



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
  getDataMarketingById,   // ✅ endpoint baru
  updateDataMarketing,    // ✅ update API
  addMarketingUser,
  addAccountMusic,
  addOfferTypeMusic,
  addTrackType,
  addGenreMusic,
  addProjectTypeMusic,
  addOrderTypeMusic,
  addKuponDiskon,
  addKepalaDivisi
} from "../services/ApiServices";

import CustomDropdown from "../marketing/CustomDropdown";

const EditDataMarketingForm = ({ marketingId }) => {
  const [dropdownData, setDropdownData] = useState({});
  const [form, setForm] = useState(null);

  const [inputByNew, setInputByNew] = useState("");
  const [accByNew, setAccByNew] = useState("");
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
        const [users, accs, accounts, offers, trackTypes, genres, projectType, orderType, kuponDiskon, marketing] = await Promise.all([
          getAllMarketingUsers(),
          getAllKepalaDivisi(),
          getAllAccountsMusic(),
          getAllOfferTypesMusic(),
          getAllTrackTypes(),
          getAllGenresMusic(),
          getAllProjectTypesMusic(),
          getAllOrderTypesMusic(),
          getAllKuponDiskon(),
          getDataMarketingById(marketingId), // fetch data marketing by id
        ]);

        setDropdownData({
          users: users.map((u) => ({ id: u.id, name: u.nama_marketing })),
          accs: accs.data.map((a) => ({ id: a.id, name: a.nama })),
          accounts: accounts.map((ac) => ({ id: ac.id, name: ac.nama_account })),
          offers: offers.map((of) => ({ id: of.id, name: of.offer_name })),
          trackTypes: trackTypes.map((tt) => ({ id: tt.id, name: tt.track_name })),
          genres: genres.map((g) => ({ id: g.id, name: g.genre_name })),
          projectType: projectType.map((pt) => ({ id: pt.id, name: pt.nama_project })),
          orderType: orderType.map((ot) => ({ id: ot.id, name: ot.order_name })),
          kuponDiskon: kuponDiskon.map((kd) => ({ id: kd.id, name: kd.nama_kupon })),
        });

        // ✅ set form awal dengan data dari API
        setForm(marketing);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [marketingId]);

  if (!form) return <p>Loading...</p>;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateDataMarketing(marketingId, form);
      alert("✅ Data marketing berhasil diperbarui!");
    } catch (err) {
      alert("❌ Gagal update data marketing");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 bg-white rounded shadow w-100">
      <h2 className="text-lg font-bold">Edit Data Marketing</h2>

      {/* contoh: Buyer Name */}
      <div>
        <label className="block text-sm font-medium">Buyer Name</label>
        <input
          type="text"
          name="buyer_name"
          value={form.buyer_name || ""}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
      </div>

      {/* contoh: Input By pakai dropdown */}
      <div>
        <label className="block text-sm font-medium">Input By</label>
        <CustomDropdown
          options={dropdownData.users}
          value={form.input_by}
          onChange={(val) => setForm({ ...form, input_by: val })}
          newItem={inputByNew}
          setNewItem={setInputByNew}
          addNew={addMarketingUser}
          placeholder="Pilih Marketing user"
        />
      </div>

      {/* kamu bisa copy dropdown lain persis dari DataMarketingForm */}
      {/* tinggal ganti value={form.field} onChange={(val) => setForm({...form, field: val})} */}

      <button type="submit" className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700">
        Update
      </button>
    </form>
  );
};

export default EditDataMarketingForm;
