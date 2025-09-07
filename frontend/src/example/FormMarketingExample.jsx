import React, { useState, useEffect, useCallback } from "react";
import { addDataMarketing, addMarketingUser, getAllMarketingUsers } from "../services/ApiServices";

const FormMarketingExample = () => {
  const [form, setForm] = useState({
    input_by: "",
    acc_by: "",
    buyer_name: "",
  });
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ nama_marketing: "", divisi: "" });

  // ✅ Fetch Users (dibungkus useCallback supaya bisa dipanggil ulang)
  const fetchUsers = useCallback(async () => {
    try {
      const data = await getAllMarketingUsers();
      console.log("📌 Users fetched:", data);
      setUsers(data || []); // fallback array kosong
    } catch (err) {
      console.error("❌ Gagal ambil marketing users:", err);
      setUsers([]);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ✅ Submit Data Marketing
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDataMarketing(form);
      alert("✅ Data marketing berhasil dibuat!");
      setForm({ input_by: "", acc_by: "", buyer_name: "" });
    } catch (err) {
      console.error("❌ Gagal simpan data marketing:", err);
      alert("❌ Gagal simpan data marketing");
    }
  };

  // ✅ Submit Marketing User Baru
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await addMarketingUser(newUser);
      alert("✅ Marketing user berhasil ditambahkan!");
      setNewUser({ nama_marketing: "", divisi: "" });
      fetchUsers(); // refresh dropdown
    } catch (err) {
      console.error("❌ Gagal tambah marketing user:", err);
      alert("❌ Gagal tambah marketing user");
    }
  };

  return (
    <div>
      <h2>Tambah Data Marketing</h2>
      <form
  onSubmit={handleSubmit}
  style={{
    border: "1px solid green",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "20px",
    height:'70vh',
    overflowY:'auto',
    margin: "0 auto",
  }}
>
  {/* Dropdown Input By */}
  <label>Input By</label>
  <select
    value={form.input_by}
    onChange={(e) => setForm({ ...form, input_by: e.target.value })}
    required
  >
    <option value="">-- Pilih Marketing --</option>
    {Array.isArray(users) &&
      users.map((user) => (
        <option key={user.id} value={user.id}>
          {user.nama_marketing} ({user.divisi})
        </option>
      ))}
  </select>

  <label>Acc By</label>
  <input
    type="text"
    value={form.acc_by}
    onChange={(e) => setForm({ ...form, acc_by: e.target.value })}
    required
  />

  <label>Buyer Name</label>
  <input
    type="text"
    value={form.buyer_name}
    onChange={(e) => setForm({ ...form, buyer_name: e.target.value })}
    required
  />

  <label>Code Order</label>
  <input
    type="text"
    value={form.code_order}
    onChange={(e) => setForm({ ...form, code_order: e.target.value })}
  />

  <label>Order Number</label>
  <input
    type="text"
    value={form.order_number}
    onChange={(e) => setForm({ ...form, order_number: e.target.value })}
  />

  <label>Account</label>
  <input
    type="text"
    value={form.account}
    onChange={(e) => setForm({ ...form, account: e.target.value })}
  />

  <label>Deadline</label>
  <input
    type="date"
    value={form.deadline}
    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
  />

  <label>Jumlah Revisi</label>
  <input
    type="number"
    value={form.jumlah_revisi}
    onChange={(e) => setForm({ ...form, jumlah_revisi: e.target.value })}
  />

  <label>Order Type</label>
  <input
    type="text"
    value={form.order_type}
    onChange={(e) => setForm({ ...form, order_type: e.target.value })}
  />

  <label>Offer Type</label>
  <input
    type="text"
    value={form.offer_type}
    onChange={(e) => setForm({ ...form, offer_type: e.target.value })}
  />

  <label>Jenis Track</label>
  <input
    type="text"
    value={form.jenis_track}
    onChange={(e) => setForm({ ...form, jenis_track: e.target.value })}
  />

  <label>Genre</label>
  <input
    type="text"
    value={form.genre}
    onChange={(e) => setForm({ ...form, genre: e.target.value })}
  />

  <label>Price</label>
  <input
    type="number"
    value={form.price}
    onChange={(e) => setForm({ ...form, price: e.target.value })}
  />

  <label>Required File</label>
  <input
    type="text"
    value={form.required_file}
    onChange={(e) => setForm({ ...form, required_file: e.target.value })}
  />

  <label>Project Type</label>
  <input
    type="text"
    value={form.project_type}
    onChange={(e) => setForm({ ...form, project_type: e.target.value })}
  />

  <label>Duration</label>
  <input
    type="text"
    value={form.duration}
    onChange={(e) => setForm({ ...form, duration: e.target.value })}
  />

  <label>Reference</label>
  <input
    type="text"
    value={form.reference}
    onChange={(e) => setForm({ ...form, reference: e.target.value })}
  />

  <label>File & Chat</label>
  <input
    type="text"
    value={form.file_and_chat}
    onChange={(e) => setForm({ ...form, file_and_chat: e.target.value })}
  />

  <label>Detail Project</label>
  <textarea
    rows="3"
    value={form.detail_project}
    onChange={(e) => setForm({ ...form, detail_project: e.target.value })}
  />

  <button type="submit">Simpan Data Marketing</button>
</form>


      <hr />

      <h3>Tambah Marketing User Baru</h3>
      <form onSubmit={handleAddUser}>
        <label>Nama Marketing</label>
        <input
          type="text"
          value={newUser.nama_marketing}
          onChange={(e) =>
            setNewUser({ ...newUser, nama_marketing: e.target.value })
          }
          required
        />

        <label>Divisi</label>
        <input
          type="text"
          value={newUser.divisi}
          onChange={(e) => setNewUser({ ...newUser, divisi: e.target.value })}
          required
        />

        <button type="submit">Tambah User</button>
      </form>
    </div>
  );
};

export default FormMarketingExample;
