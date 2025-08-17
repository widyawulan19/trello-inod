//REGISTER
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