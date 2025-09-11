import React, { useEffect, useState } from 'react';
import { useSnackbar } from '../context/Snackbar';
import { IoCreate } from 'react-icons/io5';
import BootstrapTooltip from '../components/Tooltip';
import { HiXMark } from 'react-icons/hi2';
import '../style/pages/FormDataMarketing.css';
import { addMarketingDesignJoined, addKepalaDivisiDesign, addOfferTypeDesign, addStyleDesign, createAccountDesign, createMarketingDesainUser, getAllAccountDesign, getAllKepalaDivisiDesign, getAllMarketingDesainUsers, getAllOfferTypesDesign, getAllStatusProjectDesign, getAllStyleDesign } from '../services/ApiServices';
import CustomDropdownDesign from '../marketing/CustomDropdownDesign';

const FormMarketingDesignExample = () => {
  const { showSnackbar } = useSnackbar();
  const [dropdownData, setDropdownData] = useState({ users: [], accs: [], statusAccept: [], accounts: [], offers: [], style: [] });

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
    reference: "",
    resolution: ""
  });

  const [inputByNew, setInputByNew] = useState("");
  const [accByNew, setAccByNew] = useState("");
  const [accountNew, setAccountNew] = useState("");
  const [newOffer, setNewOffer] = useState("");
  const [newStyle, setNewStyle] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const users = await getAllMarketingDesainUsers();
        const accArray = await getAllKepalaDivisiDesign();
        const statusAccept = await getAllStatusProjectDesign();
        const accounts = await getAllAccountDesign();
        const offers = await getAllOfferTypesDesign();
        const style = await getAllStyleDesign();

        setDropdownData({
          users: users.data.map(u => ({ id: u.id, name: u.nama_marketing })),
          accs: accArray.data.map(a => ({ id: a.id, name: a.nama })),
          statusAccept: statusAccept.data.map(s => ({ id: s.id, name: s.status_name })),
          accounts: accounts.data.map(ac => ({ id: ac.id, name: ac.nama_account })),
          offers: offers.data.map(of => ({ id: of.id, name: of.offer_name })),
          style: style.data.map(s => ({ id: s.id, name: s.style_name }))
        });
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
      }
    };
    fetchData();
  }, []);

  const handleAddInputBy = async () => {
    if (!inputByNew.trim()) return;
    const res = await createMarketingDesainUser({ nama_marketing: inputByNew, divisi: "Marketing Desain" });
    const created = res.data;
    setDropdownData(prev => ({ ...prev, users: [...prev.users, { id: created.id, name: created.nama_marketing }] }));
    setForm({ ...form, input_by: created.id });
    setInputByNew("");
  };

  const handleAccBy = async () => {
    if (!accByNew.trim()) return;
    const res = await addKepalaDivisiDesign({ nama: accByNew, divisi: "Marketing Design" });
    const created = res.data;
    setDropdownData(prev => ({ ...prev, accs: [...prev.accs, { id: created.id, name: created.nama }] }));
    setForm({ ...form, acc_by: created.id });
    setAccByNew("");
  };

  const handleAddAccount = async () => {
    if (!accountNew.trim()) return;
    const created = await createAccountDesign({ nama_account: accountNew });
    setDropdownData(prev => ({ ...prev, accounts: [...prev.accounts, { id: created.id, name: created.nama_account }] }));
    setForm({ ...form, account: created.id });
    setAccountNew("");
  };

  const handleAddOffer = async () => {
    if (!newOffer.trim()) return;
    const created = await addOfferTypeDesign({ offer_name: newOffer });
    setDropdownData(prev => ({ ...prev, offers: [...prev.offers, { id: created.id, name: created.offer_name }] }));
    setForm({ ...form, offer_type: created.id });
    setNewOffer("");
  };

  const handleAddStyle = async () => {
    if (!newStyle.trim()) return;
    const res = await addStyleDesign({ style_name: newStyle });
    const created = res.data;
    setDropdownData(prev => ({ ...prev, style: [...prev.style, { id: created.id, name: created.style_name }] }));
    setForm({ ...form, style_id: created.id });
    setNewStyle("");
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addMarketingDesignJoined(form);
      showSnackbar('Data Marketing Design berhasil ditambahkan!', 'success');
      // reset form
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
        reference: "",
        resolution: ""
      });
    } catch (err) {
      console.error("❌ Error submit data marketing:", err);
      showSnackbar('Gagal menyimpan data marketing!', 'error');
    }
  };

  return (
    <div className="fdm-container">
      <div className="fdm-header">
        <div className="fmdh-left">
          <div className="header-icon"><IoCreate size={15} /></div>
          <h4>CREATE DATA MARKETING DESIGN</h4>
        </div>
        <BootstrapTooltip title='close' placement='top'>
          <HiXMark className="fdm-icon" />
        </BootstrapTooltip>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-new">
          <div className="form-content">
            <h4>INFORMASI PESANAN</h4>
            <div className="sec-content">
              <div className="box-content">
                <label>Input By</label>
                <CustomDropdownDesign
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

              <div className="box-content">
                <label>Accept By</label>
                <CustomDropdownDesign
                  options={dropdownData.accs}
                  value={form.acc_by}
                  onChange={(val) => setForm({ ...form, acc_by: val })}
                  newItem={accByNew}
                  setNewItem={setAccByNew}
                  addNew={handleAccBy}
                  placeholder="Accepted by"
                  searchPlaceholder="Search kadiv..."
                  addPlaceholder="Add new accepted user..."
                />
              </div>

              <div className="box-content">
                <label>Status</label>
                <CustomDropdownDesign
                  options={dropdownData.statusAccept}
                  value={form.status_project_id}
                  onChange={(val) => setForm({ ...form, status_project_id: val })}
                  placeholder="Pilih status project"
                  searchPlaceholder="Search status..."
                />
              </div>

              <div className="box-content">
                <label>Buyer Name</label>
                <input type="text" name="buyer_name" value={form.buyer_name} onChange={handleChange} placeholder="Buyer Name" />
              </div>

              <div className="box-content">
                <label>Code Order</label>
                <input type="text" name="code_order" value={form.code_order} onChange={handleChange} placeholder="Code Order" />
              </div>

              <div className="box-content">
                <label>Order Number</label>
                <input type="text" name="order_number" value={form.order_number} onChange={handleChange} placeholder="Order Number" />
              </div>

              <div className="box-content">
                <label>Account</label>
                <CustomDropdownDesign
                  options={dropdownData.accounts}
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

            {/* DETAIL PESANAN */}
            <div className="form-content">
              <h4>DETAIL PESANAN</h4>
              <div className="sec-content">
                <div className="box-content">
                  <label>Jumlah Design</label>
                  <input type="text" name="jumlah_design" value={form.jumlah_design} onChange={handleChange} placeholder="Jumlah Design" />
                </div>

                <div className="box-content">
                  <label>Jumlah Revisi</label>
                  <input type="text" name="jumlah_revisi" value={form.jumlah_revisi} onChange={handleChange} placeholder="Jumlah Revisi" />
                </div>

                <div className="box-content">
                  <label>Order Type</label>
                  <input type="text" name="order_type_id" value={form.order_type_id} onChange={handleChange} placeholder="Order Type" />
                </div>

                <div className="box-content">
                  <label>Offer Type</label>
                  <CustomDropdownDesign
                    options={dropdownData.offers}
                    value={form.offer_type}
                    onChange={(val) => setForm({ ...form, offer_type: val })}
                    newItem={newOffer}
                    setNewItem={setNewOffer}
                    addNew={handleAddOffer}
                    placeholder="Pilih Offer"
                    searchPlaceholder="Search offer..."
                    addPlaceholder="Add new offer..."
                  />
                </div>

                <div className="box-content">
                  <label>Deadline</label>
                  <input type="date" name="deadline" value={form.deadline} onChange={handleChange} placeholder="Deadline" />
                </div>
              </div>
            </div>

            {/* DETAIL DESIGN */}
            <div className="form-content">
              <h4>DETAIL DESIGN</h4>
              <div className="sec-content">
                <div className="box-content">
                  <label>Style</label>
                  <CustomDropdownDesign
                    options={dropdownData.style}
                    value={form.style_id}
                    onChange={(val) => setForm({ ...form, style_id: val })}
                    newItem={newStyle}
                    setNewItem={setNewStyle}
                    addNew={handleAddStyle}
                    placeholder="Pilih Style"
                    searchPlaceholder="Search style..."
                    addPlaceholder="Add new style..."
                  />
                </div>

                <div className="box-content">
                  <label>Resolution</label>
                  <input type="text" name="resolution" value={form.resolution} onChange={handleChange} placeholder="Resolution" />
                </div>

                <div className="box-content">
                  <label>Required Files</label>
                  <input type="text" name="required_files" value={form.required_files} onChange={handleChange} placeholder="Required files" />
                </div>
              </div>
            </div>

            {/* HARGA */}
            <div className="form-content">
              <h4>INFORMASI HARGA DAN DISKON</h4>
              <div className="sec-content">
                <div className="box-content">
                  <label>Price Normal</label>
                  <input type="text" name="price_normal" value={form.price_normal} onChange={handleChange} placeholder="Price normal" />
                </div>
                <div className="box-content">
                  <label>Price Discount</label>
                  <input type="text" name="price_discount" value={form.price_discount} onChange={handleChange} placeholder="Price discount" />
                </div>
                <div className="box-content">
                  <label>Discount %</label>
                  <input type="text" name="discount_percentage" value={form.discount_percentage} onChange={handleChange} placeholder="Discount %" />
                </div>
              </div>
            </div>

            {/* REFERENCE AND FILE */}
            <div className="form-content">
              <h4>REFERENCE AND FILES</h4>
              <div className="sec-content">
                <div className="box-content">
                  <label>Reference</label>
                  <input type="text" name="reference" value={form.reference} onChange={handleChange} placeholder="https://example.com" />
                </div>
                <div className="box-content">
                  <label>File and Chat</label>
                  <input type="text" name="file_and_chat" value={form.file_and_chat} onChange={handleChange} placeholder="File and chat" />
                </div>
              </div>
            </div>

            <div className="form-content">
              <h4>Detail Project</h4>
              <div className="sec-content">
                <div className="box-content">
                  <label>Detail</label>
                  <textarea name="detail_project" value={form.detail_project} onChange={handleChange} placeholder="Detail project" />
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="btn-form">
          <button type='submit'>SUBMIT NEW DATA</button>
        </div>
      </form>
    </div>
  )
};

export default FormMarketingDesignExample;




// POST create new marketing_design_joined
app.post('/api/marketing-design-joined', async (req, res) => {
  try {
    const {
      buyer_name,
      code_order,
      order_number,
      jumlah_design,
      deadline,
      jumlah_revisi,
      price_normal,
      price_discount,
      discount_percentage,
      required_files,
      file_and_chat,
      detail_project,
      input_by,
      acc_by,
      account,
      offer_type,
      project_type_id,
      style_id,
      status_project_id,
      reference,
      resolution
    } = req.body;

    // Insert ke tabel marketing_design
    const insertQuery = `
      INSERT INTO marketing_design
      (buyer_name, code_order, order_number, jumlah_design, deadline, jumlah_revisi, 
      price_normal, price_discount, discount_percentage, required_files, file_and_chat, 
      detail_project, input_by, acc_by, account, offer_type, project_type_id, style_id, 
      status_project_id, reference, resolution)
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
      RETURNING *;
    `;

    const values = [
      buyer_name, code_order, order_number, jumlah_design, deadline, jumlah_revisi,
      price_normal, price_discount, discount_percentage, required_files, file_and_chat,
      detail_project, input_by, acc_by, account, offer_type, project_type_id, style_id,
      status_project_id, reference, resolution
    ];

    const result = await client.query(insertQuery, values);
    const newMarketingDesign = result.rows[0];

    // Ambil data join untuk response
    const joinedQuery = `
      SELECT md.*, mu.nama_marketing AS input_by_name, kd.nama AS acc_by_name,
             ac.nama_account AS account_name, ot.offer_name AS offer_type_name,
             st.style_name, sp.status_name
      FROM marketing_design md
      LEFT JOIN marketing_desain_user mu ON md.input_by = mu.id
      LEFT JOIN kepala_divisi_design kd ON md.acc_by = kd.id
      LEFT JOIN account_design ac ON md.account = ac.id
      LEFT JOIN offer_type_design ot ON md.offer_type = ot.id
      LEFT JOIN style_design st ON md.style_id = st.id
      LEFT JOIN status_project_design sp ON md.status_project_id = sp.id
      WHERE md.id = $1;
    `;

    const joinedResult = await client.query(joinedQuery, [newMarketingDesign.id]);

    res.json(joinedResult.rows[0]);
  } catch (err) {
    console.error("❌ Failed to create marketing_design:", err);
    res.status(500).json({ error: "Failed to create marketing_design" });
  }
});



// ✅ UPDATE Data Marketing Design by ID
app.put("/api/marketing-design/joined/:id", async (req, res) => {
    const { id } = req.params;
    const {
        buyer_name,
        code_order,
        order_number,
        jumlah_design,
        deadline,
        jumlah_revisi,
        price_normal,
        price_discount,
        discount_percentage,
        required_files,
        file_and_chat,
        detail_project,
        input_by,
        acc_by,
        account,
        offer_type,
        project_type_id,
        style_id,
        status_project_id,
    } = req.body;

    try {
        const result = await client.query(
            `
      UPDATE marketing_design
      SET 
        buyer_name          = $1,
        code_order          = $2,
        order_number        = $3,
        jumlah_design       = $4,
        deadline            = $5,
        jumlah_revisi       = $6,
        price_normal        = $7,
        price_discount      = $8,
        discount_percentage = $9,
        required_files      = $10,
        file_and_chat       = $11,
        detail_project      = $12,
        input_by            = $13,
        acc_by              = $14,
        account             = $15,
        offer_type          = $16,
        project_type_id     = $17,
        style_id            = $18,
        status_project_id   = $19,
        update_at           = NOW()
      WHERE marketing_design_id = $20
      RETURNING *;
      `,
            [
                // buyer_name,
                // code_order,
                // order_number,
                // jumlah_design,
                deadline,
                // jumlah_revisi,
                price_normal,
                price_discount,
                discount_percentage,
                required_files,
                file_and_chat,
                detail_project,
                // input_by,
                // acc_by,
                // account,
                // offer_type,
                // project_type_id,
                style_id,
                status_project_id,
                id,
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "❌ Marketing design not found" });
        }

        // Ambil data dengan join supaya konsisten
        const joined = await client.query(
            `
      SELECT 
        md.marketing_design_id,
        md.buyer_name,
        md.code_order,
        md.order_number,
        md.jumlah_design,
        md.deadline,
        md.jumlah_revisi,
        md.price_normal,
        md.price_discount,
        md.discount_percentage,
        md.required_files,
        md.file_and_chat,
        md.detail_project,
        md.create_at,
        md.update_at,

        mdu.id AS input_by,
        mdu.nama_marketing AS input_by_name,
        mdu.divisi AS input_by_divisi,

        kdd.id AS acc_by,
        kdd.nama AS acc_by_name,
        kdd.divisi AS acc_by_divisi,

        ad.id AS account,
        ad.nama_account AS account_name,

        ot.id AS offer_type,
        ot.offer_name AS offer_type_name,

        pt.id AS project_type,
        pt.project_name AS project_type_name,

        sd.id AS style,
        sd.style_name AS style_name,

        sp.id AS status_project,
        sp.status_name AS status_project_name

      FROM marketing_design md
      LEFT JOIN marketing_desain_user mdu ON md.input_by = mdu.id
      LEFT JOIN kepala_divisi_design kdd ON md.acc_by = kdd.id
      LEFT JOIN account_design ad ON md.account = ad.id
      LEFT JOIN offer_type_design ot ON md.offer_type = ot.id
      LEFT JOIN project_type_design pt ON md.project_type_id = pt.id
      LEFT JOIN style_design sd ON md.style_id = sd.id
      LEFT JOIN status_project_design sp ON md.status_project_id = sp.id
      WHERE md.marketing_design_id = $1
      `,
            [id]
        );

        res.json({
            message: "✅ Marketing design updated successfully",
            data: joined.rows[0],
        });
    } catch (err) {
        console.error("❌ Error updating marketing_design:", err);
        res.status(500).json({ error: "Failed to update marketing_design" });
    }
});


// Tambah data marketing_design baru (lengkap dengan order_type)
app.post("/api/marketing-design/joined", async (req, res) => {
    const {
        buyer_name,
        code_order,
        order_number,
        jumlah_design,
        deadline,
        jumlah_revisi,
        price_normal,
        price_discount,
        discount_percentage,
        required_files,
        file_and_chat,
        detail_project,
        input_by,          // ID dari marketing_desain_user
        acc_by,            // ID dari kepala_divisi_design
        account,           // ID dari account_design
        offer_type,        // ID dari offer_type_design
        order_type,        // ✅ Tambahan
        project_type_id,   // ID dari project_type_design
        style_id,          // ID dari style_design
        status_project_id  // ID dari status_project_design
    } = req.body;

    try {
        // Insert data baru
        const result = await client.query(
            `
            INSERT INTO marketing_design (
                buyer_name,
                code_order,
                order_number,
                jumlah_design,
                deadline,
                jumlah_revisi,
                price_normal,
                price_discount,
                discount_percentage,
                required_files,
                file_and_chat,
                detail_project,
                input_by,
                acc_by,
                account,
                offer_type,
                order_type,        -- ✅ Tambahan
                project_type_id,
                style_id,
                status_project_id,
                create_at,
                update_at
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,NOW(),NOW())
            RETURNING *;
            `,
            [

                buyer_name,
                code_order,
                order_number,
                jumlah_design,
                deadline,
                jumlah_revisi,
                price_normal,
                price_discount,
                discount_percentage,
                required_files,
                file_and_chat,
                detail_project,
                input_by,
                acc_by,
                account,
                offer_type,
                order_type,         // ✅ Tambahan
                project_type_id,
                style_id,
                status_project_id,
                resolution,
                reference
            ]
        );

        // Ambil data baru dengan join
        const joined = await client.query(
            `
            SELECT 
                md.marketing_design_id,
                md.buyer_name,
                md.code_order,
                md.order_number,
                md.jumlah_design,
                md.deadline,
                md.jumlah_revisi,
                md.price_normal,
                md.price_discount,
                md.discount_percentage,
                md.required_files,
                md.file_and_chat,
                md.detail_project,
                md.order_type,           -- ✅ Tambahan
                md.create_at,
                md.update_at,

                mdu.id AS input_by,
                mdu.nama_marketing AS input_by_name,
                mdu.divisi AS input_by_divisi,

                kdd.id AS acc_by,
                kdd.nama AS acc_by_name,

                ad.id AS account,
                ad.nama_account AS account_name,

                ot.id AS offer_type,
                ot.offer_name AS offer_type_name,

                pt.id AS project_type,
                pt.project_name AS project_type_name,

                sd.id AS style,
                sd.style_name AS style_name,

                sp.id AS status_project,
                sp.status_name AS status_project_name

            FROM marketing_design md
            LEFT JOIN marketing_desain_user mdu ON md.input_by = mdu.id
            LEFT JOIN kepala_divisi_design kdd ON md.acc_by = kdd.id
            LEFT JOIN account_design ad ON md.account = ad.id
            LEFT JOIN offer_type_design ot ON md.offer_type = ot.id
            LEFT JOIN project_type_design pt ON md.project_type_id = pt.id
            LEFT JOIN style_design sd ON md.style_id = sd.id
            LEFT JOIN status_project_design sp ON md.status_project_id = sp.id
            WHERE md.marketing_design_id = $1
            `,
            [result.rows[0].marketing_design_id]
        );

        res.status(201).json({
            message: "✅ Marketing design created successfully",
            data: joined.rows[0],
        });
    } catch (err) {
        console.error("❌ Error creating marketing_design:", err);
        res.status(500).json({ error: "Failed to create marketing_design" });
    }
});
