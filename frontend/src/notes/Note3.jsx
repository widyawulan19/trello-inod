import React, { useEffect, useState, useRef } from "react";
import {
  getAllMarketingUsers,
  getAllAccountsMusic,
  getAllProjectTypesMusic,
  getAllOfferTypesMusic,
  getAllTrackTypes,
  getAllGenresMusic,
  getAllOrderTypesMusic,
} from "../services/ApiServices";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const CustomDropdown = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  // add marketing user 
  const [newItem, setNewItem] = useState("");
  const [list, setList] = useState(options || []);

  const ref = useRef();

  const handleSelect = (id) => {
    onChange(id);
    setIsOpen(false);
  };

  // Tutup dropdown kalau klik di luar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // marketing user 
  const handleAddNew = async () => {
    if (!newItem.trim()) return;
    try {
      const created = await addMarketingUser({ nama_marketing: newItem, divisi: "Marketing" });
      setList([...list, created]);
      setNewItem("");
      onChange(created.id); // langsung pilih item baru
      setIsOpen(false);
    } catch (err) {
      console.error("❌ Gagal tambah marketing user:", err);
      alert("Gagal tambah marketing user");
    }
  };

  return (
    <div className="relative w-full" ref={ref}>
      <div
        className="p-2 border rounded cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {options.find((o) => o.id === value)?.name || placeholder}
      </div>

      {isOpen && (
        <ul className="absolute z-10 w-full overflow-y-auto bg-white border max-h-48">
          {options.map((o) => (
            <li
              key={o.id}
              className="p-2 cursor-pointer hover:bg-blue-100"
              onClick={() => handleSelect(o.id)}
            >
              {o.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const DataMarketingForm = () => {
  const [dropdownData, setDropdownData] = useState({});
  const [form, setForm] = useState({
    buyer_name: "",
    code_order: "",
    input_by: "",
    account: "",
    project_type: "",
    offer_type: "",
    track_type: "",
    genre: "",
    order_type: "",
  });

  useEffect(() => {
    const fetchDropdowns = async () => {
      const users = await getAllMarketingUsers();
      const accounts = await getAllAccountsMusic();
      const projects = await getAllProjectTypesMusic();
      const offers = await getAllOfferTypesMusic();
      const tracks = await getAllTrackTypes();
      const genres = await getAllGenresMusic();
      const orders = await getAllOrderTypesMusic();

      setDropdownData({
        users,
        accounts,
        projects,
        offers,
        tracks,
        genres,
        orders,
      });
    };

    fetchDropdowns();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/data-marketing`, form);
      alert("✅ Data marketing berhasil ditambahkan!");
      setForm({
        buyer_name: "",
        code_order: "",
        input_by: "",
        account: "",
        project_type: "",
        offer_type: "",
        track_type: "",
        genre: "",
        order_type: "",
      });
    } catch (err) {
      console.error("❌ Gagal simpan data marketing:", err);
      alert("❌ Gagal simpan data marketing");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 bg-white rounded shadow w-96">
      <h2 className="text-lg font-bold">Tambah Data Marketing</h2>

      {/* Buyer Name */}
      <input
        type="text"
        name="buyer_name"
        value={form.buyer_name}
        onChange={handleChange}
        placeholder="Buyer Name"
        className="w-full p-2 border rounded"
      />

      {/* Code Order */}
      <input
        type="text"
        name="code_order"
        value={form.code_order}
        onChange={handleChange}
        placeholder="Code Order"
        className="w-full p-2 border rounded"
      />

      {/* Input By */}
      <CustomDropdown
        options={dropdownData.users?.map(u => ({ id: u.id, name: `${u.nama_marketing} (${u.divisi})` })) || []}
        value={form.input_by}
        onChange={(val) => setForm({ ...form, input_by: val })}
        placeholder="Pilih Marketing User"
      />

      {/* Account */}
      <CustomDropdown
        options={dropdownData.accounts?.map(a => ({ id: a.id, name: a.nama_account })) || []}
        value={form.account}
        onChange={(val) => setForm({ ...form, account: val })}
        placeholder="Pilih Account"
      />

      {/* Project Type */}
      <CustomDropdown
        options={dropdownData.projects?.map(p => ({ id: p.id, name: p.nama_project })) || []}
        value={form.project_type}
        onChange={(val) => setForm({ ...form, project_type: val })}
        placeholder="Pilih Project Type"
      />

      {/* Offer Type */}
      <CustomDropdown
        options={dropdownData.offers?.map(o => ({ id: o.id, name: o.offer_name })) || []}
        value={form.offer_type}
        onChange={(val) => setForm({ ...form, offer_type: val })}
        placeholder="Pilih Offer Type"
      />

      {/* Track Type */}
      <CustomDropdown
        options={dropdownData.tracks?.map(t => ({ id: t.id, name: t.track_name })) || []}
        value={form.track_type}
        onChange={(val) => setForm({ ...form, track_type: val })}
        placeholder="Pilih Track Type"
      />

      {/* Genre */}
      <CustomDropdown
        options={dropdownData.genres?.map(g => ({ id: g.id, name: g.genre_name })) || []}
        value={form.genre}
        onChange={(val) => setForm({ ...form, genre: val })}
        placeholder="Pilih Genre"
      />

      {/* Order Type */}
      <CustomDropdown
        options={dropdownData.orders?.map(o => ({ id: o.id, name: o.order_name })) || []}
        value={form.order_type}
        onChange={(val) => setForm({ ...form, order_type: val })}
        placeholder="Pilih Order Type"
      />

      <button
        type="submit"
        className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
      >
        Simpan
      </button>
    </form>
  );
};

export default DataMarketingForm;
