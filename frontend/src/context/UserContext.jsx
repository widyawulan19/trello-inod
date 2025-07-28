import React, { createContext, useContext, useState } from "react";

// 1. Create the context
const UserContext = createContext();

// 2. Custom hook
export const useUser = () => useContext(UserContext);

// 3. Provider
export const UserProvider = ({ children }) => {
  // 4. Define initial user (karena belum ada login, kita hardcode)
  const [user, setUser] = useState({
    id: 3,
    username: "Anandra Doe",
    email: "anandra12@example.com",
  });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};



// jika menggunakan login pakai ini 
// // context/UserContext.jsx
// import { createContext, useContext, useState } from "react";

// const UserContext = createContext();

// export const useUser = () => useContext(UserContext);

// export const UserProvider = ({ children }) => {
//   const [user, setUser] = useState(null); // null saat belum login

//   const login = (userData) => setUser(userData);
//   const logout = () => {
//     setUser(null);
//     localStorage.removeItem("token");
//   };

//   return (
//     <UserContext.Provider value={{ user, login, logout }}>
//       {children}
//     </UserContext.Provider>
//   );
// };
