// src/marketing/NewMarketingDesignForm.jsx
import React, { useState, useEffect } from "react";
import { addMarketingDesignJoined, getAllMarketingUsers, getAllKepalaDivisiDesign, getAllAccountsDesign, getAllOfferTypesDesign, getAllProjectTypesDesign, getAllStylesDesign, getAllStatusProjectsDesign } from "../services/ApiServices";
import { useSnackbar } from "../context/Snackbar";

const NewMarketingDesignForm = () => {
  const { showSnackbar } = useSnackbar();
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
  });

  // dropdown data
  const [dropdown, setDropdown] = useState({
    users: [],
    accs: [],
    accounts: [],
    offers: [],
    projects: [],
    styles: [],
    statuses: [],
  });

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const users = await getAllMarketingUsers();
        const accs = await getAllKepalaDivisiDesign();
        const accounts = await getAllAccountsDesign();
        const offers = await getAllOfferTypesDesign();
        const projects = await getAllProjectTypesDesign();
        const styles = await getAllStylesDesign();
        const statuses = await getAllStatusProjectsDesign();

        setDropdown({
          users: users.map((u) => ({ id: u.id, name: u.nama_marketing })),
          accs: accs.map((a) => ({ id: a.id, name: a.nama })),
          accounts: accounts.map((acc) => ({ id: acc.id, name: acc.nama_account })),
          offers: offers.map((o) => ({ id: o.id, name: o.offer_name })),
          projects: projects.map((p) => ({ id: p.id, name: p.project_name })),
          styles: styles.map((s) => ({ id: s.id, name: s.style_name })),
          statuses: statuses.map((st) => ({ id: st.id, name: st.status_name })),
        });
      } catch (err) {
        console.error("❌ Error fetch dropdown:", err);
      }
    };
    fetchDropdowns();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addMarketingDesignJoined(form);
      showSnackbar("✅ Data Marketing Design berhasil dibuat", "success");
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
      });
    } catch (err) {
      console.error("❌ Insert error:", err);
      showSnackbar("Gagal menambahkan data", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-3 bg-white rounded shadow">
      <h2 className="text-lg font-semibold">Tambah Data Marketing Design</h2>
      
      <input type="text" name="buyer_name" value={form.buyer_name} onChange={handleChange} placeholder="Buyer Name" className="w-full p-2 border rounded" />

      <input type="text" name="code_order" value={form.code_order} onChange={handleChange} placeholder="Code Order" className="w-full p-2 border rounded" />

      <input type="text" name="order_number" value={form.order_number} onChange={handleChange} placeholder="Order Number" className="w-full p-2 border rounded" />

      <input type="number" name="jumlah_design" value={form.jumlah_design} onChange={handleChange} placeholder="Jumlah Design" className="w-full p-2 border rounded" />

      <input type="date" name="deadline" value={form.deadline} onChange={handleChange} className="w-full p-2 border rounded" />

      <input type="number" name="jumlah_revisi" value={form.jumlah_revisi} onChange={handleChange} placeholder="Jumlah Revisi" className="w-full p-2 border rounded" />

      <input type="number" name="price_normal" value={form.price_normal} onChange={handleChange} placeholder="Price Normal" className="w-full p-2 border rounded" />

      <input type="number" name="price_discount" value={form.price_discount} onChange={handleChange} placeholder="Price Discount" className="w-full p-2 border rounded" />

      <input type="number" name="discount_percentage" value={form.discount_percentage} onChange={handleChange} placeholder="Discount %" className="w-full p-2 border rounded" />

      <input type="text" name="required_files" value={form.required_files} onChange={handleChange} placeholder="Required Files" className="w-full p-2 border rounded" />

      <input type="text" name="file_and_chat" value={form.file_and_chat} onChange={handleChange} placeholder="File & Chat" className="w-full p-2 border rounded" />

      <textarea name="detail_project" value={form.detail_project} onChange={handleChange} placeholder="Detail Project" className="w-full p-2 border rounded" />

      {/* Dropdowns */}
      <select name="input_by" value={form.input_by} onChange={handleChange} className="w-full p-2 border rounded">
        <option value="">-- Input By --</option>
        {dropdown.users.map((u) => (
          <option key={u.id} value={u.id}>{u.name}</option>
        ))}
      </select>

      <select name="acc_by" value={form.acc_by} onChange={handleChange} className="w-full p-2 border rounded">
        <option value="">-- ACC By --</option>
        {dropdown.accs.map((a) => (
          <option key={a.id} value={a.id}>{a.name}</option>
        ))}
      </select>

      <select name="account" value={form.account} onChange={handleChange} className="w-full p-2 border rounded">
        <option value="">-- Account --</option>
        {dropdown.accounts.map((acc) => (
          <option key={acc.id} value={acc.id}>{acc.name}</option>
        ))}
      </select>

      <select name="offer_type" value={form.offer_type} onChange={handleChange} className="w-full p-2 border rounded">
        <option value="">-- Offer Type --</option>
        {dropdown.offers.map((o) => (
          <option key={o.id} value={o.id}>{o.name}</option>
        ))}
      </select>

      <select name="project_type_id" value={form.project_type_id} onChange={handleChange} className="w-full p-2 border rounded">
        <option value="">-- Project Type --</option>
        {dropdown.projects.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      <select name="style_id" value={form.style_id} onChange={handleChange} className="w-full p-2 border rounded">
        <option value="">-- Style --</option>
        {dropdown.styles.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      <select name="status_project_id" value={form.status_project_id} onChange={handleChange} className="w-full p-2 border rounded">
        <option value="">-- Status Project --</option>
        {dropdown.statuses.map((st) => (
          <option key={st.id} value={st.id}>{st.name}</option>
        ))}
      </select>

      <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded">
        Simpan
      </button>
    </form>
  );
};

export default NewMarketingDesignForm;
