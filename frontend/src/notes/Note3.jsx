

// import React, { useEffect, useState } from 'react';
// import {
//   getMarketingDesignCounter,
//   updateMarketingDesignCounter,
// } from '../services/ApiServices';
// import '../style/MarketingDesignCounter.css'; // opsional, buat styling nanti

// function MarketingDesignCounter() {
//   const [counter, setCounter] = useState(null);
//   const [orderNumber, setOrderNumber] = useState('');
//   const [projectNumber, setProjectNumber] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState('');

//   // ✅ Ambil data saat komponen pertama kali load
//   useEffect(() => {
//     fetchCounter();
//   }, []);

//   const fetchCounter = async () => {
//     setLoading(true);
//     try {
//       const data = await getMarketingDesignCounter();
//       setCounter(data);
//       setOrderNumber(data.current_order_number);
//       setProjectNumber(data.current_project_number);
//     } catch (err) {
//       console.error(err);
//       setMessage('Gagal memuat data counter 😢');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ Handle update counter
//   const handleUpdate = async () => {
//     if (!orderNumber || !projectNumber) {
//       return setMessage('Isi dulu semua kolom ya bestie 😚');
//     }

//     setLoading(true);
//     try {
//       const result = await updateMarketingDesignCounter({
//         current_order_number: Number(orderNumber),
//         current_project_number: Number(projectNumber),
//       });
//       setMessage(result.message || 'Counter berhasil diupdate ✅');
//       setCounter(result.data);
//     } catch (err) {
//       console.error(err);
//       setMessage('Gagal update counter 😭');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="counter-container">
      
      

//       {loading && <p>Loading...</p>}

//       {counter && (
//         <div className="counter-info">
//           <p><strong>Counter Name:</strong> {counter.counter_name}</p>
//           <p><strong>Order Number:</strong> {counter.current_order_number}</p>
//           <p><strong>Project Number:</strong> {counter.current_project_number}</p>
//           <p><em>Last Updated:</em> {new Date(counter.last_updated).toLocaleString()}</p>
//         </div>
//       )}

//       <div className="counter-form">
//         <label>Order Number</label>
//         <input
//           type="number"
//           value={orderNumber}
//           onChange={(e) => setOrderNumber(e.target.value)}
//         />

//         <label>Project Number</label>
//         <input
//           type="number"
//           value={projectNumber}
//           onChange={(e) => setProjectNumber(e.target.value)}
//         />

//         <button onClick={handleUpdate} disabled={loading}>
//           {loading ? 'Updating...' : 'Update Counter'}
//         </button>
//       </div>

//       {message && <p className="counter-message">{message}</p>}
//     </div>
//   );
// }

// export default MarketingDesignCounter;
// <div className="counter-card">
//   <h2 className="title">📊 Counter Marketing Design</h2>

//   <div className="counter-info">
//     <p><strong>Counter Name:</strong> marketing_design</p>
//     <p><strong>Order Number:</strong> {counter.current_order_number}</p>
//     <p><strong>Project Number:</strong> {counter.current_project_number}</p>
//     <p className="updated"><em>Last Updated:</em> {new Date(counter.last_updated).toLocaleString()}</p>
//   </div>

//   <form onSubmit={handleUpdateCounter} className="counter-form">
//     <div className="form-group">
//       <label htmlFor="orderNumber">Order Number</label>
//       <input
//         type="number"
//         id="orderNumber"
//         value={orderNumber}
//         onChange={(e) => setOrderNumber(e.target.value)}
//       />
//     </div>

//     <div className="form-group">
//       <label htmlFor="projectNumber">Project Number</label>
//       <input
//         type="number"
//         id="projectNumber"
//         value={projectNumber}
//         onChange={(e) => setProjectNumber(e.target.value)}
//       />
//     </div>

//     <button type="submit" disabled={loading} className="update-btn">
//       {loading ? 'Updating...' : 'Update Counter'}
//     </button>
//   </form>
// </div>


// import React, { useEffect } from 'react';
// import { useNavigate, useLocation, useParams } from 'react-router-dom';
// import '../style/pages/BoardList.css'; // misal style kamu di sini

// const BoardList = ({ lists }) => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { workspaceId, boardId } = useParams();

//   // 🧠 Ambil posisi scroll tersimpan (kalau ada)
//   useEffect(() => {
//     const container = document.querySelector('.board-scroll-container');
//     if (!container) return;

//     const savedScroll = sessionStorage.getItem('boardScroll');
//     if (savedScroll) {
//       container.scrollLeft = parseInt(savedScroll, 10);
//     }
//   }, []);

//   // 🔥 Simpan posisi scroll sebelum pindah ke Card Detail
//   const handleNavigateToCard = (listId, cardId) => {
//     const container = document.querySelector('.board-scroll-container');
//     if (container) {
//       sessionStorage.setItem('boardScroll', container.scrollLeft);
//     }
//     navigate(`/layout/workspaces/${workspaceId}/board/${boardId}/lists/${listId}/cards/${cardId}`);
//   };

//   return (
//     <div className="board-scroll-container">
//       {lists.map((list) => (
//         <div key={list.id} className="list-container">
//           <h3>{list.title}</h3>
//           {list.cards.map((card) => (
//             <div
//               key={card.id}
//               className="card-item"
//               onClick={() => handleNavigateToCard(list.id, card.id)}
//             >
//               {card.title}
//             </div>
//           ))}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default BoardList;
