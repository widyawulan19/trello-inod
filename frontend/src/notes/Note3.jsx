

[
    {
        "marketing_design_id": 78,
        "buyer_name": "BUDI",
        "code_order": "1124",
        "jumlah_design": 5,
        "order_number": "1111",
        "deadline": "2025-09-20T00:00:00.000Z",
        "jumlah_revisi": 5,
        "price_normal": "80",
        "price_discount": "0",
        "discount_percentage": "0",
        "required_files": "null",
        "file_and_chat": "https://example.com",
        "detail_project": "detail project",
        "create_at": null,
        "update_at": "2025-09-12T15:45:36.262Z",
        "card_id": 436,
        "input_by_id": 2,
        "input_by_name": "AYU",
        "acc_by_id": 2,
        "acc_by_name": "AARON",
        "account_id": 2,
        "account_name": "BLAUPATKA",
        "offer_type_id": 3,
        "offer_type_name": "NEW ORDER",
        "project_type_id": 3,
        "project_type_name": "RECREATE",
        "style_id": 4,
        "style_name": "RECREATE",
        "status_project_id": 2,
        "status_project_name": "ON PROGRESS",
        "order_type_id": null,
        "order_type_name": null
    }
]


import React, { useState, useEffect } from "react";
import { updateMarketingDesign } from "../services/ApiServices";
import { useParams, useNavigate } from "react-router-dom";

const EditMarketingDesign = () => {
  const { id } = useParams(); // Ambil id dari URL
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
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
    order_type_id: "",
    project_type_id: "",
    style_id: "",
    status_project_id: "",
    resolution: "",
  });

  // Handler untuk ubah isi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await updateMarketingDesign(id, formData);
      console.log("✅ Update berhasil:", res.data);
      alert("✅ Data berhasil diupdate!");
      navigate(`/marketing-design/${id}`); // Redirect ke detail
    } catch (err) {
      console.error("❌ Error update:", err);
      alert("❌ Gagal update data!");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h2>Edit Marketing Design</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Buyer Name:</label>
          <input
            type="text"
            name="buyer_name"
            value={formData.buyer_name}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Code Order:</label>
          <input
            type="text"
            name="code_order"
            value={formData.code_order}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Order Number:</label>
          <input
            type="text"
            name="order_number"
            value={formData.order_number}
            onChange={handleChange}
          />
        </div>
        {/* Tambahkan semua input sesuai formData */}
        <button type="submit">Update</button>
      </form>
    </div>
  );
};

export default EditMarketingDesign;
