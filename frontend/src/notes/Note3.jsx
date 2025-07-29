// context/UserContext.jsx
import { createContext, useContext, useState } from "react";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // null saat belum login

  const login = (userData) => setUser(userData);
  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};


// login 
import { useState } from "react";
import { loginUser } from "../api/auth";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const { login } = useUser();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await loginUser(form);
      localStorage.setItem("token", res.data.token); // simpan token
      login(res.data.user); // simpan user ke context
      navigate("/dashboard"); // redirect setelah login
    } catch (err) {
      setError(err.response?.data?.message || "Login gagal");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;

<>
<input 
    type="text" 
    placeholder='Email'
    value={email}
    onChange={(e) => setEmail(e.target.value)}
/>
<input 
    type="password" 
    placeholder='Password'
    value={password}
    onChange={(e) => setPassword(e.target.value)}
/>


<div className="btn-login" onClick={handleLogin}>
    Login
</div>
</>