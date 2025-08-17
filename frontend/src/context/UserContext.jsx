// import React, { createContext, useContext, useState } from "react";

// // 1. Create the context
// const UserContext = createContext();

// // 2. Custom hook
// export const useUser = () => useContext(UserContext);

// // 3. Provider
// export const UserProvider = ({ children }) => {
//   // 4. Define initial user (karena belum ada login, kita hardcode)
//   const [user, setUser] = useState({
//     id: 3,
//     username: "Anandra Doe",
//     email: "anandra12@example.com",
//   });

//   return (
//     <UserContext.Provider value={{ user, setUser }}>
//       {children}
//     </UserContext.Provider>
//   );
// };



// jika menggunakan login pakai ini 
// UserContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // awalnya null

  useEffect(() => {
    // Cek localStorage jika user sudah login
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
