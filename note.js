//register user
app.post("/api/auth/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await client.query(
      `INSERT INTO users (username, email, password)
       VALUES ($1, $2, $3) RETURNING id, username, email`,
      [username, email, hashedPassword]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Error registering user", error: err });
  }
});


// LOGIN 
import jwt from "jsonwebtoken";

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await client.query(`SELECT * FROM users WHERE email = $1`, [email]);
    if (user.rows.length === 0) return res.status(401).json({ message: "Invalid email" });

    const validPass = await bcrypt.compare(password, user.rows[0].password);
    if (!validPass) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user.rows[0].id, username: user.rows[0].username, email: user.rows[0].email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, user: { id: user.rows[0].id, username: user.rows[0].username, email: user.rows[0].email } });
  } catch (err) {
    res.status(500).json({ message: "Error logging in", error: err });
  }
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

// contoh penggunaannya 
app.get("/api/auth/me", verifyToken, (req, res) => {
  res.json({ message: `Hello ${req.user.username}`, user: req.user });
});


const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your.email@gmail.com", // ganti dengan emailmu
    pass: "your_app_password",    // gunakan App Password (bukan password biasa)
  },
});


const crypto = require("crypto");
const nodemailer = require("nodemailer");

// buat transporter seperti di atas dulu ya

app.post("/api/auth/request-reset", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await client.query(`SELECT * FROM users WHERE email = $1`, [email]);
    if (user.rows.length === 0) {
      return res.status(404).json({ message: "Email not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 3600000); // 1 jam

    await client.query(
      `UPDATE users SET password_reset_token = $1, password_reset_expires = $2 WHERE email = $3`,
      [resetToken, resetExpires, email]
    );

    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

    // Kirim email
    const mailOptions = {
      from: "your.email@gmail.com",
      to: email,
      subject: "Password Reset",
      html: `<p>Kamu meminta reset password. Klik link berikut untuk reset:</p>
             <a href="${resetLink}">${resetLink}</a>
             <p>Link berlaku selama 1 jam.</p>`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Reset link has been sent to your email" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error requesting password reset" });
  }
});



// new register 
app.post("/api/auth/register", async (req, res) => {
  const { username, email, password, security_question, security_answer } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const userResult = await client.query(
      `INSERT INTO users (username, email, password, security_question, security_answer)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, username, email, security_question`,
      [username, email, hashedPassword, security_question, security_answer]
    );

    const userId = userResult.rows[0].id;

    // ✅ Insert default profil (misalnya profil ID 1)
    await client.query(
      `INSERT INTO user_profil (user_id, profil_id)
       VALUES ($1, $2)`,
      [userId, 1]
    );

    // ✅ Insert default data ke user_data
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


app.post("/api/auth/register", async (req, res) => {
  const { username, email, password, security_question, security_answer } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedSecurityAnswer = await bcrypt.hash(security_answer, 10);

    const userResult = await client.query(
      `INSERT INTO users (username, email, password, security_question, security_answer)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, username, email, security_question`,
      [username, email, hashedPassword, security_question, hashedSecurityAnswer]
    );

    const userId = userResult.rows[0].id;

    await client.query(
      `INSERT INTO user_profil (user_id, profil_id)
       VALUES ($1, $2)`,
      [userId, 1]
    );

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
    console.error("Error during registration:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/auth/register", async (req, res) => {
  const { username, email, password, security_question, security_answer } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedSecurityAnswer = await bcrypt.hash(security_answer, 10); // ini yang disimpan

    const userResult = await client.query(
      `INSERT INTO users (username, email, password, security_question, security_answer_hash)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, username, email, security_question`,
      [username, email, hashedPassword, security_question, hashedSecurityAnswer]
    );

    const userId = userResult.rows[0].id;

    await client.query(
      `INSERT INTO user_profil (user_id, profil_id)
       VALUES ($1, $2)`,
      [userId, 1]
    );

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
    console.error("Error during registration:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});


// REGISTER
app.post("/api/auth/register", async (req, res) => {
  const { username, email, password, security_question, security_answer } = req.body;

  try {
    // Hash password dan security_answer
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedSecurityAnswer = await bcrypt.hash(security_answer, 10);

    // Simpan ke tabel users
    const result = await client.query(
      `INSERT INTO users (username, email, password, security_question, security_answer_hash)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, username, email, security_question`,
      [username, email, hashedPassword, security_question, hashedSecurityAnswer]
    );

    res.status(201).json({
      message: "User registered successfully",
      user: result.rows[0]
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});




// /api/user-setting/:userId
app.put('/api/user-setting/:userId', async (req, res) => {
  const { userId } = req.params;
  const {
    username,
    email,
    name,
    nomor_wa,
    divisi,
    jabatan,
    photo_url,
  } = req.body;

  try {
    await client.query('BEGIN');

    // Update tabel users
    await client.query(
      `UPDATE users 
       SET username = $1, email = $2, photo_url = $3 
       WHERE id = $4`,
      [username, email, photo_url, userId]
    );

    // Update tabel user_data
    await client.query(
      `UPDATE user_data 
       SET name = $1, nomor_wa = $2, divisi = $3, jabatan = $4 
       WHERE user_id = $5`,
      [name, nomor_wa, divisi, jabatan, userId]
    );

    await client.query('COMMIT');
    res.status(200).json({ message: 'User setting updated successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating user setting:', error);
    res.status(500).json({ message: 'Failed to update user setting' });
  }
});
