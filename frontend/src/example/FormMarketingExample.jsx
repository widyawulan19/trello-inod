import React, { useEffect, useState, useRef } from "react";
import { getAllMarketingUsers, addMarketingUser, addDataMarketing } from "../services/ApiServices";


// Custom dropdown dengan fitur add new
const CustomDropdownAdd = ({ options, value, onChange, placeholder, newItem, setNewItem, addNew }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(""); // state search
  const ref = useRef();

  const handleSelect = (id) => {
    onChange(id);
    setIsOpen(false);
    setSearch("");
  };

  // Tutup dropdown jika klik di luar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter options berdasarkan search
  const filteredOptions = options.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

return (
  // SHOW DROPWDON 

  //1. DROPDWON INPUT BY (BY MARKETING USER)
    <div className="relative w-full" ref={ref}>
      <div
        className="border p-2 rounded cursor-pointer flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{options.find(o => o.id === value)?.name || placeholder}</span>
        <span className={isOpen ? "rotate-180 transition-transform" : "transition-transform"}>▼</span>
      </div>

      {isOpen && (
        <ul className="absolute z-10 w-full border bg-white max-h-56 overflow-y-auto mt-1 shadow-md rounded">
          {/* Search Input */}
          <li className="p-2 border-b">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari..."
              className="w-full p-1 border rounded"
            />
          </li>

          {/* List Filtered Options */}
          {filteredOptions.map(o => (
            <li
              key={o.id}
              className="p-2 cursor-pointer hover:bg-blue-100"
              onClick={() => handleSelect(o.id)}
            >
              {o.name}
            </li>
          ))}

          {/* Add New */}
          <li className="p-2 border-t mt-1 flex space-x-2">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Tambah Marketing User..."
              className="border p-1 flex-1 rounded"
            />
            <button
              type="button"
              onClick={addNew}
              className="px-2 text-white bg-green-500 rounded hover:bg-green-600"
            >
              Tambah
            </button>
          </li>
        </ul>
      )}
    </div>
  );
};

 // END SHOW DROPWDON 


// MAIN FORM 

const DataMarketingForm = () => {
  const [dropdownData, setDropdownData] = useState({ users: [] });
  const [form, setForm] = useState({
    buyer_name: "",
    code_order: "",
    input_by: "",
  });
  const [inputByNew, setInputByNew] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      const users = await getAllMarketingUsers();
      // format untuk dropdown: {id, name}
      setDropdownData({
        users: users.map(u => ({ id: u.id, name: `${u.nama_marketing} (${u.divisi})` }))
      });
    };
    fetchUsers();
  }, []);

  // Fungsi add new marketing user
  const handleAddInputBy = async () => {
    if (!inputByNew.trim()) return;
    try {
      const created = await addMarketingUser({ nama_marketing: inputByNew, divisi: "Marketing" });
      const newOption = { id: created.id, name: `${created.nama_marketing} (${created.divisi})` };
      setDropdownData({ users: [...dropdownData.users, newOption] });
      setForm({ ...form, input_by: created.id });
      setInputByNew("");
    } catch (err) {
      console.error("❌ Gagal tambah marketing user:", err);
      alert("Gagal tambah marketing user");
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDataMarketing(form); // pakai API service
      alert("✅ Data marketing berhasil ditambahkan!");
      setForm({ buyer_name: "", code_order: "", input_by: "" });
    } catch (err) {
      console.error("❌ Gagal simpan data marketing:", err);
      alert("❌ Gagal simpan data marketing");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 bg-white rounded shadow w-100">
      <h2 className="text-lg font-bold">Tambah Data Marketing</h2>

      <div className="box-form-content" style={{border:'1px solid red'}}>
        <div className="section-main">
          <h4>Informasi Pesanan</h4>
          <div className="main-section" style={{border:'1px solid blue', display:'grid', gridTemplateColumns:'repeat(3,1fr)'}}>
              {/* Input By */}
                <div className="box-form">
                  <label className="block text-sm font-medium">Input By</label>
                  <CustomDropdownAdd
                    options={dropdownData.users}
                    value={form.input_by}
                    onChange={(val) => setForm({ ...form, input_by: val })}
                    newItem={inputByNew}
                    setNewItem={setInputByNew}
                    addNew={handleAddInputBy}
                    placeholder="Pilih Marketing User"
                  />
                </div>

                {/* Acc By */}
                <div className="box-form">
                  <label className="block text-sm font-medium">Acc By</label>
                   <input
                    type="text"
                    name="acc_by"
                    value={form.acc_by}
                    onChange={handleChange}
                    placeholder="Acc by"
                    className="w-full p-2 border rounded"
                  />
                </div>

              {/* Buyer Name */}
                <div className="box-form">
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

                {/* Code Order */}
                <div className="box-form">
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
                

                
            </div>
          </div>
      
        </div>
      

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
