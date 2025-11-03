
//MARKETING DESIGN JOINED
// ✅ Get all marketing_design + join
app.get("/api/marketing-design/joined", async (req, res) => {
  try {
    const result = await client.query(`
      SELECT 
        md.marketing_design_id,
        md.buyer_name,
        md.code_order,
        md.jumlah_design,
        md.order_number,
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

        -- Relasi (balikin ID + Nama)
        mdu.id AS input_by,
        mdu.nama_marketing AS input_by_name,
        mdu.divisi AS input_by_divisi,

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
      LEFT JOIN account_design ad ON md.account = ad.id
      LEFT JOIN offer_type_design ot ON md.offer_type = ot.id
      LEFT JOIN project_type_design pt ON md.project_type_id = pt.id
      LEFT JOIN style_design sd ON md.style_id = sd.id
      LEFT JOIN status_project_design sp ON md.status_project_id = sp.id
      ORDER BY md.marketing_design_id DESC;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error get joined marketing_design:", err);
    res.status(500).json({ error: "Failed to fetch joined data" });
  }
});


// ✅ Get marketing_design by ID + join
app.get("/api/marketing-design/joined/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await client.query(`
      SELECT 
        md.marketing_design_id,
        md.buyer_name,
        md.code_order,
        md.jumlah_design,
        md.order_number,
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

        -- Relasi (balikin ID + Nama)
        mdu.id AS input_by,
        mdu.nama_marketing AS input_by_name,
        mdu.divisi AS input_by_divisi,

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
      LEFT JOIN account_design ad ON md.account = ad.id
      LEFT JOIN offer_type_design ot ON md.offer_type = ot.id
      LEFT JOIN project_type_design pt ON md.project_type_id = pt.id
      LEFT JOIN style_design sd ON md.style_id = sd.id
      LEFT JOIN status_project_design sp ON md.status_project_id = sp.id
      WHERE md.marketing_design_id = $1;
    `, [id]);

    if (result.rows.length === 0) return res.status(404).json({ error: "Marketing design not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error get marketing_design by ID:", err);
    res.status(500).json({ error: "Failed to fetch joined data" });
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
    account,
    offer_type,
    project_type_id,
    style_id,
    status_project_id
  } = req.body;

  try {
    const result = await client.query(
      `
      UPDATE marketing_design
      SET 
        buyer_name        = $1,
        code_order        = $2,
        order_number      = $3,
        jumlah_design     = $4,
        deadline          = $5,
        jumlah_revisi     = $6,
        price_normal      = $7,
        price_discount    = $8,
        discount_percentage = $9,
        required_files    = $10,
        file_and_chat     = $11,
        detail_project    = $12,
        input_by          = $13,
        account           = $14,
        offer_type        = $15,
        project_type_id   = $16,
        style_id          = $17,
        status_project_id = $18,
        update_at         = NOW()
      WHERE marketing_design_id = $19
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
        account,
        offer_type,
        project_type_id,
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


// END MARKERING DESING JOINED 

//12. get laporan data otomatis per 10 hari berjalan
// ✅ Endpoint untuk data marketing_design hari ini + join
app.get('/api/marketing-design/reports/today', async (req, res) => {
  try {
    const result = await client.query(`
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
      LEFT JOIN account_design ad ON md.account = ad.id
      LEFT JOIN offer_type_design ot ON md.offer_type = ot.id
      LEFT JOIN project_type_design pt ON md.project_type_id = pt.id
      LEFT JOIN style_design sd ON md.style_id = sd.id
      LEFT JOIN status_project_design sp ON md.status_project_id = sp.id
      WHERE DATE(md.create_at) = CURRENT_DATE
      ORDER BY md.marketing_design_id DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error report today:", err);
    res.status(500).json({ error: err.message });
  }
});



// ✅ Endpoint marketing-design per 10 hari dengan detail + join
app.get("/api/marketing-design/reports", async (req, res) => {
  try {
    const result = await client.query(`
      SELECT
        DATE_TRUNC('month', md.create_at) AS month,
        FLOOR((EXTRACT(DAY FROM md.create_at) - 1) / 10) + 1 AS period,
        COUNT(*) AS total,
        ARRAY_AGG(md.marketing_design_id) AS ids,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'marketing_design_id', md.marketing_design_id,
            'card_id', md.card_id,
            'buyer_name', md.buyer_name,
            'code_order', md.code_order,
            'order_number', md.order_number,
            'jumlah_design', md.jumlah_design,
            'deadline', md.deadline,
            'jumlah_revisi', md.jumlah_revisi,
            'price_normal', md.price_normal,
            'price_discount', md.price_discount,
            'discount_percentage', md.discount_percentage,
            'required_files', md.required_files,
            'file_and_chat', md.file_and_chat,
            'detail_project', md.detail_project,
            'create_at', md.create_at,
            'update_at', md.update_at,

            -- Relasi (balikin ID + Nama)
            'input_by', mdu.id,
            'input_by_name', mdu.nama_marketing,
            'account', ad.id,
            'account_name', ad.nama_account,
            'offer_type', ot.id,
            'offer_type_name', ot.offer_name,
            'project_type', pt.id,
            'project_type_name', pt.project_name,
            'style', sd.id,
            'style_name', sd.style_name,
            'status_project', sp.id,
            'status_project_name', sp.status_name
          )
        ) AS details
      FROM marketing_design md
      LEFT JOIN marketing_desain_user mdu ON md.input_by = mdu.id
      LEFT JOIN account_design ad ON md.account = ad.id
      LEFT JOIN offer_type_design ot ON md.offer_type = ot.id
      LEFT JOIN project_type_design pt ON md.project_type_id = pt.id
      LEFT JOIN style_design sd ON md.style_id = sd.id
      LEFT JOIN status_project_design sp ON md.status_project_id = sp.id
      GROUP BY month, period
      ORDER BY month DESC, period ASC;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Query error:", err.message);
    res.status(500).json({ error: err.message });
  }
});


