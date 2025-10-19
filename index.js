require("dotenv").config(); // wajib paling atas sebelum import lain
const express = require("express");
const client = require('./connection');
const bodyParser = require('body-parser');
const cors = require('cors');
const moment = require('moment');
const bcrypt = require('bcryptjs');
const { logActivity } = require('./ActivityLogger');
const { logCardActivity } = require('./CardLogActivity');
require('./CronJob');
const { SystemNotification } = require('./SystemNotification');
const upload = require('./upload');
const cloudinary = require('./CloudinaryConfig');
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const dotenv = require("dotenv");
const { google } = require("googleapis");
const dayjs = require("dayjs");
require("dayjs/locale/id");  // aktifkan bahasa Indonesia
dayjs.locale("id");





//TOP
dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
    // origin: "*",
    // origin: ["http://localhost:3000", "https://inodstudiomanagement.vercel.app"],
    origin: ["http://localhost:3000", "https://trello-inod.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));


console.log("JWT_SECRET:", process.env.JWT_SECRET);

// Ambil spreadsheetId dari environment variable
const spreadsheetId = process.env.SPREADSHEET_ID;

// 🔑 Ambil credential dari ENV (Railway)
const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

// Middleware untuk mensimulasikan login
const simulateLogin = (req, res, next) => {
    req.user = { id: 3 }; // ID pengguna simulasi, misalnya 1
    next();
};
app.use(simulateLogin);
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
    res.send("Server is running on port " + PORT);
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Middleware verifyToken

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid or expired token' });
        req.user = user; // simpan payload token
        next();
    });
};

// send token to user mail 
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "your.email@gmail.com",
        pass: "your_app_password",
    }
})

// DATA MARKETING DESIGN 
// Endpoint untuk export data Marketing Design ke Google Sheets
// Endpoint untuk export data Design ke Google Sheets
app.post("/api/export-design-to-sheet", async (req, res) => {
    try {
        const { designData } = req.body; // Data dari frontend

        const clientAuth = await auth.getClient();
        const sheets = google.sheets({ version: "v4", auth: clientAuth });

        console.log("📤 Data Design yang dikirim:", designData);

        // 1. Masukin data ke Google Sheets (tab Design)
        await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.SPREADSHEET_ID,
            range: "Design!A:Z",
            valueInputOption: "RAW",
            requestBody: {
                values: [[
                    designData.project_number,
                    designData.input_by_name,
                    designData.acc_by_name,
                    designData.buyer_name,
                    designData.code_order,
                    designData.order_number,
                    designData.account_name,
                    designData.deadline,
                    designData.jumlah_design,
                    designData.jumlah_revisi,
                    designData.order_type_name,
                    designData.offer_type_name,
                    designData.project_type_name,
                    designData.style_name,
                    designData.status_project_name,
                    designData.resolution,
                    designData.reference,
                    designData.price_normal,
                    designData.price_discount,
                    designData.discount_percentage,
                    designData.required_files,
                    designData.file_and_chat,
                    designData.detail_project
                ]],
            },
        });

        res.json({
            success: true,
            message: "✅ Data Design berhasil masuk ke Google Sheet (Design tab)",
        });
    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({
            success: false,
            message: "Gagal update Google Sheet untuk Design",
        });
    }
});


// ===============================
// RESTORE SATU DATA DARI GOOGLE SHEET BY PROJECT NUMBER
// ===============================
app.post("/api/restore-marketing-design", async (req, res) => {
    try {
        const { project_number } = req.body;
        if (!project_number) {
            return res.status(400).json({
                success: false,
                message: "❌ project_number wajib dikirim di body request.",
            });
        }

        const clientAuth = await auth.getClient();
        const sheets = google.sheets({ version: "v4", auth: clientAuth });

        // Ambil data dari Google Sheet (tab Design)
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SPREADSHEET_ID,
            range: "Design!A:Z",
        });

        const rows = response.data.values;
        if (!rows || rows.length <= 1) {
            return res.status(404).json({
                success: false,
                message: "❌ Tidak ada data di Google Sheet (tab Design).",
            });
        }

        const dataRows = rows.slice(1);
        const matchedRow = dataRows.find((row) => row[0] === project_number);

        if (!matchedRow) {
            return res.status(404).json({
                success: false,
                message: `❌ Data dengan project_number '${project_number}' tidak ditemukan di Google Sheet.`,
            });
        }

        const [
            project_number_val,
            input_by_name,
            acc_by_name,
            buyer_name,
            code_order,
            order_number,
            account_name,
            deadline,
            jumlah_design,
            jumlah_revisi,
            order_type_name,
            offer_type_name,
            project_type_name,
            style_name,
            status_project_name,
            resolution,
            reference,
            price_normal,
            price_discount,
            discount_percentage,
            required_files,
            file_and_chat,
            detail_project,
        ] = matchedRow;

        // Fungsi bantu ambil ID berdasarkan nama tabel relasi
        const getId = async (table, column, value) => {
            if (!value) return null;
            const result = await client.query(
                `SELECT id FROM ${table} WHERE ${column} = $1 LIMIT 1`,
                [value]
            );
            return result.rows[0]?.id || null;
        };

        const input_by_id = await getId("marketing_desain_user", "nama_marketing", input_by_name);
        const acc_by_id = await getId("kepala_divisi_design", "nama", acc_by_name);
        const account_id = await getId("account_design", "nama_account", account_name);
        const offer_type_id = await getId("offer_type_design", "offer_name", offer_type_name);
        const project_type_id = await getId("project_type_design", "project_name", project_type_name);
        const style_id = await getId("style_design", "style_name", style_name);
        const status_project_id = await getId("status_project_design", "status_name", status_project_name);
        const order_type_id = await getId("design_order_type", "order_name", order_type_name);

        // 🔍 Cek apakah data sudah ada berdasarkan project_number
        const existing = await client.query(
            `SELECT marketing_design_id FROM marketing_design WHERE project_number = $1 LIMIT 1`,
            [project_number_val]
        );

        let result;
        if (existing.rows.length > 0) {
            // 🔄 UPDATE data lama
            result = await client.query(
                `
        UPDATE marketing_design
        SET
          buyer_name = $1,
          code_order = $2,
          jumlah_design = $3,
          order_number = $4,
          deadline = $5,
          jumlah_revisi = $6,
          resolution = $7,
          price_normal = $8,
          price_discount = $9,
          discount_percentage = $10,
          required_files = $11,
          reference = $12,
          file_and_chat = $13,
          detail_project = $14,
          input_by = $15,
          acc_by = $16,
          account = $17,
          offer_type = $18,
          project_type_id = $19,
          style_id = $20,
          status_project_id = $21,
          order_type_id = $22,
          is_deleted = false,
          update_at = NOW()
        WHERE project_number = $23
        RETURNING *;
        `,
                [
                    buyer_name,
                    code_order,
                    jumlah_design,
                    order_number,
                    deadline || null,
                    jumlah_revisi,
                    resolution,
                    price_normal,
                    price_discount,
                    discount_percentage,
                    required_files,
                    reference,
                    file_and_chat,
                    detail_project,
                    input_by_id,
                    acc_by_id,
                    account_id,
                    offer_type_id,
                    project_type_id,
                    style_id,
                    status_project_id,
                    order_type_id,
                    project_number_val,
                ]
            );
        } else {
            // ➕ INSERT data baru
            result = await client.query(
                `
        INSERT INTO marketing_design (
          buyer_name, code_order, jumlah_design, order_number, deadline,
          jumlah_revisi, resolution, price_normal, price_discount,
          discount_percentage, required_files, reference, file_and_chat,
          detail_project, input_by, acc_by, account, offer_type,
          project_type_id, style_id, status_project_id, order_type_id,
          project_number, is_deleted, create_at, update_at
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,
          $15,$16,$17,$18,$19,$20,$21,$22,$23,false,NOW(),NOW()
        )
        RETURNING *;
        `,
                [
                    buyer_name,
                    code_order,
                    jumlah_design,
                    order_number,
                    deadline || null,
                    jumlah_revisi,
                    resolution,
                    price_normal,
                    price_discount,
                    discount_percentage,
                    required_files,
                    reference,
                    file_and_chat,
                    detail_project,
                    input_by_id,
                    acc_by_id,
                    account_id,
                    offer_type_id,
                    project_type_id,
                    style_id,
                    status_project_id,
                    order_type_id,
                    project_number_val,
                ]
            );
        }

        res.json({
            success: true,
            message: `✅ Data marketing_design '${project_number}' berhasil direstore dari Google Sheet.`,
            data: result.rows[0],
        });
    } catch (error) {
        console.error("❌ Gagal restore data marketing_design:", error);
        res.status(500).json({
            success: false,
            message: "Gagal restore data marketing_design dari Google Sheet.",
            error: error.message,
        });
    }
});




// POST /api/marketing-design-export
app.post("/api/marketing-design-export", async (req, res) => {
    const { marketingDesignId } = req.body;
    const exportedBy = "admin"; // default user / bisa ambil dari req.user

    try {
        // Cek apakah sudah ada di marketing_design_exports
        const checkQuery = `SELECT * FROM marketing_design_exports WHERE marketing_design_id = $1`;
        const { rows: existing } = await client.query(checkQuery, [marketingDesignId]);

        if (existing.length > 0) {
            return res.status(200).json({ message: "Marketing design data already exported" });
        }

        // Insert baru
        const insertQuery = `
            INSERT INTO marketing_design_exports (marketing_design_id, exported_by, exported_at)
            VALUES ($1, $2, NOW())
            RETURNING *
        `;
        const { rows: inserted } = await client.query(insertQuery, [marketingDesignId, exportedBy]);

        res.status(201).json({ message: "Marketing design exported successfully", data: inserted[0] });
    } catch (err) {
        console.error("❌ Error export marketing design:", err);
        res.status(500).json({ message: "Server error" });
    }
});

//GET SEMUA DATA EXPORT MARKETING DESIGN
app.get('/api/marketing-design-export', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM marketing_design_exports ORDER BY exported_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error get all data marketing design export', error);
        res.status(500).json({ success: false, message: "Gagal ambil data" });
    }
})

// GET /api/marketing-design-export/:id
app.get("/api/marketing-design-export/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const query = `SELECT * FROM marketing_design_exports WHERE marketing_design_id = $1`;
        const { rows } = await client.query(query, [id]);
        res.json({ exported: rows.length > 0, data: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});


// END DATA MARKEGING DESIGN 



// Endpoint untuk export data ke Google Sheets
app.post("/api/export-to-sheet", async (req, res) => {
    try {
        const { marketingData } = req.body;

        const client = await auth.getClient();
        const sheets = google.sheets({ version: "v4", auth: client });

        console.log("📤 Data yang dikirim:", marketingData); // cek di logs

        //merubah format deadline
        const deadline = marketingData.deadline
            ? new Date(marketingData.deadline).toLocaleDateString("id-ID") // 25/9/2025
            : "";

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: "Musik!A:Y", // A sampai Y (25 kolom sesuai header)
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: [[

                    marketingData.project_number || "",
                    marketingData.input_by_name || "",     // Input by (A)
                    marketingData.acc_by_name || "",       // Acc by (B)
                    marketingData.buyer_name || "",        // Buyer name (C)
                    marketingData.code_order || "",        // Code order (D)
                    marketingData.order_number || "",      // Order number (E)
                    marketingData.account_name || "",      // Account name (F)
                    // marketingData.deadline || "",          // Deadline (G)
                    deadline,
                    marketingData.jumlah_revisi || "",     // Jumlah revisi (H)
                    marketingData.order_type_name || "",   // Order type (I)
                    marketingData.offer_type_name || "",   // Offer type (J)
                    marketingData.track_type_name || "",   // Jenis track (K)
                    marketingData.genre_name || "",        // Genre (L)
                    marketingData.price_normal || "",      // Price normal (M)
                    marketingData.price_discount || "",    // Price discount (N)
                    marketingData.discount || "",          // Discount (O)
                    marketingData.basic_price || "",       // Basic price (P)
                    marketingData.kupon_diskon_name || "", // Kupon name (Q)
                    marketingData.gig_link || "",          // Gig link (R)
                    marketingData.required_files || "",    // Required file (S)
                    marketingData.project_type_name || "", // Project type (T)
                    marketingData.duration || "",          // Duration (U)
                    marketingData.reference_link || "",    // Reference link (V)
                    marketingData.file_and_chat_link || "",// File and chat (W)
                    marketingData.detail_project || "",    // Detail project (X)
                    marketingData.accept_status_name || "" // Accept status (Y)
                ]]
            }
        });


        res.json({ success: true, message: "✅ Data berhasil masuk ke Google Sheet" });
    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ success: false, message: "Gagal update Google Sheet" });
    }
});

// Export data marketing untuk banyak data ke Google Sheets 
app.post("/api/export-to-sheet", async (req, res) => {
    try {
        const { marketingDataList } = req.body; // kirim array dari frontend

        if (!Array.isArray(marketingDataList)) {
            return res.status(400).json({ success: false, message: "marketingDataList harus berupa array" });
        }

        const client = await auth.getClient();
        const sheets = google.sheets({ version: "v4", auth: client });

        // mapping semua object → array of array untuk Google Sheets
        const values = marketingDataList.map((data) => [
            data.project_number,
            data.input_by_name,
            data.acc_by_name,
            data.buyer_name,
            data.code_order,
            data.order_number,
            data.account_name,
            data.Deadline,
            data.jumlah_revisi,
            data.order_type_name,
            data.offer_type_name,
            data.jenis_track,
            data.genre_name,
            data.price_normal,
            data.price_discount,
            data.discount,
            data.basic_price,
            data.kupon_diskon_name,
            data.gig_link,
            data.required_files,
            data.project_type_name,
            data.duration,
            data.reference_link,
            data.file_and_chat_link,
            data.detail_project,
            data.accept_status_name,
        ]);

        // append semua baris ke Sheet
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: "Sheet1!A:Z", // cukup lebar biar semua kolom masuk
            valueInputOption: "RAW",
            requestBody: { values },
        });

        res.json({ success: true, message: `✅ ${values.length} data berhasil masuk ke Google Sheet` });
    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ success: false, message: "Gagal update Google Sheet" });
    }
});



// MARKETING EXPORT 
// 2. Ambil semua data export
app.get("/api/marketing-exports", async (req, res) => {
    try {
        const result = await client.query("SELECT * FROM marketing_exports ORDER BY exported_at DESC");
        res.json(result.rows);
    } catch (error) {
        console.error("❌ Error get marketing_exports:", error);
        res.status(500).json({ success: false, message: "Gagal ambil data" });
    }
});

// 3. Cek export untuk 1 marketingId
app.get("/api/marketing/with-export-status", async (req, res) => {
    try {
        const query = `
      SELECT 
        m.id,
        m.buyer_name,
        m.code_order,
        CASE 
          WHEN me.marketing_id IS NOT NULL THEN true
          ELSE false
        END AS is_exported
      FROM marketing m
      LEFT JOIN marketing_exports me
      ON m.id = me.marketing_id
      ORDER BY m.id ASC
    `;

        const { rows } = await client.query(query);

        res.status(200).json({
            message: "Marketing data with export status",
            data: rows,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});



// 4. Ambil semua marketing + status export
app.get("/api/marketing-exports/join", async (req, res) => {
    try {
        const result = await client.query(`
      SELECT dm.*, 
             CASE WHEN me.id IS NOT NULL THEN 'Sudah Transfile'
                  ELSE 'Belum Transfile'
             END AS export_status,
             me.exported_at,
             me.exported_by
      FROM data_marketing dm
      LEFT JOIN marketing_exports me 
        ON dm.marketing_id = me.marketing_id
      ORDER BY dm.marketing_id DESC
    `);

        res.json(result.rows);
    } catch (error) {
        console.error("❌ Error join marketing_exports:", error);
        res.status(500).json({ success: false, message: "Gagal ambil data join" });
    }
});

// Tambah data export untuk 1 marketing_id
// POST /api/marketing-export
app.post("/api/marketing-export", async (req, res) => {
    const { marketingId } = req.body;
    const exportedBy = "admin"; // default user

    try {
        // Cek apakah sudah ada di marketing_export
        const checkQuery = `SELECT * FROM marketing_exports WHERE marketing_id = $1`;
        const { rows: existing } = await client.query(checkQuery, [marketingId]);

        if (existing.length > 0) {
            return res.status(200).json({ message: "Marketing data already exported" });
        }

        // Insert baru
        const insertQuery = `
      INSERT INTO marketing_exports (marketing_id, exported_by, exported_at)
      VALUES ($1, $2, NOW())
      RETURNING *
    `;
        const { rows: inserted } = await client.query(insertQuery, [marketingId, exportedBy]);

        res.status(201).json({ message: "Marketing exported successfully", data: inserted[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});



// Cek apakah marketing_id sudah diexport
app.get("/api/marketing-exports/:marketingId", async (req, res) => {
    try {
        const { marketingId } = req.params;

        const result = await client.query(
            `SELECT * FROM marketing_exports WHERE marketing_id = $1`,
            [marketingId]
        );

        if (result.rows.length > 0) {
            res.json({ exported: true, data: result.rows[0] });
        } else {
            res.json({ exported: false });
        }
    } catch (error) {
        console.error("❌ Error cek marketing_export:", error);
        res.status(500).json({
            success: false,
            message: "Gagal cek marketing_export",
        });
    }
});



// END MARKETING EXPORT 



// USERS 
//REGISTER
// app.post("/api/auth/register", async (req, res) => {
//   const { username, email, password } = req.body;

//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const userResult = await client.query(
//       `INSERT INTO users (username, email, password)
//        VALUES ($1, $2, $3) RETURNING id, username, email`,
//       [username, email, hashedPassword]
//     );

//     const userId = userResult.rows[0].id;

//     // ✅ Insert default profil (misalnya profil ID 1)
//     await client.query(
//       `INSERT INTO user_profil (user_id, profil_id)
//        VALUES ($1, $2)`,
//       [userId, 1]
//     );

//     // ✅ Insert default data ke user_data
//     await client.query(
//       `INSERT INTO user_data (user_id, name, nomor, divisi, jabatan)
//        VALUES ($1, $2, $3, $4, $5)`,
//       [userId, '', '', 'Umum', 'Anggota'] // kamu bisa sesuaikan default-nya
//     );

//     res.status(201).json({ message: "User registered successfully", user: userResult.rows[0] });
//   } catch (error) {
//     console.error("Error during registration:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

//new register
app.post("/api/auth/register", async (req, res) => {
    const { username, email, password, security_question, security_answer } = req.body;

    try {
        // Hash password dan security answer
        const hashedPassword = await bcrypt.hash(password, 10);
        const hashedSecurityAnswer = await bcrypt.hash(security_answer, 10);

        // Simpan ke DB
        const userResult = await client.query(
            `INSERT INTO users (username, email, password, security_question, security_answer_hash)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, username, email, security_question`,
            [username, email, hashedPassword, security_question, hashedSecurityAnswer]
        );

        const userId = userResult.rows[0].id;

        // Insert default profil
        await client.query(
            `INSERT INTO user_profil (user_id, profil_id)
       VALUES ($1, $2)`,
            [userId, 1]
        );

        // Insert default user_data
        await client.query(
            `INSERT INTO user_data (user_id, name, nomor, divisi, jabatan)
       VALUES ($1, $2, $3, $4, $5)`,
            [userId, '', '', 'Umum', 'Anggota']
        );

        res.status(201).json({
            message: "User registered successfully",
            user: userResult.rows[0],
        });
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});






//LOGIN
app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        console.log("Login attempt:", email, password);

        const user = await client.query(`SELECT * FROM users WHERE email = $1`, [email]);
        console.log("User query result:", user.rows);

        if (user.rows.length === 0) return res.status(401).json({ message: "Invalid email" });

        const validPass = await bcrypt.compare(password, user.rows[0].password);
        console.log("Password valid:", validPass);

        if (!validPass) return res.status(401).json({ message: "Invalid password" });

        const token = jwt.sign(
            { id: user.rows[0].id, username: user.rows[0].username, email: user.rows[0].email },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            token,
            user: { id: user.rows[0].id, username: user.rows[0].username, email: user.rows[0].email },
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Error logging in", error: err.message || err });
    }
});

// RESSET PASS 
app.post("/api/auth/reset-password", async (req, res) => {
    const { email, security_question, security_answer, new_password } = req.body;

    try {
        // 1. Cari user berdasarkan email dan pertanyaan keamanan
        const userResult = await client.query(
            `SELECT id, security_answer_hash FROM users 
       WHERE email = $1 AND security_question = $2`,
            [email, security_question]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "User not found with that question and email" });
        }

        const user = userResult.rows[0];

        // 2. Bandingkan jawaban dengan hash yang tersimpan
        const isMatch = await bcrypt.compare(security_answer, user.security_answer_hash);

        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect security answer" });
        }

        // 3. Hash password baru
        const hashedNewPassword = await bcrypt.hash(new_password, 10);

        // 4. Update password di DB
        await client.query(
            `UPDATE users SET password = $1 WHERE id = $2`,
            [hashedNewPassword, user.id]
        );

        res.status(200).json({ message: "Password has been reset successfully" });
    } catch (error) {
        console.error("Error during password reset:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});



// HASH PASS MANUAL 
// TEMPORARY: hash existing user password
app.put("/api/auth/hash-password", async (req, res) => {
    const { email } = req.body;

    try {
        const user = await client.query(`SELECT * FROM users WHERE email = $1`, [email]);

        if (user.rows.length === 0) return res.status(404).json({ message: "User not found" });

        const plainPass = user.rows[0].password;

        // Hash password now
        const hashed = await bcrypt.hash(plainPass, 10);

        // Update to DB
        await client.query(`UPDATE users SET password = $1 WHERE email = $2`, [hashed, email]);

        res.json({ message: "Password hashed successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error hashing password" });
    }
});



//USER
//1. create a new user
app.post('/api/users', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const result = await client.query(
            `INSERT INTO users (username, email, password) 
        VALUES ($1, $2, $3) RETURNING id, username, email`,
            [username, email, password]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
//2. get all user
app.get('/api/users', async (req, res) => {
    try {
        const result = await client.query(
            `
        SELECT 
          u.id,
          u.username,
          u.email,
          p.photo_url,
          p.profile_name
        FROM users u
        LEFT JOIN user_profil up ON up.user_id = u.id
        LEFT JOIN profil p ON up.profil_id = p.id
        ORDER BY u.id
        `
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching all users with profile:', error);
        res.status(500).json({ error: 'Failed to fetch users.' });
    }
});

//3. get user by id
app.get('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await client.query('SELECT id, username, email, create_at FROM users WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

//4. update user
app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { username, email, password } = req.body;

    try {
        const result = await client.query(
            `UPDATE users SET username = $1, email = $2, password = $3 WHERE id = $4 RETURNING id, username, email, create_at`,
            [username, email, password, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
//5. delete user
app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await client.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
//6. mengatur ulang password
app.post('/api/users/:id/password-reset', async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body; // Password baru
    try {
        const result = await client.query(
            `UPDATE users SET password = $1 WHERE id = $2 RETURNING id, username`,
            [newPassword, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 7. GET user profile (nama, email, username, nomor wa, divisi, jabatan, photo_url)
app.get('/api/user-setting/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await client.query(`
      SELECT 
          u.id,
          u.username,
          u.email,
          u.create_at,
          ud.name,
          ud.nomor,
          ud.divisi,
          ud.jabatan,
          p.photo_url
      FROM 
          public.users u
      LEFT JOIN 
          public.user_data ud ON u.id = ud.user_id
      LEFT JOIN 
          public.user_profil up ON u.id = up.user_id
      LEFT JOIN 
          public.profil p ON up.profil_id = p.id
      WHERE 
          u.id = $1;
    `, [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userProfile = result.rows[0];
        res.json(userProfile);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// 7. NEW GET user profile (nama, email, username, nomor wa, divisi, jabatan, photo_url)
app.get('/api/users-setting/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await client.query(`
      SELECT 
          u.id,
          u.username,
          u.email,
          u.create_at,
          uds.name,
          uds.nomor,
          uds.divisi,
          uds.jabatan,
          p.photo_url
      FROM 
          public.users u
      LEFT JOIN 
          public.users_data uds ON u.id = uds.user_id
      LEFT JOIN 
          public.user_profil up ON u.id = up.user_id
      LEFT JOIN 
          public.profil p ON up.profil_id = p.id
      WHERE 
          u.id = $1;
    `, [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userProfile = result.rows[0];
        res.json(userProfile);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// PUT user profile setting
app.put('/api/users-setting/:userId', async (req, res) => {
    const { userId } = req.params;
    const {
        username,
        email,
        name,
        nomor,
        divisi,
        jabatan,
        photo_url
    } = req.body;

    try {
        await client.query('BEGIN');

        // Update tabel `users`
        await client.query(`
      UPDATE public.users
      SET username = $1,
          email = $2
      WHERE id = $3
    `, [username, email, userId]);

        // Cek apakah users_data sudah ada
        const usersDataResult = await client.query(`
      SELECT id FROM public.users_data WHERE user_id = $1
    `, [userId]);

        if (usersDataResult.rows.length > 0) {
            await client.query(`
        UPDATE public.users_data
        SET name = $1,
            nomor = $2,
            divisi = $3,
            jabatan = $4
        WHERE user_id = $5
      `, [name, nomor, divisi, jabatan, userId]);
        } else {
            await client.query(`
        INSERT INTO public.users_data (user_id, name, nomor, divisi, jabatan)
        VALUES ($1, $2, $3, $4, $5)
      `, [userId, name, nomor, divisi, jabatan]);
        }

        // Cek apakah user_profil sudah ada
        const userProfilResult = await client.query(`
      SELECT profil_id FROM public.user_profil WHERE user_id = $1
    `, [userId]);

        if (userProfilResult.rows.length > 0) {
            const profilId = userProfilResult.rows[0].profil_id;

            await client.query(`
        UPDATE public.profil
        SET photo_url = $1
        WHERE id = $2
      `, [photo_url, profilId]);
        } else {
            const insertProfil = await client.query(`
        INSERT INTO public.profil (photo_url)
        VALUES ($1)
        RETURNING id
      `, [photo_url]);

            const profilId = insertProfil.rows[0].id;

            await client.query(`
        INSERT INTO public.user_profil (user_id, profil_id)
        VALUES ($1, $2)
      `, [userId, profilId]);
        }

        await client.query('COMMIT');
        res.status(200).json({ message: 'User setting updated successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});







//8. Edit user profile setting
// app.put('/api/user-setting/:userId', async (req, res) => {
//   const { userId } = req.params;
//   const { username, email, name, nomor_wa, divisi, jabatan, photo_url } = req.body;

//   try {
//     // Mulai transaksi
//     await client.query('BEGIN');

//     // Update tabel users
//     await client.query(`
//         UPDATE public.users
//         SET username = $1, email = $2
//         WHERE id = $3
//       `, [username, email, userId]);

//     // Update tabel data_employees
//     await client.query(`
//         UPDATE public.data_employees
//         SET name = $1, nomor_wa = $2, divisi = $3, jabatan = $4
//         WHERE user_id = $5
//       `, [name, nomor_wa, divisi, jabatan, userId]);

//     // Ambil profil_id terlebih dahulu
//     const profilResult = await client.query(`
//         SELECT p.id
//         FROM public.profil p
//         JOIN public.user_profil up ON p.id = up.profil_id
//         WHERE up.user_id = $1
//       `, [userId]);

//     if (profilResult.rows.length === 0) {
//       await client.query('ROLLBACK');
//       return res.status(404).json({ message: 'Profil not found' });
//     }

//     const profilId = profilResult.rows[0].id;

//     // Update tabel profil
//     await client.query(`
//         UPDATE public.profil
//         SET photo_url = $1
//         WHERE id = $2
//       `, [photo_url, profilId]);

//     // Commit transaksi
//     await client.query('COMMIT');
//     res.json({ message: 'User setting updated successfully' });

//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('Error updating user setting:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });


// PUT /api/user-setting/:userId
app.put('/api/user-setting/:userId', async (req, res) => {
    const { userId } = req.params;
    const {
        username,
        email,
        name,
        nomor, // gunakan "nomor", bukan "nomor_wa"
        divisi,
        jabatan,
        photo_url,
    } = req.body;

    try {
        await client.query('BEGIN');

        // Update `users` table (tanpa photo_url!)
        await client.query(
            `UPDATE users 
       SET username = $1, email = $2 
       WHERE id = $3`,
            [username, email, userId]
        );

        // Update `user_data` table (pakai field "nomor" bukan "nomor_wa")
        await client.query(
            `UPDATE user_data 
       SET name = $1, nomor = $2, divisi = $3, jabatan = $4 
       WHERE user_id = $5`,
            [name, nomor, divisi, jabatan, userId]
        );

        // Cek apakah user sudah punya profil (melalui relasi user_profil)
        const profilResult = await client.query(`
      SELECT p.id AS profil_id
      FROM user_profil up
      JOIN profil p ON p.id = up.profil_id
      WHERE up.user_id = $1
    `, [userId]);

        if (profilResult.rows.length > 0) {
            // Jika profil sudah ada, update photo_url
            const profilId = profilResult.rows[0].profil_id;

            await client.query(`
        UPDATE profil
        SET photo_url = $1
        WHERE id = $2
      `, [photo_url, profilId]);
        } else {
            // Jika belum ada, buat profil baru lalu tautkan dengan user_profil
            const insertProfil = await client.query(`
        INSERT INTO profil (photo_url)
        VALUES ($1)
        RETURNING id
      `, [photo_url]);

            const newProfilId = insertProfil.rows[0].id;

            await client.query(`
        INSERT INTO user_profil (user_id, profil_id)
        VALUES ($1, $2)
      `, [userId, newProfilId]);
        }

        await client.query('COMMIT');

        res.json({ message: 'User profile updated successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



// END USERS 


//ENDPOIN UPLOAD
app.post('/api/upload-attach', upload.single('file'), async (req, res) => {
    const { card_id } = req.body;

    if (!req.file || !card_id) {
        return res.status(400).json({ error: 'Missing file or card_id' });
    }

    try {
        // Upload buffer ke Cloudinary
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    resource_type: 'auto', // bisa 'auto', 'raw', 'image', 'video'
                    folder: 'trello_uploads',
                    public_id: `${Date.now()}-${req.file.originalname}`,
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(req.file.buffer);
        });

        const fileUrl = result.secure_url;
        const fileName = req.file.originalname;

        // Dapatkan ekstensi file
        const extension = fileName.split('.').pop().toLowerCase();

        // Simpan ke DB
        const dbResult = await client.query(
            `INSERT INTO uploaded_files (card_id, file_url, file_name, type) VALUES ($1, $2, $3, $4) RETURNING *`,
            [card_id, fileUrl, fileName, extension]
        );

        res.status(201).json(dbResult.rows[0]);
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed', message: error.message });
    }
});


//UPLOADED FILES
app.get('/api/uploaded-files/:cardId', async (req, res) => {
    const { cardId } = req.params;

    try {
        const result = await client.query(
            `
      SELECT 
        f.id,
        f.card_id,
        f.file_url,
        f.file_name,
        f.type,
        f.uploaded_at,
        u.username,
        pr.photo_url,
        pr.profile_name
      FROM uploaded_files f
      LEFT JOIN users u ON f.user_id = u.id
      LEFT JOIN user_profil up ON u.id = up.user_id
      LEFT JOIN profil pr ON up.profil_id = pr.id
      WHERE f.card_id = $1
      ORDER BY f.uploaded_at DESC
      `,
            [cardId]
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({ error: 'Failed to fetch uploaded files' });
    }
});

//get total file by cardid
app.get('/api/uploaded-files/:cardId/count', async (req, res) => {
    const { cardId } = req.params;

    try {
        const result = await client.query(
            `SELECT COUNT(*) AS total_files FROM uploaded_files WHERE card_id = $1`,
            [cardId]
        );

        res.status(200).json({
            card_id: cardId,
            total_files: parseInt(result.rows[0].total_files, 10)
        });
    } catch (error) {
        console.error('Error counting files:', error);
        res.status(500).json({ error: 'Failed to count uploaded files' });
    }
});

//endpoin delete uploaded file
app.delete('/api/delete-file/:cardId', async (req, res) => {
    const { cardId } = req.params;

    try {
        const result = await client.query(
            `DELETE FROM uploaded_files WHERE cardId = $1 RETURNING *`,
            [cardId],
        );
        res.status(200).json({ message: 'file uploaded removed from card' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

app.delete('/api/delete-file-id/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await client.query(
            `DELETE FROM uploaded_files WHERE id = $1 RETURNING * `,
            [id],
        );
        res.status(200).json({ message: 'file uploaded removed from card' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})



//END ENDPOIN UPLOAD

// ENDPOINT SEARCH CARD (DENGAN ID)
app.get('/api/search', async (req, res) => {
    const { keyword, workspaceId } = req.query;

    if (!keyword || !workspaceId) {
        return res.status(400).json({ error: 'Keyword and workspaceId are required' });
    }

    const searchKeyword = `%${keyword}%`;

    try {
        const query = `
      SELECT 
        cards.id AS card_id,
        cards.title,
        cards.description,
        cards.list_id,
        lists.name AS list_name,
        lists.board_id,
        boards.name AS board_name,
        boards.workspace_id,
        workspaces.name AS workspace_name,
        workspaces.id AS workspace_id
      FROM 
        cards
      JOIN 
        lists ON cards.list_id = lists.id
      JOIN 
        boards ON lists.board_id = boards.id
      JOIN 
        workspaces ON boards.workspace_id = workspaces.id
      WHERE 
        workspaces.id = $2 AND (
          LOWER(cards.title) ILIKE LOWER($1)
          OR LOWER(cards.description) ILIKE LOWER($1)
      )
    `;

        const result = await client.query(query, [searchKeyword, workspaceId]);
        res.json(result.rows);
    } catch (err) {
        console.error('Search error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//GLOBAL SEARCH CARD (berdasarkan user)
// app.get('/api/search/global', async (req, res) => {
//     const { keyword, userId } = req.query;

//     // Validasi input
//     if (!keyword || !userId) {
//         return res.status(400).json({ error: 'Keyword and userId are required' });
//     }

//     const searchKeyword = `%${keyword}%`;
//     const numericUserId = parseInt(userId);

//     if (isNaN(numericUserId)) {
//         return res.status(400).json({ error: 'Invalid userId' });
//     }

//     // Logging input
//     console.log('🔍 keyword:', keyword);
//     console.log('🔍 userId:', numericUserId);
//     console.log('🔍 searchKeyword:', searchKeyword);

//     try {
//         const query = `
//       SELECT 
//         cards.id AS card_id,
//         cards.title,
//         cards.description,
//         cards.list_id,
//         lists.name AS list_name,
//         lists.board_id,
//         boards.name AS board_name,
//         boards.workspace_id,
//         workspaces.name AS workspace_name,
//         workspaces.id AS workspace_id
//       FROM 
//         cards
//       JOIN lists ON cards.list_id = lists.id
//       JOIN boards ON lists.board_id = boards.id
//       JOIN workspaces ON boards.workspace_id = workspaces.id
//       JOIN workspaces_users ON workspaces_users.workspace_id = workspaces.id
//       WHERE 
//         workspaces_users.user_id = $2
//         AND (
//           LOWER(cards.title) ILIKE LOWER($1)
//           OR LOWER(cards.description) ILIKE LOWER($1)
//         )
//     `;

//         const result = await client.query(query, [searchKeyword, numericUserId]);
//         res.json(result.rows);
//     } catch (err) {
//         console.error('❌ Search error message:', err.message);
//         console.error('🧨 Full error:', err);
//         res.status(500).json({
//             error: 'Internal server error',
//             detail: err.message
//         });
//     }
// });


//WORKSPACE
//1.Get all workspace
// GLOBAL SEARCH CARD (termasuk archived)
app.get('/api/search/global', async (req, res) => {
    const { keyword, userId } = req.query;

    // Validasi input
    if (!keyword || !userId) {
        return res.status(400).json({ error: 'Keyword and userId are required' });
    }

    const searchKeyword = `%${keyword}%`;
    const numericUserId = parseInt(userId);

    if (isNaN(numericUserId)) {
        return res.status(400).json({ error: 'Invalid userId' });
    }

    try {
        const query = `
      -- SEARCH CARD AKTIF
        SELECT 
        c.id AS card_id,
        c.title,
        c.description,
        l.id AS list_id,
        l.name AS list_name,
        b.id AS board_id,
        b.name AS board_name,
        w.id AS workspace_id,
        w.name AS workspace_name,
        'Active' AS status       -- field tambahan hanya untuk response
        FROM cards c
        JOIN lists l ON c.list_id = l.id
        JOIN boards b ON l.board_id = b.id
        JOIN workspaces w ON b.workspace_id = w.id
        JOIN workspaces_users wu ON wu.workspace_id = w.id
        WHERE wu.user_id = $2
        AND (LOWER(c.title) ILIKE LOWER($1) OR LOWER(c.description) ILIKE LOWER($1))

        UNION ALL

        -- SEARCH CARD DI ARCHIVE
        SELECT
        a.entity_id AS card_id,
        a.name AS title,
        a.description,
        NULL AS list_id,
        NULL AS list_name,
        NULL AS board_id,
        NULL AS board_name,
        NULL AS workspace_id,
        NULL AS workspace_name,
        'Archive' AS status       -- 🔥 hanya untuk frontend, sebagai pembeda
        FROM archive a
        WHERE a.entity_type = 'card'
        AND (LOWER(a.name) ILIKE LOWER($1) OR LOWER(a.description) ILIKE LOWER($1))

    `;

        const result = await client.query(query, [searchKeyword, numericUserId]);
        res.json(result.rows);
    } catch (err) {
        console.error('❌ Search error message:', err.message);
        console.error('🧨 Full error:', err);
        res.status(500).json({
            error: 'Internal server error',
            detail: err.message
        });
    }
});




app.get('/api/workspace', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM workspaces ORDER BY id ASC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
//2. get workspace by id
app.get('/api/workspace/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    try {
        const result = await client.query('SELECT * FROM workspaces WHERE id  = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Workspace not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
//3. create a new workspace
app.post("/api/workspace", async (req, res) => {
    const { name } = req.body;
    const { description } = req.body;
    try {
        const result = await client.query(
            "INSERT INTO workspaces (name, description) VALUES ($1, $2) RETURNING *",
            [name, description]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
//4. update a workspace
app.put('/api/workspace/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const { description } = req.body;
    const userId = req.user.id;

    try {
        const result = await client.query(
            "UPDATE workspaces SET name = $1, description = $2, update_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *",
            [name, description, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Workspace not found" });
        }

        // Kirim respon sukses
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
//5. delete a workspace dan mengarsipkan workspace sebelum mendelete data 
// app.delete('/api/workspace/:id', async (req, res) => {
//     const { id } = req.params;
//     const userId = req.user.id;
//     try {
//         // Salin workspace ke archive sebelum delete
//         await client.query(`
//             INSERT INTO archive (entity_type, entity_id, name, description, create_at, update_at)
//             SELECT 'workspace', id, name, description, create_at, update_at
//             FROM workspaces
//             WHERE id = $1
//         `, [id]);

//         // Hapus workspace setelah disalin
//         const result = await client.query("DELETE FROM workspaces WHERE id = $1 RETURNING *", [id]);

//         if (result.rows.length === 0) {
//             return res.status(404).json({ error: "Workspace not found" });
//         }

//         res.json({ message: "Workspace archived and deleted successfully" });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// })
// 5. Soft delete workspace (arsipkan dan tandai sebagai terhapus)
app.delete('/api/workspace/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Cek dulu apakah workspace ada
        const check = await client.query("SELECT * FROM workspaces WHERE id = $1", [id]);
        if (check.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Workspace not found" });
        }

        // Simpan data ke tabel archive (opsional, bisa dihapus kalau gak perlu)
        await client.query(
            `
        INSERT INTO archive (entity_type, entity_id, name, description, create_at, update_at)
        SELECT 'workspace', id, name, description, create_at, update_at
        FROM workspaces
        WHERE id = $1
      `,
            [id]
        );

        // Update workspace agar jadi soft delete
        const result = await client.query(
            `
        UPDATE workspaces
        SET is_deleted = TRUE, deleted_at = NOW()
        WHERE id = $1
        RETURNING *
      `,
            [id]
        );

        res.json({
            success: true,
            message: "Workspace soft deleted successfully",
            data: result.rows[0],
        });
    } catch (err) {
        console.error("Error soft deleting workspace:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});


// 6. Restore workspace yang dihapus (soft delete restore)
app.put('/api/workspace/restore/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await client.query(
            `
        UPDATE workspaces
        SET is_deleted = FALSE, deleted_at = NULL
        WHERE id = $1
        RETURNING *
      `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Workspace not found or not deleted" });
        }

        res.json({
            success: true,
            message: "Workspace restored successfully",
            data: result.rows[0],
        });
    } catch (err) {
        console.error("Error restoring workspace:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});



//6. archive workspace
app.post('/api/workspace/archive/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    try {
        const result = await client.query(`
            INSERT INTO archive (entity_type, entity_id, name, description, create_at, update_at)
            SELECT 'workspace', id, name, description , create_at, update_at
            FROM workspaces
            WHERE id = $1
            `, [id]);
        if (result.rowCount > 0) {
            await client.query('DELETE FROM workspaces WHERE id = $1', [id])//menambahkan logika hapus ketika workspace berhasil diarsipkan
            res.status(200).send(`Workspace dengan id ${id} berhasil diarsipkan`);
        } else {
            res.status(404).send(`Workspace dengan id ${id} tidak ditemukan.`)
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
//7. update workspace name
app.put('/api/workspace/:id/name', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body; // Hanya mengambil name
    const userId = req.user.id;

    try {
        const result = await client.query(
            "UPDATE workspaces SET name = $1, update_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
            [name, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Workspace not found" });
        }

        //Log activity untuk update
        await logActivity(
            'workspaces',
            result.rows[0].id,
            'update',
            userId,
            `Workspace name updated to '${name}' in workspace`,
            null,
            null
        )

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Error updating workspace name:", error);
        res.status(500).json({ error: error.message });
    }
})
//8. update workspace description
app.put('/api/workspace/:id/description', async (req, res) => {
    const { id } = req.params;
    const { description } = req.body; // Hanya mengambil description
    const userId = req.user.id;

    try {
        const result = await client.query(
            "UPDATE workspaces SET description = $1, update_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
            [description, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Workspace not found" });
        }

        //Log activity untuk update
        await logActivity(
            'workspaces',
            result.rows[0].id,
            'update',
            userId,
            `Workspace description updated to '${description}' `,
            null,
            null
        )

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Error updating workspace description:", error);
        res.status(500).json({ error: error.message });
    }
})
//END WORKSPACE

//WORKSPACE USER
//1. create workspace user -> works
app.post('/api/workspace-user/create', async (req, res) => {
    const { name, description, userId, role } = req.body;
    try {
        //1. insert workspace ke dalam tabel workspace
        const workspaceResult = await client.query(
            `INSERT INTO workspaces (name, description)
            VALUES ($1, $2) RETURNING id`,
            [name, description]
        );

        const workspaceId = workspaceResult.rows[0].id;
        console.log('endpoin ini sudah memilikii workspaceId:', workspaceId);

        //2. insert user ke dalam tabel workspace users sebagai admin
        const userResult = await client.query(
            `INSERT INTO workspaces_users (workspace_id, user_id, role) 
            VALUES ($1, $2, $3) RETURNING *`,
            [workspaceId, userId, role]
        );

        //3. log untuk create workspace
        await logActivity(
            'workspace',
            workspaceId,
            'create',
            userId,
            `Workspace '${name}' created`,
            null,
            null
        )

        //4. log activity untuk penambahan user ke workspace
        await logActivity(
            'workspace_user',
            workspaceId,
            //   userResult.rows[0].id,
            'add',
            userId,
            `User '${userResult.rows[0].user_id}' added to workspace`,
            'workspace',
            workspaceId
        );

        res.status(201).json({
            message: 'Workspace created successfully',
            workspace: workspaceResult.rows[0],
            user: userResult.rows[0],
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
//2. get workspace user -> works (DIEDIT)
app.get('/api/workspace/:id/users', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await client.query(
            `SELECT u.id, u.username, wu.role 
            FROM users u
            JOIN workspaces_users wu ON u.id = wu.user_id
            WHERE wu.workspace_id = $1`, [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No users found in this workspace' });
        }
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
//3. update workspace user -> works
app.put('/api/workspace-user/:workspaceId/user/:userId', async (req, res) => {
    const { workspaceId, userId } = req.params;
    const { role } = req.body;
    try {
        const result = await client.query(
            `UPDATE workspaces_users
            SET role = $1
            WHERE workspace_id = $2 AND user_id = $3 RETURNING *`,
            [role, workspaceId, userId]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'User not found in this workspace' });
        }

        //log activity for update workspace user
        await logActivity(
            'workspaces_user',
            result.rows[0].id,
            'update',
            userId,
            `Workspace user updated in workspace`,
            null,
            null,
        )


        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
//4. delete workspace user -> works
app.delete('/api/workspace-user/:workspaceId/user/:userId', async (req, res) => {
    const { workspaceId, userId } = req.params;
    try {
        // Pastikan user ada dan belum dihapus
        const { rows } = await client.query(
            `SELECT * FROM workspaces_users WHERE workspace_id = $1 AND user_id = $2 AND is_deleted = FALSE`,
            [workspaceId, userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found or already removed from this workspace' });
        }

        // Soft delete user
        const result = await client.query(
            `UPDATE workspaces_users
             SET is_deleted = TRUE, deleted_at = NOW()
             WHERE workspace_id = $1 AND user_id = $2
             RETURNING *`,
            [workspaceId, userId]
        );

        // Log activity untuk soft delete
        await logActivity(
            'workspace user',
            workspaceId,
            'soft_delete',
            userId,
            `Workspace user soft deleted`,
            null,
            null
        );

        res.status(200).json({
            message: 'User soft deleted (removed logically) from workspace',
            deletedUser: result.rows[0],
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Restore soft deleted workspace user
app.patch('/api/workspace-user/:workspaceId/user/:userId/restore', async (req, res) => {
    const { workspaceId, userId } = req.params;
    try {
        // Pastikan user ada dan sudah dihapus (soft delete)
        const { rows } = await client.query(
            `SELECT * FROM workspaces_users 
             WHERE workspace_id = $1 AND user_id = $2 AND is_deleted = TRUE`,
            [workspaceId, userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'No deleted user found for this workspace' });
        }

        // Restore data
        const result = await client.query(
            `UPDATE workspaces_users
             SET is_deleted = FALSE, deleted_at = NULL
             WHERE workspace_id = $1 AND user_id = $2
             RETURNING *`,
            [workspaceId, userId]
        );

        // Log activity
        await logActivity(
            'workspace user',
            workspaceId,
            'restore',
            userId,
            `Workspace user restored`,
            null,
            null
        );

        res.status(200).json({
            message: 'User restored successfully to workspace',
            restoredUser: result.rows[0],
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


//5. archive workspace user
app.post('/api/archive-workspace-user/:workspaceId', async (req, res) => {
    const { workspaceId } = req.params;

    try {
        // Periksa apakah ada pengguna di workspace sebelum mengarsipkan
        const checkUsers = await client.query(
            `SELECT wu.user_id, u.username, wu.role 
             FROM workspaces_users wu 
             JOIN users u ON wu.user_id = u.id 
             WHERE wu.workspace_id = $1`,
            [workspaceId]
        );

        if (checkUsers.rowCount === 0) {
            return res.status(404).json({ message: `Tidak ada pengguna ditemukan untuk workspace dengan id ${workspaceId}.` });
        }

        // Masukkan data ke dalam tabel archive
        const archiveUsers = await client.query(
            `INSERT INTO archive (entity_type, entity_id, name, description, parent_id, parent_type)
             SELECT 'workspace_user', wu.user_id, u.username, wu.role, $1, 'workspace'
             FROM workspaces_users wu
             JOIN users u ON wu.user_id = u.id
             WHERE wu.workspace_id = $1
             RETURNING *`,
            [workspaceId]
        );

        // Hapus data dari workspaces_users setelah diarsipkan
        await client.query('DELETE FROM workspaces_users WHERE workspace_id = $1', [workspaceId]);


        res.status(200).json({ message: `Pengguna workspace ${workspaceId} berhasil diarsipkan`, data: archiveUsers.rows });
    } catch (err) {
        console.error('Error executing query:', err.stack);
        res.status(500).json({ error: 'Server Error saat mengarsipkan pengguna workspace!' });
    }
});


// ✅ 6. Get workspace milik user (yang belum dihapus)
// app.get('/api/user/:userId/workspaces', async (req, res) => {
//     const { userId } = req.params;

//     try {
//         const result = await client.query(
//             `
//       SELECT 
//         w.id, 
//         w.name, 
//         w.description, 
//         w.create_at, 
//         w.update_at,
//         w.is_deleted,
//         w.deleted_at
//       FROM workspaces AS w
//       INNER JOIN workspaces_users AS wu 
//         ON w.id = wu.workspace_id
//       WHERE 
//         wu.user_id = $1
//         AND w.is_deleted = FALSE
//       ORDER BY w.create_at DESC
//       `,
//             [userId]
//         );

//         if (result.rows.length === 0) {
//             return res.status(200).json([]); // kirim array kosong, bukan 404
//         }

//         res.status(200).json(result.rows);
//     } catch (error) {
//         console.error("❌ Error fetching user's workspaces:", error);
//         res.status(500).json({ error: error.message });
//     }
// });

// ✅ 6. Get workspace milik user (yang belum dihapus)
app.get('/api/user/:userId/workspaces', async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await client.query(
            `
      SELECT 
        w.id, 
        w.name, 
        w.description, 
        w.create_at, 
        w.update_at,
        w.is_deleted,
        w.deleted_at
      FROM workspaces AS w
      INNER JOIN workspaces_users AS wu 
        ON w.id = wu.workspace_id
      WHERE 
        wu.user_id = $1
        AND w.is_deleted = FALSE
        AND wu.is_deleted = FALSE   -- <-- pastikan user masih aktif di workspace
      ORDER BY w.create_at DESC
      `,
            [userId]
        );

        res.status(200).json(result.rows); // array kosong otomatis jika tidak ada
    } catch (error) {
        console.error("❌ Error fetching user's workspaces:", error);
        res.status(500).json({ error: error.message });
    }
});


//7. get admin name form workspace
app.get('/api/:workspaceId/admin', async (req, res) => {
    const { workspaceId } = req.params;

    try {
        const result = await client.query(
            `
        SELECT 
          u.id, 
          u.username, 
          u.email,
          p.profile_name,
          p.photo_url
        FROM 
          workspaces_users wu
        JOIN 
          users u ON wu.user_id = u.id
        LEFT JOIN 
          user_profil up ON u.id = up.user_id
        LEFT JOIN 
          profil p ON up.profil_id = p.id
        WHERE 
          wu.workspace_id = $1 
          AND wu.role = 'admin'
        `,
            [workspaceId]
        );

        res.json({ admins: result.rows });
    } catch (error) {
        console.error('Error fetching admins:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
//8.get total user in workspace
app.get('/api/workspaces/:workspaceId/user-count', async (req, res) => {
    const { workspaceId } = req.params;

    const query = `
      SELECT COUNT(*) AS user_count
      FROM workspaces_users
      WHERE workspace_id = $1
    `;

    try {
        const result = await client.query(query, [workspaceId]);
        res.json({ workspace_id: workspaceId, user_count: parseInt(result.rows[0].user_count, 10) });
    } catch (err) {
        console.error('Error fetching user count for workspace:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


//END WORKSPACE USER



//ASSIGN USER
//1. mendapatkan semua user berdasarkan workspace id
app.get('/api/workspace/:workspaceId/users-profil', async (req, res) => {
    const { workspaceId } = req.params;

    try {
        const result = await client.query(
            `
        SELECT 
          u.id,
          u.username,
          u.email,
          wu.role,
          p.photo_url,
          p.profile_name
        FROM workspaces_users wu
        JOIN users u ON wu.user_id = u.id
        LEFT JOIN user_profil up ON up.user_id = u.id
        LEFT JOIN profil p ON up.profil_id = p.id
        WHERE wu.workspace_id = $1
        `,
            [workspaceId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching workspace users:', error);
        res.status(500).json({ error: 'Failed to fetch users for the workspace.' });
    }
});


//2. remove user form workspace
app.delete('/api/workspace/:workspaceId/user/:userId', async (req, res) => {
    const { workspaceId, userId } = req.params;
    try {
        await client.query(
            "DELETE FROM workspaces_users WHERE workspace_id = $1 AND user_id = $2",
            [workspaceId, userId]
        );

        //mengambil nama workspace 
        const workspaceNameQuery = await client.query(
            `SELECT name FROM workspaces WHERE id = $1`,
            [workspaceId]
        )

        const workspaceName = workspaceNameQuery.rows[0]?.name || 'a workspace'

        //add log notification
        await SystemNotification({
            userId,
            message: `Someone remove you out of this workspace "${workspaceName}"`,
            type: 'remove'
        })

        res.json({ message: "User removed from workspace" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

//3. add user to workspace -> works
app.post('/api/workspace-user/:workspaceId/user/:userId', async (req, res) => {
    const { workspaceId, userId } = req.params;
    const { role } = req.body;
    try {
        // Cek apakah user sudah ada di workspace
        const checkUser = await client.query(
            `SELECT * FROM workspaces_users WHERE workspace_id = $1 AND user_id = $2`,
            [workspaceId, userId]
        );

        if (checkUser.rows.length > 0) {
            return res.status(400).json({ message: 'User is already in this workspace' });
        }

        // Jika user belum ada, tambahkan ke workspace
        const result = await client.query(
            `INSERT INTO workspaces_users (workspace_id, user_id, role) 
            VALUES ($1, $2, $3) RETURNING *`,
            [workspaceId, userId, role]
        );

        //mengambil nama workspace berdasarkan workspace id untuk notifikasi
        const workspaceNameQuery = await client.query(
            `SELECT name FROM workspaces WHERE id = $1`,
            [workspaceId]
        );

        const workspaceName = workspaceNameQuery.rows[0]?.name || 'a workspace';


        //tambahkan notification
        await SystemNotification({
            userId,
            workspaceId,
            message: `You were added to workspace "${workspaceName}"`,
            type: 'workspace_assigned'
        })

        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
//4. search user in workspace
app.get('/api/workspace/:workspaceId/user/:userId', async (req, res) => {
    const { workspaceId } = req.params;
    const { query } = req.query; // Pencarian berdasarkan username atau email
    try {
        const result = await client.query(
            `SELECT u.id, u.username, u.email, wu.role 
                 FROM workspaces_users wu 
                 JOIN users u ON wu.user_id = u.id 
                 WHERE wu.workspace_id = $1 
                 AND (u.username ILIKE $2 OR u.email ILIKE $2)`,
            [workspaceId, `%${query}%`]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
// END ASSIGN USER 

//BOARD
//patch dan reorder board position in workspace
// PATCH - reorder board position in workspace
app.patch('/api/boards/:boardId/new-position', async (req, res) => {
    const { boardId } = req.params;
    const { newPosition, workspaceId } = req.body;

    try {
        await client.query('BEGIN');

        // Ambil posisi lama dari board yang dipindah
        const { rows } = await client.query(
            `SELECT position FROM boards WHERE id = $1 AND workspace_id = $2`,
            [boardId, workspaceId]
        );

        if (rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Board not found' });
        }

        const oldPosition = rows[0].position;

        // Jika board dipindah ke bawah
        if (newPosition > oldPosition) {
            await client.query(
                `UPDATE boards
         SET position = position - 1
         WHERE workspace_id = $1 AND position > $2 AND position <= $3`,
                [workspaceId, oldPosition, newPosition]
            );
        }
        // Jika board dipindah ke atas
        else if (newPosition < oldPosition) {
            await client.query(
                `UPDATE boards
         SET position = position + 1
         WHERE workspace_id = $1 AND position >= $2 AND position < $3`,
                [workspaceId, newPosition, oldPosition]
            );
        }

        // Update posisi board yang dipindah
        await client.query(
            `UPDATE boards
       SET position = $1, update_at = NOW()
       WHERE id = $2 AND workspace_id = $3`,
            [newPosition, boardId, workspaceId]
        );

        await client.query('COMMIT');
        res.json({ success: true, boardId, newPosition });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error reordering board:', err);
        res.status(500).json({ error: err.message });
    }
});


app.put('/api/boards/reorder', async (req, res) => {
    const { workspace_id, boards } = req.body; // boards = array berisi {id, position}

    try {
        await client.query('BEGIN');
        for (const { id, position } of boards) {
            await client.query('UPDATE boards SET position = $1 WHERE id = $2', [position, id]);
        }
        await client.query('COMMIT');
        res.status(200).json({ message: 'Board positions updated successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: error.message });
    }
});


// Endpoint to get all boards
app.get('/api/boards', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM public.boards ORDER BY position ASC');
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No boards found' });
        }
        return res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error fetching boards' });
    }
});

//1. get all board by workspace id
// app.get('/api/workspaces/:workspaceId/boards', async (req, res) => {
//     const { workspaceId } = req.params;
//     try {
//         const result = await client.query(
//             'SELECT * FROM boards WHERE workspace_id = $1 AND is_deleted = FALSE ORDER BY position ASC',
//             [workspaceId]
//         );
//         res.json(result.rows);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });
// ✅ Get boards by workspace ID (hanya untuk user yang punya akses)
app.get('/api/workspaces/:workspaceId/boards', async (req, res) => {
    const { workspaceId } = req.params;
    const { userId } = req.query;

    try {
        const result = await client.query(
            `
      SELECT b.*
      FROM boards b
      JOIN workspaces w ON w.id = b.workspace_id
      LEFT JOIN workspaces_users wu ON wu.workspace_id = w.id
      WHERE b.workspace_id = $1
        AND wu.user_id = $2
        AND b.is_deleted = FALSE
      ORDER BY b.position ASC
      `,
            [workspaceId, userId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching boards:", error);
        res.status(500).json({ error: error.message });
    }
});




//2. get board by id
app.get('/api/boards/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await client.query('SELECT * FROM boards WHERE id = $1', [id]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Board not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
//3. create board
app.post('/api/boards', async (req, res) => {
    const { user_id, name, description, workspace_id } = req.body;

    try {
        // Hitung jumlah board di workspace untuk menentukan posisi baru
        const { rows: existingBoards } = await client.query(
            'SELECT COUNT(*) AS count FROM boards WHERE workspace_id = $1',
            [workspace_id]
        );
        const newPosition = parseInt(existingBoards[0].count) + 1;

        const result = await client.query(
            `INSERT INTO boards (user_id, name, description, workspace_id, position, create_at) 
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) 
       RETURNING *`,
            [user_id, name, description, workspace_id, newPosition]
        );

        const boardId = result.rows[0].id;

        await logActivity(
            'board',
            boardId,
            'create',
            user_id,
            `Board '${name}' created`,
            'workspace',
            workspace_id
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('❌ Error creating board:', error);
        res.status(500).json({ error: error.message });
    }
});


//4. update board
app.put('/api/boards/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, background_image_id, assign } = req.body;

    try {
        const result = await client.query(
            `UPDATE boards 
       SET name = $1, description = $2, background_image_id = $3, assign = $4, update_at = CURRENT_TIMESTAMP 
       WHERE id = $5 RETURNING *`,
            [name, description, background_image_id, assign, id]
        );

        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Board not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


//5. delete a board
app.delete('/api/boards/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        await client.query('BEGIN');

        // Ambil workspace_id & posisi board sebelum dihapus
        const { rows } = await client.query(
            `SELECT workspace_id, position FROM boards 
             WHERE id = $1 AND is_deleted = FALSE`,
            [id]
        );

        if (rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Board not found or already deleted' });
        }

        const { workspace_id } = rows[0];

        // Soft delete board (tidak dihapus permanen)
        await client.query(
            `UPDATE boards 
             SET is_deleted = TRUE, deleted_at = NOW() 
             WHERE id = $1`,
            [id]
        );

        // Reorder posisi board yang tersisa di workspace
        await client.query(
            `WITH reordered AS (
                SELECT id, ROW_NUMBER() OVER (ORDER BY position) AS new_pos
                FROM boards 
                WHERE workspace_id = $1 AND is_deleted = FALSE
            )
            UPDATE boards b
            SET position = r.new_pos
            FROM reordered r
            WHERE b.id = r.id`,
            [workspace_id]
        );

        // Log activity
        await logActivity(
            'board',
            id,
            'soft_delete',
            userId,
            `Board with id ${id} soft deleted`,
            'workspace',
            workspace_id
        );

        await client.query('COMMIT');
        res.json({ message: 'Board soft deleted successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

//Restore soft deleted board
app.patch('/api/boards/:id/restore', async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        await client.query('BEGIN');

        // Pastikan board memang terhapus (soft delete)
        const { rows } = await client.query(
            `SELECT workspace_id FROM boards WHERE id = $1 AND is_deleted = TRUE`,
            [id]
        );

        if (rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'No soft-deleted board found' });
        }

        const { workspace_id } = rows[0];

        // Hitung posisi terakhir agar board dikembalikan ke urutan akhir
        const { rows: posRows } = await client.query(
            `SELECT COALESCE(MAX(position), 0) + 1 AS new_position 
             FROM boards WHERE workspace_id = $1 AND is_deleted = FALSE`,
            [workspace_id]
        );
        const newPosition = posRows[0].new_position;

        // Restore board
        const result = await client.query(
            `UPDATE boards 
             SET is_deleted = FALSE, deleted_at = NULL, position = $2
             WHERE id = $1 
             RETURNING *`,
            [id, newPosition]
        );

        // Log activity
        await logActivity(
            'board',
            id,
            'restore',
            userId,
            `Board with id ${id} restored`,
            'workspace',
            workspace_id
        );

        await client.query('COMMIT');
        res.json({
            message: 'Board restored successfully',
            restoredBoard: result.rows[0],
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

//6. update board name
app.put('/api/boards/:id/name', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user.id;

    try {
        const result = await client.query(
            "UPDATE boards SET name = $1, update_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
            [name, id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Boards is not found' });
        }

        //CHECK USER ID
        console.log('endpoin update board name ini menerima userId:', userId);

        //LOG ACTIVITY 
        await logActivity(
            'board',
            result.rows[0].id,
            'update',
            userId,
            `Board name updated to '${name}' in board`,
            'board',
            id
        )

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error updating board name:', error);
        res.status(500).json({ error: error.message });
    }
})
//7. update description boards
app.put('/api/boards/:id/description', async (req, res) => {
    const { id } = req.params;
    const { description } = req.body;
    const userId = req.user.id;

    try {
        const result = await client.query(
            "UPDATE boards SET description = $1, update_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
            [description, id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Boards is not found' });
        }

        //check user id
        console.log('Endpoin update desctiption ini menerima userId:', userId);

        //log activity
        await logActivity(
            'board',
            result.rows[0].id,
            'update',
            userId,
            `Board description updated to '${description}' in board`,
            'board',
            id
        )

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error updating board name:', error);
        res.status(500).json({ error: error.message });
    }

})

//8. Endpoint untuk menduplikasi board ke workspace baru
app.post('/api/duplicate-board/:boardId/to-workspace/:workspaceId', async (req, res) => {
    const { boardId, workspaceId } = req.params;
    const userId = req.user.id;


    try {
        await client.query('BEGIN');

        // 1. Salin Board ke Workspace Baru
        const boardResult = await client.query(
            `INSERT INTO boards (user_id, name, description, workspace_id, background_image_id, assign, create_at)
            SELECT user_id, name || ' (Copy)', description, $1, background_image_id, assign, CURRENT_TIMESTAMP
            FROM boards WHERE id = $2
            RETURNING id`,
            [workspaceId, boardId]
        );

        if (boardResult.rowCount === 0) {
            throw new Error('Board tidak ditemukan.');
        }

        const newBoardId = boardResult.rows[0].id;
        // const newBoardName = boardResult.rows[0].name;

        // 2. Salin Lists yang ada di Board Lama ke Board Baru
        const listResult = await client.query(
            `INSERT INTO lists (board_id, name, position)
      SELECT $1, name, position FROM lists WHERE board_id = $2
      RETURNING id, name, position`,
            [newBoardId, boardId]
        );

        const listMap = {};
        listResult.rows.forEach((list) => {
            listMap[list.id] = list.name; // Simpan mapping ID list lama ke list baru
        });

        // 3. Salin Cards yang ada di Lists Lama ke Lists Baru
        const cardInsertPromises = Object.entries(listMap).map(async ([oldListId, name]) => {
            return client.query(
                `INSERT INTO cards (list_id, title, description)
                 SELECT (SELECT id FROM lists WHERE board_id = $1 AND name = $2), title, description
                 FROM cards WHERE list_id = $3`,
                [newBoardId, name, oldListId]
            );
        });

        await Promise.all(cardInsertPromises);

        //add log activity
        await logActivity(
            'board',
            newBoardId,
            'duplicate',
            userId,
            `Board dengan ID ${boardId} diduplikasi ke workspace ${workspaceId}`,
            'workspace',
            workspaceId
        )

        await client.query('COMMIT');

        res.status(200).json({
            message: `Board berhasil diduplikasi ke workspace ${workspaceId}.`,
            newBoardId: newBoardId
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error duplicating board:', err.stack);
        res.status(500).json({ error: 'Server error saat menduplikasi board!' });
    }
});

//9. move board to workspace
app.post('/api/move-board/:boardId/to-workspace/:workspaceId', async (req, res) => {
    const { boardId, workspaceId } = req.params;
    const userId = req.user.id;

    try {
        await client.query('BEGIN');

        // 1. Salin Board ke Workspace Baru
        const boardResult = await client.query(
            `INSERT INTO boards (user_id, name, description, workspace_id, background_image_id, assign,update_at)
             SELECT user_id, name, description, $1, background_image_id, assign, CURRENT_TIMESTAMP
             FROM boards WHERE id = $2
             RETURNING id`,
            [workspaceId, boardId]
        );

        if (boardResult.rowCount === 0) {
            throw new Error('Board tidak ditemukan.');
        }

        const newBoardId = boardResult.rows[0].id;
        // const newBoardName = boardResult.rows[0].name;

        // 2. Salin Lists yang ada di Board Lama ke Board Baru
        const listResult = await client.query(
            `INSERT INTO lists (board_id, name, position)
             SELECT $1, name, position FROM lists WHERE board_id = $2
             RETURNING id, name`,
            [newBoardId, boardId]
        );

        const listMap = {};
        listResult.rows.forEach((list) => {
            listMap[list.id] = list.name; // Simpan mapping ID list lama ke list baru
        });

        // 3. Salin Cards yang ada di Lists Lama ke Lists Baru
        const cardInsertPromises = Object.entries(listMap).map(async ([oldListId, name]) => {
            return client.query(
                `INSERT INTO cards (list_id, title, description, position)
                 SELECT (SELECT id FROM lists WHERE board_id = $1 AND name = $2), title, description, position
                 FROM cards WHERE list_id = $3`,
                [newBoardId, name, oldListId]
            );
        });

        await Promise.all(cardInsertPromises);

        //add log activity
        await logActivity(
            'board',
            newBoardId,
            'move',
            userId,
            `Board dengan ID ${newBoardId} dipindahan ke workspace ${workspaceId}`,
            'workspace',
            workspaceId
        )

        // 4. Hapus Board Lama
        await client.query(`DELETE FROM boards WHERE id = $1`, [boardId]);

        await client.query('COMMIT');

        res.status(200).json({
            message: `Board berhasil dipindahkan ke workspace ${workspaceId}.`,
            newBoardId: newBoardId
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error moving board:', err.stack);
        res.status(500).json({ error: 'Server error saat memindahkan board!' });
    }
});

//10. archive data boards
app.post('/api/boards/:boardId/archive', async (req, res) => {
    const { boardId } = req.params;
    const userId = req.user.id;

    try {
        // Ambil data board yang akan diarsipkan
        const boardQuery = 'SELECT * FROM boards WHERE id = $1';
        const boardResult = await client.query(boardQuery, [boardId]);

        if (boardResult.rows.length === 0) {
            return res.status(404).json({ message: 'Board not found' });
        }

        const board = boardResult.rows[0];

        // Masukkan data board ke dalam tabel archive
        const archiveQuery = `INSERT INTO archive (entity_type, entity_id, name, description, parent_id, parent_type) 
                              VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
        const archiveValues = ['board', board.id, board.name, board.description, board.workspace_id, 'workspace'];
        const archiveResult = await client.query(archiveQuery, archiveValues);

        // Hapus board dari tabel boards setelah diarsipkan
        const deleteQuery = 'DELETE FROM boards WHERE id = $1';
        await client.query(deleteQuery, [boardId]);

        //add log archive
        await logActivity(
            'board',
            boardId,
            'archive',
            userId,
            `Board dengan id '${boardId} berhasil di archive'`,
            'workspace',
            boardId
        )

        res.status(200).json({ message: 'Board archived successfully', archivedBoard: archiveResult.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
//END BOARDS

//BOARD PRIORITY 
//1. add priority to board -> works
app.post('/api/board-priority', async (req, res) => {
    const { board_id, priority_id } = req.body;
    const userId = req.user.id;

    try {
        if (!board_id || !priority_id) {
            return res.status(400).json({ error: "board_id dan priority_id wajib diisi" });
        }

        await client.query("BEGIN");

        // Hapus semua prioritas lama untuk board ini (hanya jika satu prioritas diperbolehkan)
        await client.query(
            "DELETE FROM board_priorities WHERE board_id = $1",
            [board_id]
        );

        // Insert prioritas baru
        const result = await client.query(
            "INSERT INTO board_priorities (board_id, priority_id, create_at,update_at) VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *",
            [board_id, priority_id]
        );

        await client.query("COMMIT");

        //add log activity
        await logActivity(
            'board priority',
            priority_id,
            'add',
            userId,
            `Board priority added`,
            'board',
            board_id
        )

        res.status(201).json({ message: "Prioritas berhasil ditambahkan", data: result.rows[0] });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error(error);
        res.status(500).json({ error: "Terjadi kesalahan server" });
    }
})
//2. get all board priority -> works
app.get('/api/board-priority/:board_id', async (req, res) => {
    try {
        const { board_id } = req.params;

        const result = await client.query(
            `SELECT p.id, p.name, p.color 
             FROM board_priorities bp
             JOIN priorities p ON bp.priority_id = p.id
             WHERE bp.board_id = $1`,
            [board_id]
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Terjadi kesalahan server" });
    }
})
//3. get all priority -> works
app.get('/api/priority', async (req, res) => {
    try {
        const result = await client.query("SELECT * FROM priorities");
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Terjadi kesalahan server" });
    }
})
//4. delete prioritas from board 
app.delete('/api/board-priority-remove', async (req, res) => {
    try {
        const { board_id, priority_id } = req.body;

        if (!board_id || !priority_id) {
            return res.status(400).json({ error: "board_id dan priority_id wajib diisi" });
        }

        const result = await client.query(
            "DELETE FROM board_priorities WHERE board_id = $1 AND priority_id = $2 RETURNING *",
            [board_id, priority_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Prioritas tidak ditemukan di board ini" });
        }

        res.status(200).json({ message: "Prioritas berhasil dihapus", data: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Terjadi kesalahan server" });
    }
})
//END BOARD PRIORITY

//CARD PRIORITY
//1. add priority to card
app.post('/api/card-priorities', async (req, res) => {
    const userId = req.user.id;
    const { card_id, priority_id } = req.body;

    if (!card_id || !priority_id) {
        return res.status(400).json({ error: "card_id dan priority_id wajib diisi" });
    }

    try {
        await client.query('BEGIN');

        // Ambil priority lama sebelum dihapus
        const oldPriorityResult = await client.query(
            `SELECT cp.priority_id, p.name AS priority_name
       FROM card_priorities cp
       JOIN priorities p ON cp.priority_id = p.id
       WHERE cp.card_id = $1`,
            [card_id]
        );

        const oldPriorityId = oldPriorityResult.rows[0]?.priority_id || null;
        const oldPriorityName = oldPriorityResult.rows[0]?.priority_name || null;

        // Hapus semua prioritas lama untuk card ini
        await client.query(
            "DELETE FROM card_priorities WHERE card_id = $1",
            [card_id]
        );

        // Tambahkan prioritas baru
        const insertResult = await client.query(
            "INSERT INTO card_priorities (card_id, priority_id) VALUES ($1, $2) RETURNING *",
            [card_id, priority_id]
        );

        // Ambil nama prioritas baru
        const newPriorityResult = await client.query(
            "SELECT name FROM priorities WHERE id = $1",
            [priority_id]
        );
        const newPriorityName = newPriorityResult.rows[0]?.name || null;

        // Log aktivitas
        await logCardActivity({
            action: 'updated_prio',
            card_id: parseInt(card_id),
            user_id: userId,
            entity: 'priority',
            entity_id: priority_id,
            details: {
                old_priority_id: oldPriorityId,
                old_priority_name: oldPriorityName,
                new_priority_id: priority_id,
                new_priority_name: newPriorityName
            }
        });

        await client.query('COMMIT');

        res.status(201).json({
            message: "Prioritas berhasil ditambahkan",
            data: insertResult.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error adding priority to card:", error);
        res.status(500).json({ error: "Terjadi kesalahan server" });
    }
});

//2. get all card priority
app.get('/api/card-priorities', async (req, res) => {
    try {
        const allCardPriorities = await client.query(
            "SELECT * FROM priorities"
        );
        res.json(allCardPriorities.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})
//3. get priority of a spesific card
app.get('/api/card-priorities/:cardId', async (req, res) => {
    const { cardId } = req.params;
    try {
        const cardPriority = await client.query(
            "SELECT p.id AS priority_id, p.name, p.color, p.background FROM card_priorities cp JOIN priorities p ON cp.priority_id = p.id WHERE cp.card_id = $1",
            [cardId]
        );
        res.json(cardPriority.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

//4. delete priority from card
app.delete('/api/card-priority', async (req, res) => {
    const { card_id, priority_id } = req.body;
    try {
        await client.query(
            "DELETE FROM card_priorities WHERE card_id = $1 AND priority_id = $2",
            [card_id, priority_id]
        );
        res.json({ message: "Priority removed from card" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

//END CARD PRIORITY

//LISTS
// reorder lists in a board simple.
app.put('/api/lists/reorder-list', async (req, res) => {
    const { board_id, lists } = req.body;

    if (!board_id || !Array.isArray(lists)) {
        return res.status(400).json({ error: 'board_id dan lists wajib diisi' });
    }

    try {
        await client.query('BEGIN');

        for (const list of lists) {
            await client.query(
                `UPDATE lists 
         SET position = $1, update_at = NOW() 
         WHERE id = $2 AND board_id = $3`,
                [list.position, list.id, board_id]
            );
        }

        await client.query('COMMIT');
        res.json({ success: true, updated: lists.length });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error updating list positions:', err);
        res.status(500).json({ error: err.message });
    }
});

//reorder list lebih kompleks
// PATCH satu list untuk ubah posisi semua list dalam board
app.patch('/api/lists/:listId/new-position', async (req, res) => {
    const { listId } = req.params;
    const { newPosition, boardId } = req.body;

    try {
        await client.query('BEGIN');

        // Ambil posisi lama dari list yang dipindah
        const { rows } = await client.query(
            `SELECT position FROM lists WHERE id = $1 AND board_id = $2`,
            [listId, boardId]
        );

        if (rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'List not found' });
        }

        const oldPosition = rows[0].position;

        // Kalau posisi berubah
        if (newPosition > oldPosition) {
            // Geser semua list di antara old+1..new ke atas (pos -1)
            await client.query(
                `UPDATE lists
         SET position = position - 1
         WHERE board_id = $1 AND position > $2 AND position <= $3`,
                [boardId, oldPosition, newPosition]
            );
        } else if (newPosition < oldPosition) {
            // Geser semua list di antara new..old-1 ke bawah (pos +1)
            await client.query(
                `UPDATE lists
         SET position = position + 1
         WHERE board_id = $1 AND position >= $2 AND position < $3`,
                [boardId, newPosition, oldPosition]
            );
        }

        // Update posisi list yang dipindah
        await client.query(
            `UPDATE lists
       SET position = $1, update_at = NOW()
       WHERE id = $2 AND board_id = $3`,
            [newPosition, listId, boardId]
        );

        await client.query('COMMIT');
        res.json({ success: true, listId, newPosition });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error moving list:', err);
        res.status(500).json({ error: err.message });
    }
});

// ✅ GET semua list dalam board tertentu, terurut berdasarkan posisi
app.get('/api/lists/board/:boardId', async (req, res) => {
    const { boardId } = req.params;

    try {
        const { rows } = await client.query(
            `SELECT * FROM lists WHERE board_id = $1 AND is_deleted = FALSE ORDER BY position ASC`,
            [boardId]
        );

        res.json(rows);
    } catch (err) {
        console.error('Error fetching lists by board:', err);
        res.status(500).json({ error: err.message });
    }
});




//1. get all lists
app.get('/api/lists', async (req, res) => {
    try {
        const result = await client.query("SELECT * FROM lists  ORDER BY position");
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
//2. get list by board_id
// app.get('/api/lists/board/:board_id', async (req, res) => {
//     const { board_id } = req.params;
//     try {
//         const result = await client.query("SELECT * FROM lists WHERE board_id = $1 AND is_deleted = FALSE ORDER BY position", [board_id]);
//         res.json(result.rows);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// })

//get list by id
app.get('/api/lists/:listId', async (req, res) => {
    const { listId } = req.params;
    try {
        const result = await client.query('SELECT * FROM lists WHERE id = $1', [listId])
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Board not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})


//3. create a new list
app.post('/api/lists', async (req, res) => {
    const { board_id, name } = req.body;
    const userId = req.user.id;

    try {
        const positionResult = await client.query("SELECT COALESCE(MAX(position), 0) + 1 AS next_position FROM lists WHERE board_id = $1", [board_id]);
        const position = positionResult.rows[0].next_position;

        const result = await client.query(
            "INSERT INTO lists (board_id, name, position, create_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING *",
            [board_id, name, position]
        );

        const listId = result.rows[0].id;

        //added activity log
        await logActivity(
            'list',
            listId,
            'create',
            userId,
            `List '${name}' created`,
            'board',
            board_id
        )

        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

//4. update list
app.put('/api/lists/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user.id;

    try {
        const result = await client.query(
            "UPDATE lists SET name = $1, update_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
            [name, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "List not found" });
        }

        // add log activity 
        await logActivity(
            'list',
            id,
            'update',
            userId,
            `List name updated to '${name}' in list`,
            'board',
            id
        )

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})



//5. delete lists
// app.delete('/api/lists/:id', async (req, res) => {
//     const { id } = req.params;
//     const userId = req.user.id;

//     try {
//         // tandai list sebagai terhapus
//         const result = await client.query(
//             "UPDATE lists SET is_deleted = true WHERE id = $1 RETURNING *",
//             [id]
//         );

//         if (result.rows.length === 0) {
//             return res.status(404).json({ error: "List not found" });
//         }

//         //add log activity
//         await logActivity(
//             'list',
//             id,
//             'delete',
//             userId,
//             `List with id '${id}' deleted`,
//             'board',
//             id
//         )

//         res.json({ message: "List deleted successfully" });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// })
app.delete('/api/lists/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id || null;

    try {
        const result = await client.query(
            `UPDATE lists 
       SET is_deleted = TRUE, deleted_at = NOW() 
       WHERE id = $1 
       RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'List not found' });
        }

        await logActivity(
            'list',
            id,
            'delete',
            userId,
            `List with id '${id}' soft-deleted`,
            'board',
            result.rows[0].board_id
        );

        res.json({
            message: 'List soft-deleted successfully',
            data: result.rows[0],
        });
    } catch (error) {
        console.error('Soft delete error:', error.message);
        res.status(500).json({ error: error.message });
    }
});




// Restore deleted list
app.patch('/api/lists/:id/restore', async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const result = await client.query(
            "UPDATE lists SET is_deleted = false WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "List not found or already active" });
        }

        await logActivity(
            'list',
            id,
            'restore',
            userId,
            `List with id '${id}' restored`,
            'board',
            id
        );

        res.json({ message: "List restored successfully", data: result.rows[0] });
    } catch (error) {
        console.error("Restore list error:", error);
        res.status(500).json({ error: error.message });
    }
});

//6. move list to another board
app.put('/api/move-list/:listId', async (req, res) => {
    const { listId } = req.params;
    const { newBoardId } = req.body;
    const userId = req.user.id;

    try {
        // 1. Cek apakah list ada
        const listQuery = 'SELECT * FROM public.lists WHERE id = $1';
        const list = await client.query(listQuery, [listId]);

        if (list.rows.length === 0) {
            return res.status(404).json({ message: 'List not found' });
        }

        // 2. Update list ke board baru
        const updateQuery = `
            UPDATE public.lists
            SET board_id = $1, update_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *`;
        const updatedList = await client.query(updateQuery, [newBoardId, listId]);

        // 3. Tambahkan log aktivitas
        await logActivity(
            'list',
            parseInt(listId),
            'move',
            userId,
            `List dengan ID ${listId} dipindahkan ke board ID ${newBoardId}`,
            'board',
            parseInt(newBoardId)
        );

        // 4. Kirim respons dengan list dan board ID tujuan
        return res.status(200).json({
            message: 'List berhasil dipindahkan',
            list: updatedList.rows[0],
            destinationBoardId: parseInt(newBoardId)
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error moving list' });
    }
});


//7. Duplicate list and all its cards to a new board
app.post('/api/duplicate-list/:listId', async (req, res) => {
    const { listId } = req.params;
    const { newBoardId } = req.body; // New board ID from request body
    const userId = req.user.id;

    try {
        // Mulai transaksi untuk memastikan konsistensi data
        await client.query('BEGIN');

        // 1. Ambil data list asli
        const listQuery = 'SELECT * FROM public.lists WHERE id = $1';
        const list = await client.query(listQuery, [listId]);

        if (list.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'List not found' });
        }

        // 2. Dapatkan posisi terakhir di board baru
        const maxPositionQuery = 'SELECT COALESCE(MAX(position), 0) + 1 AS new_position FROM public.lists WHERE board_id = $1';
        const maxPositionResult = await client.query(maxPositionQuery, [newBoardId]);
        const newPosition = maxPositionResult.rows[0].new_position;

        // 3. Duplikasi list ke board baru
        const duplicateListQuery = `
            INSERT INTO public.lists (board_id, name, position, create_at)
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
            RETURNING id`;
        const duplicatedList = await client.query(duplicateListQuery, [
            newBoardId,
            list.rows[0].name,
            newPosition
        ]);
        const duplicatedListId = duplicatedList.rows[0].id;

        // 4. Ambil semua kartu dalam list asli
        const cardsQuery = 'SELECT * FROM public.cards WHERE list_id = $1 ORDER BY position';
        const cards = await client.query(cardsQuery, [listId]);

        for (const card of cards.rows) {
            // Dapatkan posisi baru berdasarkan urutan kartu asli
            const maxCardPositionQuery = 'SELECT COALESCE(MAX(position), 0) + 1 AS new_card_position FROM public.cards WHERE list_id = $1';
            const maxCardPositionResult = await client.query(maxCardPositionQuery, [duplicatedListId]);
            const newCardPosition = maxCardPositionResult.rows[0].new_card_position;

            // Salin kartu ke list baru
            const duplicateCardQuery = `
                INSERT INTO public.cards (list_id, title, description, position, create_at)
                VALUES ($1, $2, $3, $4,CURRENT_TIMESTAMP)
                RETURNING id`;
            const newCard = await client.query(duplicateCardQuery, [
                duplicatedListId,
                card.title,
                card.description,
                newCardPosition
            ]);
            const newCardId = newCard.rows[0].id;

            // Salin seluruh data terkait kartu (checklists, cover, descriptions, etc.)
            const relations = [
                { table: 'card_checklists', columns: 'checklist_id, created_at, updated_at' },
                { table: 'card_cover', columns: 'cover_id' },
                { table: 'card_descriptions', columns: 'description, created_at, updated_at' },
                { table: 'card_due_dates', columns: 'due_date, created_at, updated_at' },
                { table: 'card_labels', columns: 'label_id' },
                { table: 'card_members', columns: 'user_id' },
                { table: 'card_priorities', columns: 'priority_id' },
                { table: 'card_status', columns: 'status_id, assigned_at' },
                { table: 'card_users', columns: 'user_id' }
            ];

            for (const { table, columns } of relations) {
                await client.query(
                    `INSERT INTO public.${table} (card_id, ${columns})
                     SELECT $1, ${columns} FROM public.${table} WHERE card_id = $2`,
                    [newCardId, card.id]
                );
            }
        }

        // Commit transaksi
        await client.query('COMMIT');

        //add log activity
        await logActivity(
            'list',
            listId,
            'duplicate',
            userId,
            `List id dengan id${listId} diduplikasi ke board id ${newBoardId}`,
            'board',
            newBoardId
        )

        return res.status(201).json({ duplicatedListId });

    } catch (err) {
        // Rollback jika terjadi error
        await client.query('ROLLBACK');
        console.error(err);
        return res.status(500).json({ message: 'Error duplicating list' });
    }
});

//8. archive data lists
app.put('/api/archive-lists/:listId', async (req, res) => {
    const { listId } = req.params;
    const userId = req.user.id;

    try {
        // Retrieve the list data to be archived
        const listQuery = 'SELECT * FROM public.lists WHERE id = $1';
        const listResult = await client.query(listQuery, [listId]);

        if (listResult.rows.length === 0) {
            return res.status(404).json({ error: 'List not found' });
        }

        const list = listResult.rows[0];

        // Insert the list into the archive table
        const archiveQuery = `
                INSERT INTO public.archive (entity_type, entity_id, name, description, parent_id, parent_type)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id, entity_type, entity_id, name, description, parent_id, parent_type, archived_at
            `;
        const archiveResult = await client.query(archiveQuery, [
            'list',
            list.id,
            list.name,
            list.description,
            list.board_id,
            'board',
        ]);

        const archivedData = archiveResult.rows[0];

        // If archive is successful, delete the list from lists table
        const deleteQuery = 'DELETE FROM public.lists WHERE id = $1';
        await client.query(deleteQuery, [listId]);

        //add activity log
        await logActivity(
            'list',
            listId,
            'archive',
            userId,
            `List dengan id ${listId} berhasil di archive`,
            'board',
            listId
        )

        return res.status(200).json({
            message: 'List archived successfully',
            archivedData: archivedData,
        });
    } catch (error) {
        console.error('Error archiving list:', error);
        return res.status(500).json({
            error: 'An error occurred while archiving the list',
        });
    }
})

//END LISTS

// CARD POSITION IN LIST 
//1.  get all card in list
app.get('/api/lists/:listId/cards', async (req, res) => {
    const { listId } = req.params;

    try {
        const result = await client.query(
            `SELECT * FROM cards WHERE list_id = $1 ORDER BY position ASC`,
            [listId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//2. update posisi satu card saja
app.patch('/api/cards/:cardId/position', async (req, res) => {
    const { cardId } = req.params;
    const { newPosition, listId } = req.body;

    try {
        await client.query(
            `UPDATE cards 
       SET position = $1, updated_at = NOW() 
       WHERE id = $2 AND list_id = $3`,
            [newPosition, cardId, listId]
        );

        res.json({ success: true, cardId, newPosition });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//3. reorder untuk drag and drop
app.put('/api/lists/:listId/cards/reorder', async (req, res) => {
    const { listId } = req.params;
    const { cards } = req.body;

    try {
        await client.query('BEGIN');

        for (const card of cards) {
            await client.query(
                `UPDATE cards 
         SET position = $1, updated_at = NOW() 
         WHERE id = $2 AND list_id = $3`,
                [card.position, card.id, listId]
            );
        }

        await client.query('COMMIT');
        res.json({ success: true, updated: cards.length });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    }
});

//4. patch satu card untuk semua card dalam list
app.patch('/api/cards/:cardId/new-position', async (req, res) => {
    const { cardId } = req.params;
    const { newPosition, listId } = req.body;

    try {
        await client.query('BEGIN');

        // Ambil posisi lama
        const { rows } = await client.query(
            `SELECT position FROM cards WHERE id = $1 AND list_id = $2`,
            [cardId, listId]
        );
        if (rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Card not found' });
        }
        const oldPosition = rows[0].position;

        if (newPosition > oldPosition) {
            // geser semua card di antara old+1 .. new ke atas (pos -1)
            await client.query(
                `UPDATE cards
         SET position = position - 1
         WHERE list_id = $1 AND position > $2 AND position <= $3`,
                [listId, oldPosition, newPosition]
            );
        } else if (newPosition < oldPosition) {
            // geser semua card di antara new .. old-1 ke bawah (pos +1)
            await client.query(
                `UPDATE cards
         SET position = position + 1
         WHERE list_id = $1 AND position >= $2 AND position < $3`,
                [listId, newPosition, oldPosition]
            );
        }


        // Update card yang dipindah
        await client.query(
            `UPDATE cards
       SET position = $1, update_at = NOW()
       WHERE id = $2 AND list_id = $3`,
            [newPosition, cardId, listId]
        );

        await client.query('COMMIT');
        res.json({ success: true, cardId, newPosition });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    }
});



// END CARD POSITION IN LIST 



//CARD
//1. get all cards
app.get('/api/cards', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM cards ORDER BY position');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

//get card by id
app.get('/api/cards/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await client.query(`
      SELECT 
        c.id AS card_id,
        c.list_id,
        c.title,
        c.description,
        c.position,
        c.due_date,
        json_agg(
          json_build_object(
            'id', l.id,
            'name', l.name,
            'color', l.color
          )
        ) FILTER (WHERE l.id IS NOT NULL) AS labels
      FROM cards c
      LEFT JOIN card_labels cl ON cl.card_id = c.id
      LEFT JOIN labels l ON l.id = cl.label_id
      WHERE c.id = $1
      GROUP BY c.id
    `, [id]);

        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Card not found' });
        }
    } catch (error) {
        console.error('Error fetching card:', error);
        res.status(500).json({ error: error.message });
    }
});

//2. get card by list id
app.get('/api/cards/list/:listId', async (req, res) => {
    const { listId } = req.params;
    try {
        const result = await client.query("SELECT * FROM cards WHERE list_id = $1 AND is_deleted = FALSE ORDER BY position", [listId]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

//3. create a new card
app.post('/api/cards', async (req, res) => {
    const { title, description, list_id } = req.body;
    const userId = req.user.id;

    try {
        if (!title || !description || !list_id) {
            return res.status(400).json({ error: "Title, description, and list_id are required" });
        }

        // Cek apakah list_id ada di database
        const listCheck = await client.query("SELECT id FROM lists WHERE id = $1", [list_id]);
        if (listCheck.rows.length === 0) {
            return res.status(404).json({ error: "List not found" });
        }

        // Dapatkan posisi terakhir dalam list tersebut
        const positionResult = await client.query(
            "SELECT COALESCE(MAX(position), 0) + 1 AS new_position FROM cards WHERE list_id = $1",
            [list_id]
        );
        const newPosition = positionResult.rows[0].new_position;

        // Tambahkan kartu ke dalam list yang sesuai
        const result = await client.query(
            "INSERT INTO cards (title, description, list_id, position, create_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING *",
            [title, description, list_id, newPosition]
        );

        const cardId = result.rows[0].id;
        console.log('Endpoin post card ini menerima cardId:', cardId)

        //add log activity
        await logActivity(
            'card',
            cardId,
            'create',
            userId,
            `Card ${title} created`,
            'list',
            list_id
        )

        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


//4. delete card
app.delete('/api/cards/:cardId', async (req, res) => {
    const { cardId } = req.params;
    const userId = req.user.id;

    try {
        const { rows } = await client.query(
            "SELECT list_id, position FROM cards WHERE id = $1 AND is_deleted = FALSE",
            [cardId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Card not found or already deleted" });
        }

        const { list_id, position } = rows[0];

        // 1️⃣ Update card jadi 'deleted'
        await client.query(
            `UPDATE cards 
            SET is_deleted = TRUE, deleted_at = NOW() 
            WHERE id = $1`,
            [cardId]
        );

        // 2️⃣ Update posisi card lain dalam list
        await client.query(
            `UPDATE cards
             SET position = position - 1
             WHERE list_id = $1 AND position > $2 AND is_deleted = FALSE`,
            [list_id, position]
        );

        // 3️⃣ Log activity
        await logActivity(
            'card',
            cardId,
            'soft_delete',
            userId,
            `Card with id ${cardId} moved to recycle bin`,
            'list',
            cardId
        );

        res.json({ message: "Card moved to recycle bin (soft deleted)" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// restore soft-deleted card
app.patch('/api/cards/:cardId/restore', async (req, res) => {
    const { cardId } = req.params;
    const userId = req.user.id;

    try {
        // Ambil list_id card yang mau direstore
        const { rows } = await client.query(
            "SELECT list_id FROM cards WHERE id = $1 AND is_deleted = TRUE",
            [cardId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Card not found or not deleted" });
        }

        const { list_id } = rows[0];

        // Dapatkan posisi terakhir di list untuk card aktif
        const { rows: activeCards } = await client.query(
            "SELECT COUNT(*) AS count FROM cards WHERE list_id = $1 AND is_deleted = FALSE",
            [list_id]
        );
        const newPosition = parseInt(activeCards[0].count) + 1;

        // Restore card
        await client.query(
            "UPDATE cards SET is_deleted = FALSE, position = $1 WHERE id = $2",
            [newPosition, cardId]
        );

        // Log activity
        await logActivity(
            'card',
            cardId,
            'restore',
            userId,
            `Card with id ${cardId} restored from recycle bin`,
            'list',
            cardId
        );

        res.json({ message: "Card restored successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


//5. duplicate card
// Endpoint untuk duplikasi card ke list tertentu
app.post('/api/duplicate-card-to-list/:cardId/:listId', async (req, res) => {
    const { cardId, listId } = req.params;
    const { position } = req.body; // 🎯 ambil posisi dari body
    const userId = req.user.id;


    try {
        await client.query('BEGIN');

        // Kalau user pilih posisi, geser posisi lain dulu
        if (position) {
            await client.query(
                `UPDATE public.cards 
            SET position = position + 1 
            WHERE list_id = $1 AND position >= $2`,
                [listId, position]
            );
        }

        const result = await client.query(
            `INSERT INTO public.cards (title, description, list_id, position) 
        SELECT title, description, $1, 
                COALESCE($2, (SELECT COALESCE(MAX(position), 0) + 1 FROM public.cards WHERE list_id = $1))
        FROM public.cards 
        WHERE id = $3 
        RETURNING id, title, list_id`,
            [listId, position, cardId]
        );


        const newCardId = result.rows[0].id;
        const newCardTitle = result.rows[0].title;

        // 2. Salin relasi-relasi card
        await client.query(
            `INSERT INTO public.card_checklists (card_id, checklist_id, created_at, updated_at)
             SELECT $1, checklist_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
             FROM public.card_checklists WHERE card_id = $2`,
            [newCardId, cardId]
        );

        await client.query(
            `INSERT INTO public.card_cover (card_id, cover_id)
             SELECT $1, cover_id FROM public.card_cover WHERE card_id = $2`,
            [newCardId, cardId]
        );

        await client.query(
            `INSERT INTO public.card_descriptions (card_id, description, created_at, updated_at)
             SELECT $1, description, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
             FROM public.card_descriptions WHERE card_id = $2`,
            [newCardId, cardId]
        );

        await client.query(
            `INSERT INTO public.card_due_dates (card_id, due_date, created_at, updated_at)
             SELECT $1, due_date, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
             FROM public.card_due_dates WHERE card_id = $2`,
            [newCardId, cardId]
        );

        await client.query(
            `INSERT INTO public.card_labels (card_id, label_id)
             SELECT $1, label_id FROM public.card_labels WHERE card_id = $2`,
            [newCardId, cardId]
        );

        await client.query(
            `INSERT INTO public.card_members (card_id, user_id)
             SELECT $1, user_id FROM public.card_members WHERE card_id = $2`,
            [newCardId, cardId]
        );

        await client.query(
            `INSERT INTO public.card_priorities (card_id, priority_id)
             SELECT $1, priority_id FROM public.card_priorities WHERE card_id = $2`,
            [newCardId, cardId]
        );

        await client.query(
            `INSERT INTO public.card_status (card_id, status_id, assigned_at)
             SELECT $1, status_id, CURRENT_TIMESTAMP
             FROM public.card_status WHERE card_id = $2`,
            [newCardId, cardId]
        );

        await client.query(
            `INSERT INTO public.card_users (card_id, user_id)
             SELECT $1, user_id FROM public.card_users WHERE card_id = $2`,
            [newCardId, cardId]
        );

        // 3. Ambil nama user untuk dicatat di activity
        const userRes = await client.query(
            "SELECT username FROM users WHERE id = $1",
            [userId]
        );
        const userName = userRes.rows[0]?.username || 'Unknown';

        // === Ambil info list + board asal (dari card lama) ===
        const oldListRes = await client.query(
            `SELECT l.id AS list_id, l.name AS list_name, b.id AS board_id, b.name AS board_name
             FROM cards c
             JOIN lists l ON c.list_id = l.id
             JOIN boards b ON l.board_id = b.id
             WHERE c.id = $1`,
            [cardId]
        );
        const fromListId = oldListRes.rows[0]?.list_id;
        const fromListName = oldListRes.rows[0]?.list_name || "Unknown List";
        const fromBoardId = oldListRes.rows[0]?.board_id;
        const fromBoardName = oldListRes.rows[0]?.board_name || "Unknown Board";

        // === Ambil info list + board tujuan ===
        const newListRes = await client.query(
            `SELECT l.id AS list_id, l.name AS list_name, b.id AS board_id, b.name AS board_name
             FROM lists l
             JOIN boards b ON l.board_id = b.id
             WHERE l.id = $1`,
            [listId]
        );
        const toListName = newListRes.rows[0]?.list_name || "Unknown List";
        const toBoardId = newListRes.rows[0]?.board_id;
        const toBoardName = newListRes.rows[0]?.board_name || "Unknown Board";

        // Ambil semua card di list tujuan untuk generate pilihan posisi
        const cardsInTargetList = await client.query(
            `SELECT id, title, position FROM public.cards WHERE list_id = $1 ORDER BY position ASC`,
            [listId]
        );

        const positions = cardsInTargetList.rows.map((c, index) => ({
            value: index + 1,
            label: `${index + 1}. ${c.title}`
        }));


        await client.query('COMMIT');

        // 4. Log ke user_activity (global activity)
        await logActivity(
            'card',
            newCardId,
            'duplicate',
            userId,
            `Card dengan ID ${cardId} diduplikasi dari list ${fromListId} ke list ${listId}`,
            'list',
            listId
        );

        // 5. Log ke card_activities (activity di card baru)
        await logCardActivity({
            action: 'duplicate',
            card_id: newCardId,
            user_ids: [userId], // <<< perbaikan di sini
            entity: 'list',
            entity_id: listId,
            details: {
                cardTitle: newCardTitle,
                fromListId,
                fromListName,
                fromBoardId,
                fromBoardName,
                toListId: listId,
                toListName,
                toBoardId,
                toBoardName,
                duplicatedBy: { id: userId, username: userName }
            }
        });


        // Response sukses
        res.status(200).json({
            message: 'Card berhasil diduplikasi',
            cardId: newCardId,
            listId,
            listName: toListName,
            fromBoard: { id: fromBoardId, name: fromBoardName },
            toBoard: { id: toBoardId, name: toBoardName },
            newCard: {
                id: newCardId,
                title: newCardTitle,
                listId,
                listName: toListName,
                duplicatedBy: {
                    id: userId,
                    username: userName
                }
            },
            positions
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Terjadi kesalahan saat menyalin card ke list yang baru' });
    }
});


// Endpoint untuk duplikasi card ke list tertentu
// app.post('/api/duplicate-card-to-list/:cardId/:listId', async (req, res) => {
//     const { cardId, listId } = req.params;
//     const { position } = req.body;
//     const userId = req.user?.id || 1; // sementara kalau belum ada auth middleware

//     try {
//         await client.query('BEGIN');

//         // Geser posisi jika user pilih posisi
//         if (position) {
//             await client.query(
//                 `UPDATE public.cards 
//                  SET position = position + 1 
//                  WHERE list_id = $1 AND position >= $2`,
//                 [listId, position]
//             );
//         }

//         // Duplikasi card
//         const result = await client.query(
//             `INSERT INTO public.cards (title, description, list_id, position) 
//              SELECT title, description, $1, 
//                     COALESCE($2, (SELECT COALESCE(MAX(position), 0) + 1 FROM public.cards WHERE list_id = $1))
//              FROM public.cards 
//              WHERE id = $3
//              RETURNING id, title, list_id`,
//             [listId, position, cardId]
//         );

//         const newCardId = result.rows[0].id;
//         const newCardTitle = result.rows[0].title;

//         // === Duplikasi relasi manual ===
//         await client.query(
//             `INSERT INTO public.card_checklists (card_id, checklist_id, created_at, updated_at)
//              SELECT $1, checklist_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
//              FROM public.card_checklists WHERE card_id = $2`,
//             [newCardId, cardId]
//         );

//         await client.query(
//             `INSERT INTO public.card_cover (card_id, cover_id)
//              SELECT $1, cover_id FROM public.card_cover WHERE card_id = $2`,
//             [newCardId, cardId]
//         );

//         await client.query(
//             `INSERT INTO public.card_descriptions (card_id, description, created_at, updated_at)
//              SELECT $1, description, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
//              FROM public.card_descriptions WHERE card_id = $2`,
//             [newCardId, cardId]
//         );

//         await client.query(
//             `INSERT INTO public.card_due_dates (card_id, due_date, created_at, updated_at)
//              SELECT $1, due_date, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
//              FROM public.card_due_dates WHERE card_id = $2`,
//             [newCardId, cardId]
//         );

//         await client.query(
//             `INSERT INTO public.card_labels (card_id, label_id)
//              SELECT $1, label_id FROM public.card_labels WHERE card_id = $2`,
//             [newCardId, cardId]
//         );

//         await client.query(
//             `INSERT INTO public.card_members (card_id, user_id)
//              SELECT $1, user_id FROM public.card_members WHERE card_id = $2`,
//             [newCardId, cardId]
//         );

//         await client.query(
//             `INSERT INTO public.card_priorities (card_id, priority_id)
//              SELECT $1, priority_id FROM public.card_priorities WHERE card_id = $2`,
//             [newCardId, cardId]
//         );

//         await client.query(
//             `INSERT INTO public.card_status (card_id, status_id, assigned_at)
//              SELECT $1, status_id, CURRENT_TIMESTAMP
//              FROM public.card_status WHERE card_id = $2`,
//             [newCardId, cardId]
//         );

//         // === Ambil semua user workspace (bukan card_users) ===
//         const workspaceRes = await client.query(
//             `SELECT DISTINCT u.id AS user_id
//              FROM users u
//              JOIN workspaces_users wu ON wu.user_id = u.id
//              JOIN lists l ON l.board_id = (SELECT board_id FROM lists WHERE id = $1)
//              WHERE wu.workspace_id = l.board_id`,
//             [listId]
//         );
//         const workspaceUserIds = workspaceRes.rows.map(r => r.user_id);

//         // Ambil nama user yang duplicate card
//         const userRes = await client.query(
//             `SELECT username FROM users WHERE id = $1`,
//             [userId]
//         );
//         const userName = userRes.rows[0]?.username || 'Unknown';

//         // Ambil info list & board lama
//         const oldListRes = await client.query(
//             `SELECT l.id AS list_id, l.name AS list_name, b.id AS board_id, b.name AS board_name
//              FROM cards c
//              JOIN lists l ON c.list_id = l.id
//              JOIN boards b ON l.board_id = b.id
//              WHERE c.id = $1`,
//             [cardId]
//         );
//         const fromListId = oldListRes.rows[0]?.list_id;
//         const fromListName = oldListRes.rows[0]?.list_name || "Unknown List";
//         const fromBoardId = oldListRes.rows[0]?.board_id;
//         const fromBoardName = oldListRes.rows[0]?.board_name || "Unknown Board";

//         // Ambil info list & board baru
//         const newListRes = await client.query(
//             `SELECT l.id AS list_id, l.name AS list_name, b.id AS board_id, b.name AS board_name
//              FROM lists l
//              JOIN boards b ON l.board_id = b.id
//              WHERE l.id = $1`,
//             [listId]
//         );
//         const toListName = newListRes.rows[0]?.list_name || "Unknown List";
//         const toBoardId = newListRes.rows[0]?.board_id;
//         const toBoardName = newListRes.rows[0]?.board_name || "Unknown Board";

//         // Log activity untuk semua user workspace
//         await logCardActivity({
//             action: 'duplicate',
//             card_id: newCardId,
//             user_ids: workspaceUserIds,
//             entity: 'list',
//             entity_id: listId,
//             details: {
//                 cardTitle: newCardTitle,
//                 fromListId,
//                 fromListName,
//                 fromBoardId,
//                 fromBoardName,
//                 toListId: listId,
//                 toListName,
//                 toBoardId,
//                 toBoardName,
//                 duplicatedBy: { id: userId, username: userName }
//             }
//         });

//         await client.query('COMMIT');

//         res.status(200).json({
//             message: 'Card berhasil diduplikasi',
//             cardId: newCardId,
//             listId,
//             listName: toListName,
//             fromBoard: { id: fromBoardId, name: fromBoardName },
//             toBoard: { id: toBoardId, name: toBoardName },
//             newCard: {
//                 id: newCardId,
//                 title: newCardTitle,
//                 listId,
//                 listName: toListName,
//                 duplicatedBy: { id: userId, username: userName }
//             }
//         });

//     } catch (err) {
//         await client.query('ROLLBACK');
//         console.error('❌ Gagal duplikasi card:', err);
//         res.status(500).json({ error: 'Terjadi kesalahan saat menduplikasi card' });
//     }
// });

// 6. Move card (antar list atau board + posisi baru)
// 6. Move card (antar list atau board + posisi baru)
// app.put('/api/cards/:cardId/move', async (req, res) => {
//     const { cardId } = req.params;
//     const { targetListId, newPosition } = req.body;
//     const actingUserId = req.user?.id;

//     if (!actingUserId) return res.status(401).json({ error: 'Unauthorized' });

//     try {
//         await client.query('BEGIN');

//         // ambil info card lama
//         const oldCardRes = await client.query(
//             `SELECT c.list_id, c.position, c.title, l.board_id 
//        FROM cards c 
//        JOIN lists l ON c.list_id = l.id
//        WHERE c.id = $1`,
//             [cardId]
//         );
//         if (oldCardRes.rows.length === 0)
//             return res.status(404).json({ error: 'Card tidak ditemukan' });

//         const { list_id: oldListId, board_id: oldBoardId, position: oldPosition, title } = oldCardRes.rows[0];

//         // ambil board_id dari list tujuan
//         const targetListRes = await client.query(`SELECT board_id FROM lists WHERE id = $1`, [targetListId]);
//         if (targetListRes.rows.length === 0)
//             return res.status(404).json({ error: 'List tujuan tidak ditemukan' });
//         const targetBoardId = targetListRes.rows[0].board_id;

//         // geser posisi di list lama
//         await client.query(
//             `UPDATE cards SET position = position - 1
//        WHERE list_id = $1 AND position > $2`,
//             [oldListId, oldPosition]
//         );

//         // hitung posisi baru
//         let finalPosition = newPosition;
//         if (!finalPosition) {
//             const posRes = await client.query(
//                 `SELECT COALESCE(MAX(position), 0) + 1 AS pos
//          FROM cards WHERE list_id = $1`,
//                 [targetListId]
//             );
//             finalPosition = posRes.rows[0].pos;
//         } else {
//             // geser posisi di list tujuan
//             await client.query(
//                 `UPDATE cards SET position = position + 1
//          WHERE list_id = $1 AND position >= $2`,
//                 [targetListId, finalPosition]
//             );
//         }

//         // update posisi dan list card
//         await client.query(
//             `UPDATE cards
//        SET list_id = $1, position = $2, update_at = CURRENT_TIMESTAMP
//        WHERE id = $3`,
//             [targetListId, finalPosition, cardId]
//         );

//         // ambil info board & list lama dan baru
//         const oldInfo = await client.query(
//             `SELECT l.name AS list_name, b.name AS board_name
//        FROM lists l 
//        JOIN boards b ON l.board_id = b.id
//        WHERE l.id = $1`,
//             [oldListId]
//         );
//         const newInfo = await client.query(
//             `SELECT l.name AS list_name, b.name AS board_name
//        FROM lists l 
//        JOIN boards b ON l.board_id = b.id
//        WHERE l.id = $1`,
//             [targetListId]
//         );

//         const oldListName = oldInfo.rows[0]?.list_name || 'Unknown List';
//         const oldBoardName = oldInfo.rows[0]?.board_name || 'Unknown Board';
//         const newListName = newInfo.rows[0]?.list_name || 'Unknown List';
//         const newBoardName = newInfo.rows[0]?.board_name || 'Unknown Board';

//         // ambil semua user workspace
//         const workspaceUsersRes = await client.query(
//             `SELECT user_id FROM workspaces_users WHERE workspace_id = $1 AND is_deleted = FALSE`,
//             [oldBoardId]
//         );
//         const userIds = workspaceUsersRes.rows.map(r => r.user_id);

//         // pastikan actingUserId ada di userIds
//         if (!userIds.includes(actingUserId)) userIds.push(actingUserId);

//         // ambil username acting user
//         const actingUserRes = await client.query(
//             'SELECT username FROM users WHERE id = $1',
//             [actingUserId]
//         );
//         const actingUserName = actingUserRes.rows[0]?.username || 'Unknown';

//         // log activity
//         await logCardActivity({
//             action: 'move',
//             card_id: cardId,
//             user_ids: userIds,
//             entity: 'list',
//             entity_id: targetListId,
//             details: {
//                 cardTitle: title,
//                 fromBoardId: oldBoardId,
//                 fromBoardName: oldBoardName,
//                 fromListId: oldListId,
//                 fromListName: oldListName,
//                 toBoardId: targetBoardId,
//                 toBoardName: newBoardName,
//                 toListId: targetListId,
//                 toListName: newListName,
//                 newPosition: finalPosition,
//                 movedBy: { id: actingUserId, username: actingUserName } // ✅ user yang benar-benar memindahkan
//             }
//         });

//         await client.query('COMMIT');

//         // response ke frontend
//         res.status(200).json({
//             message: 'Card berhasil dipindahkan',
//             cardId,
//             fromListId: oldListId,
//             fromListName: oldListName,
//             toListId: targetListId,
//             toListName: newListName,
//             fromBoardId: oldBoardId,
//             fromBoardName: oldBoardName,
//             toBoardId: targetBoardId,
//             toBoardName: newBoardName,
//             position: finalPosition,
//             movedBy: { id: actingUserId, username: actingUserName } // frontend bisa langsung pakai
//         });

//     } catch (err) {
//         await client.query('ROLLBACK');
//         console.error('❌ Gagal move card:', err);
//         res.status(500).json({ error: 'Gagal memindahkan card' });
//     }
// });
// 6. Move card (antar list atau board + posisi baru)
app.put('/api/cards/:cardId/move', async (req, res) => {
    const { cardId } = req.params;
    const { targetListId, newPosition } = req.body;
    const actingUserId = req.user?.id;

    if (!actingUserId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        await client.query('BEGIN');

        // ambil info card lama
        const oldCardRes = await client.query(
            `SELECT c.list_id, c.position, c.title, l.board_id 
       FROM cards c 
       JOIN lists l ON c.list_id = l.id
       WHERE c.id = $1`,
            [cardId]
        );
        if (oldCardRes.rows.length === 0)
            return res.status(404).json({ error: 'Card tidak ditemukan' });

        const { list_id: oldListId, board_id: oldBoardId, position: oldPosition, title } = oldCardRes.rows[0];

        // ambil board_id dari list tujuan
        const targetListRes = await client.query(`SELECT board_id FROM lists WHERE id = $1`, [targetListId]);
        if (targetListRes.rows.length === 0)
            return res.status(404).json({ error: 'List tujuan tidak ditemukan' });
        const targetBoardId = targetListRes.rows[0].board_id;

        // geser posisi di list lama
        await client.query(
            `UPDATE cards SET position = position - 1
       WHERE list_id = $1 AND position > $2`,
            [oldListId, oldPosition]
        );

        // hitung posisi baru
        let finalPosition = newPosition;
        if (!finalPosition) {
            const posRes = await client.query(
                `SELECT COALESCE(MAX(position), 0) + 1 AS pos
         FROM cards WHERE list_id = $1`,
                [targetListId]
            );
            finalPosition = posRes.rows[0].pos;
        } else {
            // geser posisi di list tujuan
            await client.query(
                `UPDATE cards SET position = position + 1
         WHERE list_id = $1 AND position >= $2`,
                [targetListId, finalPosition]
            );
        }

        // update posisi dan list card
        await client.query(
            `UPDATE cards
       SET list_id = $1, position = $2, update_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
            [targetListId, finalPosition, cardId]
        );

        // ambil info board & list lama dan baru
        const oldInfo = await client.query(
            `SELECT l.name AS list_name, b.name AS board_name
       FROM lists l 
       JOIN boards b ON l.board_id = b.id
       WHERE l.id = $1`,
            [oldListId]
        );
        const newInfo = await client.query(
            `SELECT l.name AS list_name, b.name AS board_name
       FROM lists l 
       JOIN boards b ON l.board_id = b.id
       WHERE l.id = $1`,
            [targetListId]
        );

        const oldListName = oldInfo.rows[0]?.list_name || 'Unknown List';
        const oldBoardName = oldInfo.rows[0]?.board_name || 'Unknown Board';
        const newListName = newInfo.rows[0]?.list_name || 'Unknown List';
        const newBoardName = newInfo.rows[0]?.board_name || 'Unknown Board';

        // ambil semua user workspace
        const workspaceUsersRes = await client.query(
            `SELECT user_id FROM workspaces_users WHERE workspace_id = $1 AND is_deleted = FALSE`,
            [oldBoardId]
        );
        const userIds = workspaceUsersRes.rows.map(r => r.user_id);

        // pastikan actingUserId ada di userIds
        if (!userIds.includes(actingUserId)) userIds.push(actingUserId);

        // ambil username acting user
        const actingUserRes = await client.query(
            'SELECT username FROM users WHERE id = $1',
            [actingUserId]
        );
        const actingUserName = actingUserRes.rows[0]?.username || 'Unknown';

        // log activity
        await logCardActivity({
            action: 'move',
            card_id: cardId,
            user_ids: userIds,
            entity: 'list',
            entity_id: targetListId,
            details: {
                cardTitle: title,
                fromBoardId: oldBoardId,
                fromBoardName: oldBoardName,
                fromListId: oldListId,
                fromListName: oldListName,
                toBoardId: targetBoardId,
                toBoardName: newBoardName,
                toListId: targetListId,
                toListName: newListName,
                newPosition: finalPosition,
                movedBy: { id: actingUserId, username: actingUserName } // ✅ user yang benar-benar memindahkan
            }
        });

        await client.query('COMMIT');

        // response ke frontend
        res.status(200).json({
            message: 'Card berhasil dipindahkan',
            cardId,
            fromListId: oldListId,
            fromListName: oldListName,
            toListId: targetListId,
            toListName: newListName,
            fromBoardId: oldBoardId,
            fromBoardName: oldBoardName,
            toBoardId: targetBoardId,
            toBoardName: newBoardName,
            position: finalPosition,
            movedBy: { id: actingUserId, username: actingUserName } // frontend bisa langsung pakai
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Gagal move card:', err);
        res.status(500).json({ error: 'Gagal memindahkan card' });
    }
});






//7. archive card data
app.put('/api/archive-card/:cardId', async (req, res) => {
    const { cardId } = req.params;
    const userId = req.user.id;

    try {
        // 1. Ambil data card
        const cardResult = await client.query(
            'SELECT list_id, position, title, description FROM public.cards WHERE id = $1',
            [cardId]
        );

        if (cardResult.rows.length === 0) {
            return res.status(404).json({ error: 'Card not found' });
        }

        const { list_id, position, title, description } = cardResult.rows[0];

        // 2. Insert card ke archive
        const archiveResult = await client.query(
            `INSERT INTO public.archive (entity_type, entity_id, name, description, parent_id, parent_type)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, entity_type, entity_id, name, description, parent_id, parent_type, archived_at`,
            ['card', cardId, title, description, list_id, 'list']
        );

        const archivedData = archiveResult.rows[0];

        // 3. Hapus card dari table cards
        await client.query('DELETE FROM public.cards WHERE id = $1', [cardId]);

        // 4. Reorder posisi card lain di list
        await client.query(
            `UPDATE public.cards
       SET position = position - 1
       WHERE list_id = $1 AND position > $2`,
            [list_id, position]
        );

        // 5. Log activity
        await logActivity(
            'card',
            cardId,
            'archive',
            userId,
            `Card dengan ID ${cardId} berhasil di archive`,
            'list',
            cardId
        );

        return res.status(200).json({
            message: 'Card archived successfully and positions updated',
            archivedData,
        });

    } catch (error) {
        console.error('Error archiving card:', error);
        return res.status(500).json({ error: 'An error occurred while archiving the card' });
    }
});

//END CARD

//CARD USER
//1. get semua user yang disa di assign ke card
app.get('/api/cards/:cardId/assignable-users', async (req, res) => {
    const { cardId } = req.params;

    try {
        const query = `
        SELECT 
            u.id AS user_id,
            u.username,
            u.email,
            p.photo_url
        FROM users u
        JOIN user_profil up ON up.user_id = u.id
        JOIN profil p ON p.id = up.profil_id
        JOIN workspaces_users wu ON wu.user_id = u.id
        JOIN boards b ON b.workspace_id = wu.workspace_id
        JOIN lists l ON l.board_id = b.id
        JOIN cards c ON c.list_id = l.id
        WHERE c.id = $1;
        `;

        const result = await client.query(query, [cardId]);

        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

//2. assign user to card
app.post('/api/cards/:cardId/users/:userId', async (req, res) => {
    const { cardId, userId } = req.params;
    const usersId = req.user.id;

    try {
        const validationQuery = `
        SELECT 1
        FROM workspaces_users wu
        JOIN boards b ON b.workspace_id = wu.workspace_id
        JOIN lists l ON l.board_id = b.id
        JOIN cards c ON c.list_id = l.id
        WHERE wu.user_id = $1 AND c.id = $2
        LIMIT 1;
        `;
        const validation = await client.query(validationQuery, [userId, cardId]);

        if (validation.rowCount === 0) {
            return res.status(403).json({ error: 'User not in the same workspace as this card' });
        }

        const insert = await client.query(
            `INSERT INTO card_users (card_id, user_id, create_at) VALUES ($1, $2, CURRENT_TIMESTAMP)
            ON CONFLICT DO NOTHING RETURNING *`,
            [cardId, userId]
        );

        //mengambil nama card 
        const cardNameQuery = await client.query(
            `SELECT title FROM cards WHERE id = $1`,
            [cardId]
        );

        const cardName = cardNameQuery.rows[0]?.title || ' a card';

        //add log notification
        await SystemNotification({
            userId,
            cardId,
            message: `Your were added to card name "${cardName}"`,
            type: 'card_assigned',
        })

        //add log card activity
        await logCardActivity({
            action: 'add_user',
            card_id: cardId,
            user_id: usersId,
            entity: 'users',
            entity_id: userId,
            details: ''
        })

        res.status(200).json({ message: 'User assigned to card', data: insert.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

//3. remove user from card
app.delete('/api/cards/:cardId/users/:userId', async (req, res) => {
    const { cardId, userId } = req.params;
    const usersId = req.user.id;

    try {
        const result = await client.query(
            `DELETE FROM card_users WHERE card_id = $1 AND user_id = $2 RETURNING *`,
            [cardId, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        //get card name 
        const cardNameQuery = await client.query(
            `SELECT title FROM cards WHERE id = $1`,
            [cardId]
        );

        const cardName = cardNameQuery.rows[0]?.title || 'a card';

        //add log notification
        await SystemNotification({
            userId,
            message: `You were removed from card name "${cardName}"`,
            type: 'card_unassigned',
        })

        //add log card activity
        await logCardActivity({
            action: 'remove_user',
            card_id: cardId,
            user_id: usersId,
            entity: 'users',
            entity_id: userId,
            details: ''
        })

        res.status(200).json({ message: 'User unassigned from card' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//4. get all users assigned to a card
app.get('/api/cards/:cardId/users', async (req, res) => {
    const { cardId } = req.params;

    try {
        const result = await client.query(
            `SELECT 
                u.id AS user_id,
                u.username,
                u.email,
                p.photo_url
             FROM card_users cu
             JOIN users u ON cu.user_id = u.id
             JOIN user_profil up ON up.user_id = u.id
             JOIN profil p ON up.profil_id = p.id
             WHERE cu.card_id = $1`,
            [cardId]
        );

        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//END CARD USER

//UPDATE CARD
//1. update title card
app.put('/api/cards/:id/title', async (req, res) => {
    const { id } = req.params;
    const { title } = req.body;
    const userId = req.user.id;

    console.log('Endpoin update ini menerima data userId:', userId);
    try {
        // Ambil data lama dulu buat dicatat di log
        const oldResult = await client.query("SELECT title FROM cards WHERE id = $1", [id]);
        if (oldResult.rows.length === 0) return res.status(404).json({ error: "Card not found" });

        const oldTitle = oldResult.rows[0].title;

        const result = await client.query(
            "UPDATE cards SET title = $1, update_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
            [title, id]
        );

        // ✅ Tambahkan log aktivitas
        await logCardActivity({
            action: 'updated_title',
            card_id: parseInt(id),
            user_id: userId,
            entity: 'title',
            entity_id: null,
            details: {
                old_title: oldTitle,
                new_title: title
            }
        });

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error updating card title:", error);
        res.status(500).json({ error: error.message });
    }
})

//1.1 update title card (testing)
app.put('/api/cards/:id/title-testing/:userId', async (req, res) => {
    const { id, userId } = req.params;
    const { title } = req.body;
    const actingUserId = parseInt(userId, 10);
    // const userId = req.user.id;

    if (!actingUserId) return res.status(401).json({ error: "Unauthorized" });
    console.log('Endpoin update ini menerima data userId:', userId);

    try {
        // Ambil data lama dulu buat dicatat di log
        const oldResult = await client.query("SELECT title FROM cards WHERE id = $1", [id]);
        if (oldResult.rows.length === 0) return res.status(404).json({ error: "Card not found" });

        const oldTitle = oldResult.rows[0].title;

        //update new title
        const result = await client.query(
            "UPDATE cards SET title = $1, update_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
            [title, id]
        );

        // untuk bisa mengambil nama user harus lakukan langkah berikut:
        // 1. mencari workspace id dari card 
        const boardRes = await client.query(`
            SELECT b.workspace_id
            FROM boards b
            JOIN lists l ON l.board_id = b.id
            JOIN cards c ON c.list_id = l.id
            WHERE c.id = $1
        `, [id]);

        const workspaceId = boardRes.rows[0]?.workspace_id;

        // 2. mengambil Semua user workspace 
        const workspaceUsersRes = await client.query(
            `SELECT user_id FROM workspaces_users WHERE workspace_id = $1 AND is_deleted = FALSE`,
            [workspaceId]
        );
        const userIds = workspaceUsersRes.rows.map(r => r.user_id);
        if (!userIds.includes(actingUserId)) userIds.push(actingUserId);

        //3. mengambil username acting user
        const actingUserRes = await client.query(
            'SELECT username FROM users WHERE id = $1',
            [actingUserId]
        );
        const actingUserName = actingUserRes.rows[0]?.username || 'Unknown';


        // menyimpan aktivitas update title ke card_activity
        const activityRes = await client.query(`
            INSERT INTO card_activities 
            (card_id, user_id, action_type, entity, entity_id, action_detail)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
            `, [
            id,
            actingUserId,
            'updated_title',
            'title',
            id,
            JSON.stringify({
                from: oldTitle || null,
                to: title,
                updatedBy: { id: actingUserId, username: actingUserName }
            })
        ]);
        // kirim pesan response 
        res.status(200).json({
            message: 'Card title berhasil di update!',
            id,
            workspaceId,
            activity: activityRes.rows[0],
        });

        // ✅ Tambahkan log aktivitas
        // await logCardActivity({
        //     action: 'updated_title',
        //     card_id: parseInt(id),
        //     user_id: userId,
        //     entity: 'title',
        //     entity_id: null,
        //     details: {
        //         old_title: oldTitle,
        //         new_title: title
        //     }
        // });
        // res.json(result.rows[0]);
    } catch (error) {
        console.error("Error updating card title:", error);
        res.status(500).json({ error: 'Gagal memperbarui title card' });
    }
})

//2. update title description
app.put("/api/cards/:id/desc", async (req, res) => {
    const { id } = req.params;
    const { description } = req.body;

    console.log("👉 Request diterima untuk update description");
    console.log("📦 cardId:", id);
    console.log("📝 description (asli):", description);

    try {
        await client.query(
            "UPDATE cards SET description = $1 WHERE id = $2",
            [description, id]
        );

        res.json({ message: "Description updated", description });
    } catch (err) {
        console.error("❌ Error update description:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// 2.1 update card description (testing)
app.put("/api/cards/:id/desc-testing/:userId", async (req, res) => {
    const { id, userId } = req.params;
    const { description } = req.body;
    const actingUserId = parseInt(userId, 10);

    if (!actingUserId) return res.status(401).json({ error: "Unauthorized" })

    //CONSOLE 
    console.log('Endpoin update ini menerima userId:', userId);
    console.log("👉 Request diterima untuk update description");
    console.log("📦 cardId:", id);
    console.log("📝 description (asli):", description);

    try {
        await client.query(
            "UPDATE cards SET description = $1 WHERE id = $2",
            [description, id]
        );

        //mengambil user name
        // 1. mencari workspace id dari card 
        const boardRes = await client.query(`
            SELECT b.workspace_id
            FROM boards b
            JOIN lists l ON l.board_id = b.id
            JOIN cards c ON c.list_id = l.id
            WHERE c.id = $1
        `, [id]);

        const workspaceId = boardRes.rows[0]?.workspace_id;

        // 2. mengambil semua user 
        const workspaceUsersRes = await client.query(
            `SELECT user_id FROM workspaces_users WHERE workspace_id = $1 AND is_deleted = FALSE`,
            [workspaceId]
        );
        const userIds = workspaceUsersRes.rows.map(r => r.user_id);
        if (!userIds.includes(actingUserId)) userIds.push(actingUserId);

        //3. mengambil username acting user
        const actingUserRes = await client.query(
            'SELECT username FROM users WHERE id = $1',
            [actingUserId]
        );
        const actingUserName = actingUserRes.rows[0]?.username || 'Unknown';


        // menyimpan aktivitas update title ke card_activity
        const activityRes = await client.query(`
            INSERT INTO card_activities 
            (card_id, user_id, action_type, entity, entity_id, action_detail)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
            `, [
            id,
            actingUserId,
            'updated_desc',
            'description',
            id,
            JSON.stringify({
                // from: oldTitle || null,
                // to: title,
                updatedBy: { id: actingUserId, username: actingUserName }
            })
        ]);

        // kirim pesan response 
        res.status(200).json({
            message: 'Card description berhasil di update!',
            id,
            workspaceId,
            activity: activityRes.rows[0],
        });

    } catch (err) {
        console.error("❌ Error update description:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});


//3. update due_date
app.put('/api/cards/:id/due_date', async (req, res) => {
    const { id } = req.params;
    const { due_date } = req.body;
    try {
        const result = await client.query("UPDATE cards SET due_date = $1, update_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *", [due_date, id]);
        if (result.rows.length === 0) return res.status(404).json({ error: "Card not found" });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

//3.1 update due_data (testing)
app.put('/api/cards/:id/due-testing/:userId', async (req, res) => {
    const { id, userId } = req.params;
    const { due_date } = req.body;
    const actingUserId = parseInt(userId, 10);

    if (!actingUserId) return res.status(401).json({ error: "Unauthorized" });

    try {
        const result = await client.query("UPDATE cards SET due_date = $1, update_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *", [due_date, id]);
        if (result.rows.length === 0) return res.status(404).json({ error: "Card not found" });

        //mengambil user name
        // 1. mencari workspace id dari card 
        const boardRes = await client.query(`
            SELECT b.workspace_id
            FROM boards b
            JOIN lists l ON l.board_id = b.id
            JOIN cards c ON c.list_id = l.id
            WHERE c.id = $1
        `, [id]);

        const workspaceId = boardRes.rows[0]?.workspace_id;

        // 2. mengambil semua user 
        const workspaceUsersRes = await client.query(
            `SELECT user_id FROM workspaces_users WHERE workspace_id = $1 AND is_deleted = FALSE`,
            [workspaceId]
        );
        const userIds = workspaceUsersRes.rows.map(r => r.user_id);
        if (!userIds.includes(actingUserId)) userIds.push(actingUserId);

        //3. mengambil username acting user
        const actingUserRes = await client.query(
            'SELECT username FROM users WHERE id = $1',
            [actingUserId]
        );
        const actingUserName = actingUserRes.rows[0]?.username || 'Unknown';

        //menyimpan aktivitas update due date ke card activity
        const activityRes = await client.query(`
            INSERT INTO card_activities 
            (card_id, user_id, action_type, entity, entity_id, action_detail)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
            `, [
            id,
            actingUserId,
            'updated_due',
            'due date',
            id,
            JSON.stringify({
                // from: oldTitle || null,
                // to: title,
                updatedBy: { id: actingUserId, username: actingUserName }
            })
        ]);

        // kirim pesan response 
        res.status(200).json({
            message: 'Card due date berhasil di update!',
            id,
            workspaceId,
            activity: activityRes.rows[0],
        });

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

//4. update cover_id
app.put('/api/cards/:id/cover', async (req, res) => {
    const { id } = req.params;
    const { cover_id } = req.body;
    try {
        const result = await client.query("UPDATE cards SET cover_id = $1, update_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *", [cover_id, id]);
        if (result.rows.length === 0) return res.status(404).json({ error: "Card not found" });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
//5. update label_id
app.put('/api/cards/:id/label', async (req, res) => {
    const { id } = req.params;
    const { label_id } = req.body; // array of label IDs
    try {
        const result = await client.query("UPDATE cards SET label_id = $1 WHERE id = $2 RETURNING *", [label_id, id]);
        if (result.rows.length === 0) return res.status(404).json({ error: "Card not found" });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
//6. update image
app.put('/api/cards/:id/image', async (req, res) => {
    const { id } = req.params;
    const { image_id } = req.body;
    try {
        const result = await client.query("UPDATE cards SET image_id = $1 WHERE id = $2 RETURNING *", [image_id, id]);
        if (result.rows.length === 0) return res.status(404).json({ error: "Card not found" });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
//7. update assign
app.put('/api/cards/:id/assign', async (req, res) => {
    const { id } = req.params;
    const { assign } = req.body; // array of user IDs
    try {
        const result = await client.query("UPDATE cards SET assign = $1 WHERE id = $2 RETURNING *", [assign, id]);
        if (result.rows.length === 0) return res.status(404).json({ error: "Card not found" });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

// END UPDATE CARD 

//CARD COVER
//1. mendapatkan cover berdasarkan card_id -> works
app.get('/api/card-cover/:cardId', async (req, res) => {
    const { cardId } = req.params;
    try {
        const result = await client.query(
            `SELECT c.* FROM cover c 
                 INNER JOIN card_cover cc ON c.id = cc.cover_id 
                 WHERE cc.card_id = $1`,
            [cardId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
//2. menambahkan cover ke card -> works
app.post('/api/add-cover', async (req, res) => {
    const { card_id, cover_id } = req.body;
    const userId = req.user.id;

    try {
        const checkExisting = await client.query(
            "SELECT * FROM card_cover WHERE card_id = $1",
            [card_id]
        );

        if (checkExisting.rows.length > 0) {
            return res.status(400).json({ message: "Card already has a cover. Please update instead." });
        }

        const result = await client.query(
            "INSERT INTO card_cover (card_id, cover_id, create_at) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING *",
            [card_id, cover_id]
        );

        //add log card activity
        await logCardActivity({
            action: 'add_cover',
            card_id: card_id,
            user_id: userId,
            entity: 'cover',
            entity_id: cover_id,
            details: ''
        })

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

//2.1 menambahkan cover ke card -> (testing)
app.post('/api/add-cover/:userId', async (req, res) => {
    const { userId } = req.params;
    const { card_id, cover_id } = req.body;
    const actingUserId = parseInt(userId, 10);

    if (!actingUserId) return res.status(401).json({ error: "Unauthorized" });

    try {
        const checkExisting = await client.query(
            "SELECT * FROM card_cover WHERE card_id = $1",
            [card_id]
        );

        if (checkExisting.rows.length > 0) {
            return res.status(400).json({ message: "Card already has a cover. Please update instead." });
        }

        const result = await client.query(
            "INSERT INTO card_cover (card_id, cover_id, create_at) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING *",
            [card_id, cover_id]
        );

        //mengambil user name
        // 1. mencari workspace id dari card 
        const boardRes = await client.query(`
            SELECT b.workspace_id
            FROM boards b
            JOIN lists l ON l.board_id = b.id
            JOIN cards c ON c.list_id = l.id
            WHERE c.id = $1
        `, [card_id]);

        const workspaceId = boardRes.rows[0]?.workspace_id;

        // 2. mengambil semua user 
        const workspaceUsersRes = await client.query(
            `SELECT user_id FROM workspaces_users WHERE workspace_id = $1 AND is_deleted = FALSE`,
            [workspaceId]
        );
        const userIds = workspaceUsersRes.rows.map(r => r.user_id);
        if (!userIds.includes(actingUserId)) userIds.push(actingUserId);

        //3. mengambil username acting user
        const actingUserRes = await client.query(
            'SELECT username FROM users WHERE id = $1',
            [actingUserId]
        );
        const actingUserName = actingUserRes.rows[0]?.username || 'Unknown';

        // menyimpan aktivitas update title ke card_activity
        const activityRes = await client.query(`
            INSERT INTO card_activities 
            (card_id, user_id, action_type, entity, entity_id, action_detail)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
            `, [
            card_id,
            actingUserId,
            'add_cover',
            'card cover',
            card_id,
            JSON.stringify({
                // from: oldTitle || null,
                // to: title,
                updatedBy: { id: actingUserId, username: actingUserName },
                coverId: cover_id
            })
        ]);

        // kirim pesan response 
        res.status(200).json({
            message: 'Card cover berhasil di tambahkan!',
            card_id,
            workspaceId,
            activity: activityRes.rows[0],
        });

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

//3. mengupdate cover pada card -> works
app.put('/api/update-cover', async (req, res) => {
    const { card_id, cover_id } = req.body;
    try {
        const result = await client.query(
            "UPDATE card_cover SET cover_id = $1, update_at = CURRENT_TIMESTAMP WHERE card_id = $2 RETURNING *",
            [cover_id, card_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "No cover found for this card." });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
//3.1 mengupdate cover pada card -> (testing)
app.put('/api/update-cover-testing/:userId', async (req, res) => {
    const { userId } = req.params;
    const { card_id, cover_id } = req.body;
    const actingUserId = parseInt(userId, 10);

    if (!actingUserId) return res.status(401).json({ error: "Unauthorized" });

    try {
        const result = await client.query(
            "UPDATE card_cover SET cover_id = $1, update_at = CURRENT_TIMESTAMP WHERE card_id = $2 RETURNING *",
            [cover_id, card_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "No cover found for this card." });
        }

        //mengambil user name
        // 1. mencari workspace id dari card 
        const boardRes = await client.query(`
            SELECT b.workspace_id
            FROM boards b
            JOIN lists l ON l.board_id = b.id
            JOIN cards c ON c.list_id = l.id
            WHERE c.id = $1
        `, [card_id]);

        const workspaceId = boardRes.rows[0]?.workspace_id;

        // 2. mengambil semua user 
        const workspaceUsersRes = await client.query(
            `SELECT user_id FROM workspaces_users WHERE workspace_id = $1 AND is_deleted = FALSE`,
            [workspaceId]
        );
        const userIds = workspaceUsersRes.rows.map(r => r.user_id);
        if (!userIds.includes(actingUserId)) userIds.push(actingUserId);

        //3. mengambil username acting user
        const actingUserRes = await client.query(
            'SELECT username FROM users WHERE id = $1',
            [actingUserId]
        );
        const actingUserName = actingUserRes.rows[0]?.username || 'Unknown';

        // menyimpan aktivitas update title ke card_activity
        const activityRes = await client.query(`
            INSERT INTO card_activities 
            (card_id, user_id, action_type, entity, entity_id, action_detail)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
            `, [
            card_id,
            actingUserId,
            'updated_cover',
            'card cover',
            card_id,
            JSON.stringify({
                // from: oldTitle || null,
                // to: title,
                updatedBy: { id: actingUserId, username: actingUserName },
                coverId: cover_id
            })
        ]);

        // kirim pesan response 
        res.status(200).json({
            message: 'Card cover berhasil di update!',
            card_id,
            workspaceId,
            activity: activityRes.rows[0],
        });

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
//4. menghapus cover dari card -> works
app.delete('/api/delete-cover/:cardId', async (req, res) => {
    const { cardId } = req.params;
    const userId = req.user.id;

    try {
        // Ambil dulu data cover sebelum dihapus
        const coverResult = await client.query(
            "SELECT * FROM card_cover WHERE card_id = $1",
            [cardId]
        );

        if (coverResult.rowCount === 0) {
            return res.status(404).json({ message: "No cover found for this card." });
        }

        const cover = coverResult.rows[0]; // Data cover sebelum dihapus

        // Hapus cover
        await client.query(
            "DELETE FROM card_cover WHERE card_id = $1",
            [cardId]
        );

        // Log aktivitas penghapusan cover
        await logCardActivity({
            card_id: parseInt(cardId),
            user_id: userId,
            action: "delete",
            entity: "cover",
            entity_id: cover.id, // Ini id cover yang dihapus
            details: ''
        });

        res.json({ message: "Cover removed successfully." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

//4. menghapus cover dari card -> testing
app.delete('/api/delete-cover/:cardId/:userId', async (req, res) => {
    const { cardId, userId } = req.params;
    const actingUserId = parseInt(userId, 10);

    if (!actingUserId) return res.status(401).json({ error: "Unauthorized" });

    try {
        // Ambil dulu data cover sebelum dihapus
        const coverResult = await client.query(
            "SELECT * FROM card_cover WHERE card_id = $1",
            [cardId]
        );

        if (coverResult.rowCount === 0) {
            return res.status(404).json({ message: "No cover found for this card." });
        }

        const cover = coverResult.rows[0]; // Data cover sebelum dihapus

        // Hapus cover
        await client.query(
            "DELETE FROM card_cover WHERE card_id = $1",
            [cardId]
        );

        //mengambil user name
        // 1. mencari workspace id dari card 
        const boardRes = await client.query(`
            SELECT b.workspace_id
            FROM boards b
            JOIN lists l ON l.board_id = b.id
            JOIN cards c ON c.list_id = l.id
            WHERE c.id = $1
        `, [cardId]);

        const workspaceId = boardRes.rows[0]?.workspace_id;

        // 2. mengambil semua user 
        const workspaceUsersRes = await client.query(
            `SELECT user_id FROM workspaces_users WHERE workspace_id = $1 AND is_deleted = FALSE`,
            [workspaceId]
        );
        const userIds = workspaceUsersRes.rows.map(r => r.user_id);
        if (!userIds.includes(actingUserId)) userIds.push(actingUserId);

        //3. mengambil username acting user
        const actingUserRes = await client.query(
            'SELECT username FROM users WHERE id = $1',
            [actingUserId]
        );
        const actingUserName = actingUserRes.rows[0]?.username || 'Unknown';

        // menyimpan aktivitas update title ke card_activity
        const activityRes = await client.query(`
            INSERT INTO card_activities 
            (card_id, user_id, action_type, entity, entity_id, action_detail)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
            `, [
            cardId,
            actingUserId,
            'remove_cover',
            'card cover',
            cardId,
            JSON.stringify({
                // from: oldTitle || null,
                // to: title,
                updatedBy: { id: actingUserId, username: actingUserName },
                coverId: cover_id
            })
        ]);

        // kirim pesan response 
        res.status(200).json({
            message: 'Card cover berhasil di remove!',
            cardId,
            workspaceId,
            activity: activityRes.rows[0],
        });

        res.json({ message: "Cover removed successfully." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

//5. mendapatkan semua cover yang tersedia
app.get('/api/covers', async (req, res) => {
    try {
        const result = await client.query("SELECT * FROM cover");
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
//END CARD COVER

//DUE DATE
//1. get all due date
app.get('/api/card-due-dates', async (req, res) => {
    try {
        const result = await client.query("SELECT * FROM card_due_dates ORDER BY due_date ASC");
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
})
//2. get due date by id
app.get('/api/card-due-date/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await client.query("SELECT * FROM card_due_dates WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Due date not found" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
})
//3. Ambil semua due date berdasarkan card_id (Berguna untuk fitur DatePicker)
app.get('/api/card-due-date/card/:cardId', async (req, res) => {
    const { cardId } = req.params;
    try {
        const result = await client.query("SELECT * FROM card_due_dates WHERE card_id = $1 ORDER BY due_date ASC", [cardId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
})
//4. add new due date
app.post('/api/card-due-dates', async (req, res) => {
    const { card_id, due_date } = req.body;
    try {
        const result = await client.query(
            "INSERT INTO card_due_dates (card_id, due_date, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING *",
            [card_id, due_date]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
})
//5.update due date by id
//5. update due date by id
app.put('/api/card-due-date/:id', async (req, res) => {
    const { id } = req.params;
    const { due_date } = req.body;
    const userId = req.user.id;

    try {
        // Ambil cardId dan due date lama
        const existing = await client.query(
            "SELECT * FROM card_due_dates WHERE id = $1",
            [id]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({ error: "Due date not found" });
        }

        const oldDueDate = existing.rows[0].due_date;
        const cardId = existing.rows[0].card_id;

        // Update due date
        const result = await client.query(
            "UPDATE card_due_dates SET due_date = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
            [due_date, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Due date not found after update" });
        }

        const updatedDueDate = result.rows[0].due_date;

        // Format tanggal ke: Wednesday, 11 June 2025
        const formatDate = (dateStr) => {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            return new Intl.DateTimeFormat('en-GB', options).format(new Date(dateStr));
        };

        // Log aktivitas update
        await logCardActivity({
            action: 'updated_due',
            card_id: cardId,
            user_id: userId,
            entity: 'due date',
            entity_id: null,
            details: {
                old_title: formatDate(oldDueDate),
                new_title: formatDate(updatedDueDate),
            }
        });

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});


//6. delete due date by ID
app.delete('/api/card-due-date/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await client.query("DELETE FROM card_due_dates WHERE id = $1 RETURNING *", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Due date not found" });
        }
        res.json({ message: "Due date deleted successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
})
//END DUE DATE

//REMINDERS
// 1. Endpoint untuk menambahkan pengingat baru
app.post('/api/card-due-date/:cardId/set-reminder', async (req, res) => {
    const { cardId } = req.params;
    const { reminder_date } = req.body;

    // Validate reminder_date
    if (!reminder_date) {
        return res.status(400).json({ error: 'Reminder date is required' });
    }

    try {
        const result = await client.query(`
            INSERT INTO reminders (card_id, reminder_date)
            VALUES ($1, $2) RETURNING id, card_id, reminder_date, reminder_sent, created_at, updated_at
        `, [cardId, reminder_date]);

        if (result.rows.length === 0) {
            return res.status(500).json({ error: 'Failed to create reminder' });
        }

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error setting reminder:', err);
        res.status(500).json({ error: 'Failed to set reminder' });
    }
});



// 2.Endpoint untuk mengambil pengingat berdasarkan cardId
app.get('/api/card-due-date/:cardId/get-reminder', async (req, res) => {
    const { cardId } = req.params;

    try {
        const result = await client.query(`
        SELECT * FROM reminders
        WHERE card_id = $1
      `, [cardId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No reminder found for this card' });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching reminder:', err);
        res.status(500).json({ error: 'Failed to fetch reminder' });
    }
});


//3. Endpoint untuk memperbarui pengingat
app.put('/api/card-due-date/:cardId/update-reminder', async (req, res) => {
    const { cardId } = req.params;
    const { reminder_date } = req.body;

    try {
        const result = await client.query(`
        UPDATE reminders
        SET reminder_date = $1, updated_at = CURRENT_TIMESTAMP
        WHERE card_id = $2 RETURNING *
      `, [reminder_date, cardId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Reminder not found for this card' });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error updating reminder:', err);
        res.status(500).json({ error: 'Failed to update reminder' });
    }
});


// 4. Endpoint untuk menghapus pengingat berdasarkan cardId
app.delete('/api/card-due-date/:cardId/delete-reminder', async (req, res) => {
    const { cardId } = req.params;

    try {
        const result = await client.query(`
        DELETE FROM reminders
        WHERE card_id = $1 RETURNING *
      `, [cardId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Reminder not found for this card' });
        }

        res.status(200).json({ message: 'Reminder deleted successfully' });
    } catch (err) {
        console.error('Error deleting reminder:', err);
        res.status(500).json({ error: 'Failed to delete reminder' });
    }
});


//5. Endpoint untuk mengambil semua pengingat
app.get('/api/card-due-date', async (req, res) => {
    try {
        const result = await client.query(`
        SELECT * FROM reminders
        ORDER BY reminder_date ASC
      `);

        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching all reminders:', err);
        res.status(500).json({ error: 'Failed to fetch reminders' });
    }
});


//6. Endpoint untuk menandai reminder yang sudah dikirim
app.put('/api/card-due-date/:cardId/mark-reminder-sent', async (req, res) => {
    const { cardId } = req.params;

    try {
        const result = await client.query(`
        UPDATE reminders
        SET reminder_sent = true, updated_at = CURRENT_TIMESTAMP
        WHERE card_id = $1 RETURNING *
      `, [cardId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Reminder not found for this card' });
        }

        res.status(200).json({ message: 'Reminder marked as sent' });
    } catch (err) {
        console.error('Error marking reminder as sent:', err);
        res.status(500).json({ error: 'Failed to mark reminder as sent' });
    }
});

//END REMINDERS

//CARD DESCRIPTION
//1. Endpoint untuk membuat dan mengubah card description
app.post('/api/card-description', async (req, res) => {
    const { card_id, description } = req.body;
    try {
        const existingDesription = await client.query(
            'SELECT * FROM card_descriptions WHERE card_id = $1',
            [card_id]
        );
        if (existingDesription.rows.length > 0) {
            //jika desktipsi sudah ada, lakukan update
            await client.query(
                'UPDATE card_descriptions SET description = $1, updated_at = NOW() WHERE card_id = $2',
                [description, card_id]
            );
        } else {
            await client.query(
                'INSERT INTO card_descriptions (card_id, description) VALUES ($1, $2)',
                [card_id, description]
            );
        }
        res.json({ success: true, message: 'Deskripsi berhasil disimpan' });
    } catch (error) {
        console.error('Gagal menyimpan deskripsi:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
})

//2. get card description by card id
app.get('/api/card-description/:card_id', async (req, res) => {
    const { card_id } = req.params;
    try {
        const result = await client.query(
            'SELECT description FROM card_descriptions WHERE card_id = $1',
            [card_id]
        );

        if (result.rows.length > 0) {
            res.json({ success: true, description: result.rows[0].description });
        } else {
            res.json({ success: true, description: 'masukkan teks...' }); // Jika tidak ada, return string kosong
        }
    } catch (error) {
        console.error('Gagal mengambil deskripsi:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
})

//3. update card description
app.put('/api/card-description/:card_id', async (req, res) => {
    const { card_id } = req.params;
    const { description } = req.body;

    try {
        await client.query(
            'UPDATE card_descriptions SET description = $1 WHERE card_id = $2',
            [description, card_id]
        );
        res.json({ success: true, message: 'Deskripsi berhasil diperbarui' });
    } catch (error) {
        console.error('Gagal menyimpan deskripsi:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
})

//CHECKLIST 
//1. get all checklist 
app.get('/api/checklists', async (req, res) => {
    try {
        const result = await client.query(
            'SELECT * FROM checklists ORDER BY id DESC')
        res.json(result.rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})
//2. get checklist by id
app.get('/api/checklist/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await client.query("SELECT * FROM checklists WHERE id = $1", [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: "Checklist not found" });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
//3. create new Checklist
app.post('/api/checklist', async (req, res) => {
    const { name } = req.body;
    try {
        const result = await client.query(
            "INSERT INTO checklists (name) VALUES ($1) RETURNING *",
            [name]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
//4. update checklist
app.put('/api/checklist/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        const result = await client.query(
            "UPDATE checklists SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
            [name, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: "Checklist not found" });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
//5. delete checklist
app.delete('/api/checklist/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await client.query("DELETE FROM checklists WHERE id = $1 RETURNING *", [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: "Checklist not found" });
        res.json({ message: "Checklist deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
//END CHECKLIST

//CARD CHECKLIST
//create new checklist using two tabel card checklist and checklist
app.post('/api/cards/:cardId/checklists', async (req, res) => {
    const { cardId } = req.params;
    const { name } = req.body; // Nama checklist yang akan ditambahkan

    if (!name) {
        return res.status(400).json({ error: "Checklist name is required" });
    }

    try {
        await client.query("BEGIN"); // Mulai transaksi

        // 1. Tambahkan checklist baru ke tabel `checklists`
        const checklistResult = await client.query(
            `INSERT INTO checklists (name) VALUES ($1) RETURNING id`,
            [name]
        );
        const checklistId = checklistResult.rows[0].id;

        // 2. Hubungkan checklist dengan card dalam tabel `card_checklists`
        await client.query(
            `INSERT INTO card_checklists (card_id, checklist_id) VALUES ($1, $2)`,
            [cardId, checklistId]
        );

        await client.query("COMMIT"); // Selesaikan transaksi

        res.status(201).json({
            message: "Checklist created and linked to card successfully",
            checklist_id: checklistId,
        });
    } catch (error) {
        await client.query("ROLLBACK"); // Rollback jika terjadi error
        console.error("Error creating checklist:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET /api/checklists/:id
app.get('/api/checklists-items/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Fetch checklist berdasarkan ID
        const checklistResult = await client.query('SELECT * FROM public.checklists WHERE id = $1', [id]);

        // Pastikan checklist ditemukan
        if (checklistResult.rows.length === 0) {
            return res.status(404).json({ message: 'Checklist not found' });
        }

        // Fetch checklist items yang terkait dengan checklist_id
        const checklistItemsResult = await client.query('SELECT * FROM public.checklist_items WHERE checklist_id = $1', [id]);

        // Gabungkan hasil checklist dengan checklist items
        const checklist = checklistResult.rows[0];
        checklist.items = checklistItemsResult.rows;

        res.json(checklist);
    } catch (error) {
        console.error('Error fetching checklist and items:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

//1. get all card checklist
app.get('/api/card-checklists', async (req, res) => {
    try {
        const result = await client.query("SELECT * FROM card_checklists ORDER BY id DESC");
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
//2.get card checklist by id
app.get('/api/card-checklist/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await client.query("SELECT * FROM card_checklists WHERE id = $1", [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: "Card checklist not found" });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
//

//3.get card checklist by card id
app.get('/api/card-checklist/card/:card_id', async (req, res) => {
    const card_id = parseInt(req.params.card_id, 10);

    if (isNaN(card_id)) {
        return res.status(400).json({ error: "Invalid card_id" });
    }

    try {
        const result = await client.query(
            `SELECT 
                  cc.card_id, 
                  json_agg(json_build_object('id', c.id, 'name', c.name)) AS checklists
               FROM card_checklists cc
               JOIN checklists c ON cc.checklist_id = c.id
               WHERE cc.card_id = $1
               GROUP BY cc.card_id`,
            [card_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: `No checklists found for card_id ${card_id}` });
        }

        res.json(result.rows[0]); // Mengembalikan satu objek JSON, bukan array
    } catch (error) {
        console.error('❌ Database error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

//4. create card checklist
app.post('/api/card-checklist', async (req, res) => {
    const { card_id, checklist_id } = req.body;
    try {
        const result = await client.query(
            "INSERT INTO card_checklists (card_id, checklist_id,created_at) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING *",
            [card_id, checklist_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
//5. update card checklist
app.put('/api/card-checklist/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await client.query("DELETE FROM card_checklists WHERE id = $1 RETURNING *", [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: "Card checklist not found" });
        res.json({ message: "Card checklist deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
//6. delete card checklist
app.delete('/api/card-checklist/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
    }

    try {
        const result = await client.query("DELETE FROM card_checklists WHERE id = $1 RETURNING *", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Card checklist not found or already deleted" });
        }

        res.json({ message: "Card checklist deleted successfully", deletedData: result.rows[0] });
    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//END CARD CHECKLIST

//CHECKLIST ITEM
//1. get all checklist item for a checklist
app.get('/api/checklists/:checklist_id/items', async (req, res) => {
    const { checklist_id } = req.params;
    try {
        const result = await client.query(
            'SELECT * FROM checklist_items WHERE checklist_id = $1 ORDER BY id DESC',
            [checklist_id]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
//2. get checklist item by id
app.get('/api/checklists/:checklistId/items/:itemId', async (req, res) => {
    const { checklistId, itemId } = req.params;
    try {
        const result = await client.query(
            'SELECT * FROM checklist_items WHERE id = $1 AND checklist_id = $2',
            [itemId, checklistId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Checklist item not found" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

//get checklist item by checklist id
app.get('/api/checklist-items/:checklist_id', async (req, res) => {
    const checklist_id = parseInt(req.params.checklist_id, 10);

    if (isNaN(checklist_id)) {
        return res.status(400).json({ error: "Invalid checklist_id" });
    }

    try {
        const result = await client.query(
            `SELECT 
                ci.id,
                ci.name,
                ci.is_checked,
                ci.created_at,
                ci.updated_at
            FROM checklist_items ci
            WHERE ci.checklist_id = $1`,
            [checklist_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: `No checklist items found for checklist_id ${checklist_id}` });
        }

        res.json(result.rows);
    } catch (error) {
        console.error('❌ Database error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

//3. create checklist item
app.post('/api/checklists/:checklistId/items', async (req, res) => {
    const { checklistId } = req.params;
    const { name } = req.body;

    // Pastikan is_checked diset false jika tidak ada dalam request body
    const is_checked = false;

    try {
        const result = await client.query(
            'INSERT INTO checklist_items (checklist_id, name, is_checked) VALUES ($1, $2, $3) RETURNING *',
            [checklistId, name, is_checked]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


//4. update checklist item
app.put('/api/checklists/:checklistId/items/:itemId/name', async (req, res) => {
    const { checklistId, itemId } = req.params;
    const { name } = req.body;
    try {
        const result = await client.query(
            'UPDATE checklist_items SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND checklist_id = $3 RETURNING *',
            [name, itemId, checklistId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Checklist item not found" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
//5. update checklist item is_checked
app.put('/api/checklists/:checklistId/items/:itemId/check', async (req, res) => {
    const { checklistId, itemId } = req.params;
    const { is_checked } = req.body;
    try {
        const result = await client.query(
            'UPDATE checklist_items SET is_checked = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND checklist_id = $3 RETURNING *',
            [is_checked, itemId, checklistId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Checklist item not found" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


//5. delete checklist item
app.delete('/api/checklists/:checklistId/items/:itemId', async (req, res) => {
    const { checklistId, itemId } = req.params;
    try {
        const result = await client.query(
            'DELETE FROM checklist_items WHERE id = $1 AND checklist_id = $2 RETURNING *',
            [itemId, checklistId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Checklist item not found" });
        }
        res.json({ message: "Checklist item deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//6. get checklist total by cardId
app.get('/api/:cardId/checklist-total', async (req, res) => {
    const { cardId } = req.params;
    try {
        const result = await client.query(`
          SELECT COUNT(*) AS total
          FROM card_checklists cc
          JOIN checklists c ON cc.checklist_id = c.id
          JOIN checklist_items ci ON c.id = ci.checklist_id
          WHERE cc.card_id = $1;
        `, [cardId]);

        res.json({ cardId: parseInt(cardId), total: parseInt(result.rows[0].total) });
    } catch (error) {
        console.error('Error getting total checklist items:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})
//7. get checklist item "checked"
app.get('/api/:cardId/checklist-checked', async (req, res) => {
    const { cardId } = req.params;
    try {
        const result = await client.query(`
        SELECT COUNT(*) AS checked
        FROM card_checklists cc
        JOIN checklists c ON cc.checklist_id = c.id
        JOIN checklist_items ci ON c.id = ci.checklist_id
        WHERE cc.card_id = $1 AND ci.is_checked = true;
      `, [cardId]);

        res.json({ cardId: parseInt(cardId), checked: parseInt(result.rows[0].checked) });
    } catch (error) {
        console.error('Error getting checked checklist items:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

//8. get checklist item "unchecked"
app.get('/api/:cardId/checklist-unchecked', async (req, res) => {
    const { cardId } = req.params;
    try {
        const result = await client.query(`
        SELECT COUNT(*) AS unchecked
        FROM card_checklists cc
        JOIN checklists c ON cc.checklist_id = c.id
        JOIN checklist_items ci ON c.id = ci.checklist_id
        WHERE cc.card_id = $1 AND ci.is_checked = false;
      `, [cardId]);

        res.json({ cardId: parseInt(cardId), unchecked: parseInt(result.rows[0].unchecked) });
    } catch (error) {
        console.error('Error getting unchecked checklist items:', error);
        res.status(500).json({ error: 'Internal server error' });
    }

})
//END CHECKLIST ITEM


//GABUNGAN KETIGA TABEL (CARD_CHECKLIST, CHECKLIST, CHECKLIST_ITEM)
// 1.Endpoint untuk mendapatkan checklist beserta checklist items berdasarkan card_id
app.get('/api/checklists-with-items/:card_id', async (req, res) => {
    const { card_id } = req.params;

    try {
        const checklistsWithItems = await client.query(`
            SELECT 
                c.id AS checklist_id,
                c.name AS checklist_name,
                ci.id AS item_id,
                ci.name AS item_name,
                ci.is_checked
            FROM public.checklists c
            JOIN public.card_checklists cc ON c.id = cc.checklist_id
            LEFT JOIN public.checklist_items ci ON c.id = ci.checklist_id
            WHERE cc.card_id = $1
        `, [card_id]);

        if (checklistsWithItems.rows.length === 0) {
            return res.status(404).json({ message: 'No checklists or items found for this card' });
        }

        // Organize data into checklist format
        const result = checklistsWithItems.rows.reduce((acc, row) => {
            const { checklist_id, checklist_name, item_id, item_name, is_checked } = row;

            // Find existing checklist in accumulator
            let checklist = acc.find(c => c.checklist_id === checklist_id);

            if (!checklist) {
                checklist = {
                    checklist_id,
                    checklist_name,
                    items: []
                };
                acc.push(checklist);
            }

            // Add items to the checklist
            if (item_id) {
                checklist.items.push({
                    item_id,
                    item_name,
                    is_checked
                });
            }

            return acc;
        }, []);

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

//2.menambahkan checklist baru dan menghubungkannya dengan card
app.post('/api/checklists-fix', async (req, res) => {
    const { card_id, name } = req.body;
    try {
        const checklistResult = await client.query(
            'INSERT INTO public.checklists (name) VALUES ($1) RETURNING id',
            [name]
        );
        const checklist_id = checklistResult.rows[0].id;

        await client.query(
            'INSERT INTO public.card_checklists (card_id, checklist_id, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP)',
            [card_id, checklist_id]
        );

        res.status(201).json({ checklist_id, message: 'Checklist berhasil ditambahkan' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
})
//3. mengupdate nama checklist
app.put('/api/checklists-fix/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        await client.query('UPDATE public.checklists SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [name, id]);
        res.json({ message: 'Checklist berhasil diperbarui' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
})
//4. menghapus checklist dari sebuah card
app.delete('/api/checklists-fix/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Hapus dulu dari tabel relasi card_checklists
        await client.query('DELETE FROM public.card_checklists WHERE checklist_id = $1', [id]);
        // Baru hapus dari checklists
        await client.query('DELETE FROM public.checklists WHERE id = $1', [id]);

        res.json({ message: 'Checklist berhasil dihapus' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

//CHECKLIST ITEM

//5. menambahkan checklist item baru ke checklist
app.post('/api/checklists-fix-items', async (req, res) => {
    const { checklist_id, name } = req.body;
    try {
        const result = await client.query(
            'INSERT INTO public.checklist_items (checklist_id, name) VALUES ($1, $2) RETURNING id',
            [checklist_id, name]
        );
        res.status(201).json({ item_id: result.rows[0].id, message: 'Checklist item berhasil ditambahkan' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
})
//6. mengupdate status is_checked pada checklist items
app.put('/api/checklists-fix-items/:id/check', async (req, res) => {
    const { id } = req.params;
    const { is_checked } = req.body;
    try {
        await client.query('UPDATE public.checklist_items SET is_checked = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [is_checked, id]);
        res.json({ message: 'Status checklist item berhasil diperbarui' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
})
//7. mengupdate name checklist item
app.put('/api/checklists-fix-items/:id/name', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        await client.query('UPDATE public.checklist_items SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [name, id]);
        res.json({ message: 'Checklist item berhasil diperbarui' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
})
//8. menghapus checklist item
app.delete('/api/checklists-fix-items/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await client.query('DELETE FROM public.checklist_items WHERE id = $1', [id]);
        res.json({ message: 'Checklist item berhasil dihapus' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
})

//LABEL
// 1. get label by card id 
app.get('/api/cards/:cardId/labels', async (req, res) => {
    const { cardId } = req.params;

    const query = `
    SELECT 
      l.id AS label_id,
      l.name AS label_name,
      c.hex_code AS bg_color
    FROM card_labels cl
    JOIN labels l ON cl.label_id = l.id
    LEFT JOIN colors c ON l.bg_color_id = c.id
    WHERE cl.card_id = $1
  `;

    try {
        const result = await client.query(query, [cardId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching labels by cardId:', error);
        res.status(500).json({ error: 'Failed to fetch labels' });
    }
});

//2. menampilkan semua label 
app.get('/api/labels', async (req, res) => {
    try {
        const result = await client.query(`
            SELECT 
            l.id,
            l.name,
            c.hex_code AS bg_color
            FROM labels l
            LEFT JOIN colors c ON l.bg_color_id = c.id

        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching labels with color:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});




//CARD_LABELS
// 3. menghapus label dari card id 
app.delete('/api/cards/:cardId/labels/:labelId', async (req, res) => {
    const { cardId, labelId } = req.params;
    const userId = req.user.id;

    try {
        await client.query(
            `DELETE FROM card_labels WHERE card_id = $1 AND label_id = $2`,
            [cardId, labelId]
        );

        //add log card activity
        await logCardActivity({
            action: 'remove_label',
            card_id: cardId,
            user_id: userId,
            entity: 'label',
            entity_id: labelId,
            details: ''
        })

        res.json({ message: "Label removed from card successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
})
//4. membuat label baru
app.post('/api/labels', async (req, res) => {
    const { name } = req.body; // Hanya menerima nama label

    try {
        const result = await client.query(
            `INSERT INTO labels (name,color,create_at) VALUES ($1, $2,CURRENT_TIMESTAMP) RETURNING *`,
            [name, '#333']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
})

//5. add label to card
app.post('/api/cards/:cardId/labels/:labelId', async (req, res) => {
    const { cardId, labelId } = req.params;
    const userId = req.user.id;

    try {
        // Check if the card and label exist
        const cardExists = await client.query('SELECT 1 FROM cards WHERE id = $1', [cardId]);
        const labelExists = await client.query('SELECT 1 FROM labels WHERE id = $1', [labelId]);

        if (!cardExists.rows.length || !labelExists.rows.length) {
            return res.status(400).json({ message: 'Card or Label does not exist.' });
        }

        // Insert label to card in card_labels table
        const result = await client.query(
            'INSERT INTO card_labels (card_id, label_id, create_at) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING *',
            [cardId, labelId]
        );

        //add log card activity
        await logCardActivity({
            action: 'add_label',
            card_id: cardId,
            user_id: userId,
            entity: 'add label',
            entity_id: labelId,
            details: ''
        })

        return res.status(201).json({
            message: 'Label added to card successfully',
            data: result.rows[0],
        });
    } catch (error) {
        console.error('Error adding label to card:', error);
        return res.status(500).json({ message: 'Server error' });
    }
})

//6. delete label from labels
app.delete('/api/delete-label/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await client.query('DELETE FROM labels WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Label not found' });
        }

        res.json({ message: 'Label deleted successfully' });
    } catch (error) {
        console.error('Error deleting label:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

//7. update nama label 
app.put('/api/update-label-name/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        const result = await client.query(
            'UPDATE labels SET name = $1, update_at = NOW() WHERE id = $2 RETURNING *',
            [name, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Label not found' });
        }

        res.json({ message: 'Label updated successfully', label: result.rows[0] });
    } catch (error) {
        console.error('Error updating label:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

//8.add color id to label for bg 
app.put('/api/label/:labelId/bg_color', async (req, res) => {
    const { labelId } = req.params;
    const { bg_color_id } = req.body;

    try {
        const updateQuery = `
      UPDATE labels
      SET bg_color_id = $1,
          update_at = NOW()
      WHERE id = $2
      RETURNING *;
    `;

        const result = await client.query(updateQuery, [bg_color_id, labelId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Label not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

// END LABEL 

//COLORS
//1. get all data colors
app.get('/api/colors', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM colors');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})
//END COLORS


//CARD STATUS
//1. get status card by card id
app.get('/api/cards/:cardId/status', async (req, res) => {
    const { cardId } = req.params;
    // console.log("Received cardId:", cardId);

    try {
        const result = await client.query(
            `SELECT s.status_id, s.status_name, s.text_color,s.background_color, cs.assigned_at
            FROM card_status cs
            JOIN status s ON cs.status_id = s.status_id
            WHERE cs.card_id = $1`,
            [cardId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Tidak ada status untuk cardId ini' });
        }

        res.json(result.rows);
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: 'Gagal mengambil status', detail: error.message });
    }
});

app.get('/api/card-status/:cardId', async (req, res) => {
    const { cardId } = req.params;

    try {
        const result = await client.query(
            `SELECT  s.status_name, s.text_color,s.background_color
                 FROM card_status cs
                 JOIN status s ON cs.status_id = s.status_id
                 WHERE cs.card_id = $1`,
            [cardId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error mengambil status berdasarkan cardId:', error);
        res.status(500).json({ message: 'Gagal mengambil status' });
    }
})

//2. get all status
app.get('/api/status', async (req, res) => {
    try {
        const result = await client.query(`SELECT * FROM status`);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Gagal mengambil daftar status' });
    }
})

//3. add/update status card id
app.post('/api/cards/:cardId/status', async (req, res) => {
    const { cardId } = req.params;
    const { statusId } = req.body;
    const userId = req.user.id;

    try {
        // Cek apakah kartu sudah memiliki status
        const check = await client.query(`SELECT * FROM card_status WHERE card_id = $1`, [cardId]);

        if (check.rows.length > 0) {
            // Jika ada, update status
            await client.query(`UPDATE card_status SET status_id = $1, update_at = CURRENT_TIMESTAMP WHERE card_id = $2`, [statusId, cardId]);
            res.json({ message: 'Status kartu berhasil diperbarui' });
        } else {
            // Jika belum ada, tambahkan status baru
            await client.query(`INSERT INTO card_status (card_id, status_id, assigned_at) VALUES ($1, $2, CURRENT_TIMESTAMP)`, [cardId, statusId]);
            res.json({ message: 'Status kartu berhasil ditambahkan' });
        }

        //add log card activity
        await logCardActivity({
            action: 'updated_status',
            card_id: cardId,
            user_id: userId,
            entity: 'status',
            entity_id: statusId,
            details: ''
        })

    } catch (error) {
        res.status(500).json({ error: 'Gagal menambahkan/memperbarui status kartu' });
    }
})

//3.1 add/update status card id
app.post('/api/cards/:cardId/update-status-testing/:userId', async (req, res) => {
    const { cardId, userId } = req.params;
    const { statusId } = req.body;
    const actingUserId = parseInt(userId, 10);

    if (!actingUserId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        let message = '';
        let oldStatusId = null;
        let oldStatusName = null;
        let newStatusName = null;

        // Cek apakah kartu sudah memiliki status
        const check = await client.query(`SELECT * FROM card_status WHERE card_id = $1`, [cardId]);

        if (check.rows.length > 0) {

            //simpan status lama sebelum update 
            oldStatusId = check.rows[0].status_id;

            // Ambil nama status lama
            const oldStatusRes = await client.query(`SELECT status_name FROM status WHERE status_id = $1`, [oldStatusId]);
            oldStatusName = oldStatusRes.rows[0]?.status_name || 'Unknown';

            // Jika ada, update status
            await client.query(
                `UPDATE card_status SET status_id = $1, update_at = CURRENT_TIMESTAMP WHERE card_id = $2`,
                [statusId, cardId]
            );
            message = 'Status kartu berhasil diperbarui';
        } else {
            // Jika belum ada, tambahkan status baru
            await client.query(
                `INSERT INTO card_status (card_id, status_id, assigned_at) VALUES ($1, $2, CURRENT_TIMESTAMP)`,
                [cardId, statusId]
            );
            message = 'Status kartu berhasil ditambahkan';
        }

        // Ambil nama status baru
        const newStatusRes = await client.query(`SELECT status_name FROM status WHERE status_id = $1`, [statusId]);
        newStatusName = newStatusRes.rows[0]?.status_name || 'Unknown';


        // Cari workspace_id dari card
        const boardRes = await client.query(`
            SELECT b.workspace_id
            FROM boards b
            JOIN lists l ON l.board_id = b.id
            JOIN cards c ON c.list_id = l.id
            WHERE c.id = $1
        `, [cardId]);

        const workspaceId = boardRes.rows[0]?.workspace_id;

        // Mengambil semua user workspace
        const workspaceUsersRes = await client.query(
            `SELECT user_id FROM workspaces_users WHERE workspace_id = $1 AND is_deleted = FALSE`,
            [workspaceId]
        );
        const userIds = workspaceUsersRes.rows.map(r => r.user_id);
        if (!userIds.includes(actingUserId)) userIds.push(actingUserId);

        // Ambil username acting user
        const actingUserRes = await client.query(
            'SELECT username FROM users WHERE id = $1',
            [actingUserId]
        );
        const actingUserName = actingUserRes.rows[0]?.username || 'Unknown';


        // Buat deskripsi aksi yang cantik ✨
        const actionDescription = oldStatusId
            ? `${actingUserName} updated card status dari '${oldStatusName}' menjadi '${newStatusName}'`
            : `${actingUserName} menetapkan status kartu ke '${newStatusName}'`;


        // Simpan aktivitas ke card_activities
        const activityRes = await client.query(`
            INSERT INTO card_activities 
            (card_id, user_id, action_type, entity, entity_id, action_detail)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [
            cardId,
            actingUserId,
            'updated_status',
            'status',
            statusId,
            JSON.stringify({
                from: oldStatusName || null,
                to: newStatusName,
                updatedBy: { id: actingUserId, username: actingUserName },
                description: actionDescription,
            })
        ]);

        // Kirim response akhir
        res.status(200).json({
            message,
            cardId,
            workspaceId,
            activity: activityRes.rows[0],
        });

    } catch (error) {
        console.error('❌ Error update status:', error);
        res.status(500).json({ error: 'Gagal menambahkan/memperbarui status kartu' });
    }
});


//4. delete status card id
app.delete('/api/cards/:cardId/status', async (req, res) => {
    const { cardId } = req.params;
    try {
        await client.query(`DELETE FROM card_status WHERE card_id = $1`, [cardId]);
        res.json({ message: 'Status berhasil dihapus dari kartu' });
    } catch (error) {
        res.status(500).json({ error: 'Gagal menghapus status kartu' });
    }
})



//DATA_EMPLOYEE
//1. add data employee
app.post('/api/data-employees', async (req, res) => {
    const { name, nomor_wa, divisi, jabatan, email_employee, username } = req.body
    try {
        const result = await client.query(
            `INSERT INTO data_employees (name, nomor_wa, divisi, jabatan, email_employee,username, create_at, update_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *`,
            [name, nomor_wa, divisi, jabatan, email_employee, username]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//2. delete data employee
app.delete('/api/employees/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const query = `DELETE FROM data_employees WHERE id = $1 RETURNING *;`;
        const result = await client.query(query, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Data employee tidak ditemukan" });
        }

        res.json({ message: "Data employee berhasil dihapus" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Gagal menghapus data employee" });
    }
})


//3.Mendapatkan semua data employee
app.get('/api/employees', async (req, res) => {
    try {
        const result = await client.query(`
        SELECT 
            de.id AS employee_id,
            de.name,
            de.nomor_wa,
            de.divisi,
            de.jabatan,
            de.email_employee,
            de.username,
            ep.id AS employee_profile_id,
            p.id AS profile_id,
            p.profile_name,
            p.photo_url,
            p.created_at AS profile_created_at
        FROM 
            data_employees de
        LEFT JOIN 
            employee_profiles ep ON de.id = ep.employee_id
        LEFT JOIN 
            profil p ON ep.profil_id = p.id
      `);

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching employee with profile', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//4. get data employee by id
app.get('/api/employees/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await client.query(`
      SELECT 
          de.id AS employee_id,
          de.name,
          de.nomor_wa,
          de.divisi,
          de.jabatan,
          de.email_employee,
          de.username,
          ep.id AS employee_profile_id,
          p.id AS profile_id,
          p.profile_name,
          p.photo_url,
          p.created_at AS profile_created_at
        FROM 
            data_employees de
        JOIN 
            employee_profiles ep ON de.id = ep.employee_id
        JOIN 
            profil p ON ep.profil_id = p.id
        WHERE 
            de.id = $1
        `, [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

//5. update data employee
app.put('/api/employees/:id', async (req, res) => {
    const { id } = req.params;
    const { name, nomor_wa, divisi, jabatan, email_employee, username } = req.body;

    try {
        const result = await client.query(
            `UPDATE data_employees SET 
            name = $1, nomor_wa = $2, divisi = $3, jabatan = $4, email_employee = $5, username = $6, update_at = CURRENT_TIMESTAMP
        WHERE id = $7 RETURNING *`,
            [name, nomor_wa, divisi, jabatan, email_employee, username, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})


//DATA MARKETING

// ✅ Get laporan today berdasarkan create_at (full join)
app.get('/api/marketing/reports/today', async (req, res) => {
    try {
        const result = await client.query(`
      SELECT 
        dm.*,
        mu.nama_marketing AS input_by_name,
        kd.nama AS acc_by_name,
        am.nama_account AS account_name,
        ot.order_name AS order_type_name,
        oft.offer_name AS offer_type_name,
        tt.track_name AS track_type_name,
        g.genre_name AS genre_name,
        pt.nama_project AS project_type_name,
        k.nama_kupon AS kupon_diskon_name,
        s.status_name AS accept_status_name
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
      LEFT JOIN accept_status s ON s.id = dm.accept_status_id
      WHERE DATE(dm.create_at) = CURRENT_DATE
      ORDER BY dm.marketing_id DESC;
    `);
        res.json(result.rows);
    } catch (error) {
        console.error("❌ Error get today report:", error.message);
        res.status(500).json({ error: error.message });
    }
});


// ✅ Get laporan per 10 hari berdasarkan create_at (full join)
app.get("/api/marketing/reports", async (req, res) => {
    try {
        const result = await client.query(`
      SELECT
        DATE_TRUNC('month', dm.create_at) AS month,
        FLOOR((EXTRACT(DAY FROM dm.create_at) - 1) / 10) + 1 AS period,
        COUNT(*) AS total,
        ARRAY_AGG(dm.marketing_id) AS ids,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'marketing_id', dm.marketing_id,
            'buyer_name', dm.buyer_name,
            'code_order', dm.code_order,
            'order_number', dm.order_number,
            'jumlah_track', dm.jumlah_track,
            'duration', dm.duration,
            'jumlah_revisi', dm.jumlah_revisi,
            'deadline', dm.deadline,
            'price_normal', dm.price_normal,
            'price_discount', dm.price_discount,
            'discount', dm.discount,
            'basic_price', dm.basic_price,
            'gig_link', dm.gig_link,
            'reference_link', dm.reference_link,
            'required_files', dm.required_files,
            'file_and_chat_link', dm.file_and_chat_link,
            'detail_project', dm.detail_project,
            'card_id', dm.card_id,
            'create_at', dm.create_at,
            'update_at', dm.update_at,
            'project_number', dm.project_number,

            -- Relasi (pakai hasil join)
            'input_by', dm.input_by,
            'input_by_name', mu.nama_marketing,
            'acc_by', dm.acc_by,
            'acc_by_name', kd.nama,
            'account', dm.account,
            'account_name', am.nama_account,
            'order_type', dm.order_type,
            'order_type_name', ot.order_name,
            'offer_type', dm.offer_type,
            'offer_type_name', oft.offer_name,
            'jenis_track', dm.jenis_track,
            'track_type_name', tt.track_name,
            'genre', dm.genre,
            'genre_name', g.genre_name,
            'project_type', dm.project_type,
            'project_type_name', pt.nama_project,
            'kupon_diskon_id', dm.kupon_diskon_id,
            'kupon_diskon_name', k.nama_kupon,
            'accept_status_id', dm.accept_status_id,
            'accept_status_name', s.status_name
          )
        ) AS details
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
      LEFT JOIN accept_status s ON s.id = dm.accept_status_id
      GROUP BY month, period
      ORDER BY month DESC, period ASC;
    `);

        res.json(result.rows);
    } catch (err) {
        console.error("❌ Query error:", err.message);
        res.status(500).json({ error: err.message });
    }
});




// ✅ Endpoint get all data marketing + join
app.get("/api/data-marketing/joined", async (req, res) => {
    try {
        const result = await client.query(`
      SELECT 
        dm.marketing_id,
        dm.card_id,
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
        dm.project_number,

        -- Relasi (balikin ID + Nama)
        mu.id AS input_by,
        mu.nama_marketing AS input_by_name,

        kd.id AS acc_by,
        kd.nama AS acc_by_name,

        am.id AS account,
        am.nama_account AS account_name,

        ot.id AS order_type,
        ot.order_name AS order_type_name,

        oft.id AS offer_type,
        oft.offer_name AS offer_type_name,

        tt.id AS jenis_track,
        tt.track_name AS track_type_name,

        g.id AS genre,
        g.genre_name AS genre_name,

        pt.id AS project_type,
        pt.nama_project AS project_type_name,

        k.id AS kupon_diskon_id,
        k.nama_kupon AS kupon_diskon_name,

        s.id AS accept_status_id,
        s.status_name AS accept_status_name

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
      LEFT JOIN accept_status s ON s.id = dm.accept_status_id
      WHERE dm.is_deleted = FALSE
      ORDER BY dm.position ASC;
    `);

        res.json(result.rows);
    } catch (err) {
        console.error("❌ Error get joined data marketing:", err);
        res.status(500).json({ error: "Failed to fetch joined data" });
    }
});


// ✅ GET Data Marketing by ID (Joined dengan semua relasi)
app.get("/api/data-marketing/joined/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await client.query(
            `
      SELECT 
        dm.marketing_id,
        dm.card_id,
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
        dm.project_number,

        -- Relasi (balikin ID + Nama)
        mu.id AS input_by,
        mu.nama_marketing AS input_by_name,

        kd.id AS acc_by,
        kd.nama AS acc_by_name,

        am.id AS account,
        am.nama_account AS account_name,

        ot.id AS order_type,
        ot.order_name AS order_type_name,

        oft.id AS offer_type,
        oft.offer_name AS offer_type_name,

        tt.id AS jenis_track,
        tt.track_name AS track_type_name,

        g.id AS genre,
        g.genre_name AS genre_name,

        pt.id AS project_type,
        pt.nama_project AS project_type_name,

        k.id AS kupon_diskon_id,
        k.nama_kupon AS kupon_diskon_name,

        s.id AS accept_status_id,
        s.status_name AS accept_status_name

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
      LEFT JOIN accept_status s ON s.id = dm.accept_status_id
      WHERE dm.marketing_id = $1 AND dm.is_deleted = FALSE
      LIMIT 1;
      `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "❌ Data marketing not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error get joined data marketing by ID:", err);
        res.status(500).json({ error: "Failed to fetch joined data by id" });
    }
});




// ✅ UPDATE Data Marketing by ID
app.put("/api/data-marketing/joined/:id", async (req, res) => {
    const { id } = req.params;
    const {
        buyer_name,
        code_order,
        order_number,
        jumlah_track,
        duration,
        jumlah_revisi,
        deadline,
        price_normal,
        price_discount,
        discount,
        basic_price,
        gig_link,
        reference_link,
        required_files,
        file_and_chat_link,
        detail_project,
        input_by,
        acc_by,
        account,
        order_type,
        offer_type,
        jenis_track,
        genre,
        project_type,
        kupon_diskon_id,
        accept_status_id,
        project_number,
    } = req.body;

    try {
        const result = await client.query(
            `
      UPDATE data_marketing
      SET 
        buyer_name       = $1,
        code_order       = $2,
        order_number     = $3,
        jumlah_track     = $4,
        duration         = $5,
        jumlah_revisi    = $6,
        deadline         = $7,
        price_normal     = $8,
        price_discount   = $9,
        discount         = $10,
        basic_price      = $11,
        gig_link         = $12,
        reference_link   = $13,
        required_files   = $14,
        file_and_chat_link = $15,
        detail_project   = $16,
        input_by         = $17,
        acc_by           = $18,
        account          = $19,
        order_type       = $20,
        offer_type       = $21,
        jenis_track      = $22,
        genre            = $23,
        project_type     = $24,
        kupon_diskon_id  = $25,
        accept_status_id = $26,
        project_number = $27,
        update_at        = NOW()
      WHERE marketing_id = $28
      RETURNING *;
      `,
            [
                buyer_name,
                code_order,
                order_number,
                jumlah_track,
                duration,
                jumlah_revisi,
                deadline,
                price_normal,
                price_discount,
                discount,
                basic_price,
                gig_link,
                reference_link,
                required_files,
                file_and_chat_link,
                detail_project,
                input_by,
                acc_by,
                account,
                order_type,
                offer_type,
                jenis_track,
                genre,
                project_type,
                kupon_diskon_id,
                accept_status_id,
                project_number,
                id,
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "❌ Data marketing not found" });
        }

        res.json({
            message: "✅ Data marketing updated successfully",
            data: result.rows[0],
        });
    } catch (err) {
        console.error("❌ Error updating data marketing:", err);
        res.status(500).json({ error: "Failed to update data marketing" });
    }
});




//1. get all marketing data
app.get('/api/marketing', async (req, res) => {
    try {
        const result = await client.query("SELECT * FROM data_marketing WHERE is_deleted = FALSE");
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
})

//2. get data marketing by id
app.get('/api/marketing/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await client.query("SELECT * FROM data_marketing WHERE marketing_id = $1 AND is_deleted = FALSE", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Data tidak ditemukan" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
})

// 3. update data marketing
app.put('/api/marketing/:id', async (req, res) => {
    const { id } = req.params;
    const {
        card_id,
        input_by,
        acc_by,
        buyer_name,
        code_order,
        jumlah_track,
        order_number,
        account,
        deadline,
        jumlah_revisi,
        order_type,
        offer_type,
        jenis_track,
        genre,
        price_normal,
        price_discount,
        discount,
        basic_price,
        gig_link,
        required_files,
        project_type,
        duration,
        reference_link,
        file_and_chat_link,
        detail_project,
        is_accepted // <- Tambahan kolom baru
    } = req.body;

    try {
        const result = await client.query(
            `UPDATE data_marketing SET 
        card_id = $1, input_by = $2, acc_by = $3, buyer_name = $4, 
        code_order = $5, jumlah_track = $6, order_number = $7, account = $8, 
        deadline = $9, jumlah_revisi = $10, order_type = $11, offer_type = $12, 
        jenis_track = $13, genre = $14, price_normal = $15, price_discount = $16, 
        discount = $17, basic_price = $18, gig_link = $19, required_files = $20, 
        project_type = $21, duration = $22, reference_link = $23, 
        file_and_chat_link = $24, detail_project = $25, is_accepted = $26, 
        update_at = CURRENT_TIMESTAMP
      WHERE marketing_id = $27 RETURNING *`,
            [
                card_id, input_by, acc_by, buyer_name, code_order, jumlah_track, order_number,
                account, deadline, jumlah_revisi, order_type, offer_type, jenis_track, genre,
                price_normal, price_discount, discount, basic_price, gig_link, required_files,
                project_type, duration, reference_link, file_and_chat_link, detail_project,
                is_accepted, // posisi ke-26
                id           // posisi ke-27
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Data tidak ditemukan" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});


//4. menghapus data marketing
app.delete("/api/marketing/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await client.query(
            `UPDATE data_marketing 
            SET is_deleted = true, deleted_at = NOW() 
            WHERE marketing_id = $1 RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Data tidak ditemukan" });
        }

        res.json({ message: "Data berhasil dipindahkan ke Recycle Bin", data: result.rows[0] });
    } catch (err) {
        console.error("Soft delete error:", err.message);
        res.status(500).send("Server error");
    }
});

// Restore data marketing
app.patch("/api/marketing/:id/restore", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await client.query(
            "UPDATE data_marketing SET is_deleted = false WHERE marketing_id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Data tidak ditemukan atau sudah aktif" });
        }

        res.json({ message: "Data berhasil direstore", data: result.rows[0] });
    } catch (err) {
        console.error("Restore error:", err.message);
        res.status(500).send("Server error");
    }
});


// 5. membuat data baru
// app.post("/api/marketing", async (req, res) => {
//     try {
//         const {
//             input_by,
//             acc_by,
//             buyer_name,
//             code_order,
//             jumlah_track,
//             order_number,
//             account,
//             deadline,
//             jumlah_revisi,
//             order_type,
//             offer_type,
//             jenis_track,
//             genre,
//             price_normal,
//             price_discount,
//             discount,
//             basic_price,
//             gig_link,
//             required_files,
//             project_type,
//             duration,
//             reference_link,
//             file_and_chat_link,
//             detail_project,
//         } = req.body;

//         // --- hitung project_number ---
//         const createAt = new Date(); // default pakai waktu saat insert
//         const monthStart = dayjs(createAt).startOf("month").toDate();
//         const monthEnd = dayjs(createAt).endOf("month").toDate();

//         const countResult = await client.query(
//             `SELECT COUNT(*) AS count
//        FROM data_marketing
//        WHERE create_at BETWEEN $1 AND $2`,
//             [monthStart, monthEnd]
//         );

//         const nextNumber = parseInt(countResult.rows[0].count) + 1;
//         const monthName = dayjs(createAt).format("MMMM");
//         // const projectNumber = `P${String(nextNumber).padStart(2, "0")} ${monthName}`;
//         const projectNumber = `P${String(nextNumber).padStart(2, "0")} ${dayjs(createAt).locale("id").format("DD/MMM/YYYY")}`;


//         // --- insert ke tabel ---
//         const result = await client.query(
//             `INSERT INTO data_marketing 
//       (input_by, acc_by, buyer_name, code_order, jumlah_track, order_number, 
//        account, deadline, jumlah_revisi, order_type, offer_type, jenis_track, genre, 
//        price_normal, price_discount, discount, basic_price, gig_link, required_files, 
//        project_type, duration, reference_link, file_and_chat_link, detail_project, 
//        create_at, project_number) 
//       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 
//               $16, $17, $18, $19, $20, $21, $22, $23, $24, CURRENT_TIMESTAMP, $25) 
//       RETURNING *`,
//             [
//                 input_by, acc_by, buyer_name, code_order, jumlah_track, order_number,
//                 account, deadline, jumlah_revisi, order_type, offer_type, jenis_track, genre,
//                 price_normal, price_discount, discount, basic_price, gig_link, required_files,
//                 project_type, duration, reference_link, file_and_chat_link, detail_project,
//                 projectNumber,
//             ]
//         );

//         res.status(201).json(result.rows[0]);
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send("Server error");
//     }
// });




//6. mengubah data marketing menjadi cards

// Titik awal nomornya bisa kamu ubah di sini
let currentOrderNumber = 297;    // nanti otomatis jadi 298, 299, dst
let currentProjectNumber = 35;   // nanti otomatis jadi P036, P037, dst

app.post("/api/marketing", async (req, res) => {
    try {
        const {
            input_by,
            acc_by,
            buyer_name,
            code_order,
            jumlah_track,
            account,
            deadline,
            jumlah_revisi,
            order_type,
            offer_type,
            jenis_track,
            genre,
            price_normal,
            price_discount,
            discount,
            basic_price,
            gig_link,
            required_files,
            project_type,
            duration,
            reference_link,
            file_and_chat_link,
            detail_project,
        } = req.body;

        // --- generate nomor otomatis ---
        currentOrderNumber += 1;
        currentProjectNumber += 1;

        const createAt = new Date();
        const formattedOrderNumber = currentOrderNumber.toString();
        const projectNumber = `P${String(currentProjectNumber).padStart(2, "0")} ${dayjs(createAt).locale("id").format("DD/MMM/YYYY")}`;

        // --- insert ke tabel ---
        const result = await client.query(
            `INSERT INTO data_marketing 
            (input_by, acc_by, buyer_name, code_order, jumlah_track, order_number, 
             account, deadline, jumlah_revisi, order_type, offer_type, jenis_track, genre, 
             price_normal, price_discount, discount, basic_price, gig_link, required_files, 
             project_type, duration, reference_link, file_and_chat_link, detail_project, 
             create_at, project_number) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 
                    $16, $17, $18, $19, $20, $21, $22, $23, CURRENT_TIMESTAMP, $24) 
            RETURNING *`,
            [
                input_by, acc_by, buyer_name, code_order, jumlah_track, formattedOrderNumber,
                account, deadline, jumlah_revisi, order_type, offer_type, jenis_track, genre,
                price_normal, price_discount, discount, basic_price, gig_link, required_files,
                project_type, duration, reference_link, file_and_chat_link, detail_project,
                projectNumber,
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error creating marketing data:", err.message);
        res.status(500).send("Server error");
    }
});


app.put('/api/create-card-marketing/:listId/:marketingId', async (req, res) => {
    const { listId, marketingId } = req.params;

    try {
        // ✅ Ambil data marketing dengan JOIN lengkap
        const marketingData = await client.query(`
            SELECT 
                dm.marketing_id,
                dm.card_id,
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
                dm.project_number,

                mu.nama_marketing AS input_by_name,
                kd.nama AS acc_by_name,
                am.nama_account AS account_name,
                ot.order_name AS order_type_name,
                oft.offer_name AS offer_type_name,
                tt.track_name AS track_type_name,
                g.genre_name AS genre_name,
                pt.nama_project AS project_type_name,
                k.nama_kupon AS kupon_diskon_name,
                s.status_name AS accept_status_name

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
            LEFT JOIN accept_status s ON s.id = dm.accept_status_id
            WHERE dm.marketing_id = $1 AND dm.card_id IS NULL
        `, [marketingId]);

        if (marketingData.rows.length === 0) {
            return res.status(404).json({ message: 'Data marketing tidak ditemukan atau sudah memiliki card_id' });
        }

        const marketing = marketingData.rows[0];

        const description = `
            <div>
            <p><strong> Project Number:</strong> ${marketing.project_number}</p>
            <p><strong> Order Code:</strong> ${marketing.code_order}</p>
            <p><strong> Input By:</strong> ${marketing.input_by_name || 'N/A'}</p>
            <p><strong> Approved By:</strong> ${marketing.acc_by_name || 'N/A'}</p>
            <p><strong> Buyer:</strong> ${marketing.buyer_name}</p>
            <p><strong> Order Number:</strong> ${marketing.order_number}</p>
            <p><strong> Account:</strong> ${marketing.account_name || 'N/A'}</p>
            <p><strong> Deadline:</strong> ${marketing.deadline ? new Date(marketing.deadline).toISOString().split('T')[0] : 'N/A'}</p>
            <p><strong> Jumlah Revisi:</strong> ${marketing.jumlah_revisi}</p>
            <p><strong> Order Type:</strong> ${marketing.order_type_name || 'N/A'}</p>
            <p><strong> Offer Type:</strong> ${marketing.offer_type_name || 'N/A'}</p>
            <p><strong> Jenis Track:</strong> ${marketing.track_type_name || 'N/A'}</p>
            <p><strong> Genre:</strong> ${marketing.genre_name || 'N/A'}</p>
            <p><strong> Jumlah Track:</strong> ${marketing.jumlah_track}</p>
            <p><strong> Normal Price:</strong> $${marketing.price_normal}</p>
            <p><strong> Discount:</strong> ${marketing.discount ?? 'N/A'}</p>
            <p><strong> Basic Price:</strong> $${marketing.basic_price ?? 'N/A'}</p>
            <p><strong> Required Files:</strong> ${marketing.required_files}</p>
            <p><strong> Project Type:</strong> ${marketing.project_type_name || 'N/A'}</p>
            <p><strong> Duration:</strong> ${marketing.duration}</p>
            <p><strong> Gig Link:</strong> ${marketing.gig_link}</p>
            <p><strong> Reference:</strong> ${marketing.reference_link}</p>
            <p><strong> File & Chat:</strong> ${marketing.file_and_chat_link}</p>
            <p><strong> Kupon Diskon:</strong> ${marketing.kupon_diskon_name || 'N/A'}</p>
            <p><strong> Status:</strong> ${marketing.accept_status_name || 'N/A'}</p>
            <p><strong> Detail:</strong> ${marketing.detail_project}</p>
            </div>
            `.trim();


        // Ambil 5 digit terakhir code_order
        const lastFiveDigits = marketing.code_order
            ? marketing.code_order.slice(-5)
            : 'XXXXX'; // default kalau code_order kosong

        // ambil posisi terakhir
        const posResult = await client.query(
            `SELECT COALESCE(MAX(position), -1) + 1 AS next_position
        FROM cards
        WHERE list_id = $1`,
            [listId]
        );

        const nextPosition = posResult.rows[0].next_position;

        // ✅ Card title juga pakai nama genre + buyer
        // insert card baru di posisi terakhir
        const newCard = await client.query(
            `INSERT INTO cards (list_id, title, description, position, due_date) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING id`,
            [
                listId,
                `'New Project' - ${marketing.buyer_name || 'Unknown'} - (${marketing.account_name || '-'}) - ${marketing.order_type_name || 'N/A'} - ${lastFiveDigits}`,
                description,
                nextPosition, // posisi terakhir
                marketing.deadline
            ]
        );

        const cardId = newCard.rows[0].id;

        // ✅ Update card_id di data_marketing
        await client.query(
            'UPDATE data_marketing SET card_id = $1 WHERE marketing_id = $2',
            [cardId, marketingId]
        );

        // ✅ Tambahin auto-label kalau project_type = ORIGINAL
        if (marketing.project_type_name === "ORIGINAL") {
            const labelResult = await client.query(
                "SELECT id FROM labels WHERE name = $1 LIMIT 1",
                ["Mixing & Mastering"]
            );

            if (labelResult.rows.length > 0) {
                await client.query(
                    "INSERT INTO card_labels (card_id, label_id) VALUES ($1, $2)",
                    [cardId, labelResult.rows[0].id]
                );
            }
        }

        return res.status(201).json({
            message: 'Card berhasil dibuat dari data marketing.',
            cardId
        });

    } catch (error) {
        console.error('Error creating card from marketing data:', error);
        return res.status(500).json({ message: 'Terjadi kesalahan saat membuat card dari data marketing.' });
    }
});



//7. get card id by marketing id
app.get('/api/get-card-id/:marketingId', async (req, res) => {
    const { marketingId } = req.params;
    try {
        const query = `
          SELECT card_id
          FROM public.data_marketing
          WHERE marketing_id = $1
        `;
        const result = await client.query(query, [marketingId]);

        if (result.rows.length > 0) {
            const { card_id } = result.rows[0]; // Mengambil card_id dari hasil query
            return res.json({ cardId: card_id });
        } else {
            return res.status(404).json({ error: 'Card not found for the provided marketing_id' });
        }
    } catch (error) {
        console.error('Error executing query', error.stack);
        return res.status(500).json({ error: 'Internal server error' });
    }
})
//8. check card id in marketing id (null or not)
app.get('/api/check-card-id/:marketingId', async (req, res) => {
    const { marketingId } = req.params;
    try {
        const query = 'SELECT card_id FROM public.data_marketing WHERE marketing_id = $1';
        const result = await client.query(query, [marketingId]);

        if (result.rows.length > 0) {
            // If card_id exists, return the card_id
            return res.status(200).json({ card_id: result.rows[0].card_id });
        } else {
            // No card_id found for the given marketing_id
            return res.status(404).json({ message: 'No card_id found for this marketing_id' });
        }
    } catch (error) {
        console.error('Error checking card_id:', error);
        return res.status(500).json({ message: 'Server error' });
    }
})

// POSITION DATA MARKETING 
app.patch("/api/data-marketing/:id/position", async (req, res) => {
    const { id } = req.params;
    const { direction } = req.body; // "up" atau "down"

    try {
        // Ambil data yang ingin dipindah
        const { rows } = await client.query(
            `SELECT marketing_id, position FROM data_marketing WHERE marketing_id = $1`,
            [id]
        );

        if (!rows.length)
            return res.status(404).json({ error: "Data tidak ditemukan" });

        const current = rows[0];
        const newPosition =
            direction === "up" ? current.position - 1 : current.position + 1;

        // Cari item yang punya posisi target
        const swap = await client.query(
            `SELECT marketing_id FROM data_marketing WHERE position = $1`,
            [newPosition]
        );

        if (!swap.rows.length) {
            return res.json({ message: "Sudah di posisi teratas / terbawah" });
        }

        const swapId = swap.rows[0].marketing_id;

        // Tukar posisi
        await client.query("BEGIN");
        await client.query(
            `UPDATE data_marketing SET position = $1 WHERE marketing_id = $2`,
            [newPosition, current.marketing_id]
        );
        await client.query(
            `UPDATE data_marketing SET position = $1 WHERE marketing_id = $2`,
            [current.position, swapId]
        );
        await client.query("COMMIT");

        res.json({ success: true, message: "Posisi diperbarui" });
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("❌ Error ubah posisi data_marketing:", err);
        res.status(500).json({ error: "Gagal ubah posisi" });
    }
});


// ✅ Get Data Marketing with cardId IS NOT NULL + JOIN
app.get('/api/data-marketing-cardId', async (req, res) => {
    try {
        const result = await client.query(`
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
        dm.card_id,
        dm.create_at,
        dm.update_at,
        dm.project_number,

        -- Relasi (balikin ID + Nama)
        mu.id AS input_by,
        mu.nama_marketing AS input_by_name,

        kd.id AS acc_by,
        kd.nama AS acc_by_name,

        am.id AS account,
        am.nama_account AS account_name,

        ot.id AS order_type,
        ot.order_name AS order_type_name,

        oft.id AS offer_type,
        oft.offer_name AS offer_type_name,

        tt.id AS jenis_track,
        tt.track_name AS track_type_name,

        g.id AS genre,
        g.genre_name AS genre_name,

        pt.id AS project_type,
        pt.nama_project AS project_type_name,

        k.id AS kupon_diskon_id,
        k.nama_kupon AS kupon_diskon_name,

        s.id AS accept_status_id,
        s.status_name AS accept_status_name

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
      LEFT JOIN accept_status s ON s.id = dm.accept_status_id
      WHERE dm.card_id IS NOT NULL AND dm.is_deleted = false
      ORDER BY dm.marketing_id DESC;
    `);

        res.json(result.rows);
    } catch (error) {
        console.error('❌ Error fetching marketing data with cardId:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// ✅ Get Data Marketing with cardId IS NULL + JOIN
app.get('/api/data-marketing-cardId-null', async (req, res) => {
    try {
        const result = await client.query(`
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
        dm.card_id,
        dm.create_at,
        dm.update_at,
        dm.project_number,

        -- Relasi (balikin ID + Nama)
        mu.id AS input_by,
        mu.nama_marketing AS input_by_name,

        kd.id AS acc_by,
        kd.nama AS acc_by_name,

        am.id AS account,
        am.nama_account AS account_name,

        ot.id AS order_type,
        ot.order_name AS order_type_name,

        oft.id AS offer_type,
        oft.offer_name AS offer_type_name,

        tt.id AS jenis_track,
        tt.track_name AS track_type_name,

        g.id AS genre,
        g.genre_name AS genre_name,

        pt.id AS project_type,
        pt.nama_project AS project_type_name,

        k.id AS kupon_diskon_id,
        k.nama_kupon AS kupon_diskon_name,

        s.id AS accept_status_id,
        s.status_name AS accept_status_name

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
      LEFT JOIN accept_status s ON s.id = dm.accept_status_id
      WHERE dm.card_id IS NULL AND dm.is_deleted = false
      ORDER BY dm.marketing_id DESC;
    `);

        res.json(result.rows);
    } catch (error) {
        console.error('❌ Error fetching data marketing cardId null:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// ✅ Get Data Marketing Accepted
// ✅ Get Data Marketing Accepted + Join Lengkap
app.get("/api/data-marketing/accepted", async (req, res) => {
    try {
        const result = await client.query(`
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
        dm.project_number,

        mu.id AS input_by,
        mu.nama_marketing AS input_by_name,

        kd.id AS acc_by,
        kd.nama AS acc_by_name,

        am.id AS account,
        am.nama_account AS account_name,

        ot.id AS order_type,
        ot.order_name AS order_type_name,

        oft.id AS offer_type,
        oft.offer_name AS offer_type_name,

        tt.id AS jenis_track,
        tt.track_name AS track_type_name,

        g.id AS genre,
        g.genre_name AS genre_name,

        pt.id AS project_type,
        pt.nama_project AS project_type_name,

        k.id AS kupon_diskon_id,
        k.nama_kupon AS kupon_diskon_name,

        s.id AS accept_status_id,
        s.status_name AS accept_status_name

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
      LEFT JOIN accept_status s ON s.id = dm.accept_status_id
      WHERE s.status_name = 'Not Accepted' AND dm.is_deleted = false

      ORDER BY dm.marketing_id DESC;
    `);

        res.json(result.rows);
    } catch (err) {
        console.error("❌ Error get accepted data:", err);
        res.status(500).json({ error: "Failed to fetch accepted data" });
    }
});


// ✅ Get Data Marketing Not Accepted + Join Lengkap
app.get("/api/data-marketing/rejected", async (req, res) => {
    try {
        const result = await client.query(`
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
        dm.project_number,

        mu.id AS input_by,
        mu.nama_marketing AS input_by_name,

        kd.id AS acc_by,
        kd.nama AS acc_by_name,

        am.id AS account,
        am.nama_account AS account_name,

        ot.id AS order_type,
        ot.order_name AS order_type_name,

        oft.id AS offer_type,
        oft.offer_name AS offer_type_name,

        tt.id AS jenis_track,
        tt.track_name AS track_type_name,

        g.id AS genre,
        g.genre_name AS genre_name,

        pt.id AS project_type,
        pt.nama_project AS project_type_name,

        k.id AS kupon_diskon_id,
        k.nama_kupon AS kupon_diskon_name,

        s.id AS accept_status_id,
        s.status_name AS accept_status_name

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
      LEFT JOIN accept_status s ON s.id = dm.accept_status_id
    WHERE s.status_name = 'Not Accepted' AND dm.is_deleted = false

      ORDER BY dm.marketing_id DESC;
    `);

        res.json(result.rows);
    } catch (err) {
        console.error("❌ Error get not accepted data:", err);
        res.status(500).json({ error: "Failed to fetch not accepted data" });
    }
});



//13. archive data marketing
app.post('/api/archive-data-marketing/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await client.query(`
            INSERT INTO archive (
                entity_type, entity_id, name, description, parent_id, parent_type, create_at, update_at, archived_at
            )
            SELECT 
                'data_marketing',
                dm.marketing_id,
                dm.buyer_name,
                dm.detail_project,
                dm.card_id,
                'card',
                dm.create_at,
                dm.update_at,
                NOW()
            FROM data_marketing dm
            WHERE dm.marketing_id = $1
        `, [id]);

        if (result.rowCount > 0) {
            await client.query(`DELETE FROM data_marketing WHERE marketing_id = $1`, [id]);
            res.status(200).send(`Data marketing dengan id ${id} berhasil diarsipkan`);
        } else {
            res.status(404).send(`Data marketing dengan id ${id} tidak ditemukan`);
        }
    } catch (error) {
        console.error(`Error archive data marketing with id ${id}`, error);
        res.status(500).json({ error: error.message });
    }
});


// STATUS ACCEPT 

// ✅ Get semua status accept
app.get("/api/accept-status", async (req, res) => {
    try {
        const result = await client.query("SELECT * FROM accept_status ORDER BY id ASC");
        res.json(result.rows);
    } catch (err) {
        console.error("❌ Error get accept_status:", err);
        res.status(500).json({ error: "Gagal mengambil data accept status" });
    }
});

// ✅ Get status accept by ID
app.get("/api/accept-status/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await client.query("SELECT * FROM accept_status WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Status accept tidak ditemukan" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error get accept_status by id:", err);
        res.status(500).json({ error: "Gagal mengambil data accept status" });
    }
});

// ✅ Create status accept baru
app.post("/api/accept-status", async (req, res) => {
    try {
        const { status_name } = req.body;
        const result = await client.query(
            "INSERT INTO accept_status (status_name) VALUES ($1) RETURNING *",
            [status_name]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error tambah accept_status:", err);
        res.status(500).json({ error: "Gagal tambah status accept" });
    }
});

// ✅ Update status accept
app.put("/api/accept-status/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { status_name } = req.body;
        const result = await client.query(
            `UPDATE accept_status 
       SET status_name = $1, update_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
            [status_name, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Status accept tidak ditemukan" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error update accept_status:", err);
        res.status(500).json({ error: "Gagal update status accept" });
    }
});

// ✅ Delete status accept
app.delete("/api/accept-status/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await client.query(
            "DELETE FROM accept_status WHERE id = $1 RETURNING *",
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Status accept tidak ditemukan" });
        }
        res.json({ message: "Status accept berhasil dihapus" });
    } catch (err) {
        console.error("❌ Error delete accept_status:", err);
        res.status(500).json({ error: "Gagal hapus status accept" });
    }
});

// END STATUS ACCEPT 

//DATA MARKETING DESIGN

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
        md.card_id,
        md.resolution,
        md.reference,
        md.project_number,

        -- Relasi Input By
        mdu.id AS input_by_id,
        mdu.nama_marketing AS input_by_name,

        -- Relasi Acc By (kepala divisi design)
        kdd.id AS acc_by_id,
        kdd.nama AS acc_by_name,

        -- Relasi Account
        ad.id AS account_id,
        ad.nama_account AS account_name,

        -- Relasi Offer Type
        ot.id AS offer_type_id,
        ot.offer_name AS offer_type_name,

        -- Relasi Project Type
        pt.id AS project_type_id,
        pt.project_name AS project_type_name,

        -- Relasi Style
        sd.id AS style_id,
        sd.style_name AS style_name,

        -- Relasi Status Project
        sp.id AS status_project_id,
        sp.status_name AS status_project_name,

        -- Relasi Design Order Type (baru ditambahkan)
        dot.id AS order_type_id,
        dot.order_name AS order_type_name

      FROM marketing_design md
      LEFT JOIN marketing_desain_user mdu ON md.input_by = mdu.id
      LEFT JOIN kepala_divisi_design kdd ON md.acc_by = kdd.id
      LEFT JOIN account_design ad ON md.account = ad.id
      LEFT JOIN offer_type_design ot ON md.offer_type = ot.id
      LEFT JOIN project_type_design pt ON md.project_type_id = pt.id
      LEFT JOIN style_design sd ON md.style_id = sd.id
      LEFT JOIN status_project_design sp ON md.status_project_id = sp.id
      LEFT JOIN design_order_type dot ON md.order_type_id = dot.id
      WHERE md.is_deleted = false
      ORDER BY md.marketing_design_id DESC;
    `);

        res.json(result.rows);
    } catch (err) {
        console.error("❌ Error get joined marketing_design:", err);
        res.status(500).json({ error: "Failed to fetch joined data" });
    }
});



// ✅ Get marketing_design by ID + join (id + name saja)
app.get("/api/marketing-design/joined/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await client.query(
            `
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
        md.card_id,
        md.resolution,
        md.reference,
        md.project_number,

        -- Relasi Input By
        mdu.id AS input_by_id,
        mdu.nama_marketing AS input_by_name,

        -- Relasi Acc By (kepala divisi design)
        kdd.id AS acc_by_id,
        kdd.nama AS acc_by_name,

        -- Relasi Account
        ad.id AS account_id,
        ad.nama_account AS account_name,

        -- Relasi Offer Type
        ot.id AS offer_type_id,
        ot.offer_name AS offer_type_name,

        -- Relasi Project Type
        pt.id AS project_type_id,
        pt.project_name AS project_type_name,

        -- Relasi Style
        sd.id AS style_id,
        sd.style_name AS style_name,

        -- Relasi Status Project
        sp.id AS status_project_id,
        sp.status_name AS status_project_name,

        -- Relasi Design Order Type (baru ditambahkan)
        dot.id AS order_type_id,
        dot.order_name AS order_type_name

      FROM marketing_design md
      LEFT JOIN marketing_desain_user mdu ON md.input_by = mdu.id
      LEFT JOIN kepala_divisi_design kdd ON md.acc_by = kdd.id
      LEFT JOIN account_design ad ON md.account = ad.id
      LEFT JOIN offer_type_design ot ON md.offer_type = ot.id
      LEFT JOIN project_type_design pt ON md.project_type_id = pt.id
      LEFT JOIN style_design sd ON md.style_id = sd.id
      LEFT JOIN status_project_design sp ON md.status_project_id = sp.id
      LEFT JOIN design_order_type dot ON md.order_type_id = dot.id
      WHERE md.marketing_design_id = $1 AND md.is_deleted = FALSE;
    `,
            [id]
        );

        // if (result.rows.length === 0)
        //     return res.status(404).json({ error: "Marketing design not found" });

        // const row = result.rows[0];

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "❌ Data marketing Design not found" });
        }

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
        acc_by,
        account,
        offer_type,
        order_type_id,
        project_type_id,
        style_id,
        status_project_id,
        resolution,
        reference,
        project_number,
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
        order_type_id       = $17,
        project_type_id     = $18,
        style_id            = $19,
        status_project_id   = $20,
        resolution          = $21,
        reference           = $22,
        project_number      = $23,
        update_at           = NOW()
      WHERE marketing_design_id = $24
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
                order_type_id,
                project_type_id,
                style_id,
                status_project_id,
                resolution,
                reference,
                project_number,
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
        md.resolution,
        md.reference,
        md.project_number,

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
        sp.status_name AS status_project_name,

        -- Relasi Design Order Type (baru ditambahkan)
        dot.id AS order_type_id,
        dot.order_name AS order_type_name

      FROM marketing_design md
      LEFT JOIN marketing_desain_user mdu ON md.input_by = mdu.id
      LEFT JOIN kepala_divisi_design kdd ON md.acc_by = kdd.id
      LEFT JOIN account_design ad ON md.account = ad.id
      LEFT JOIN offer_type_design ot ON md.offer_type = ot.id
      LEFT JOIN project_type_design pt ON md.project_type_id = pt.id
      LEFT JOIN style_design sd ON md.style_id = sd.id
      LEFT JOIN status_project_design sp ON md.status_project_id = sp.id
      LEFT JOIN design_order_type dot ON md.order_type_id = dot.id
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

// ✅ Get laporan today untuk data marketing design (full join)
app.get('/api/marketing-design/reports/today', async (req, res) => {
    try {
        const result = await client.query(`
      SELECT 
        md.*,
        mdu.nama_marketing AS input_by_name,
        kdd.nama AS acc_by_name,
        ad.nama_account AS account_name,
        dot.order_name AS order_type_name,
        ot.offer_name AS offer_type_name,
        sd.style_name AS style_name,
        md.resolution,
        pt.project_name AS project_type_name,
        sp.status_name AS status_project_name
      FROM marketing_design md
      LEFT JOIN marketing_desain_user mdu ON mdu.id = md.input_by
      LEFT JOIN kepala_divisi_design kdd ON kdd.id = md.acc_by
      LEFT JOIN account_design ad ON ad.id = md.account
      LEFT JOIN design_order_type dot ON dot.id = md.order_type_id
      LEFT JOIN offer_type_design ot ON ot.id = md.offer_type
      LEFT JOIN style_design sd ON sd.id = md.style_id
      LEFT JOIN project_type_design pt ON pt.id = md.project_type_id
      LEFT JOIN status_project_design sp ON sp.id = md.status_project_id
      WHERE DATE(md.create_at) = CURRENT_DATE AND md.is_deleted = FALSE
      ORDER BY md.marketing_design_id DESC;
    `);

        res.json(result.rows);
    } catch (error) {
        console.error("❌ Error get today marketing-design report:", error.message);
        res.status(500).json({ error: error.message });
    }
});



/// ✅ Endpoint marketing-design per 10 hari dengan detail + join
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
            'resolution', md.resolution,
            'reference', md.reference,
            'project_number', md.project_number,   -- ✅ ditambah

            -- Relasi Input By
            'input_by', mdu.id,
            'input_by_name', mdu.nama_marketing,

            -- Relasi Acc By
            'acc_by', kdd.id,
            'acc_by_name', kdd.nama,

            -- Relasi Account
            'account', ad.id,
            'account_name', ad.nama_account,

            -- Relasi Offer Type
            'offer_type', ot.id,
            'offer_type_name', ot.offer_name,

            -- Relasi Project Type
            'project_type', pt.id,
            'project_type_name', pt.project_name,

            -- Relasi Style
            'style', sd.id,
            'style_name', sd.style_name,

            -- Relasi Status Project
            'status_project', sp.id,
            'status_project_name', sp.status_name,

            -- Relasi Design Order Type (baru ditambah)
            'order_type', dot.id,
            'order_type_name', dot.order_name
          )
        ) AS details
      FROM marketing_design md
      LEFT JOIN marketing_desain_user mdu ON md.input_by = mdu.id
      LEFT JOIN kepala_divisi_design kdd ON md.acc_by = kdd.id
      LEFT JOIN account_design ad ON md.account = ad.id
      LEFT JOIN offer_type_design ot ON md.offer_type = ot.id
      LEFT JOIN project_type_design pt ON md.project_type_id = pt.id
      LEFT JOIN style_design sd ON md.style_id = sd.id
      LEFT JOIN status_project_design sp ON md.status_project_id = sp.id
      LEFT JOIN design_order_type dot ON md.order_type_id = dot.id
      WHERE md.is_deleted = false
      GROUP BY month, period
      ORDER BY month DESC, period ASC;
    `);

        res.json(result.rows);
    } catch (err) {
        console.error("❌ Query error:", err.message);
        res.status(500).json({ error: err.message });
    }
});





//1. menampilkan semua data
app.get('/api/marketing-design', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM marketing_design');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})
//2. menampilkan data berdasarkan id
app.get('/api/marketing-design/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await client.query('SELECT * FROM marketing_design WHERE marketing_design_id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Data not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

app.post('/api/marketing-design', async (req, res) => {
    let {
        input_by, buyer_name, code_order, jumlah_design, order_number, account, deadline,
        jumlah_revisi, order_type, offer_type, style, resolution, price_normal, price_discount,
        discount_percentage, required_files, project_type, reference, file_and_chat, detail_project, acc_by, is_accepted, project_number,
    } = req.body;

    // ✅ Default value jika is_accepted tidak dikirim
    if (typeof is_accepted === 'undefined' || is_accepted === null) {
        is_accepted = false;
    }

    console.log("Received data:", req.body); // 🟡 log data yang dikirim dari frontend

    try {
        const result = await client.query(
            `INSERT INTO marketing_design (
                input_by, buyer_name, code_order, jumlah_design, order_number, account, deadline,
                jumlah_revisi, order_type, offer_type, style, resolution, price_normal, price_discount,
                discount_percentage, required_files, project_type, reference, file_and_chat, detail_project, acc_by, is_accepted, create_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, CURRENT_TIMESTAMP
            ) RETURNING *`,
            [
                input_by, buyer_name, code_order, jumlah_design, order_number, account, deadline,
                jumlah_revisi, order_type, offer_type, style, resolution, price_normal, price_discount,
                discount_percentage, required_files, project_type, reference, file_and_chat, detail_project, acc_by, is_accepted
            ]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("❌ Insert Error:", err); // 🔴 tampilkan error detail
        res.status(500).json({ error: err.message });
    }
});


// Tambah data marketing_design baru (lengkap dengan order_type + project_number)
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
        input_by,
        acc_by,
        account,
        offer_type,
        order_type_id,
        resolution,
        reference,
        project_type_id,
        style_id,
        status_project_id
    } = req.body;

    try {
        // --- Hitung project_number otomatis ---
        const createAt = new Date();
        const monthStart = dayjs(createAt).startOf("month").toDate();
        const monthEnd = dayjs(createAt).endOf("month").toDate();

        const countResult = await client.query(
            `SELECT COUNT(*) AS count
             FROM marketing_design
             WHERE create_at BETWEEN $1 AND $2`,
            [monthStart, monthEnd]
        );

        const nextNumber = parseInt(countResult.rows[0].count) + 1;
        const monthName = dayjs(createAt).format("MMMM");
        // const projectNumber = `P${String(nextNumber).padStart(2, "0")} ${monthName}`;
        const projectNumber = `P${String(nextNumber).padStart(2, "0")} ${dayjs(createAt).locale("id").format("DD/MMM/YYYY")}$`;
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
                order_type_id,
                resolution,
                reference,
                project_type_id,
                style_id,
                status_project_id,
                project_number,   -- ✅ tambahin project_number
                create_at
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23, NOW())
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
                order_type_id,
                resolution,
                reference,
                project_type_id,
                style_id,
                status_project_id,
                projectNumber // ✅ masukin hasil generate
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
                md.resolution,
                md.reference,
                md.project_number, -- ✅ tampilkan juga di hasil GET

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
                sp.status_name AS status_project_name,

                dot.id AS order_type_id,
                dot.order_name AS order_type_name
            FROM marketing_design md
            LEFT JOIN marketing_desain_user mdu ON md.input_by = mdu.id
            LEFT JOIN kepala_divisi_design kdd ON md.acc_by = kdd.id
            LEFT JOIN account_design ad ON md.account = ad.id
            LEFT JOIN offer_type_design ot ON md.offer_type = ot.id
            LEFT JOIN project_type_design pt ON md.project_type_id = pt.id
            LEFT JOIN style_design sd ON md.style_id = sd.id
            LEFT JOIN status_project_design sp ON md.status_project_id = sp.id
            LEFT JOIN design_order_type dot ON md.order_type_id = dot.id
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


// ENDPOIN UBAH POSISI DATA 
app.patch("/api/marketing-design/:id/position", async (req, res) => {
    const { id } = req.params;
    const { direction } = req.body; // "up" atau "down"

    try {
        const { rows } = await client.query(
            `SELECT marketing_design_id, position FROM marketing_design WHERE marketing_design_id = $1`,
            [id]
        );

        if (!rows.length) return res.status(404).json({ error: "Data tidak ditemukan" });

        const current = rows[0];
        const newPosition = direction === "up" ? current.position - 1 : current.position + 1;

        // Cari item yang punya posisi target
        const swap = await client.query(
            `SELECT marketing_design_id FROM marketing_design WHERE position = $1`,
            [newPosition]
        );

        if (!swap.rows.length) {
            return res.json({ message: "Sudah di posisi teratas / terbawah" });
        }

        const swapId = swap.rows[0].marketing_design_id;

        // Tukar posisi
        await client.query("BEGIN");
        await client.query(
            `UPDATE marketing_design SET position = $1 WHERE marketing_design_id = $2`,
            [newPosition, current.marketing_design_id]
        );
        await client.query(
            `UPDATE marketing_design SET position = $1 WHERE marketing_design_id = $2`,
            [current.position, swapId]
        );
        await client.query("COMMIT");

        res.json({ success: true, message: "Posisi diperbarui" });
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("❌ Error ubah posisi:", err);
        res.status(500).json({ error: "Gagal ubah posisi" });
    }
});




// // Tambah data marketing_design baru (lengkap dengan order_type + project_number)
// app.post("/api/marketing-design/joined", async (req, res) => {
//     const {
//         buyer_name,
//         code_order,
//         order_number,
//         jumlah_design,
//         deadline,
//         jumlah_revisi,
//         price_normal,
//         price_discount,
//         discount_percentage,
//         required_files,
//         file_and_chat,
//         detail_project,
//         input_by,
//         acc_by,
//         account,
//         offer_type,
//         order_type_id,
//         resolution,
//         reference,
//         project_type_id,
//         style_id,
//         status_project_id
//     } = req.body;

//     try {
//         // 🧠 Ambil bulan sekarang
//         const createAt = new Date();
//         const monthStart = dayjs(createAt).startOf("month").toDate();
//         const monthEnd = dayjs(createAt).endOf("month").toDate();
//         const monthName = dayjs(createAt).format("MMMM");

//         // 🧾 Ambil project_number terakhir di bulan ini
//         const lastProjectQuery = await client.query(
//             `
//             SELECT project_number 
//             FROM marketing_design
//             WHERE create_at BETWEEN $1 AND $2
//             ORDER BY marketing_design_id DESC
//             LIMIT 1;
//             `,
//             [monthStart, monthEnd]
//         );

//         let nextNumber;

//         if (lastProjectQuery.rows.length > 0) {
//             // 🔢 Ambil angka terakhir dari format "P035 Oktober"
//             const lastNumberPart = lastProjectQuery.rows[0].project_number.match(/P(\d+)/);
//             const lastNumber = lastNumberPart ? parseInt(lastNumberPart[1]) : 0;
//             nextNumber = lastNumber + 1;
//         } else {
//             // 🔄 Kalau belum ada di bulan ini, mulai dari 1
//             nextNumber = 1;
//         }

//         // 🧮 Buat format project number baru
//         const projectNumber = `P${String(nextNumber).padStart(3, "0")} ${monthName}`;

//         // 💾 Simpan ke DB
//         const result = await client.query(
//             `
//             INSERT INTO marketing_design (
//                 buyer_name,
//                 code_order,
//                 order_number,
//                 jumlah_design,
//                 deadline,
//                 jumlah_revisi,
//                 price_normal,
//                 price_discount,
//                 discount_percentage,
//                 required_files,
//                 file_and_chat,
//                 detail_project,
//                 input_by,
//                 acc_by,
//                 account,
//                 offer_type,
//                 order_type_id,
//                 resolution,
//                 reference,
//                 project_type_id,
//                 style_id,
//                 status_project_id,
//                 project_number,
//                 create_at
//             )
//             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22, NOW())
//             RETURNING *;
//             `,
//             [
//                 buyer_name,
//                 code_order,
//                 order_number,
//                 jumlah_design,
//                 deadline,
//                 jumlah_revisi,
//                 price_normal,
//                 price_discount,
//                 discount_percentage,
//                 required_files,
//                 file_and_chat,
//                 detail_project,
//                 input_by,
//                 acc_by,
//                 account,
//                 offer_type,
//                 order_type_id,
//                 resolution,
//                 reference,
//                 project_type_id,
//                 style_id,
//                 status_project_id,
//                 projectNumber
//             ]
//         );

//         // Ambil data dengan join biar langsung lengkap tampilannya
//         const joined = await client.query(
//             `
//             SELECT 
//                 md.marketing_design_id,
//                 md.buyer_name,
//                 md.code_order,
//                 md.order_number,
//                 md.jumlah_design,
//                 md.deadline,
//                 md.jumlah_revisi,
//                 md.price_normal,
//                 md.price_discount,
//                 md.discount_percentage,
//                 md.required_files,
//                 md.file_and_chat,
//                 md.detail_project,
//                 md.resolution,
//                 md.reference,
//                 md.project_number,

//                 mdu.id AS input_by,
//                 mdu.nama_marketing AS input_by_name,
//                 mdu.divisi AS input_by_divisi,

//                 kdd.id AS acc_by,
//                 kdd.nama AS acc_by_name,

//                 ad.id AS account,
//                 ad.nama_account AS account_name,

//                 ot.id AS offer_type,
//                 ot.offer_name AS offer_type_name,

//                 pt.id AS project_type,
//                 pt.project_name AS project_type_name,

//                 sd.id AS style,
//                 sd.style_name AS style_name,

//                 sp.id AS status_project,
//                 sp.status_name AS status_project_name,

//                 dot.id AS order_type_id,
//                 dot.order_name AS order_type_name
//             FROM marketing_design md
//             LEFT JOIN marketing_desain_user mdu ON md.input_by = mdu.id
//             LEFT JOIN kepala_divisi_design kdd ON md.acc_by = kdd.id
//             LEFT JOIN account_design ad ON md.account = ad.id
//             LEFT JOIN offer_type_design ot ON md.offer_type = ot.id
//             LEFT JOIN project_type_design pt ON md.project_type_id = pt.id
//             LEFT JOIN style_design sd ON md.style_id = sd.id
//             LEFT JOIN status_project_design sp ON md.status_project_id = sp.id
//             LEFT JOIN design_order_type dot ON md.order_type_id = dot.id
//             WHERE md.marketing_design_id = $1
//             `,
//             [result.rows[0].marketing_design_id]
//         );

//         res.status(201).json({
//             message: "✅ Marketing design created successfully",
//             data: joined.rows[0],
//         });
//     } catch (err) {
//         console.error("❌ Error creating marketing_design:", err);
//         res.status(500).json({ error: "Failed to create marketing_design" });
//     }
// });



//4. mengupdate data 
// Titik awal nomor project (kalau kamu mau mulai dari angka tertentu)
// let currentProjectNumberDesign = 35; // misal mau mulai dari P035

// app.post("/api/marketing-design/joined", async (req, res) => {
//     const {
//         buyer_name,
//         code_order,
//         order_number, // tetap dikirim manual dari FE
//         jumlah_design,
//         deadline,
//         jumlah_revisi,
//         price_normal,
//         price_discount,
//         discount_percentage,
//         required_files,
//         file_and_chat,
//         detail_project,
//         input_by,
//         acc_by,
//         account,
//         offer_type,
//         order_type_id,
//         resolution,
//         reference,
//         project_type_id,
//         style_id,
//         status_project_id
//     } = req.body;

//     try {
//         // 🧠 Ambil bulan sekarang
//         const createAt = new Date();
//         const monthStart = dayjs(createAt).startOf("month").toDate();
//         const monthEnd = dayjs(createAt).endOf("month").toDate();
//         const monthName = dayjs(createAt).format("MMMM");

//         // 🧾 Ambil project_number terakhir di bulan ini
//         const lastProjectQuery = await client.query(
//             `
//             SELECT project_number 
//             FROM marketing_design
//             WHERE create_at BETWEEN $1 AND $2
//             ORDER BY marketing_design_id DESC
//             LIMIT 1;
//             `,
//             [monthStart, monthEnd]
//         );

//         let nextProjectNumber;
//         if (lastProjectQuery.rows.length > 0) {
//             // 🔢 Ambil angka terakhir dari format "P035 Oktober"
//             const lastNumberPart = lastProjectQuery.rows[0].project_number.match(/P(\d+)/);
//             const lastNumber = lastNumberPart ? parseInt(lastNumberPart[1]) : currentProjectNumberDesign;
//             nextProjectNumber = lastNumber + 1;
//         } else {
//             // 🔄 Kalau bulan baru, mulai dari angka yang kamu set
//             nextProjectNumber = currentProjectNumberDesign + 1;
//         }

//         // 🎨 Generate nomor otomatis (misal "P036 Oktober")
//         const projectNumber = `P${String(nextProjectNumber).padStart(3, "0")} ${monthName}`;

//         // 💾 Simpan ke DB
//         const result = await client.query(
//             `
//             INSERT INTO marketing_design (
//                 buyer_name,
//                 code_order,
//                 order_number,
//                 jumlah_design,
//                 deadline,
//                 jumlah_revisi,
//                 price_normal,
//                 price_discount,
//                 discount_percentage,
//                 required_files,
//                 file_and_chat,
//                 detail_project,
//                 input_by,
//                 acc_by,
//                 account,
//                 offer_type,
//                 order_type_id,
//                 resolution,
//                 reference,
//                 project_type_id,
//                 style_id,
//                 status_project_id,
//                 project_number,
//                 create_at
//             )
//             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22, NOW())
//             RETURNING *;
//             `,
//             [
//                 buyer_name,
//                 code_order,
//                 order_number, // dikirim dari FE
//                 jumlah_design,
//                 deadline,
//                 jumlah_revisi,
//                 price_normal,
//                 price_discount,
//                 discount_percentage,
//                 required_files,
//                 file_and_chat,
//                 detail_project,
//                 input_by,
//                 acc_by,
//                 account,
//                 offer_type,
//                 order_type_id,
//                 resolution,
//                 reference,
//                 project_type_id,
//                 style_id,
//                 status_project_id,
//                 projectNumber
//             ]
//         );

//         // 🔗 Ambil data lengkap hasil join
//         const joined = await client.query(
//             `
//             SELECT 
//                 md.marketing_design_id,
//                 md.buyer_name,
//                 md.code_order,
//                 md.order_number,
//                 md.jumlah_design,
//                 md.deadline,
//                 md.jumlah_revisi,
//                 md.price_normal,
//                 md.price_discount,
//                 md.discount_percentage,
//                 md.required_files,
//                 md.file_and_chat,
//                 md.detail_project,
//                 md.resolution,
//                 md.reference,
//                 md.project_number,

//                 mdu.id AS input_by,
//                 mdu.nama_marketing AS input_by_name,
//                 mdu.divisi AS input_by_divisi,

//                 kdd.id AS acc_by,
//                 kdd.nama AS acc_by_name,

//                 ad.id AS account,
//                 ad.nama_account AS account_name,

//                 ot.id AS offer_type,
//                 ot.offer_name AS offer_type_name,

//                 pt.id AS project_type,
//                 pt.project_name AS project_type_name,

//                 sd.id AS style,
//                 sd.style_name AS style_name,

//                 sp.id AS status_project,
//                 sp.status_name AS status_project_name,

//                 dot.id AS order_type_id,
//                 dot.order_name AS order_type_name
//             FROM marketing_design md
//             LEFT JOIN marketing_desain_user mdu ON md.input_by = mdu.id
//             LEFT JOIN kepala_divisi_design kdd ON md.acc_by = kdd.id
//             LEFT JOIN account_design ad ON md.account = ad.id
//             LEFT JOIN offer_type_design ot ON md.offer_type = ot.id
//             LEFT JOIN project_type_design pt ON md.project_type_id = pt.id
//             LEFT JOIN style_design sd ON md.style_id = sd.id
//             LEFT JOIN status_project_design sp ON md.status_project_id = sp.id
//             LEFT JOIN design_order_type dot ON md.order_type_id = dot.id
//             WHERE md.marketing_design_id = $1
//             `,
//             [result.rows[0].marketing_design_id]
//         );

//         res.status(201).json({
//             message: "✅ Marketing design created successfully",
//             data: joined.rows[0],
//         });
//     } catch (err) {
//         console.error("❌ Error creating marketing_design:", err);
//         res.status(500).json({ error: "Failed to create marketing_design" });
//     }
// });


app.put('/api/marketing-design/:id', async (req, res) => {
    const { id } = req.params;
    const { input_by, buyer_name, code_order, jumlah_design, order_number, account, deadline, jumlah_revisi, order_type, offer_type, style, resolution, price_normal, price_discount, discount_percentage, required_files, project_type, reference, file_and_chat, detail_project, acc_by, is_accepted } = req.body;
    try {
        const result = await client.query(
            `UPDATE marketing_design SET 
                 input_by = $1, buyer_name = $2, code_order = $3, jumlah_design = $4, order_number = $5, account = $6, deadline = $7, jumlah_revisi = $8, order_type = $9, offer_type = $10, style = $11, resolution = $12, price_normal = $13, price_discount = $14, discount_percentage = $15, required_files = $16, project_type = $17, reference = $18, file_and_chat = $19, detail_project = $20, acc_by = $21, is_accepted = $22, update_at = CURRENT_TIMESTAMP
             WHERE marketing_design_id = $23 RETURNING *`,
            [input_by, buyer_name, code_order, jumlah_design, order_number, account, deadline, jumlah_revisi, order_type, offer_type, style, resolution, price_normal, price_discount, discount_percentage, required_files, project_type, reference, file_and_chat, detail_project, acc_by, is_accepted, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Data not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

// 5. Soft delete marketing design
app.delete('/api/marketing-design/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await client.query(
            'UPDATE marketing_design SET is_deleted = TRUE, deleted_at = NOW() WHERE marketing_design_id = $1 AND is_deleted = FALSE RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Data not found or already deleted' });
        }

        res.json({ message: 'Data soft-deleted successfully', data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Restore soft-deleted marketing design
app.patch('/api/marketing-design/:id/restore', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await client.query(
            'UPDATE marketing_design SET is_deleted = FALSE, deleted_at = NULL WHERE marketing_design_id = $1 AND is_deleted = TRUE RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Data not found or not deleted' });
        }

        res.json({ message: 'Data restored successfully', data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



//6. check card id if null or not
app.get('/api/check-card-id-design/:marketing_design_id', async (req, res) => {
    const { marketing_design_id } = req.params;

    try {
        const query = 'SELECT card_id FROM marketing_design WHERE marketing_design_id = $1';
        const result = await client.query(query, [marketing_design_id]);

        console.log('Query Result:', result.rows[0]); // Debug hasil query di terminal

        if (result.rows.length > 0) {
            const cardId = result.rows[0].card_id;
            return res.status(200).json({ message: 'card_id found', card_id: cardId });
        } else {
            return res.status(404).json({ message: 'No card_id found for this marketing_design_id' });
        }
    } catch (error) {
        console.error('Error checking card_id:', error);
        return res.status(500).json({ message: 'Server Error' });
    }
});

// 7. Mengubah data marketing design menjadi card design (pakai data join)
app.put('/api/create-card-marketing-design/:listId/:marketingDesignId', async (req, res) => {
    const { listId, marketingDesignId } = req.params;

    try {
        // Ambil data marketing_design dengan JOIN supaya relasi kebawa
        const query = `
          SELECT 
            md.*,
            mdu.nama_marketing AS input_by_name,
            mdu.divisi AS input_by_divisi,
            kdd.nama AS acc_by_name,
            kdd.divisi AS acc_by_divisi,
            ad.nama_account AS account_name,
            ot.offer_name AS offer_type_name,
            pt.project_name AS project_type_name,
            sd.style_name,
            sp.status_name AS status_project_name
          FROM marketing_design md
          LEFT JOIN marketing_desain_user mdu ON md.input_by = mdu.id
          LEFT JOIN kepala_divisi_design kdd ON md.acc_by = kdd.id
          LEFT JOIN account_design ad ON md.account = ad.id
          LEFT JOIN offer_type_design ot ON md.offer_type = ot.id
          LEFT JOIN project_type_design pt ON md.project_type_id = pt.id
          LEFT JOIN style_design sd ON md.style_id = sd.id
          LEFT JOIN status_project_design sp ON md.status_project_id = sp.id
          WHERE md.marketing_design_id = $1 AND md.card_id IS NULL
        `;
        const marketingData = await client.query(query, [marketingDesignId]);

        if (marketingData.rows.length === 0) {
            return res.status(404).json({ message: 'Data marketing design tidak ditemukan atau sudah memiliki card_id' });
        }

        const marketing = marketingData.rows[0];

        const deadlineFormatted = marketing.deadline
            ? new Date(marketing.deadline).toLocaleString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
            : '-';

        // Pakai field hasil join
        const description = `
            <div>
                <p><strong>Project Number:</strong> ${marketing.project_number || 'N/A'}</p>
                <p><strong>Code Order:</strong> ${marketing.code_order || 'N/A'}</p>
                <p><strong>Input By:</strong> ${marketing.input_by_name || 'N/A'} (${marketing.input_by_divisi || '-'})</p>
                <p><strong>Buyer:</strong> ${marketing.buyer_name || 'N/A'}</p>
                <p><strong>Order Number:</strong> ${marketing.order_number || 'N/A'}</p>
                <p><strong>Account:</strong> ${marketing.account_name || 'N/A'}</p>
                <p><strong>Design Count:</strong> ${marketing.jumlah_design || '0'}</p>
                <p><strong>Deadline:</strong> ${marketing.deadline ? new Date(marketing.deadline).toISOString().split('T')[0] : 'N/A'}</p>
                <p><strong>Jumlah Revisi:</strong> ${marketing.jumlah_revisi || '0'}</p>
                <p><strong>Offer Type:</strong> ${marketing.offer_type_name || 'N/A'}</p>
                <p><strong>Project Type:</strong> ${marketing.project_type_name || 'N/A'}</p>
                <p><strong>Style:</strong> ${marketing.style_name || 'N/A'}</p>
                <p><strong>Normal Price:</strong> $${marketing.price_normal ?? 'N/A'}</p>
                <p><strong>Discount Price:</strong> $${marketing.price_discount ?? 'N/A'}</p>
                <p><strong>Discount Percentage:</strong> ${marketing.discount_percentage ?? '0'}%</p>
                <p><strong>Required Files:</strong> ${marketing.required_files || 'N/A'}</p>
                <p><strong>File/Chat:</strong> ${marketing.file_and_chat || 'N/A'}</p>
                <p><strong>Detail:</strong> ${marketing.detail_project || 'N/A'}</p>
                <p><strong>Approved By:</strong> ${marketing.acc_by_name || 'N/A'} (${marketing.acc_by_divisi || '-'})</p>
                <p><strong>Status Project:</strong> ${marketing.status_project_name || 'N/A'}</p>
                <p><strong>Reference:</strong> ${marketing.reference || 'N/A'}</p>
                <p><strong>Resolution:</strong> ${marketing.resolution || 'N/A'}</p>
            </div>
        `.trim();


        // Ambil 5 digit terakhir code_order
        const lastFiveDigits = marketing.code_order
            ? marketing.code_order.slice(-5)
            : 'XXXXX'; // default kalau code_order kosong

        // ambil posisi terakhir
        const posResult = await client.query(
            `SELECT COALESCE(MAX(position), -1) + 1 AS next_position
        FROM cards
        WHERE list_id = $1`,
            [listId]
        );


        const nextPosition = posResult.rows[0].next_position;


        // Membuat card baru
        const newCard = await client.query(
            `INSERT INTO cards (list_id, title, description, position, due_date, create_at) 
             VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) 
             RETURNING id`,
            [
                listId,
                `'New Project' - ${marketing.buyer_name || 'Unknown'} - ${marketing.account_name || '-'} - ${marketing.project_type_name || "-"} - ${lastFiveDigits}`,
                // `${marketing.buyer_name} - ${marketing.order_number} (${marketing.account_name})`,
                description,
                nextPosition,
                marketing.deadline
            ]
        );

        // Update card_id di tabel marketing_design
        await client.query(
            'UPDATE marketing_design SET card_id = $1, update_at = CURRENT_TIMESTAMP WHERE marketing_design_id = $2',
            [newCard.rows[0].id, marketingDesignId]
        );

        return res.status(201).json({
            message: '✅ Card berhasil dibuat dari data marketing design.',
            cardId: newCard.rows[0].id
        });
    } catch (error) {
        console.error('❌ Error creating card from marketing design data:', error);
        return res.status(500).json({ message: 'Terjadi kesalahan saat membuat card dari data marketing design.' });
    }
});




//8. get card id by marketing design id
app.get('/api/card-id-design/:marketingDesignId', async (req, res) => {
    const { marketingDesignId } = req.params;
    try {
        const query = `
          SELECT card_id
          FROM public.marketing_design
          WHERE marketing_design_id = $1
        `;
        const result = await client.query(query, [marketingDesignId]);

        if (result.rows.length > 0) {
            const { card_id } = result.rows[0]; // Mengambil card_id dari hasil query
            return res.json({ cardId: card_id });
        } else {
            return res.status(404).json({ error: 'Card not found for the provided marketing_design_id' });
        }
    } catch (error) {
        console.error('Error executing query', error.stack);
        return res.status(500).json({ error: 'Internal server error' });
    }
})

//9. archive data marketing design
app.post('/api/archive-data-marketing-design/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await client.query(`
            INSERT INTO archive (
                entity_type, entity_id, name, description, parent_id, parent_type, create_at, update_at, archived_at
            )
            SELECT 
                'marketing_design',
                md.marketing_design_id,
                md.buyer_name,
                md.detail_project,
                md.card_id,
                'card',
                md.create_at,
                md.update_at,
                NOW()
            FROM marketing_design md
            WHERE md.marketing_design_id = $1
        `, [id]);

        if (result.rowCount > 0) {
            await client.query(`DELETE FROM marketing_design WHERE marketing_design_id = $1`, [id]);
            res.status(200).send(`Marketing design dengan id ${id} berhasil diarsipkan`);
        } else {
            res.status(404).send(`Data marketing design dengan id ${id} tidak ditemukan`);
        }
    } catch (error) {
        console.error(`Error archive data marketing design with id ${id}`, error);
        res.status(500).json({ error: error.message });
    }
});

// ✅ 10. Get data marketing design by accepted (with join)
app.get('/api/marketing-design-accepted', async (req, res) => {
    try {
        const result = await client.query(`
      SELECT 
        dmd.marketing_design_id,
        dmd.buyer_name,
        dmd.code_order,
        dmd.order_number,
        dmd.jumlah_track,
        dmd.duration,
        dmd.jumlah_revisi,
        dmd.deadline,
        dmd.price_normal,
        dmd.price_discount,
        dmd.discount,
        dmd.basic_price,
        dmd.gig_link,
        dmd.reference_link,
        dmd.required_files,
        dmd.file_and_chat_link,
        dmd.detail_project,
        dmd.create_at,
        dmd.update_at,

        mu.id AS input_by,
        mu.nama_marketing AS input_by_name,

        kd.id AS acc_by,
        kd.nama AS acc_by_name,

        ad.id AS account,
        ad.nama_account AS account_name,

        ot.id AS order_type,
        ot.order_name AS order_type_name,

        oft.id AS offer_type,
        oft.offer_name AS offer_type_name,

        tt.id AS jenis_track,
        tt.track_name AS track_type_name,

        g.id AS genre,
        g.genre_name AS genre_name,

        pt.id AS project_type,
        pt.nama_project AS project_type_name,

        k.id AS kupon_diskon_id,
        k.nama_kupon AS kupon_diskon_name,

        s.id AS accept_status_id,
        s.status_name AS accept_status_name

      FROM marketing_design dmd
      LEFT JOIN marketing_design_user mu ON mu.id = dmd.input_by
      LEFT JOIN kepala_divisi_design kd ON kd.id = dmd.acc_by
      LEFT JOIN account_design ad ON ad.id = dmd.account
      LEFT JOIN design_order_type ot ON ot.id = dmd.order_type
      LEFT JOIN offer_type_design oft ON oft.id = dmd.offer_type
      LEFT JOIN track_types_design tt ON tt.id = dmd.jenis_track
      LEFT JOIN genre_design g ON g.id = dmd.genre
      LEFT JOIN project_type_design pt ON pt.id = dmd.project_type
      LEFT JOIN kupon_diskon k ON k.id = dmd.kupon_diskon_id
      LEFT JOIN accept_status s ON s.id = dmd.accept_status_id
      WHERE dmd.is_accepted = true
      ORDER BY dmd.marketing_design_id DESC;
    `);

        res.json(result.rows);
    } catch (err) {
        console.error("❌ Error fetching accepted design data:", err);
        res.status(500).json({ error: err.message });
    }
});


//11. get data marketing by data not accepted
// ✅ 11. Get data marketing design by not accepted (with join)
app.get('/api/marketing-design-not-accepted', async (req, res) => {
    try {
        const result = await client.query(`
      SELECT 
        dmd.marketing_design_id,
        dmd.buyer_name,
        dmd.code_order,
        dmd.order_number,
        dmd.jumlah_track,
        dmd.duration,
        dmd.jumlah_revisi,
        dmd.deadline,
        dmd.price_normal,
        dmd.price_discount,
        dmd.discount,
        dmd.basic_price,
        dmd.gig_link,
        dmd.reference_link,
        dmd.required_files,
        dmd.file_and_chat_link,
        dmd.detail_project,
        dmd.create_at,
        dmd.update_at,

        mu.id AS input_by,
        mu.nama_marketing AS input_by_name,

        kd.id AS acc_by,
        kd.nama AS acc_by_name,

        ad.id AS account,
        ad.nama_account AS account_name,

        ot.id AS order_type,
        ot.order_name AS order_type_name,

        oft.id AS offer_type,
        oft.offer_name AS offer_type_name,

        tt.id AS jenis_track,
        tt.track_name AS track_type_name,

        g.id AS genre,
        g.genre_name AS genre_name,

        pt.id AS project_type,
        pt.nama_project AS project_type_name,

        k.id AS kupon_diskon_id,
        k.nama_kupon AS kupon_diskon_name,

        s.id AS accept_status_id,
        s.status_name AS accept_status_name

      FROM marketing_design dmd
      LEFT JOIN marketing_design_user mu ON mu.id = dmd.input_by
      LEFT JOIN kepala_divisi_design kd ON kd.id = dmd.acc_by
      LEFT JOIN account_design ad ON ad.id = dmd.account
      LEFT JOIN design_order_type ot ON ot.id = dmd.order_type
      LEFT JOIN offer_type_design oft ON oft.id = dmd.offer_type
      LEFT JOIN track_types_design tt ON tt.id = dmd.jenis_track
      LEFT JOIN genre_design g ON g.id = dmd.genre
      LEFT JOIN project_type_design pt ON pt.id = dmd.project_type
      LEFT JOIN kupon_diskon k ON k.id = dmd.kupon_diskon_id
      LEFT JOIN accept_status s ON s.id = dmd.accept_status_id
      WHERE dmd.is_accepted = false
      ORDER BY dmd.marketing_design_id DESC;
    `);

        res.json(result.rows);
    } catch (err) {
        console.error("❌ Error fetching not accepted design data:", err);
        res.status(500).json({ error: err.message });
    }
});

// ✅ Get marketing_design by status_name (dinamis)
app.get('/api/marketing-designs/status/:statusName', async (req, res) => {
    try {
        const { statusName } = req.params;

        const result = await client.query(`
      SELECT 
        dmd.marketing_design_id,
        dmd.buyer_name,
        dmd.code_order,
        dmd.order_number,
        dmd.jumlah_track,
        dmd.duration,
        dmd.jumlah_revisi,
        dmd.deadline,
        dmd.price_normal,
        dmd.price_discount,
        dmd.discount,
        dmd.basic_price,
        dmd.gig_link,
        dmd.reference_link,
        dmd.required_files,
        dmd.file_and_chat_link,
        dmd.detail_project,
        dmd.create_at,
        dmd.update_at,

        mu.id AS input_by,
        mu.nama_marketing AS input_by_name,

        kd.id AS acc_by,
        kd.nama AS acc_by_name,

        ad.id AS account,
        ad.nama_account AS account_name,

        ot.id AS order_type,
        ot.order_name AS order_type_name,

        oft.id AS offer_type,
        oft.offer_name AS offer_type_name,

        tt.id AS jenis_track,
        tt.track_name AS track_type_name,

        g.id AS genre,
        g.genre_name AS genre_name,

        pt.id AS project_type,
        pt.nama_project AS project_type_name,

        k.id AS kupon_diskon_id,
        k.nama_kupon AS kupon_diskon_name,

        s.id AS accept_status_id,
        s.status_name AS accept_status_name

      FROM marketing_design dmd
      LEFT JOIN marketing_design_user mu ON mu.id = dmd.input_by
      LEFT JOIN kepala_divisi_design kd ON kd.id = dmd.acc_by
      LEFT JOIN account_design ad ON ad.id = dmd.account
      LEFT JOIN design_order_type ot ON ot.id = dmd.order_type
      LEFT JOIN offer_type_design oft ON oft.id = dmd.offer_type
      LEFT JOIN track_types_design tt ON tt.id = dmd.jenis_track
      LEFT JOIN genre_design g ON g.id = dmd.genre
      LEFT JOIN project_type_design pt ON pt.id = dmd.project_type
      LEFT JOIN kupon_diskon k ON k.id = dmd.kupon_diskon_id
      LEFT JOIN accept_status s ON s.id = dmd.accept_status_id
      WHERE s.status_name = $1
      ORDER BY dmd.marketing_design_id DESC;
    `, [statusName]);

        res.json(result.rows);
    } catch (err) {
        console.error("❌ Error fetching marketing design by status:", err);
        res.status(500).json({ error: err.message });
    }
});



// MARKETING DESIGN JOIN TABLE 
// 1. USER MAREKTING DESIGN 

// ✅ GET all users
app.get("/api/marketing-desain-users", async (req, res) => {
    try {
        const result = await client.query(
            "SELECT * FROM marketing_desain_user ORDER BY id ASC"
        );
        res.json(result.rows);
    } catch (err) {
        console.error("❌ Error get marketing_desain_user:", err);
        res.status(500).json({ error: err.message });
    }
});

// ✅ GET user by id
app.get("/api/marketing-desain-users/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await client.query(
            "SELECT * FROM marketing_desain_user WHERE id = $1",
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error get marketing_desain_user by id:", err);
        res.status(500).json({ error: err.message });
    }
});

// ✅ CREATE new user
app.post("/api/marketing-desain-users", async (req, res) => {
    const { nama_marketing, divisi } = req.body;
    try {
        const result = await client.query(
            `INSERT INTO marketing_desain_user (nama_marketing, divisi) 
       VALUES ($1, $2) RETURNING *`,
            [nama_marketing, divisi]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error create marketing_desain_user:", err);
        res.status(500).json({ error: err.message });
    }
});

// ✅ UPDATE user
app.put("/api/marketing-desain-users/:id", async (req, res) => {
    const { id } = req.params;
    const { nama_marketing, divisi } = req.body;
    try {
        const result = await client.query(
            `UPDATE marketing_desain_user
       SET nama_marketing = $1,
           divisi = $2,
           update_at = now()
       WHERE id = $3
       RETURNING *`,
            [nama_marketing, divisi, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error update marketing_desain_user:", err);
        res.status(500).json({ error: err.message });
    }
});

// ✅ DELETE user
app.delete("/api/marketing-desain-users/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await client.query(
            "DELETE FROM marketing_desain_user WHERE id = $1 RETURNING *",
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        console.error("❌ Error delete marketing_desain_user:", err);
        res.status(500).json({ error: err.message });
    }
});


// ACCOUNT DESIGN 
// ✅ Get all accounts
app.get("/api/account-design", async (req, res) => {
    try {
        const result = await client.query("SELECT * FROM account_design ORDER BY id ASC");
        res.json(result.rows);
    } catch (err) {
        console.error("❌ Error get account_design:", err);
        res.status(500).json({ error: err.message });
    }
});

// ✅ Get account by ID
app.get("/api/account-design/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await client.query("SELECT * FROM account_design WHERE id = $1", [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: "Account not found" });
        res.json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error get account_design by id:", err);
        res.status(500).json({ error: err.message });
    }
});

// ✅ Create new account
app.post("/api/account-design", async (req, res) => {
    const { nama_account } = req.body;
    try {
        const result = await client.query(
            "INSERT INTO account_design (nama_account) VALUES ($1) RETURNING *",
            [nama_account]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error create account_design:", err);
        res.status(500).json({ error: err.message });
    }
});

// ✅ Update account
app.put("/api/account-design/:id", async (req, res) => {
    const { id } = req.params;
    const { nama_account } = req.body;
    try {
        const result = await client.query(
            "UPDATE account_design SET nama_account=$1, update_at=now() WHERE id=$2 RETURNING *",
            [nama_account, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: "Account not found" });
        res.json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error update account_design:", err);
        res.status(500).json({ error: err.message });
    }
});

// ✅ Delete account
app.delete("/api/account-design/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await client.query("DELETE FROM account_design WHERE id=$1 RETURNING *", [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: "Account not found" });
        res.json({ message: "Account deleted successfully" });
    } catch (err) {
        console.error("❌ Error delete account_design:", err);
        res.status(500).json({ error: err.message });
    }
});


// ==========================================
// 📌 CRUD OFFER TYPE DESIGN
// ==========================================

// ✅ Get semua offer_type_design
app.get("/api/offer-type-design", async (req, res) => {
    try {
        const result = await client.query("SELECT * FROM offer_type_design ORDER BY id ASC");
        res.json(result.rows);
    } catch (err) {
        console.error("❌ Error get offer_type_design:", err);
        res.status(500).json({ error: err.message });
    }
});

// ✅ Get by ID
app.get("/api/offer-type-design/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await client.query("SELECT * FROM offer_type_design WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Offer type not found" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error get offer_type_design by ID:", err);
        res.status(500).json({ error: err.message });
    }
});

// ✅ Create
app.post("/api/offer-type-design", async (req, res) => {
    try {
        const { offer_name } = req.body;
        const result = await client.query(
            "INSERT INTO offer_type_design (offer_name) VALUES ($1) RETURNING *",
            [offer_name]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error create offer_type_design:", err);
        res.status(500).json({ error: err.message });
    }
});

// ✅ Update
app.put("/api/offer-type-design/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { offer_name } = req.body;
        const result = await client.query(
            "UPDATE offer_type_design SET offer_name = $1, update_at = now() WHERE id = $2 RETURNING *",
            [offer_name, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Offer type not found" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error update offer_type_design:", err);
        res.status(500).json({ error: err.message });
    }
});

// ✅ Delete
app.delete("/api/offer-type-design/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await client.query("DELETE FROM offer_type_design WHERE id = $1 RETURNING *", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Offer type not found" });
        }
        res.json({ message: "Offer type deleted successfully" });
    } catch (err) {
        console.error("❌ Error delete offer_type_design:", err);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 📌 CRUD PROJECT TYPE DESIGN
// ==========================================

// ✅ Get all
app.get("/api/project-type-design", async (req, res) => {
    try {
        const result = await client.query("SELECT * FROM project_type_design ORDER BY id ASC");
        res.json(result.rows);
    } catch (err) {
        console.error("❌ Error get project_type_design:", err);
        res.status(500).json({ error: err.message });
    }
});

// ✅ Get by ID
app.get("/api/project-type-design/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await client.query("SELECT * FROM project_type_design WHERE id = $1", [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: "Project type not found" });
        res.json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error get project_type_design by ID:", err);
        res.status(500).json({ error: err.message });
    }
});

// ✅ Create
app.post("/api/project-type-design", async (req, res) => {
    try {
        const { project_name } = req.body;
        const result = await client.query(
            "INSERT INTO project_type_design (project_name) VALUES ($1) RETURNING *",
            [project_name]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error create project_type_design:", err);
        res.status(500).json({ error: err.message });
    }
});

// ✅ Update
app.put("/api/project-type-design/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { project_name } = req.body;
        const result = await client.query(
            "UPDATE project_type_design SET project_name = $1, update_at = now() WHERE id = $2 RETURNING *",
            [project_name, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: "Project type not found" });
        res.json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error update project_type_design:", err);
        res.status(500).json({ error: err.message });
    }
});

// ✅ Delete
app.delete("/api/project-type-design/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await client.query("DELETE FROM project_type_design WHERE id = $1 RETURNING *", [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: "Project type not found" });
        res.json({ message: "Project type deleted successfully" });
    } catch (err) {
        console.error("❌ Error delete project_type_design:", err);
        res.status(500).json({ error: err.message });
    }
});


// ==========================================
// 📌 CRUD STYLE DESIGN
// ==========================================

// ✅ Get all
app.get("/api/style-design", async (req, res) => {
    try {
        const result = await client.query("SELECT * FROM style_design ORDER BY id ASC");
        res.json(result.rows);
    } catch (err) {
        console.error("❌ Error get style_design:", err);
        res.status(500).json({ error: err.message });
    }
});

// ✅ Get by ID
app.get("/api/style-design/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await client.query("SELECT * FROM style_design WHERE id = $1", [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: "Style not found" });
        res.json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error get style_design by ID:", err);
        res.status(500).json({ error: err.message });
    }
});

// ✅ Create
app.post("/api/style-design", async (req, res) => {
    const { style_name } = req.body;
    try {
        const result = await client.query(
            "INSERT INTO style_design (style_name) VALUES ($1) RETURNING *",
            [style_name]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error create style_design:", err);
        res.status(500).json({ error: err.message });
    }
});

// ✅ Update
app.put("/api/style-design/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { style_name } = req.body;
        const result = await client.query(
            "UPDATE style_design SET style_name = $1, update_at = now() WHERE id = $2 RETURNING *",
            [style_name, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: "Style not found" });
        res.json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error update style_design:", err);
        res.status(500).json({ error: err.message });
    }
});

// ✅ Delete
app.delete("/api/style-design/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await client.query("DELETE FROM style_design WHERE id = $1 RETURNING *", [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: "Style not found" });
        res.json({ message: "Style deleted successfully" });
    } catch (err) {
        console.error("❌ Error delete style_design:", err);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 📌 CRUD STATUS PROJECT DESIGN
// ==========================================

// ✅ Get all
app.get("/api/status-project-design", async (req, res) => {
    try {
        const result = await client.query("SELECT * FROM status_project_design ORDER BY id ASC");
        res.json(result.rows);
    } catch (err) {
        console.error("❌ Error get status_project_design:", err);
        res.status(500).json({ error: err.message });
    }
});

// ✅ Get by ID
app.get("/api/status-project-design/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await client.query("SELECT * FROM status_project_design WHERE id = $1", [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: "Status not found" });
        res.json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error get status_project_design by ID:", err);
        res.status(500).json({ error: err.message });
    }
});

// ✅ Create
app.post("/api/status-project-design", async (req, res) => {
    const { status_name } = req.body;
    try {
        const result = await client.query(
            "INSERT INTO status_project_design (status_name) VALUES ($1) RETURNING *",
            [status_name]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error create status_project_design:", err);
        res.status(500).json({ error: err.message });
    }
});

// ✅ Update
app.put("/api/status-project-design/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { status_name } = req.body;
        const result = await client.query(
            "UPDATE status_project_design SET status_name = $1, update_at = now() WHERE id = $2 RETURNING *",
            [status_name, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: "Status not found" });
        res.json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error update status_project_design:", err);
        res.status(500).json({ error: err.message });
    }
});

// ✅ Delete
app.delete("/api/status-project-design/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await client.query("DELETE FROM status_project_design WHERE id = $1 RETURNING *", [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: "Status not found" });
        res.json({ message: "Status deleted successfully" });
    } catch (err) {
        console.error("❌ Error delete status_project_design:", err);
        res.status(500).json({ error: err.message });
    }
});

// ===============================
// ✅ CRUD Kepala Divisi Design
// ===============================

// Get all kepala_divisi_design
app.get("/api/kepala-divisi-design", async (req, res) => {
    try {
        const result = await client.query("SELECT * FROM kepala_divisi_design ORDER BY id ASC");
        res.json(result.rows);
    } catch (err) {
        console.error("❌ Error get kepala_divisi_design:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// Get kepala_divisi_design by ID
app.get("/api/kepala-divisi-design/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await client.query("SELECT * FROM kepala_divisi_design WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Kepala divisi design not found" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error get kepala_divisi_design by ID:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// Add kepala_divisi_design
app.post("/api/kepala-divisi-design", async (req, res) => {
    const { nama, divisi } = req.body;
    try {
        const result = await client.query(
            "INSERT INTO kepala_divisi_design (nama, divisi) VALUES ($1, $2) RETURNING *",
            [nama, divisi]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error add kepala_divisi_design:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// Update kepala_divisi_design
app.put("/api/kepala-divisi-design/:id", async (req, res) => {
    const { id } = req.params;
    const { nama, divisi } = req.body;
    try {
        const result = await client.query(
            `UPDATE kepala_divisi_design 
       SET nama = $1, divisi = $2, update_at = NOW() 
       WHERE id = $3 RETURNING *`,
            [nama, divisi, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Kepala divisi design not found" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error update kepala_divisi_design:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// Delete kepala_divisi_design
app.delete("/api/kepala-divisi-design/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await client.query("DELETE FROM kepala_divisi_design WHERE id = $1 RETURNING *", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Kepala divisi design not found" });
        }
        res.json({ message: "✅ Deleted successfully" });
    } catch (err) {
        console.error("❌ Error delete kepala_divisi_design:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// =======================
// DESIGN ORDER TYPE
// =======================

// ✅ Get all
app.get("/api/design-order-type", async (req, res) => {
    try {
        const result = await client.query("SELECT * FROM design_order_type ORDER BY id ASC");
        res.json(result.rows);
    } catch (err) {
        console.error("❌ Error fetching design_order_type:", err);
        res.status(500).json({ error: err.message });
    }
});

// ✅ Get by ID
app.get("/api/design-order-type/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await client.query("SELECT * FROM design_order_type WHERE id = $1", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Design order type not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error fetching design_order_type by ID:", err);
        res.status(500).json({ error: err.message });
    }
});

// ✅ Create new
app.post("/api/design-order-type", async (req, res) => {
    try {
        const { order_name } = req.body;

        const result = await client.query(
            "INSERT INTO design_order_type (order_name) VALUES ($1) RETURNING *",
            [order_name]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error creating design_order_type:", err);
        res.status(500).json({ error: err.message });
    }
});

// ✅ Update
app.put("/api/design-order-type/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { order_name } = req.body;

        const result = await client.query(
            "UPDATE design_order_type SET order_name = $1, created_at = now() WHERE id = $2 RETURNING *",
            [order_name, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Design order type not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error updating design_order_type:", err);
        res.status(500).json({ error: err.message });
    }
});

// ✅ Delete
app.delete("/api/design-order-type/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await client.query("DELETE FROM design_order_type WHERE id = $1 RETURNING *", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Design order type not found" });
        }

        res.json({ message: "Design order type deleted successfully" });
    } catch (err) {
        console.error("❌ Error deleting design_order_type:", err);
        res.status(500).json({ error: err.message });
    }
});







//ENDPOIN UNTUK MENDAPATKAN WORKSPACE ID DAN BOARD ID BERDASARKAN LIST ID DAN CARD ID
app.post('/api/get-workspaceid-boardid', async (req, res) => {
    const { listId, cardId } = req.body; // menggunakan req.body
    try {
        const query = `
        SELECT b.workspace_id, l.board_id
        FROM public.cards c
        JOIN public.lists l ON c.list_id = l.id
        JOIN public.boards b ON l.board_id = b.id
        WHERE c.id = $1
      `;
        const result = await client.query(query, [cardId]);

        if (result.rows.length > 0) {
            const { workspace_id, board_id } = result.rows[0];
            return res.json({ workspaceId: workspace_id, boardId: board_id });
        } else {
            return res.status(404).json({ error: 'Card not found' });
        }
    } catch (error) {
        console.error('Error executing query', error.stack);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

//ENDPOIN UNTUK MENAMPILKAN DATA MARKETING UNTUK CARD ID YANG TIDAK NULL
// ✅ Get marketing_design (card_id NOT NULL) + join relasi (safe null handling)
app.get('/api/marketing-designs/not-null', async (req, res) => {
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
        md.card_id,
        md.create_at,
        md.update_at,
        md.resolution,
        md.project_number,

        -- Relasi (ID + Name) | NULLIF biar ga keluar string "null"
        NULLIF(mdu.id::text, '')::int      AS input_by,
        mdu.nama_marketing                 AS input_by_name,

        NULLIF(kdd.id::text, '')::int      AS acc_by,
        kdd.nama                           AS acc_by_name,

        NULLIF(ad.id::text, '')::int       AS account,
        ad.nama_account                    AS account_name,

        NULLIF(ot.id::text, '')::int       AS offer_type,
        ot.offer_name                      AS offer_type_name,

        NULLIF(pt.id::text, '')::int       AS project_type,
        pt.project_name                    AS project_type_name,

        NULLIF(sd.id::text, '')::int       AS style,
        sd.style_name                      AS style_name,

        NULLIF(sp.id::text, '')::int       AS status_project,
        sp.status_name                     AS status_project_name,

        -- ✅ Relasi ke Design Order Type
        NULLIF(dot.id::text, '')::int      AS order_type_id,
        dot.order_name                     AS order_type_name

      FROM marketing_design md
      LEFT JOIN marketing_desain_user mdu ON md.input_by = mdu.id
      LEFT JOIN kepala_divisi_design kdd ON md.acc_by = kdd.id
      LEFT JOIN account_design ad ON md.account = ad.id
      LEFT JOIN offer_type_design ot ON md.offer_type = ot.id
      LEFT JOIN project_type_design pt ON md.project_type_id = pt.id
      LEFT JOIN style_design sd ON md.style_id = sd.id
      LEFT JOIN status_project_design sp ON md.status_project_id = sp.id
      LEFT JOIN design_order_type dot ON md.order_type_id = dot.id
      WHERE md.card_id IS NOT NULL
      ORDER BY md.marketing_design_id DESC;
    `);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching marketing designs:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});




//ENDPOIN UNTUK MENAMPILKAN DATA MARKETING UNTUK CARD ID NULL
// ✅ Get marketing_design (card_id IS NULL) + join relasi (safe null handling)
app.get('/api/marketing-designs/null', async (req, res) => {
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
        md.card_id,
        md.create_at,
        md.update_at,
        md.resolution,
        md.project_number,

        -- Relasi (ID + Name) | NULLIF biar ga keluar string "null"
        NULLIF(mdu.id::text, '')::int      AS input_by,
        mdu.nama_marketing                 AS input_by_name,

        NULLIF(kdd.id::text, '')::int      AS acc_by,
        kdd.nama                           AS acc_by_name,

        NULLIF(ad.id::text, '')::int       AS account,
        ad.nama_account                    AS account_name,

        NULLIF(ot.id::text, '')::int       AS offer_type,
        ot.offer_name                      AS offer_type_name,

        NULLIF(pt.id::text, '')::int       AS project_type,
        pt.project_name                    AS project_type_name,

        NULLIF(sd.id::text, '')::int       AS style,
        sd.style_name                      AS style_name,

        NULLIF(sp.id::text, '')::int       AS status_project,
        sp.status_name                     AS status_project_name,

        -- ✅ Relasi ke Design Order Type
        NULLIF(dot.id::text, '')::int      AS order_type_id,
        dot.order_name                     AS order_type_name

      FROM marketing_design md
      LEFT JOIN marketing_desain_user mdu ON md.input_by = mdu.id
      LEFT JOIN kepala_divisi_design kdd ON md.acc_by = kdd.id
      LEFT JOIN account_design ad ON md.account = ad.id
      LEFT JOIN offer_type_design ot ON md.offer_type = ot.id
      LEFT JOIN project_type_design pt ON md.project_type_id = pt.id
      LEFT JOIN style_design sd ON md.style_id = sd.id
      LEFT JOIN status_project_design sp ON md.status_project_id = sp.id
      LEFT JOIN design_order_type dot ON md.order_type_id = dot.id
      WHERE md.card_id IS NULL
      ORDER BY md.marketing_design_id DESC;
    `);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching marketing designs (card_id NULL):', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



//ARCHIVE UNIVERSAL
//1. get all data archive
app.get('/api/archive-data', async (req, res) => {
    try {
        const result = await client.query(`SELECT * FROM archive_universal ORDER BY archived_at DESC`);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching archive:', error);
        res.status(500).json({ error: error.message });
    }
});
//2. archive data berdasarkan entity
app.post('/api/archive/:entity/:id', async (req, res) => {
    const { entity, id } = req.params;
    const userId = req.user.id;

    const entityMap = {
        workspaces_user: { table: 'workspaces_users', idField: 'workspace_id' },
        workspaces: { table: 'workspaces', idField: 'id' },
        boards: { table: 'boards', idField: 'id' },
        lists: { table: 'lists', idField: 'id' },
        cards: { table: 'cards', idField: 'id' },
        data_marketing: { table: 'data_marketing', idField: 'marketing_id' },
        marketing_design: { table: 'marketing_design', idField: 'marketing_design_id' }
        // tambahkan entitas lainnya jika perlu
    };

    const config = entityMap[entity];
    if (!config) return res.status(400).json({ error: 'Entity tidak dikenali' });

    try {
        const { table, idField } = config;

        // 1. Ambil data dari tabel asli
        const result = await client.query(
            `SELECT * FROM ${table} WHERE ${idField} = $1`, [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: `Data ${entity} dengan ID ${id} tidak ditemukan` });
        }

        const data = result.rows[0];

        // 2. Masukkan ke archive_universal
        await client.query(`
        INSERT INTO archive_universal (entity_type, entity_id, data, user_id)
        VALUES ($1, $2, $3, $4)
        `, [entity, id, data, userId]); // <-- pastikan req.user.id diset


        // 3. Hapus dari tabel aslinya
        await client.query(
            `DELETE FROM ${table} WHERE ${idField} = $1`, [id]
        );

        res.status(200).json({ message: `Data ${entity} ID ${id} berhasil diarsipkan` });
    } catch (err) {
        console.error('Archive error:', err);
        res.status(500).json({ error: err.message });
    }
});

//3. delete data archive by id
app.delete('/api/archive-data/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await client.query(`DELETE FROM archive_universal WHERE id = $1`, [id]);
        if (result.rowCount > 0) {
            res.status(200).json({ message: `Archive with id ${id} deleted` });
        } else {
            res.status(404).json({ error: `Archive with id ${id} not found` });
        }
    } catch (error) {
        console.error('Error deleting archive:', error);
        res.status(500).json({ error: error.message });
    }
});

//4. restore data archive 
app.post('/api/restore/:entity/:id', async (req, res) => {
    const { entity, id } = req.params;

    const entityMap = {
        workspaces_users: { table: 'workspaces_users' },
        workspaces: { table: 'workspaces' },
        boards: { table: 'boards' },
        lists: { table: 'lists' },
        cards: { table: 'cards' },
        data_marketing: { table: 'data_marketing' },
        marketing_design: { table: 'marketing_design' }
        // tambah sesuai entity kamu
    };

    const config = entityMap[entity];
    if (!config) return res.status(400).json({ error: 'Entity tidak dikenali' });

    try {
        // 1. Ambil data dari archive_universal
        const archiveResult = await client.query(
            `SELECT data FROM archive_universal WHERE entity_type = $1 AND entity_id = $2`,
            [entity, id]
        );

        if (archiveResult.rows.length === 0) {
            return res.status(404).json({ error: `Data ${entity} dengan id ${id} tidak ditemukan di archive` });
        }

        const data = archiveResult.rows[0].data;
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

        // 2. Insert kembali ke tabel aslinya
        const insertQuery = `
      INSERT INTO ${config.table} (${keys.join(', ')})
      VALUES (${placeholders})
    `;
        await client.query(insertQuery, values);

        // 3. Hapus dari archive_universal
        await client.query(
            `DELETE FROM archive_universal WHERE entity_type = $1 AND entity_id = $2`,
            [entity, id]
        );

        res.status(200).json({ message: `Data ${entity} berhasil direstore.` });
    } catch (err) {
        console.error('Restore error:', err);
        res.status(500).json({ error: err.message });
    }
});

//END ARCHIVE UNIVERSAL



// ARCHIVE DATA 
//1. get all workspace archive
app.get('/api/archive-workspace', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM archive WHERE entity_type = $1', ['workspace']);

        if (result.rows.length > 0) {
            res.status(200).json(result.rows);
        } else {
            res.status(404).send('Tidak ada data workspace yang ditemukan');
        }
    } catch (error) {
        console.error('Error executing query:', error.stack);
        res.status(500).send('Server error saat mengambil data dari database!')
    }
})

// archive workspace user
app.get('/api/archive-workspace-user', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM archive WHERE entity_type = $1', ['workspace_user']);

        if (result.rows.length > 0) {
            res.status(200).json(result.rows);
        } else {
            res.status(404).send('Tidak ada data workspace user yang ditemukan');
        }
    } catch (error) {
        console.error('Error fetching data archive workspace user:', error.stack)
        res.status(500).send({ message: 'Server error saat mengambil data dari database' });
    }
})

//2. get all boards archive
app.get('/api/archive-board', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM archive WHERE entity_type = $1', ['board']);

        if (result.rows.length > 0) {
            res.status(200).json(result.rows);
        } else {
            res.status(404).send('Tidak ada data board yang ditemukan');
        }
    } catch (error) {
        console.error('Error executing query:', error.stack);
        res.status(500).send('Server error saat mengambil data dari database!')
    }
})
//3. get all list archive
app.get('/api/archive-list', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM archive WHERE entity_type = $1', ['list']);

        if (result.rows.length > 0) {
            res.status(200).json(result.rows);
        } else {
            res.status(404).send('Tidak ada data list yang ditemukan');
        }
    } catch (error) {
        console.error('Error executing query:', error.stack);
        res.status(500).send('Server error saat mengambil data dari database!')
    }
})
//4. get all card archive
app.get('/api/archive-card', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM archive WHERE entity_type = $1', ['card']);

        if (result.rows.length > 0) {
            res.status(200).json(result.rows);
        } else {
            res.status(404).send('Tidak ada data card yang ditemukan');
        }
    } catch (error) {
        console.error('Error executing query:', error.stack);
        res.status(500).send('Server error saat mengambil data dari database!')
    }
})
//5. get all marketing data archive
app.get('/api/archive-marketing', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM archive WHERE entity_type = $1', ['marketing']);

        if (result.rows.length > 0) {
            res.status(200).json(result.rows);
        } else {
            res.status(404).send('Tidak ada data marketing yang ditemukan');
        }
    } catch (error) {
        console.error('Error executing query:', error.stack);
        res.status(500).send('Server error saat mengambil data dari database!')
    }
})
//6. get all marketing design data archive
app.get('/api/archive-marketing-design', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM archive WHERE entity_type = $1', ['marketing_design']);

        if (result.rows.length > 0) {
            res.status(200).json(result.rows);
        } else {
            res.status(404).send('Tidak ada data marketing design yang ditemukan');
        }
    } catch (error) {
        console.error('Error executing query:', error.stack);
        res.status(500).send('Server error saat mengambil data dari database!')
    }
})

//TABEL WORKSPACE SUMMARY
// app.get('/api/workspaces/:userId/summary', async (req, res) => {
//     const { userId } = req.params;

//     const query = `
//       SELECT 
//         w.id AS workspace_id,
//         w.name AS workspace_name,
//         COUNT(DISTINCT b.id) AS board_count,
//         COUNT(DISTINCT l.id) AS list_count,
//         COUNT(c.id) AS card_count
//       FROM workspaces_users wu
//       JOIN workspaces w ON wu.workspace_id = w.id
//       LEFT JOIN boards b ON b.workspace_id = w.id
//       LEFT JOIN lists l ON l.board_id = b.id
//       LEFT JOIN cards c ON c.list_id = l.id
//       WHERE wu.user_id = $1
//       GROUP BY w.id
//       ORDER BY w.name
//     `;

//     try {
//         const result = await client.query(query, [userId]);
//         if (result.rows.length === 0) {
//             return res.status(404).json({ message: 'No workspace summary found for this user' });
//         }
//         res.json(result.rows);
//     } catch (err) {
//         console.error('Error fetching workspace summary:', err);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

app.get('/api/workspaces/:userId/summary', async (req, res) => {
    const { userId } = req.params;

    const query = `
      SELECT 
        w.id AS workspace_id,
        w.name AS workspace_name,
        COUNT(DISTINCT b.id) AS board_count,
        COUNT(DISTINCT l.id) AS list_count,
        COUNT(c.id) AS card_count
      FROM workspaces_users wu
      JOIN workspaces w ON wu.workspace_id = w.id
      LEFT JOIN boards b ON b.workspace_id = w.id
      LEFT JOIN lists l ON l.board_id = b.id
      LEFT JOIN cards c ON c.list_id = l.id
      WHERE wu.user_id = $1
        AND wu.is_deleted = FALSE   -- pastikan user aktif di workspace
        AND w.is_deleted = FALSE    -- pastikan workspace belum dihapus
      GROUP BY w.id
      ORDER BY w.name
    `;

    try {
        const result = await client.query(query, [userId]);
        if (result.rows.length === 0) {
            return res.status(200).json([]); // kirim array kosong, bukan 404
        }
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching workspace summary:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


//get summary form a workspace 
// app.get('/api/workspaces/:userId/summary/:workspaceId', async (req, res) => {
//     const { userId, workspaceId } = req.params;

//     const query = `
//     SELECT 
//       w.id AS workspace_id,
//       w.name AS workspace_name,
//       COUNT(DISTINCT b.id) AS board_count,
//       COUNT(DISTINCT l.id) AS list_count,
//       COUNT(c.id) AS card_count
//     FROM workspaces_users wu
//     JOIN workspaces w ON wu.workspace_id = w.id
//     LEFT JOIN boards b ON b.workspace_id = w.id
//     LEFT JOIN lists l ON l.board_id = b.id
//     LEFT JOIN cards c ON c.list_id = l.id
//     WHERE wu.user_id = $1 AND w.id = $2
//     GROUP BY w.id
//     ORDER BY w.name
//   `;

//     try {
//         const result = await client.query(query, [userId, workspaceId]);

//         if (result.rows.length === 0) {
//             return res.status(404).json({ message: 'Workspace summary not found for this user' });
//         }

//         res.json(result.rows[0]); // hanya satu workspace
//     } catch (err) {
//         console.error('Error fetching workspace summary by ID:', err);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// Get summary for a specific workspace
app.get('/api/workspaces/:userId/summary/:workspaceId', async (req, res) => {
    const { userId, workspaceId } = req.params;

    const query = `
      SELECT 
        w.id AS workspace_id,
        w.name AS workspace_name,
        COUNT(DISTINCT b.id) AS board_count,
        COUNT(DISTINCT l.id) AS list_count,
        COUNT(c.id) AS card_count
      FROM workspaces_users wu
      JOIN workspaces w ON wu.workspace_id = w.id
      LEFT JOIN boards b ON b.workspace_id = w.id AND b.is_deleted = FALSE
      LEFT JOIN lists l ON l.board_id = b.id AND l.is_deleted = FALSE
      LEFT JOIN cards c ON c.list_id = l.id AND c.is_deleted = FALSE
      WHERE wu.user_id = $1
        AND w.id = $2
        AND wu.is_deleted = FALSE
        AND w.is_deleted = FALSE
      GROUP BY w.id
    `;

    try {
        const result = await client.query(query, [userId, workspaceId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Workspace summary not found for this user' });
        }

        res.json(result.rows[0]); // hanya satu workspace
    } catch (err) {
        console.error('Error fetching workspace summary by ID:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


//PERSONAL NOTE
//1. get all note
app.get('/api/all-note', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM personal_notes ORDER BY id DESC');
        res.json(result.rows)
    } catch (error) {
        res.status(500).json({ error: 'Gagal mengambil data semua personal note' });
    }
})

// 2.  Get all notes for a specific user
app.get('/api/personal-note/user/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await client.query(
            'SELECT * FROM personal_notes WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Get a single note by ID (only if owned by user)
app.get('/api/personal-note/:id/user/:userId', async (req, res) => {
    const { id, userId } = req.params;
    try {
        const result = await client.query(
            'SELECT * FROM personal_notes WHERE id = $1 AND user_id = $2',
            [id, userId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Note not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Create a new note
app.post('/api/personal-note', async (req, res) => {
    const { name, isi_note, user_id, agenda_id } = req.body;
    try {
        const result = await client.query(
            `INSERT INTO personal_notes (name, isi_note, user_id, agenda_id) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
            [name, isi_note, user_id, agenda_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Update a note (only if owned by user)
app.put('/api/personal-note/:id/user/:userId', async (req, res) => {
    const { id, userId } = req.params;
    const { name, isi_note, agenda_id } = req.body;
    try {
        const result = await client.query(
            `UPDATE personal_notes SET name = $1, isi_note = $2, agenda_id = $3, updated_at = NOW() 
       WHERE id = $4 AND user_id = $5 RETURNING *`,
            [name, isi_note, agenda_id, id, userId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Note not found or not owned by user' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//5.1 Update title note
app.put('/api/personal-note/:id/name/:userId', async (req, res) => {
    const { id, userId } = req.params;
    const { name } = req.body;

    try {
        const result = await client.query(
            `UPDATE personal_notes 
       SET name = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 AND user_id = $3 
       RETURNING *`,
            [name, id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Note not found or not owned by user" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


//5.2 update description note
app.put('/api/personal-note/:id/desc/:userId', async (req, res) => {
    const { id, userId } = req.params;
    const { isi_note } = req.body;

    try {
        const result = await client.query(
            `UPDATE personal_notes 
       SET isi_note = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 AND user_id = $3 
       RETURNING *`,
            [isi_note, id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Note not found or not owned by user" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// 6. Delete a note (only if owned by user)
app.delete('/api/personal-note/:id/user/:userId', async (req, res) => {
    const { id, userId } = req.params;
    try {
        const result = await client.query(
            'DELETE FROM personal_notes WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Note not found or not owned by user' });
        }
        res.json({ message: 'Note deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//7. put personal note color
app.put('/api/persona-note/:id/bg-color', async (req, res) => {
    const { id } = req.params;
    const { bg_color } = req.body;

    try {
        await client.query(
            'UPDATE personal_notes SET bg_color = $1 WHERE id = $2',
            [bg_color, id]
        )
        res.json({ message: 'Color update successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update color' });
    }
})

//COLOR NOTE
//1. get all data note color
app.get('/api/note-colors', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM notes_color ORDER BY id DESC');
        res.json(result.rows)
    } catch (error) {
        res.status(500).json({ error: 'Gagal mengambil semua data color note' })
    }
})

//2. add a new data note color 
app.post('/api/note-colors', async (req, res) => {
    const { color, color_name } = req.body;
    try {
        const result = await client.query(
            `INSERT INTO notes_color (color, color_name)
      VALUES ($1, $2) RETURNING *`,
            [color, color_name]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

//


//PERSONAL AGENDA
//1. create new agenda
app.post('/api/agenda', async (req, res) => {
    const { user_id, title, description, agenda_date, reminder_time, status_id } = req.body;
    try {
        const result = await client.query(
            `INSERT INTO agenda_personal (user_id, title, description, agenda_date, reminder_time, status_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [user_id, title, description, agenda_date, reminder_time, status_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//2. read all agendas for users
app.get('/api/agenda-user/user/:user_id', async (req, res) => {
    const { user_id } = req.params;
    try {
        const result = await client.query(
            `SELECT a.*, s.name as status_name, s.color 
       FROM agenda_personal a
       LEFT JOIN agenda_status s ON a.status_id = s.id
       WHERE a.user_id = $1
       ORDER BY a.agenda_date ASC`,
            [user_id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


//3. read satu agenda by id (and user)
app.get('/api/agenda-user/:id/user/:user_id', async (req, res) => {
    const { id, user_id } = req.params;
    try {
        const result = await client.query(
            `SELECT a.*, s.name as status_name, s.color 
       FROM agenda_personal a
       LEFT JOIN agenda_status s ON a.status_id = s.id
       WHERE a.id = $1 AND a.user_id = $2`,
            [id, user_id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Agenda not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//4. update agenda
app.put('/api/agenda/:id/user/:user_id', async (req, res) => {
    const { id, user_id } = req.params;
    const { title, description, agenda_date, reminder_time, status_id, is_notified, is_done } = req.body;

    try {
        const result = await client.query(
            `UPDATE agenda_personal
       SET title = $1,
           description = $2,
           agenda_date = $3,
           reminder_time = $4,
           status_id = $5,
           is_notified = $6,
           is_done = $7,
           updated_at = NOW()
       WHERE id = $8 AND user_id = $9
       RETURNING *`,
            [title, description, agenda_date, reminder_time, status_id, is_notified, is_done, id, user_id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Agenda not found or unauthorized' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//4. 1 Update description
app.put('/api/agenda/:id/user/:user_id/description', async (req, res) => {
    const { id, user_id } = req.params;
    const { description } = req.body;

    try {
        const result = await client.query(
            `UPDATE agenda_personal
       SET description = $1,
           updated_at = NOW()
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
            [description, id, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Agenda not found or unauthorized' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//4.2 update name agenda
app.put('/api/agenda/:id/user/:user_id/title', async (req, res) => {
    const { id, user_id } = req.params;
    const { title } = req.body;

    try {
        const result = await client.query(
            `UPDATE agenda_personal
       SET title = $1,
           updated_at = NOW()
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
            [title, id, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Agenda not found or unauthorized' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



//5. delete agenda
app.delete('/api/agenda-user/:id/user/:user_id', async (req, res) => {
    const { id, user_id } = req.params;
    try {
        const result = await client.query(
            `DELETE FROM agenda_personal WHERE id = $1 AND user_id = $2 RETURNING *`,
            [id, user_id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Agenda not found or unauthorized' });
        res.json({ message: 'Agenda deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. mark check agenda (get unfinished agendas)
app.get('/api/unfinished-agendas/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await client.query(`
      SELECT a.*, s.name as status_name, s.color 
      FROM agenda_personal a
      LEFT JOIN agenda_status s ON a.status_id = s.id
      WHERE a.user_id = $1 
        AND a.is_done = false
      ORDER BY a.agenda_date ASC
    `, [userId]);

        res.json({
            count: result.rowCount,
            data: result.rows,
            message: result.rowCount > 0 ? 'Unfinished agendas fetched successfully' : 'No unfinished agendas found'
        });
    } catch (err) {
        console.error('Error fetching unfinished agendas with status:', err);
        res.status(500).send('Failed to fetch unfinished agendas');
    }
});




//6.1 mark check agenda (get finish agendas)
app.get('/api/finish-agendas/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await client.query(`
      SELECT a.*, s.name as status_name, s.color 
      FROM agenda_personal a
      LEFT JOIN agenda_status s ON a.status_id = s.id
      WHERE a.user_id = $1 
        AND a.is_done = true
      ORDER BY a.agenda_date ASC
    `, [userId]);

        res.json({
            count: result.rowCount,
            data: result.rows,
            message: result.rowCount > 0 ? 'Finished agendas fetched successfully' : 'No finished agendas found'
        });
    } catch (err) {
        console.error('Error fetching finished agendas:', err);
        res.status(500).send('Failed to fetch finished agendas');
    }
});



// 7. Update is_done value (true or false) universal
app.put('/api/update-agenda-status/:agendaId', async (req, res) => {
    const { agendaId } = req.params;
    const { is_done } = req.body; // frontend kirim nilai true atau false

    try {
        const result = await client.query(`
      UPDATE agenda_personal 
      SET is_done = $1 
      WHERE id = $2
      RETURNING *
    `, [is_done, agendaId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Agenda not found' });
        }

        res.json({
            message: `Agenda status updated to ${is_done}`,
            updatedAgenda: result.rows[0]
        });
    } catch (err) {
        console.error('Error updating agenda status:', err);
        res.status(500).send('Failed to update agenda status');
    }
});

// 8. Update is_done with user check
app.put('/api/update-agenda-status/:agendaId/user/:userId', async (req, res) => {
    const { agendaId, userId } = req.params;
    const { is_done } = req.body;

    try {
        // Pastikan agenda ini milik user yang benar
        const check = await client.query(
            'SELECT * FROM agenda_personal WHERE id = $1 AND user_id = $2',
            [agendaId, userId]
        );

        if (check.rowCount === 0) {
            return res.status(403).json({ message: 'Agenda not found or access denied' });
        }

        const result = await client.query(
            'UPDATE agenda_personal SET is_done = $1 WHERE id = $2 RETURNING *',
            [is_done, agendaId]
        );

        res.json({
            message: `Agenda status updated to ${is_done}`,
            updatedAgenda: result.rows[0]
        });
    } catch (err) {
        console.error('Error updating agenda status:', err);
        res.status(500).send('Failed to update agenda status');
    }
});





//STATUS AGENDA
//1. get all agenda status
app.get('/api/agenda-status', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM agenda_status ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//2. Get single status by ID
app.get('/api/agenda-status/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await client.query('SELECT * FROM agenda_status WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Status not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//3. create new status
app.post('/api/agenda-status', async (req, res) => {
    const { name, description, color } = req.body;
    try {
        const result = await client.query(
            `INSERT INTO agenda_status (name, description, color)
       VALUES ($1, $2, $3) RETURNING *`,
            [name, description, color]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//4. Update status
app.put('/api/agenda-status/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, color } = req.body;
    try {
        const result = await client.query(
            `UPDATE agenda_status SET name = $1, description = $2, color = $3 WHERE id = $4 RETURNING *`,
            [name, description, color, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Status not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//5. Delete status (with safety: only if not used in agenda_personal)
app.delete('/api/agenda-status/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Cek apakah ada agenda menggunakan status ini
        const check = await client.query('SELECT 1 FROM agenda_personal WHERE status_id = $1 LIMIT 1', [id]);
        if (check.rows.length > 0) {
            return res.status(400).json({ message: 'Cannot delete status: already used in agenda_personal' });
        }

        const result = await client.query('DELETE FROM agenda_status WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Status not found' });

        res.json({ message: 'Status deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//6. Get single agenda + status by agenda_id and user_id
app.get('/api/:id/user/:user_id', async (req, res) => {
    const { id, user_id } = req.params;

    try {
        const result = await client.query(
            `SELECT 
          a.*, 
          s.name AS status_name, 
          s.description AS status_description,
          s.color AS status_color
       FROM agenda_personal a
       LEFT JOIN agenda_status s ON a.status_id = s.id
       WHERE a.id = $1 AND a.user_id = $2`,
            [id, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Agenda not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// PROFILE 
//1. get all profile
app.get('/api/profile', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM profil ORDER BY id DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Gagal mengambil profil' });
    }
})

//2. get profile by id
app.get('/api/profile/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await client.query('SELECT * FROM profil WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Profil tidak ditemukan' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Gagal mengambil profil' });
    }
})

//USER PROFIL 
//1. get profile by user 
app.get('/api/profile-user/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await client.query(`
        SELECT up.*, p.photo_url 
        FROM user_profil up 
        JOIN profil p ON up.profil_id = p.id 
        WHERE up.user_id = $1
      `, [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Profil untuk user tidak ditemukan' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Gagal mengambil profil user' });
    }
})

//2. add profile to user 
app.post('/api/profile-user', async (req, res) => {
    const { user_id, profil_id } = req.body;

    try {
        const existing = await client.query(
            'SELECT * FROM user_profil WHERE user_id = $1',
            [user_id]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'User sudah memiliki profil' });
        }

        const created = await client.query(
            'INSERT INTO user_profil (user_id, profil_id, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING *',
            [user_id, profil_id]
        );

        res.status(201).json({ message: 'Profil berhasil ditambahkan ke user', data: created.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Gagal menambahkan profil ke user' });
    }
})

//3. delete user profil
app.delete('/api/profile-user/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const deleted = await client.query(
            'DELETE FROM user_profil WHERE user_id = $1 RETURNING *',
            [userId]
        );

        if (deleted.rows.length === 0) {
            return res.status(404).json({ error: 'Mapping profil user tidak ditemukan' });
        }

        res.json({ message: 'Mapping profil user berhasil dihapus', data: deleted.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Gagal menghapus mapping profil user' });
    }
})

//4. update profile user
app.put('/api/profile-user/:userId', async (req, res) => {
    const userId = req.params.userId;
    const { profil_id } = req.body;

    try {
        const existing = await client.query(
            'SELECT * FROM user_profil WHERE user_id = $1',
            [userId]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({ error: 'Profil untuk user ini belum ada' });
        }

        const updated = await client.query(
            'UPDATE user_profil SET profil_id = $1, update_at = CURRENT_TIMESTAMP WHERE user_id = $2 RETURNING *',
            [profil_id, userId]
        );

        res.json({ message: 'Profil user berhasil diperbarui', data: updated.rows[0] });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Gagal memperbarui profil user' });
    }
})

// MARKETING USER 
// 1. Get semua marketing_user
app.get("/api/marketing-users", async (req, res) => {
    try {
        const result = await client.query("SELECT * FROM marketing_musik_user ORDER BY id ASC");
        res.json(result.rows);
    } catch (err) {
        console.error("❌ Error get marketing_musik_user:", err);
        res.status(500).json({ error: "Gagal ambil data" });
    }
});
// 2.Get 1 user by ID
app.get("/api/marketing-users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await client.query("SELECT * FROM marketing_musik_user WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User tidak ditemukan" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error get user:", err);
        res.status(500).json({ error: "Gagal ambil user" });
    }
});

// 3. Create user baru
app.post("/api/marketing-users", async (req, res) => {
    try {
        const { nama_marketing, divisi } = req.body;
        const result = await client.query(
            `INSERT INTO marketing_musik_user (nama_marketing, divisi) 
       VALUES ($1, $2) RETURNING *`,
            [nama_marketing, divisi]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error create user:", err);
        res.status(500).json({ error: "Gagal buat user baru" });
    }
});

// 4. Update user
app.put("/api/marketing-users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_marketing, divisi } = req.body;
        const result = await client.query(
            `UPDATE marketing_musik_user 
       SET nama_marketing=$1, divisi=$2, update_at=NOW() 
       WHERE id=$5 RETURNING *`,
            [nama_marketing, divisi, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User tidak ditemukan" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error update user:", err);
        res.status(500).json({ error: "Gagal update user" });
    }
});

// 5. Delete user
app.delete("/api/marketing-users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await client.query("DELETE FROM marketing_musik_user WHERE id=$1 RETURNING *", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User tidak ditemukan" });
        }
        res.json({ message: "User berhasil dihapus" });
    } catch (err) {
        console.error("❌ Error delete user:", err);
        res.status(500).json({ error: "Gagal hapus user" });
    }
});

// ACCOUNT MUSIC 
// ✅ Ambil semua account
app.get("/api/accounts-music", async (req, res) => {
    try {
        const result = await client.query("SELECT * FROM account_music ORDER BY id ASC");
        res.json(result.rows);
    } catch (err) {
        console.error("❌ Error get accounts:", err);
        res.status(500).json({ error: "Gagal ambil data accounts" });
    }
});

// ✅ Ambil 1 account by ID
app.get("/api/accounts-music/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await client.query("SELECT * FROM account_music WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Account tidak ditemukan" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error get account:", err);
        res.status(500).json({ error: "Gagal ambil account" });
    }
});

// ✅ Tambah account baru
app.post("/api/accounts-music", async (req, res) => {
    try {
        const { nama_account } = req.body;
        const result = await client.query(
            `INSERT INTO account_music (nama_account) 
       VALUES ($1) RETURNING *`,
            [nama_account]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error create account:", err);
        res.status(500).json({ error: "Gagal buat account baru" });
    }
});

// ✅ Update account
app.put("/api/accounts-music/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_account } = req.body;
        const result = await client.query(
            `UPDATE account_music 
       SET nama_account=$1, update_at=NOW() 
       WHERE id=$2 RETURNING *`,
            [nama_account, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Account tidak ditemukan" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error update account:", err);
        res.status(500).json({ error: "Gagal update account" });
    }
});

// ✅ Hapus account
app.delete("/api/accounts-music/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await client.query("DELETE FROM account_music WHERE id=$1 RETURNING *", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Account tidak ditemukan" });
        }
        res.json({ message: "Account berhasil dihapus" });
    } catch (err) {
        console.error("❌ Error delete account:", err);
        res.status(500).json({ error: "Gagal hapus account" });
    }
});

// PROJECT TYPE MUSIC 
// ✅ Get all project types
app.get('/api/project-types-music', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM project_type ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('❌ Error ambil project types:', err);
        res.status(500).json({ error: 'Gagal ambil data project type' });
    }
});

// ✅ Get project type by ID
app.get('/api/project-types-music/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await client.query('SELECT * FROM project_type WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Project type tidak ditemukan' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('❌ Error ambil project type by ID:', err);
        res.status(500).json({ error: 'Gagal ambil project type' });
    }
});

// ✅ Create new project type
app.post('/api/project-types-music', async (req, res) => {
    try {
        const { nama_project } = req.body;
        const result = await client.query(
            'INSERT INTO project_type (nama_project) VALUES ($1) RETURNING *',
            [nama_project]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('❌ Error tambah project type:', err);
        res.status(500).json({ error: 'Gagal tambah project type' });
    }
});

// ✅ Update project type
app.put('/api/project-types-music/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_project } = req.body;

        const result = await client.query(
            `UPDATE project_type 
       SET nama_project = $1, update_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
            [nama_project, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Project type tidak ditemukan' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('❌ Error update project type:', err);
        res.status(500).json({ error: 'Gagal update project type' });
    }
});

// ✅ Delete project type
app.delete('/api/project-types-music/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await client.query(
            'DELETE FROM project_type WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Project type tidak ditemukan' });
        }

        res.json({ message: 'Project type berhasil dihapus' });
    } catch (err) {
        console.error('❌ Error hapus project type:', err);
        res.status(500).json({ error: 'Gagal hapus project type' });
    }
});

// OFFER TYPE MUSIC 
// ✅ Get all offer types
app.get('/api/offer-types-music', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM offer_type_music ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('❌ Error ambil offer types:', err);
        res.status(500).json({ error: 'Gagal ambil data offer types' });
    }
});

// ✅ Get offer type by ID
app.get('/api/offer-types-music/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await client.query('SELECT * FROM offer_type_music WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Offer type tidak ditemukan' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('❌ Error ambil offer type by ID:', err);
        res.status(500).json({ error: 'Gagal ambil offer type' });
    }
});

// ✅ Create new offer type
app.post('/api/offer-types-music', async (req, res) => {
    try {
        const { offer_name } = req.body;
        const result = await client.query(
            'INSERT INTO offer_type_music (offer_name) VALUES ($1) RETURNING *',
            [offer_name]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('❌ Error tambah offer type:', err);
        res.status(500).json({ error: 'Gagal tambah offer type' });
    }
});

// ✅ Update offer type
app.put('/api/offer-types-music/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { offer_name } = req.body;

        const result = await client.query(
            `UPDATE offer_type_music 
       SET offer_name = $1, update_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
            [offer_name, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Offer type tidak ditemukan' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('❌ Error update offer type:', err);
        res.status(500).json({ error: 'Gagal update offer type' });
    }
});

// ✅ Delete offer type
app.delete('/api/offer-types-music/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await client.query(
            'DELETE FROM offer_type_music WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Offer type tidak ditemukan' });
        }

        res.json({ message: 'Offer type berhasil dihapus' });
    } catch (err) {
        console.error('❌ Error hapus offer type:', err);
        res.status(500).json({ error: 'Gagal hapus offer type' });
    }
});

// TYPE TRACK 
// ✅ Get all track types
app.get('/api/track-types', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM track_types ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('❌ Error ambil track types:', err);
        res.status(500).json({ error: 'Gagal ambil data track types' });
    }
});

// ✅ Get track type by ID
app.get('/api/track-types/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await client.query('SELECT * FROM track_types WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Track type tidak ditemukan' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('❌ Error ambil track type by ID:', err);
        res.status(500).json({ error: 'Gagal ambil track type' });
    }
});

// ✅ Create new track type
app.post('/api/track-types', async (req, res) => {
    try {
        const { track_name } = req.body;
        const result = await client.query(
            'INSERT INTO track_types (track_name) VALUES ($1) RETURNING *',
            [track_name]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('❌ Error tambah track type:', err);
        res.status(500).json({ error: 'Gagal tambah track type' });
    }
});

// ✅ Update track type
app.put('/api/track-types/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { track_name } = req.body;

        const result = await client.query(
            `UPDATE track_types 
       SET track_name = $1, update_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
            [track_name, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Track type tidak ditemukan' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('❌ Error update track type:', err);
        res.status(500).json({ error: 'Gagal update track type' });
    }
});

// ✅ Delete track type
app.delete('/api/track-types/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await client.query(
            'DELETE FROM track_types WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Track type tidak ditemukan' });
        }

        res.json({ message: 'Track type berhasil dihapus' });
    } catch (err) {
        console.error('❌ Error hapus track type:', err);
        res.status(500).json({ error: 'Gagal hapus track type' });
    }
});

// MUSIC GENRE 
// ✅ GET semua genre
app.get("/api/genre-music", async (req, res) => {
    try {
        const result = await client.query("SELECT * FROM genre_music ORDER BY id ASC");
        res.json(result.rows);
    } catch (err) {
        console.error("❌ Error ambil genre:", err);
        res.status(500).json({ error: "Gagal ambil genre" });
    }
});

// ✅ GET genre by ID
app.get("/api/genre-music/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await client.query("SELECT * FROM genre_music WHERE id = $1", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Genre tidak ditemukan" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error ambil genre by ID:", err);
        res.status(500).json({ error: "Gagal ambil genre" });
    }
});

// ✅ CREATE genre baru
app.post("/api/genre-music", async (req, res) => {
    try {
        const { genre_name } = req.body;
        const result = await client.query(
            "INSERT INTO genre_music (genre_name) VALUES ($1) RETURNING *",
            [genre_name]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error tambah genre:", err);
        res.status(500).json({ error: "Gagal tambah genre" });
    }
});

// ✅ UPDATE genre
app.put("/api/genre-music/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { genre_name } = req.body;

        const result = await client.query(
            `UPDATE genre_music 
       SET genre_name = $1, update_at = CURRENT_TIMESTAMP 
       WHERE id = $2 RETURNING *`,
            [genre_name, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Genre tidak ditemukan" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error update genre:", err);
        res.status(500).json({ error: "Gagal update genre" });
    }
});

// ✅ DELETE genre
app.delete("/api/genre-music/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await client.query(
            "DELETE FROM genre_music WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Genre tidak ditemukan" });
        }

        res.json({ message: "Genre berhasil dihapus" });
    } catch (err) {
        console.error("❌ Error hapus genre:", err);
        res.status(500).json({ error: "Gagal hapus genre" });
    }
});

// ORDER TYPE MUSIC 
// ✅ CREATE - Tambah order type baru
app.post("/api/music-order-types", async (req, res) => {
    try {
        const { order_name } = req.body;
        const result = await client.query(
            `INSERT INTO music_order_type (order_name) 
       VALUES ($1) RETURNING *`,
            [order_name]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error tambah music_order_type:", err);
        res.status(500).json({ error: "Gagal tambah order type" });
    }
});

// ✅ READ - Ambil semua order type
app.get("/api/music-order-types", async (req, res) => {
    try {
        const result = await client.query("SELECT * FROM music_order_type ORDER BY id ASC");
        res.json(result.rows);
    } catch (err) {
        console.error("❌ Error ambil music_order_type:", err);
        res.status(500).json({ error: "Gagal ambil order type" });
    }
});

// ✅ READ by ID - Ambil order type tertentu
app.get("/api/music-order-types/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await client.query("SELECT * FROM music_order_type WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Order type tidak ditemukan" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error ambil order type by ID:", err);
        res.status(500).json({ error: "Gagal ambil order type" });
    }
});

// ✅ UPDATE - Edit order type
app.put("/api/music-order-types/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { order_name } = req.body;
        const result = await client.query(
            `UPDATE music_order_type 
       SET order_name = $1, update_at = CURRENT_TIMESTAMP 
       WHERE id = $2 RETURNING *`,
            [order_name, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Order type tidak ditemukan" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error update music_order_type:", err);
        res.status(500).json({ error: "Gagal update order type" });
    }
});

// ✅ DELETE - Hapus order type
app.delete("/api/music-order-types/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await client.query(
            "DELETE FROM music_order_type WHERE id = $1 RETURNING *",
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Order type tidak ditemukan" });
        }
        res.json({ message: "Order type berhasil dihapus" });
    } catch (err) {
        console.error("❌ Error hapus music_order_type:", err);
        res.status(500).json({ error: "Gagal hapus order type" });
    }
});
// END ORDER TYPE MUSIC 

//KEPALA DIVISI
// ✅ GET semua kepala divisi
app.get("/api/kepala-divisi", async (req, res) => {
    try {
        const result = await client.query(`
      SELECT * FROM kepala_divisi
      ORDER BY id ASC
    `);
        res.json(result.rows);
    } catch (err) {
        console.error("❌ Gagal ambil kepala divisi:", err.message);
        res.status(500).json({ error: "Gagal ambil data kepala divisi" });
    }
});

// ✅ POST tambah kepala divisi baru
app.post("/api/kepala-divisi", async (req, res) => {
    try {
        const { nama, divisi } = req.body;

        const result = await client.query(`
      INSERT INTO kepala_divisi (nama, divisi, create_at, update_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [nama, divisi]);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("❌ Gagal tambah kepala divisi:", err.message);
        res.status(500).json({ error: "Gagal tambah kepala divisi" });
    }
});

// ✅ Optional: GET kepala divisi by id
app.get("/api/kepala-divisi/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await client.query(`SELECT * FROM kepala_divisi WHERE id = $1`, [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: "Kepala divisi tidak ditemukan" });
        res.json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error ambil kepala divisi:", err.message);
        res.status(500).json({ error: "Gagal ambil kepala divisi" });
    }
});

// ✅ UPDATE Kepala Divisi
app.put("/api/kepala-divisi/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nama, divisi } = req.body;

        const result = await client.query(`
      UPDATE kepala_divisi
      SET nama = $1,
          divisi = $2,
          update_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [nama, divisi, id]);

        if (result.rows.length === 0) return res.status(404).json({ error: "Kepala divisi tidak ditemukan" });

        res.json(result.rows[0]);
    } catch (err) {
        console.error("❌ Gagal update kepala divisi:", err.message);
        res.status(500).json({ error: "Gagal update kepala divisi" });
    }
});

// ✅ DELETE Kepala Divisi
app.delete("/api/kepala-divisi/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await client.query(`
      DELETE FROM kepala_divisi
      WHERE id = $1
      RETURNING *
    `, [id]);

        if (result.rows.length === 0) return res.status(404).json({ error: "Kepala divisi tidak ditemukan" });

        res.json({ message: "✅ Kepala divisi berhasil dihapus", deleted: result.rows[0] });
    } catch (err) {
        console.error("❌ Gagal hapus kepala divisi:", err.message);
        res.status(500).json({ error: "Gagal hapus kepala divisi" });
    }
});
//END KEPALA DIVISI

// KUPON DISKON 
// =======================
// CRUD Kupon Diskon
// =======================

// ✅ Get semua kupon diskon
app.get("/api/kupon-diskon", async (req, res) => {
    try {
        const result = await client.query("SELECT * FROM kupon_diskon ORDER BY id ASC");
        res.json(result.rows);
    } catch (err) {
        console.error("❌ Error get kupon_diskon:", err);
        res.status(500).json({ error: "Gagal mengambil data kupon diskon" });
    }
});

// ✅ Get kupon diskon by ID
app.get("/api/kupon-diskon/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await client.query("SELECT * FROM kupon_diskon WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Kupon diskon tidak ditemukan" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error get kupon_diskon by id:", err);
        res.status(500).json({ error: "Gagal mengambil data kupon diskon" });
    }
});

// ✅ Create kupon diskon baru
app.post("/api/kupon-diskon", async (req, res) => {
    try {
        const { nama_kupon } = req.body;
        const result = await client.query(
            "INSERT INTO kupon_diskon (nama_kupon) VALUES ($1) RETURNING *",
            [nama_kupon]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error tambah kupon_diskon:", err);
        res.status(500).json({ error: "Gagal tambah kupon diskon" });
    }
});

// ✅ Update kupon diskon
app.put("/api/kupon-diskon/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_kupon } = req.body;
        const result = await client.query(
            `UPDATE kupon_diskon 
       SET nama_kupon = $1, update_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
            [nama_kupon, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Kupon diskon tidak ditemukan" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error update kupon_diskon:", err);
        res.status(500).json({ error: "Gagal update kupon diskon" });
    }
});

// ✅ Delete kupon diskon
app.delete("/api/kupon-diskon/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await client.query("DELETE FROM kupon_diskon WHERE id = $1 RETURNING *", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Kupon diskon tidak ditemukan" });
        }
        res.json({ message: "Kupon diskon berhasil dihapus" });
    } catch (err) {
        console.error("❌ Error delete kupon_diskon:", err);
        res.status(500).json({ error: "Gagal hapus kupon diskon" });
    }
});

// END KUPON DISKON 

//LOG ACTIVITY USER
//1. menampilkan semua activity berdasarkan userId
app.get('/api/user-log/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await client.query(
            `SELECT * FROM activity_logs WHERE user_id = $1 ORDER BY "timestamp" DESC`,
            [userId]
        );

        if (result.rowCount === 0) {
            return res.status(200).json({ message: `User belum memiliki activity sekarang`, activities: [] });
        }

        res.status(200).json({
            message: `Activities for user ID ${userId}`,
            activities: result.rows,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



//LOG ACTIVITY CARD
// app.get('/api/activity-card/card/:cardId', async (req, res) => {
//     const { cardId } = req.params;

//     try {
//         const result = await client.query(`
//       SELECT ca.*, u.username
//       FROM card_activities ca
//       JOIN users u ON ca.user_id = u.id
//       WHERE ca.card_id = $1
//       ORDER BY ca.created_at DESC
//     `, [cardId]);

//         res.json({
//             message: `Activities for card ID ${cardId}`,
//             activities: result.rows,
//         });
//     } catch (err) {
//         console.error('Error fetching activities:', err);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// })
app.get('/api/activity-card/card/:cardId', async (req, res) => {
    const { cardId } = req.params;

    try {
        const result = await client.query(`
            SELECT ca.*
            FROM card_activities ca
            WHERE ca.card_id = $1
            ORDER BY ca.created_at DESC
        `, [cardId]);

        const activities = result.rows.map(row => {
            let movedBy = null;
            try {
                const detail = JSON.parse(row.action_detail);
                movedBy = detail.movedBy || null;
            } catch (err) {
                movedBy = null;
            }

            return {
                ...row,
                movedBy, // username + id yang melakukan action
            };
        });

        res.json({
            message: `Activities for card ID ${cardId}`,
            activities
        });
    } catch (err) {
        console.error('Error fetching activities:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});





app.post('/api/activity-log', async (req, res) => {
    const { entityType, entityId, action, userId, details, parentEntity, parentEntityId } = req.body;

    try {
        // Validasi input
        if (!entityType || !entityId || !action || !userId) {
            return res.status(400).json({ error: 'Missing required fields: entityType, entityId, action, userId' });
        }

        // Menambahkan log aktivitas ke dalam tabel activity_logs
        const result = await client.query(
            `INSERT INTO activity_logs (entity_type, entity_id, action, user_id, details, parent_entity, parent_entity_id, "timestamp")
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING id`,
            [entityType, entityId, action, userId, details, parentEntity, parentEntityId]
        );

        // Menanggapi jika log berhasil ditambahkan
        res.status(201).json({
            message: 'Activity log added successfully',
            logId: result.rows[0].id
        });
    } catch (error) {
        console.error('Error adding activity log:', error);
        res.status(500).json({ error: error.message });
    }
});


//END

//CHAT ROOM
// 1. mengambil semua data chat room beserta media
app.get('/api/cards/:cardId/chats', async (req, res) => {
    const { cardId } = req.params;

    try {
        const result = await client.query(
            `SELECT 
                cc.*, 
                u.username,
                p.profile_name,
                p.photo_url,
                json_agg(
                    json_build_object(
                        'id', cm.id,
                        'media_url', cm.media_url,
                        'media_type', cm.media_type,
                        'created_at', cm.created_at
                    )
                ) AS medias
             FROM card_chats cc
             JOIN users u ON cc.user_id = u.id
             LEFT JOIN user_profil up ON u.id = up.user_id
             LEFT JOIN profil p ON up.profil_id = p.id
             LEFT JOIN card_chats_media cm ON cm.chat_id = cc.id
             WHERE cc.card_id = $1 AND cc.deleted_at IS NULL
             GROUP BY cc.id, u.username, p.profile_name, p.photo_url
             ORDER BY cc.send_time ASC`,
            [cardId]
        );

        const allChats = result.rows.map(chat => ({
            ...chat,
            medias: chat.medias[0] && chat.medias[0].id ? chat.medias : [] // kalau gak ada media biar [] kosong
        }));

        // Buat map ID ke chat
        const chatMap = {};
        allChats.forEach(chat => {
            chat.replies = [];
            chatMap[chat.id] = chat;
        });

        // Susun struktur nested
        const chatTree = [];
        allChats.forEach(chat => {
            if (chat.parent_message_id) {
                const parent = chatMap[chat.parent_message_id];
                if (parent) {
                    parent.replies.push(chat);
                }
            } else {
                chatTree.push(chat);
            }
        });

        res.status(200).json(chatTree);
    } catch (err) {
        console.error('Error fetching chats:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


//2. CREATE CHAT + NOTIFIKASI
app.post('/api/cards/:cardId/chats', async (req, res) => {
    try {
        const { cardId } = req.params;
        const { user_id, message, parent_message_id } = req.body;

        // ✅ pastikan null beneran, bukan string "null"
        let parentId = parent_message_id;
        if (parentId === "null" || parentId === undefined || parentId === "") {
            parentId = null;
        }

        // Step 1: Simpan chat dulu
        const result = await client.query(
            `INSERT INTO card_chats (card_id, user_id, message, parent_message_id)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [cardId, user_id, message, parentId]
        );

        const newChat = result.rows[0];

        // Step 2: Notifikasi balasan (reply)
        if (parent_message_id) {
            const parent = await client.query(
                `SELECT user_id FROM card_chats WHERE id = $1`,
                [parent_message_id]
            );

            const parentUserId = parent.rows[0]?.user_id;

            if (parentUserId && parentUserId !== user_id) {
                const senderResult = await client.query(
                    `SELECT username FROM users WHERE id = $1`,
                    [user_id]
                );
                const senderUsername = senderResult.rows[0]?.username || 'Someone';

                await client.query(
                    `INSERT INTO notifications (user_id, chat_id, message, type)
                     VALUES ($1, $2, $3, 'reply')`,
                    [parentUserId, newChat.id, `${senderUsername} replied to your message`]
                );
            }
        }

        // Step 3: Notifikasi mention
        const mentionMatches = message.match(/@(\w+)/g);
        let mentionedUserIds = [];

        if (mentionMatches) {
            for (const mention of mentionMatches) {
                const username = mention.slice(1);

                const userResult = await client.query(
                    `SELECT id FROM users WHERE username = $1`,
                    [username]
                );

                if (userResult.rows.length > 0) {
                    const mentionedUserId = userResult.rows[0].id;
                    mentionedUserIds.push(mentionedUserId);

                    await client.query(
                        `INSERT INTO notifications (user_id, chat_id, message, type)
                         VALUES ($1, $2, $3, 'mention')`,
                        [mentionedUserId, newChat.id, `${message}`]
                    );
                }
            }

            await client.query(
                `UPDATE card_chats SET mentions = $1 WHERE id = $2`,
                [JSON.stringify(mentionedUserIds), newChat.id]
            );
        }

        // Ambil nama card
        const cardResult = await client.query(
            `SELECT title FROM cards WHERE id = $1`,
            [cardId]
        );
        const cardName = cardResult.rows[0]?.title || `Card ${cardId}`;

        // Step 4: Notifikasi pesan baru ke semua member card (kecuali pengirim)
        const members = await client.query(
            `SELECT user_id FROM card_users WHERE card_id = $1 AND user_id != $2`,
            [cardId, user_id]
        );

        const senderResult = await client.query(
            `SELECT username FROM users WHERE id = $1`,
            [user_id]
        );
        const senderUsername = senderResult.rows[0]?.username || 'Someone';

        for (const member of members.rows) {
            await client.query(
                `INSERT INTO notifications (user_id, chat_id, message, type)
                VALUES ($1, $2, $3, 'new_message')`,
                [member.user_id, newChat.id, `${senderUsername} posted a new message in ${cardName}`]
            );
        }

        // Step 5: Return chat
        const updatedChat = await client.query(
            `SELECT * FROM card_chats WHERE id = $1`,
            [newChat.id]
        );

        res.status(201).json(updatedChat.rows[0]);

    } catch (err) {
        console.error('Error post chat:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


//3. soft delete message
app.delete('/api/chats/:chatId', async (req, res) => {
    const { chatId } = req.params;

    try {
        // Tandai pesan sebagai dihapus
        await client.query(
            `UPDATE card_chats 
         SET deleted_at = NOW(), message = '[pesan dihapus]' 
         WHERE id = $1`,
            [chatId]
        );

        res.status(200).json({ message: 'Pesan berhasil dihapus (soft delete)' });
    } catch (err) {
        console.error('Error deleting chat:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
})

//4. get total message card
app.get('/api/chats-total/cards/:cardId', async (req, res) => {
    const { cardId } = req.params;

    try {
        const result = await client.query(
            `SELECT COUNT(*) AS message_count FROM card_chats WHERE card_id = $1 AND deleted_at IS NULL`,
            [cardId]
        );

        res.json({ cardId, messageCount: parseInt(result.rows[0].message_count) });
    } catch (err) {
        console.error('Error getting message count:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
})

//5. menampilkan mention 
app.get('/api/notification-mention/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await client.query(
            `SELECT * FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC`,
            [userId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching notifications:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
})

// Ambil semua notifikasi untuk user
app.get('/api/notifications/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await client.query(
            `SELECT n.*, u.username as sender_name
             FROM notifications n
             LEFT JOIN card_chats c ON n.chat_id = c.id
             LEFT JOIN users u ON c.user_id = u.id
             WHERE n.user_id = $1
             ORDER BY n.created_at DESC`,
            [userId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error('Error get notifications:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


//6. endpoin untuk menampilkan endpoin yang sudah dibaca
app.patch('/api/notification-read/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await client.query(
            `UPDATE notifications SET is_read = true WHERE id = $1`,
            [id]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error markeing notification is read:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

//7. endpoin delete notification by user
app.delete('/api/notifications/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await client.query(
            `DELETE FROM notifications WHERE id = $1`,
            [id]
        );

        res.json({ success: true, message: `Delete notifications with id ${id}` });
    } catch (error) {
        console.error('Error deleting notifications:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

// 8. Update chat message (hanya bisa oleh pengirimnya)
app.put('/api/card-chats/:id', async (req, res) => {
    const { id } = req.params; // id chat yang mau diubah
    const { user_id, message } = req.body; // id user yang sedang login & pesan baru

    if (!user_id || !message) {
        return res.status(400).json({ error: 'user_id dan message wajib diisi' });
    }

    try {
        // 1️⃣ Cek apakah pesan ini memang dikirim oleh user_id tersebut
        const check = await client.query(
            `SELECT * FROM card_chats WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
            [id, user_id]
        );

        if (check.rows.length === 0) {
            return res.status(403).json({
                error: 'Kamu tidak bisa mengedit pesan ini karena bukan kamu yang kirim.',
            });
        }

        // 2️⃣ Update pesan dan waktu terakhir diubah
        const result = await client.query(
            `UPDATE card_chats 
       SET message = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
            [message, id]
        );

        res.status(200).json({
            message: 'Pesan berhasil diupdate',
            data: result.rows[0],
        });
    } catch (err) {
        console.error('Error updating chat:', err);
        res.status(500).json({ error: 'Terjadi kesalahan saat update chat' });
    }
});



// MEDIA CHATS 
app.post('/api/chats/:chatId/media', upload.single('file'), async (req, res) => {
    const { chatId } = req.params;

    if (!req.file || !chatId) {
        return res.status(400).json({ error: 'Missing file or chatId' });
    }

    try {
        // Upload buffer ke Cloudinary
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    resource_type: 'auto', // auto = bisa image, video, pdf, dll
                    folder: 'trello_chat_media',
                    public_id: `${Date.now()}-${req.file.originalname}`,
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(req.file.buffer);
        });

        const fileUrl = result.secure_url;
        const fileName = req.file.originalname;

        // Tentukan tipe media berdasarkan mimetype
        const mimeType = req.file.mimetype;
        let mediaType = 'file';
        if (mimeType.startsWith('image/')) mediaType = 'image';
        else if (mimeType.startsWith('video/')) mediaType = 'video';
        else if (mimeType.startsWith('audio/')) mediaType = 'audio';

        // Simpan ke tabel card_chats_media
        const dbResult = await client.query(
            `INSERT INTO card_chats_media (chat_id, media_url, media_type)
             VALUES ($1, $2, $3) RETURNING *`,
            [chatId, fileUrl, mediaType]
        );

        res.status(201).json(dbResult.rows[0]);
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed', message: error.message });
    }
});

// END MEDIA CHATS 


//SCHEDULE
//1. create new schedule, but just 1 day
app.post('/api/schedule', async (req, res) => {
    const { user_id, day_id, shift_id } = req.body;
    try {
        const result = await client.query(
            `INSERT INTO user_weekly_schedule (user_id, day_id, shift_id)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id, day_id) DO UPDATE SET shift_id = EXCLUDED.shift_id
           RETURNING *`,
            [user_id, day_id, shift_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Insert error:', error);
        res.status(500).json({ message: 'Failed to add schedule' });
    }
})

//2. update shedule 
app.put('/api/update-schedule/:scheduleId', async (req, res) => {
    const { scheduleId } = req.params;
    const { shift_id } = req.body;

    try {
        const result = await client.query(
            `UPDATE user_weekly_schedule
         SET shift_id = $1, updated_at = NOW()
         WHERE schedule_id = $2
         RETURNING *`,
            [shift_id, scheduleId]
        );
        res.status(200).json({
            message: 'Jadwal berhasil diperbarui',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ message: 'Failed to update schedule' });
    }
})

//3. delete schedule per hari
app.delete('/api/delete-schedule/:scheduleId', async (req, res) => {
    const { scheduleId } = req.params;
    try {
        await client.query(
            `DELETE FROM user_weekly_schedule WHERE schedule_id = $1`,
            [scheduleId]
        );
        res.json({ message: 'Schedule deleted' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ message: 'Failed to delete schedule' });
    }
})

//4. get schedule by user 
app.get('/api/user-schedule/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await client.query(
            `SELECT s.schedule_id, d.days_name, sh.status_shift, sh.keterangan
            FROM user_weekly_schedule s
            JOIN days_of_week d ON s.day_id = d.days_id
            JOIN shift_schedule sh ON s.shift_id = sh.shift_id
            WHERE s.user_id = $1
            ORDER BY d.days_id ASC`,
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Fetch error:', error);
        res.status(500).json({ message: 'Failed to fetch schedule' });
    }
})

//5. get all shift
// app.get('/api/shift', async(req,res)=>{
//     try{
//         const result = await client.query(
//             'SELECT * FROM shift_schedule'
//         )
//         res.json(result.rows);
//     }catch(error){
//         res.status(500).json({error:error.message})
//     }
// })

//update employee shift
app.put('/api/schedule-weekly', async (req, res) => {
    const { employee_id, day_id, shift_id } = req.body;

    if (!employee_id || !day_id) {
        return res.status(400).json({ message: 'employee_id dan day_id wajib diisi' });
    }

    const today = new Date().toISOString().slice(0, 10); // format: YYYY-MM-DD

    try {
        // Cek apakah data sudah ada berdasarkan employee_id dan schedule_date
        const checkQuery = `
      SELECT id FROM employee_schedule 
      WHERE employee_id = $1 AND schedule_date = $2 AND day_id = $3
    `;
        const checkResult = await client.query(checkQuery, [employee_id, today, day_id]);

        if (checkResult.rows.length > 0) {
            // Sudah ada, update
            const updateQuery = `
        UPDATE employee_schedule
        SET shift_id = $1
        WHERE employee_id = $2 AND schedule_date = $3 AND day_id = $4
      `;
            await client.query(updateQuery, [shift_id || null, employee_id, today, day_id]);
        } else {
            // Belum ada, insert
            const insertQuery = `
        INSERT INTO employee_schedule (employee_id, day_id, shift_id, schedule_date)
        VALUES ($1, $2, $3, $4)
      `;
            await client.query(insertQuery, [employee_id, day_id, shift_id || null, today]);
        }

        res.json({ message: 'Shift berhasil diperbarui' });
    } catch (error) {
        console.error('Error updating shift:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// NEW EMPLOYEE SCHEDULE
//1. get all schedule
app.get('/api/schedules', async (req, res) => {
    try {
        const result = await client.query(`
          SELECT es.id, es.schedule_date, sd.day_name, ss.status_shift, de.name AS employee_name
          FROM employee_schedule es
          JOIN data_employees de ON es.employee_id = de.id
          LEFT JOIN shift_schedule ss ON es.shift_id = ss.shift_id
          LEFT JOIN schedule_day sd ON es.day_id = sd.day_id
          ORDER BY de.name, es.schedule_date
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})
//2. get schedule by employee
app.get('/api/schedule-employee/:employeeId', async (req, res) => {
    const { employeeId } = req.params;
    try {
        const result = await client.query(`
        SELECT es.id, es.schedule_date, sd.day_name, ss.status_shift
        FROM employee_schedule es
        LEFT JOIN shift_schedule ss ON es.shift_id = ss.shift_id
        LEFT JOIN schedule_day sd ON es.day_id = sd.day_id
        WHERE es.employee_id = $1
        ORDER BY es.schedule_date
      `, [employeeId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

// 3. get all employee shedule dalam seminggu
app.get('/api/schedule-weekly', async (req, res) => {
    try {
        const query = `
          SELECT 
            e.id AS employee_id,
            e.name AS employee_name,
            e.divisi AS employee_divisi,
            d.day_id,
            d.day_name,
            COALESCE(s.status_shift, 'Libur') AS shift
          FROM data_employees e
          CROSS JOIN schedule_day d
          LEFT JOIN employee_schedule es 
            ON es.employee_id = e.id AND es.day_id = d.day_id
          LEFT JOIN shift_schedule s 
            ON s.shift_id = es.shift_id
          ORDER BY e.id, d.day_id;
        `;

        const { rows } = await client.query(query);

        // Transform data menjadi format tabel:
        const result = {};
        rows.forEach(row => {
            const { employee_id, employee_divisi, employee_name, day_name, shift } = row;
            if (!result[employee_id]) {
                result[employee_id] = { employee_id, employee_divisi, Nama: employee_name };
            }
            result[employee_id][day_name] = shift;
        });

        // Convert object to array
        const formatted = Object.values(result);

        res.json(formatted);
    } catch (error) {
        console.error('Error getting employee schedules:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

// NEW SCHEDULE EMPLOYEE
//1. view data schedule employee 
app.get('/api/employee-schedule/view', async (req, res) => {
    try {
        const result = await client.query(`
      SELECT 
        e.id AS employee_id,
        e.name,
        e.divisi,
        MAX(CASE WHEN d.name = 'Senin' THEN s.name END) AS senin,
        MAX(CASE WHEN d.name = 'Selasa' THEN s.name END) AS selasa,
        MAX(CASE WHEN d.name = 'Rabu' THEN s.name END) AS rabu,
        MAX(CASE WHEN d.name = 'Kamis' THEN s.name END) AS kamis,
        MAX(CASE WHEN d.name = 'Jumat' THEN s.name END) AS jumat,
        MAX(CASE WHEN d.name = 'Sabtu' THEN s.name END) AS sabtu,
        MAX(CASE WHEN d.name = 'Minggu' THEN s.name END) AS minggu
      FROM employee_schedules es
      JOIN employees e ON es.employee_id = e.id
      JOIN day d ON es.day_id = d.id
      JOIN shift_employee s ON es.shift_id = s.id
      GROUP BY e.id, e.name, e.divisi
      ORDER BY e.name
    `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching schedule:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



//1.2 view data shcedule employee by employee id
app.get('/api/employee-schedule/view/:employeeId', async (req, res) => {
    const { employeeId } = req.params;

    try {
        const result = await client.query(`
      SELECT 
        e.id,
        e.name,
        e.divisi,
        MAX(CASE WHEN d.name = 'Senin' THEN s.name END) AS senin,
        MAX(CASE WHEN d.name = 'Selasa' THEN s.name END) AS selasa,
        MAX(CASE WHEN d.name = 'Rabu' THEN s.name END) AS rabu,
        MAX(CASE WHEN d.name = 'Kamis' THEN s.name END) AS kamis,
        MAX(CASE WHEN d.name = 'Jumat' THEN s.name END) AS jumat,
        MAX(CASE WHEN d.name = 'Sabtu' THEN s.name END) AS sabtu,
        MAX(CASE WHEN d.name = 'Minggu' THEN s.name END) AS minggu
      FROM employee_schedules es
      JOIN employees e ON es.employee_id = e.id
      JOIN day d ON es.day_id = d.id
      JOIN shift_employee s ON es.shift_id = s.id
      WHERE e.id = $1
      GROUP BY e.id, e.name, e.divisi
    `, [employeeId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Employee schedule not found.' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching employee schedule:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


//2. post endpoin 
app.post("/api/employee-schedule", async (req, res) => {
    const { name, divisi, schedules } = req.body;

    try {
        // 1. Cek apakah employee sudah ada
        const employeeCheck = await client.query(
            "SELECT id FROM employees WHERE name = $1 AND divisi = $2",
            [name, divisi]
        );

        let employeeId;

        if (employeeCheck.rows.length > 0) {
            // Sudah ada
            employeeId = employeeCheck.rows[0].id;
        } else {
            // Belum ada, tambahkan employee
            const insertEmployee = await client.query(
                "INSERT INTO employees (name, divisi) VALUES ($1, $2) RETURNING id",
                [name, divisi]
            );
            employeeId = insertEmployee.rows[0].id;
        }

        // 2. Simpan shift untuk setiap hari ke tabel employee_schedules
        for (const s of schedules) {
            await client.query(
                `INSERT INTO employee_schedules (employee_id, day_id, shift_id)
         VALUES ($1, $2, $3)`,
                [employeeId, s.day_id, s.shift_id]
            );
        }

        res.status(201).json({ message: "Jadwal shift berhasil disimpan!" });
    } catch (err) {
        console.error("Error saving employee schedule:", err);
        res.status(500).json({ error: "Terjadi kesalahan saat menyimpan shift." });
    }
});

//3. Update seluruh data karyawan dan jadwal shift
app.put("/api/employee-schedule/:employeeId", async (req, res) => {
    const { employeeId } = req.params;
    const { name, divisi, schedules } = req.body;

    try {
        // Update nama dan divisi employee
        await client.query(
            "UPDATE employees SET name = $1, divisi = $2 WHERE id = $3",
            [name, divisi, employeeId]
        );

        // Hapus semua jadwal lama
        await client.query("DELETE FROM employee_schedules WHERE employee_id = $1", [employeeId]);

        // Masukkan jadwal baru
        for (const s of schedules) {
            await client.query(
                "INSERT INTO employee_schedules (employee_id, day_id, shift_id) VALUES ($1, $2, $3)",
                [employeeId, s.day_id, s.shift_id]
            );
        }

        res.status(200).json({ message: "Data karyawan dan jadwal berhasil diupdate." });
    } catch (err) {
        console.error("Error updating employee schedule:", err);
        res.status(500).json({ error: "Terjadi kesalahan saat mengupdate data." });
    }
});

//4. Update hanya jadwal shift tanpa mengubah nama dan divisi
app.put("/api/employee-schedule/:employeeId/schedules", async (req, res) => {
    const { employeeId } = req.params;
    const { schedules } = req.body;

    try {
        // Hapus semua jadwal lama
        await client.query("DELETE FROM employee_schedules WHERE employee_id = $1", [employeeId]);

        // Masukkan jadwal baru
        for (const s of schedules) {
            await client.query(
                "INSERT INTO employee_schedules (employee_id, day_id, shift_id) VALUES ($1, $2, $3)",
                [employeeId, s.day_id, s.shift_id]
            );
        }

        res.status(200).json({ message: "Jadwal shift berhasil diupdate." });
    } catch (err) {
        console.error("Error updating schedules:", err);
        res.status(500).json({ error: "Terjadi kesalahan saat mengupdate jadwal." });
    }
});

//5. delete schedule employee by employee id
app.delete("/api/employee-schedule/:employeeId", async (req, res) => {
    const { employeeId } = req.params;

    try {
        const result = await client.query(
            "DELETE FROM employee_schedules WHERE employee_id = $1",
            [employeeId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Jadwal tidak ditemukan untuk employee ini." });
        }

        res.status(200).json({ message: "Jadwal shift berhasil dihapus." });
    } catch (err) {
        console.error("Error deleting schedules:", err);
        res.status(500).json({ error: "Terjadi kesalahan saat menghapus jadwal." });
    }
});

//6. updae shift by employe and day
app.put('/api/employee-schedule/:employeeId/day/:dayId', async (req, res) => {
    const { employeeId, dayId } = req.params;
    const { shift_id } = req.body;

    try {
        // 1. Cek apakah jadwal untuk employee dan hari sudah ada
        const existing = await client.query(
            `SELECT * FROM employee_schedules WHERE employee_id = $1 AND day_id = $2`,
            [employeeId, dayId]
        );

        if (existing.rows.length > 0) {
            // 2. Update jika ada
            await client.query(
                `UPDATE employee_schedules SET shift_id = $1 WHERE employee_id = $2 AND day_id = $3`,
                [shift_id, employeeId, dayId]
            );
        } else {
            // 3. Jika belum ada, insert baru
            await client.query(
                `INSERT INTO employee_schedules (employee_id, day_id, shift_id) VALUES ($1, $2, $3)`,
                [employeeId, dayId, shift_id]
            );
        }

        res.status(200).json({ message: "Shift updated successfully" });
    } catch (error) {
        console.error("Error updating shift:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});



//GET ALL DAY
app.get('/api/all-days', async (req, res) => {
    try {
        const result = await client.query("SELECT * FROM day ORDER BY id ASC");
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Error getting days:", err);
        res.status(500).json({ error: "Terjadi kesalahan saat mengambil data" });
    }
})

//GET ALL SHIFT
app.get('/api/all-shift', async (req, res) => {
    try {
        const result = await client.query("SELECT * FROM shift_employee ORDER BY id ASC");
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Error getting shifts:", err);
        res.status(500).json({ error: "Terjadi kesalahan saat mengambil data" })
    }
})








//SCHEDULE DAY
//1. get all days
app.get('/api/schedule-days', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM schedule_day')
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

//2. get schedule per hari berdasarkan employee id
app.get('/api/day-schedule-employee/:employeeId', async (req, res) => {
    const { employeeId } = req.params;

    try {
        const result = await client.query(
            `
      SELECT 
        sd.day_id, 
        sd.day_name, 
        ss.status_shift
      FROM schedule_day sd
      LEFT JOIN employee_schedule es ON es.day_id = sd.day_id AND es.employee_id = $1
      LEFT JOIN shift_schedule ss ON ss.shift_id = es.shift_id
      ORDER BY sd.day_id;
      `,
            [employeeId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching employee schedule:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});



//END CHAT ROOM


//SYSTEM NOTIFICATION

//1. get notification by user id
app.get('/api/system-notification/user-notif/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await client.query('SELECT * FROM system_notifications WHERE user_id = $1', [userId])
        res.json(result.rows);

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

//2. mark notification as read
app.patch('/api/system-notification/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await client.query(
            `UPDATE system_notifications SET is_read = true WHERE id = $1`,
            [id]
        );

        res.json({ success: true })
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

//3. delete notification by user
app.delete('/api/system-notification/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await client.query(
            `DELETE FROM system_notifications WHERE id = $1`, [id]
        );

        res.json({ success: true, message: `Delete notifications with id ${id}` })
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
})


// Misalnya di file server.js / routes.js kamu
// 5. Get chat message detail by chat_id and user_id (for mention or reply notification)
app.get('/api/chat/:chatId/user/:userId', async (req, res) => {
    const { chatId, userId } = req.params;

    try {
        const result = await client.query(
            `SELECT 
         cc.id, cc.card_id, cc.user_id, cc.message, cc.parent_message_id,
         cc.mentions, cc.send_time, cc.created_at, u.username
       FROM card_chats cc
       JOIN users u ON cc.user_id = u.id
       WHERE cc.id = $1`,
            [chatId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Chat message not found' });
        }

        const chat = result.rows[0];

        // Cek apakah user_id termasuk dalam mentions
        const isMentioned = chat.mentions && Array.isArray(chat.mentions)
            ? chat.mentions.includes(parseInt(userId))
            : false;

        res.json({
            chat,
            isMentioned
        });
    } catch (error) {
        console.error('Error fetching chat message:', error);
        res.status(500).json({ error: error.message });
    }
});


//5.1 // GET unread chat status untuk card tertentu
app.get('/api/cards/:cardId/users/:userId/has-new-chat', async (req, res) => {
    const { cardId, userId } = req.params;
    try {
        const result = await client.query(
            `SELECT EXISTS (
         SELECT 1
         FROM notifications n
         JOIN card_chats c ON n.chat_id = c.id
         WHERE n.user_id = $1
           AND c.card_id = $2
           AND n.type = 'new_message'
           AND n.is_read = false
       ) AS has_new_chat`,
            [userId, cardId]
        );

        res.json({ hasNewChat: result.rows[0].has_new_chat });
    } catch (err) {
        console.error('Error checking new chat status:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


//6. endpoin untuk mengetahui total notifikasi yang belum dibaca dari dua tabel (system_notifikasi dan notifikasi pesan)
app.get('/api/notifications/unread-count/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await client.query(`
        SELECT 
            (SELECT COUNT(*) FROM system_notifications WHERE user_id = $1 AND is_read = false) AS unread_system,
            (SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false) AS unread_chat;
        `, [userId]);

        const unreadSystem = parseInt(result.rows[0].unread_system, 10);
        const unreadChat = parseInt(result.rows[0].unread_chat, 10);

        res.status(200).json({
            unread_system: unreadSystem,
            unread_chat: unreadChat,
            total_unread: unreadSystem + unreadChat
        });

    } catch (error) {
        console.error('Error fetching unread counts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

//7. gabungan kedua notifikasi (chat + system) menampilkan semua notifikasi
app.get('/api/all-notif/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        // Query chat notifications
        const chatResult = await client.query(`
            SELECT id, chat_id, message, is_read, created_at, type, 'chat' AS source 
            FROM notifications
            WHERE user_id = $1
        `, [userId]);

        // Query system notifications
        const systemResult = await client.query(`
            SELECT id, card_id, message, is_read, created_at, type, 'system' AS source
            FROM system_notifications
            WHERE user_id = $1
        `, [userId]);

        // Gabungkan & urutkan berdasarkan waktu terbaru
        const allNotifications = [...chatResult.rows, ...systemResult.rows].sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        res.json({ success: true, data: allNotifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
    }
});


//mendapatkan data workspace, board, list berdasarkan data (cardId dan listId)
// Endpoint untuk ambil lokasi lengkap dari card
app.get('/api/card/:cardId/user/:userId/location', async (req, res) => {
    const { cardId, userId } = req.params;

    try {
        const result = await client.query(
            `SELECT 
                cards.id AS card_id,
                cards.list_id,
                lists.board_id,
                boards.workspace_id
             FROM cards
             JOIN lists ON cards.list_id = lists.id
             JOIN boards ON lists.board_id = boards.id
             WHERE cards.id = $1`,
            [cardId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Card not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET path info from chatId and userId
app.get('/api/chat/:chatId/path', async (req, res) => {
    const { chatId } = req.params;

    try {
        const result = await client.query(`
            SELECT 
                cc.card_id, 
                c.list_id, 
                l.board_id, 
                b.workspace_id
            FROM card_chats cc
            JOIN cards c ON cc.card_id = c.id
            JOIN lists l ON c.list_id = l.id
            JOIN boards b ON l.board_id = b.id
            WHERE cc.id = $1
        `, [chatId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Chat not found" });
        }

        const { card_id, list_id, board_id, workspace_id } = result.rows[0];

        res.json({
            workspaceId: workspace_id,
            boardId: board_id,
            listId: list_id,
            cardId: card_id
        });

    } catch (error) {
        console.error('Error fetching path:', error);
        res.status(500).json({ error: error.message });
    }
});

//GET PATH info from workspaceId and cardId
app.get('/api/card/:cardId/card-location', async (req, res) => {
    const { cardId } = req.params;

    if (!cardId) {
        return res.status(400).json({ error: 'cardId wajib diisi' });
    }

    try {
        console.log("Fetching location for cardId:", cardId);

        const result = await client.query(`
      SELECT 
        w.id AS workspace_id,
        b.id AS board_id,
        l.id AS list_id,
        c.id AS card_id
      FROM cards c
      JOIN lists l ON c.list_id = l.id
      JOIN boards b ON l.board_id = b.id
      JOIN workspaces w ON b.workspace_id = w.id
      WHERE c.id = $1
      LIMIT 1
    `, [cardId]);

        if (result.rows.length === 0) {
            console.log("Card not found or broken relation");
            return res.status(404).json({ error: 'Data tidak ditemukan' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Gagal mengambil lokasi card:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data', detail: error.message });
    }
});



// TESTING ENDPOIN 
// 6. Move card (antar list atau board + posisi baru)
app.put('/api/cards/:cardId/move-testing/:userId', async (req, res) => {
    const { cardId, userId } = req.params;   // ambil userId dari URL
    const { targetListId, newPosition } = req.body;
    const actingUserId = parseInt(userId, 10); // pakai userId sebagai actingUserId

    if (!actingUserId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        await client.query('BEGIN');

        // ambil info card lama
        const oldCardRes = await client.query(
            `SELECT c.list_id, c.position, c.title, l.board_id 
       FROM cards c 
       JOIN lists l ON c.list_id = l.id
       WHERE c.id = $1`,
            [cardId]
        );
        if (oldCardRes.rows.length === 0)
            return res.status(404).json({ error: 'Card tidak ditemukan' });

        const { list_id: oldListId, board_id: oldBoardId, position: oldPosition, title } = oldCardRes.rows[0];

        // ambil board_id dari list tujuan
        const targetListRes = await client.query(`SELECT board_id FROM lists WHERE id = $1`, [targetListId]);
        if (targetListRes.rows.length === 0)
            return res.status(404).json({ error: 'List tujuan tidak ditemukan' });
        const targetBoardId = targetListRes.rows[0].board_id;

        // geser posisi di list lama
        await client.query(
            `UPDATE cards SET position = position - 1
       WHERE list_id = $1 AND position > $2`,
            [oldListId, oldPosition]
        );

        // hitung posisi baru
        let finalPosition = newPosition;
        if (!finalPosition) {
            const posRes = await client.query(
                `SELECT COALESCE(MAX(position), 0) + 1 AS pos
         FROM cards WHERE list_id = $1`,
                [targetListId]
            );
            finalPosition = posRes.rows[0].pos;
        } else {
            // geser posisi di list tujuan
            await client.query(
                `UPDATE cards SET position = position + 1
         WHERE list_id = $1 AND position >= $2`,
                [targetListId, finalPosition]
            );
        }

        // update posisi dan list card
        await client.query(
            `UPDATE cards
       SET list_id = $1, position = $2, update_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
            [targetListId, finalPosition, cardId]
        );

        // ambil info board & list lama dan baru
        const oldInfo = await client.query(
            `SELECT l.name AS list_name, b.name AS board_name
       FROM lists l 
       JOIN boards b ON l.board_id = b.id
       WHERE l.id = $1`,
            [oldListId]
        );
        const newInfo = await client.query(
            `SELECT l.name AS list_name, b.name AS board_name
       FROM lists l 
       JOIN boards b ON l.board_id = b.id
       WHERE l.id = $1`,
            [targetListId]
        );

        const oldListName = oldInfo.rows[0]?.list_name || 'Unknown List';
        const oldBoardName = oldInfo.rows[0]?.board_name || 'Unknown Board';
        const newListName = newInfo.rows[0]?.list_name || 'Unknown List';
        const newBoardName = newInfo.rows[0]?.board_name || 'Unknown Board';

        // ambil semua user workspace
        const workspaceUsersRes = await client.query(
            `SELECT user_id FROM workspaces_users WHERE workspace_id = $1 AND is_deleted = FALSE`,
            [oldBoardId]
        );
        const userIds = workspaceUsersRes.rows.map(r => r.user_id);

        // pastikan actingUserId ada di userIds
        if (!userIds.includes(actingUserId)) userIds.push(actingUserId);

        // ambil username acting user
        const actingUserRes = await client.query(
            'SELECT username FROM users WHERE id = $1',
            [actingUserId]
        );
        const actingUserName = actingUserRes.rows[0]?.username || 'Unknown';

        // 🔥 Simpan activity langsung ke tabel card_activities
        await client.query(`
      INSERT INTO card_activities 
        (card_id, user_id, action_type, entity, entity_id, action_detail)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
            cardId, // card_id
            actingUserId, // user_id
            'moved', // action_type
            'list', // entity
            targetListId, // entity_id
            JSON.stringify({ // action_detail valid JSON
                cardTitle: title,
                fromBoardId: oldBoardId,
                fromBoardName: oldBoardName,
                fromListId: oldListId,
                fromListName: oldListName,
                toBoardId: targetBoardId,
                toBoardName: newBoardName,
                toListId: targetListId,
                toListName: newListName,
                newPosition: finalPosition,
                movedBy: { id: actingUserId, username: actingUserName }
            })
        ]);

        await client.query('COMMIT');

        // ✅ Respon sukses
        res.status(200).json({
            message: 'Card berhasil dipindahkan',
            cardId,
            fromListId: oldListId,
            fromListName: oldListName,
            toListId: targetListId,
            toListName: newListName,
            fromBoardId: oldBoardId,
            fromBoardName: oldBoardName,
            toBoardId: targetBoardId,
            toBoardName: newBoardName,
            position: finalPosition,
            movedBy: { id: actingUserId, username: actingUserName }
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Gagal move card:', err);
        res.status(500).json({ error: 'Gagal memindahkan card' });
    }
});



// Move card endpoint





//get card activity
// app.get('/api/cards/:cardId/activities', async (req, res) => {
//     const { cardId } = req.params;

//     try {
//         const result = await client.query(`
//       SELECT 
//         ca.*,
//         u.username AS movedBy
//       FROM card_activities ca
//       LEFT JOIN users u ON ca.user_id = u.id
//       WHERE ca.card_id = $1
//       ORDER BY ca.created_at DESC
//     `, [cardId]);

//         res.json({
//             message: `Activities for card ID ${cardId}`,
//             activities: result.rows
//         });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Error fetching card activities' });
//     }
// });

// ✅ GET card activities (termasuk aktivitas duplicate)
// ✅ GET card activities (termasuk aktivitas duplicate)
app.get('/api/cards/:cardId/activities-testing', async (req, res) => {
    const { cardId } = req.params;

    try {
        const result = await client.query(`
      SELECT 
          ca.id,
          ca.card_id,
          ca.action_type,
          ca.entity,
          ca.entity_id,
          ca.action_detail,
          ca.created_at,
          u.username AS movedby
      FROM public.card_activities ca
      LEFT JOIN public.users u ON ca.user_id = u.id
      WHERE ca.card_id = $1
      ORDER BY ca.created_at DESC
    `, [cardId]);

        // 🧠 Parse kolom action_detail dengan aman
        const activities = result.rows.map(row => {
            let parsedDetail = null;

            try {
                if (row.action_detail) {
                    parsedDetail = JSON.parse(row.action_detail);
                }
            } catch (e) {
                // kalau bukan JSON valid, simpan sebagai teks biasa
                parsedDetail = { rawText: row.action_detail };
            }

            return {
                id: row.id,
                card_id: row.card_id,
                action_type: row.action_type,
                entity: row.entity,
                entity_id: row.entity_id,
                created_at: row.created_at,
                movedby: row.movedby,
                action_detail: parsedDetail
            };
        });

        res.status(200).json({
            message: `Activities for card ID ${cardId}`,
            total: activities.length,
            activities
        });

    } catch (err) {
        console.error('❌ Error fetching card activities:', err);
        res.status(500).json({
            message: 'Error fetching card activities',
            error: err.message
        });
    }
});




// 5. duplicate card
// Endpoint untuk duplikasi card ke list tertentu
app.post('/api/duplicate-card-to-list/:cardId/:listId/:userId/testing', async (req, res) => {
    const { cardId, listId, userId } = req.params; // 🎯 userId dari URL
    const { position } = req.body; // ambil posisi dari body
    const actingUserId = parseInt(userId, 10);

    if (!actingUserId) return res.status(401).json({ error: 'Unauthorized: userId missing' });

    try {
        await client.query('BEGIN');

        // Kalau user pilih posisi, geser posisi lain dulu
        if (position) {
            await client.query(
                `UPDATE public.cards 
                 SET position = position + 1 
                 WHERE list_id = $1 AND position >= $2`,
                [listId, position]
            );
        }

        const result = await client.query(
            `INSERT INTO public.cards (title, description, list_id, position) 
             SELECT title, description, $1, 
                    COALESCE($2, (SELECT COALESCE(MAX(position), 0) + 1 FROM public.cards WHERE list_id = $1))
             FROM public.cards 
             WHERE id = $3 
             RETURNING id, title, list_id`,
            [listId, position, cardId]
        );

        const newCardId = result.rows[0].id;
        const newCardTitle = result.rows[0].title;

        // Salin relasi-relasi card
        await client.query(
            `INSERT INTO public.card_checklists (card_id, checklist_id, created_at, updated_at)
             SELECT $1, checklist_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
             FROM public.card_checklists WHERE card_id = $2`,
            [newCardId, cardId]
        );

        await client.query(
            `INSERT INTO public.card_cover (card_id, cover_id)
             SELECT $1, cover_id FROM public.card_cover WHERE card_id = $2`,
            [newCardId, cardId]
        );

        await client.query(
            `INSERT INTO public.card_descriptions (card_id, description, created_at, updated_at)
             SELECT $1, description, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
             FROM public.card_descriptions WHERE card_id = $2`,
            [newCardId, cardId]
        );

        await client.query(
            `INSERT INTO public.card_due_dates (card_id, due_date, created_at, updated_at)
             SELECT $1, due_date, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
             FROM public.card_due_dates WHERE card_id = $2`,
            [newCardId, cardId]
        );

        await client.query(
            `INSERT INTO public.card_labels (card_id, label_id)
             SELECT $1, label_id FROM public.card_labels WHERE card_id = $2`,
            [newCardId, cardId]
        );

        await client.query(
            `INSERT INTO public.card_members (card_id, user_id)
             SELECT $1, user_id FROM public.card_members WHERE card_id = $2`,
            [newCardId, cardId]
        );

        await client.query(
            `INSERT INTO public.card_priorities (card_id, priority_id)
             SELECT $1, priority_id FROM public.card_priorities WHERE card_id = $2`,
            [newCardId, cardId]
        );

        await client.query(
            `INSERT INTO public.card_status (card_id, status_id, assigned_at)
             SELECT $1, status_id, CURRENT_TIMESTAMP
             FROM public.card_status WHERE card_id = $2`,
            [newCardId, cardId]
        );

        await client.query(
            `INSERT INTO public.card_users (card_id, user_id)
             SELECT $1, user_id FROM public.card_users WHERE card_id = $2`,
            [newCardId, cardId]
        );

        // Ambil username userId
        const userRes = await client.query(
            "SELECT username FROM users WHERE id = $1",
            [actingUserId]
        );
        const userName = userRes.rows[0]?.username || 'Unknown';

        // Ambil info list + board asal dan tujuan
        const oldListRes = await client.query(
            `SELECT l.id AS list_id, l.name AS list_name, b.id AS board_id, b.name AS board_name
             FROM cards c
             JOIN lists l ON c.list_id = l.id
             JOIN boards b ON l.board_id = b.id
             WHERE c.id = $1`,
            [cardId]
        );
        const fromListId = oldListRes.rows[0]?.list_id;
        const fromListName = oldListRes.rows[0]?.list_name || "Unknown List";
        const fromBoardId = oldListRes.rows[0]?.board_id;
        const fromBoardName = oldListRes.rows[0]?.board_name || "Unknown Board";

        const newListRes = await client.query(
            `SELECT l.id AS list_id, l.name AS list_name, b.id AS board_id, b.name AS board_name
             FROM lists l
             JOIN boards b ON l.board_id = b.id
             WHERE l.id = $1`,
            [listId]
        );
        const toListName = newListRes.rows[0]?.list_name || "Unknown List";
        const toBoardId = newListRes.rows[0]?.board_id;
        const toBoardName = newListRes.rows[0]?.board_name || "Unknown Board";

        await client.query('COMMIT');

        // 🔥 Simpan activity langsung ke tabel card_activities
        await client.query(`
      INSERT INTO card_activities 
        (card_id, user_id, action_type, entity, entity_id, action_detail)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
            newCardId,
            actingUserId,
            'duplicate',
            'list',
            listId,
            JSON.stringify({
                cardTitle: newCardTitle,
                fromListId,
                fromListName,
                fromBoardId,
                fromBoardName,
                toListId: listId,
                toListName,
                toBoardId,
                toBoardName,
                position: position || null,
                duplicatedBy: { id: actingUserId, username: userName }
            })
        ]);

        res.status(200).json({
            message: 'Card berhasil diduplikasi',
            cardId: newCardId,
            fromListId,
            fromListName,
            toListId: listId,
            toListName,
            fromBoardId,
            fromBoardName,
            toBoardId,
            toBoardName,
            position: position || null,
            duplicatedBy: { id: actingUserId, username: userName }
        });


    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Duplicate card error:', err); // ini cetak ke log server
        res.status(500).json({ error: err.message, stack: err.stack }); // tampilkan detail error di response
    }
});


// END TESTING ENDPOIN 