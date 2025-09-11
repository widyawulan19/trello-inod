import React, { useState } from "react";
import { useSnackbar } from "../context/Snackbar";
import { addMarketingDesignJoined } from "../services/ApiServices";
import { HiXMark } from "react-icons/hi2";
import { IoCreate } from "react-icons/io5";
import BootstrapTooltip from "../components/Tooltip";
import CustomDropdownDesign from "../marketing/CustomDropdownDesign";

const FormMarketingDesignExample = ({ dropdownData, fetchData }) => {
  const { showSnackbar } = useSnackbar();

  // ✅ Form sesuai endpoint backend
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

  // State untuk "add new item"
  const [newInputBy, setNewInputBy] = useState("");
  const [newAccBy, setNewAccBy] = useState("");
  const [newAccount, setNewAccount] = useState("");
  const [newOffer, setNewOffer] = useState("");
  const [newProjectType, setNewProjectType] = useState("");
  const [newStyle, setNewStyle] = useState("");
  const [newStatus, setNewStatus] = useState("");

  // Input Change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Reset Form
  const resetForm = () => {
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
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addMarketingDesignJoined(form);
      showSnackbar("✅ Data berhasil ditambahkan", "success");
      resetForm();
      setIsOpen(false);
      fetchData(); // refresh list
    } catch (err) {
      console.error("❌ Error submit:", err);
      showSnackbar("Gagal menambahkan data", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {!isOpen ? (
        <BootstrapTooltip title="Tambah Data Marketing Design">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 text-white bg-green-500 rounded-full shadow hover:bg-green-600"
          >
            <IoCreate size={20} />
          </button>
        </BootstrapTooltip>
      ) : (
        <div className="p-4 bg-white border rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Tambah Data Marketing Design</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-red-500"
            >
              <HiXMark size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            {/* Buyer Name */}
            <div>
              <label>Buyer Name</label>
              <input
                type="text"
                name="buyer_name"
                value={form.buyer_name}
                onChange={handleChange}
                placeholder="Buyer Name"
                className="input-box"
              />
            </div>

            {/* Code Order */}
            <div>
              <label>Code Order</label>
              <input
                type="text"
                name="code_order"
                value={form.code_order}
                onChange={handleChange}
                placeholder="Code Order"
                className="input-box"
              />
            </div>

            {/* Order Number */}
            <div>
              <label>Order Number</label>
              <input
                type="text"
                name="order_number"
                value={form.order_number}
                onChange={handleChange}
                placeholder="Order Number"
                className="input-box"
              />
            </div>

            {/* Jumlah Design */}
            <div>
              <label>Jumlah Design</label>
              <input
                type="text"
                name="jumlah_design"
                value={form.jumlah_design}
                onChange={handleChange}
                placeholder="Jumlah Design"
                className="input-box"
              />
            </div>

            {/* Deadline */}
            <div>
              <label>Deadline</label>
              <input
                type="date"
                name="deadline"
                value={form.deadline}
                onChange={handleChange}
                className="input-box"
              />
            </div>

            {/* Jumlah Revisi */}
            <div>
              <label>Jumlah Revisi</label>
              <input
                type="text"
                name="jumlah_revisi"
                value={form.jumlah_revisi}
                onChange={handleChange}
                placeholder="Jumlah Revisi"
                className="input-box"
              />
            </div>

            {/* Price Normal */}
            <div>
              <label>Price Normal</label>
              <input
                type="text"
                name="price_normal"
                value={form.price_normal}
                onChange={handleChange}
                placeholder="Price Normal"
                className="input-box"
              />
            </div>

            {/* Price Discount */}
            <div>
              <label>Price Discount</label>
              <input
                type="text"
                name="price_discount"
                value={form.price_discount}
                onChange={handleChange}
                placeholder="Price Discount"
                className="input-box"
              />
            </div>

            {/* Discount % */}
            <div>
              <label>Discount %</label>
              <input
                type="text"
                name="discount_percentage"
                value={form.discount_percentage}
                onChange={handleChange}
                placeholder="Discount %"
                className="input-box"
              />
            </div>

            {/* Required Files */}
            <div>
              <label>Required Files</label>
              <input
                type="text"
                name="required_files"
                value={form.required_files}
                onChange={handleChange}
                placeholder="Required Files"
                className="input-box"
              />
            </div>

            {/* File & Chat */}
            <div>
              <label>File & Chat</label>
              <input
                type="text"
                name="file_and_chat"
                value={form.file_and_chat}
                onChange={handleChange}
                placeholder="File & Chat"
                className="input-box"
              />
            </div>

            {/* Detail Project */}
            <div className="col-span-2">
              <label>Detail Project</label>
              <textarea
                name="detail_project"
                value={form.detail_project}
                onChange={handleChange}
                placeholder="Detail Project"
                className="input-box"
              />
            </div>

            {/* Input By */}
            <CustomDropdownDesign
              label="Input By"
              options={dropdownData.users}
              value={form.input_by}
              onChange={(val) => setForm({ ...form, input_by: val })}
              newItem={newInputBy}
              setNewItem={setNewInputBy}
              addNew={dropdownData.handleAddUser}
              placeholder="Pilih Input By"
              searchPlaceholder="Cari user..."
              addPlaceholder="Tambah user baru..."
            />

            {/* Acc By */}
            <CustomDropdownDesign
              label="Acc By"
              options={dropdownData.accs}
              value={form.acc_by}
              onChange={(val) => setForm({ ...form, acc_by: val })}
              newItem={newAccBy}
              setNewItem={setNewAccBy}
              addNew={dropdownData.handleAddAcc}
              placeholder="Pilih Kepala Divisi"
              searchPlaceholder="Cari kepala divisi..."
              addPlaceholder="Tambah kepala divisi..."
            />

            {/* Account */}
            <CustomDropdownDesign
              label="Account"
              options={dropdownData.accounts}
              value={form.account}
              onChange={(val) => setForm({ ...form, account: val })}
              newItem={newAccount}
              setNewItem={setNewAccount}
              addNew={dropdownData.handleAddAccount}
              placeholder="Pilih Account"
              searchPlaceholder="Cari account..."
              addPlaceholder="Tambah account..."
            />

            {/* Offer Type */}
            <CustomDropdownDesign
              label="Offer Type"
              options={dropdownData.offers}
              value={form.offer_type}
              onChange={(val) => setForm({ ...form, offer_type: val })}
              newItem={newOffer}
              setNewItem={setNewOffer}
              addNew={dropdownData.handleAddOffer}
              placeholder="Pilih Offer"
              searchPlaceholder="Cari offer..."
              addPlaceholder="Tambah offer baru..."
            />

            {/* Project Type */}
            <CustomDropdownDesign
              label="Project Type"
              options={dropdownData.projectTypes}
              value={form.project_type_id}
              onChange={(val) => setForm({ ...form, project_type_id: val })}
              newItem={newProjectType}
              setNewItem={setNewProjectType}
              addNew={dropdownData.handleAddProjectType}
              placeholder="Pilih Project Type"
              searchPlaceholder="Cari project type..."
              addPlaceholder="Tambah project type..."
            />

            {/* Style */}
            <CustomDropdownDesign
              label="Style"
              options={dropdownData.styles}
              value={form.style_id}
              onChange={(val) => setForm({ ...form, style_id: val })}
              newItem={newStyle}
              setNewItem={setNewStyle}
              addNew={dropdownData.handleAddStyle}
              placeholder="Pilih Style"
              searchPlaceholder="Cari style..."
              addPlaceholder="Tambah style..."
            />

            {/* Status Project */}
            <CustomDropdownDesign
              label="Status Project"
              options={dropdownData.statuses}
              value={form.status_project_id}
              onChange={(val) => setForm({ ...form, status_project_id: val })}
              newItem={newStatus}
              setNewItem={setNewStatus}
              addNew={dropdownData.handleAddStatus}
              placeholder="Pilih Status"
              searchPlaceholder="Cari status..."
              addPlaceholder="Tambah status baru..."
            />

            {/* Submit */}
            <div className="flex justify-end col-span-2 gap-2 mt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default FormMarketingDesignExample;
