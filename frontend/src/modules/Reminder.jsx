// import React, { useState, useEffect } from 'react'
// import { getDueDateByCardId,updateDueDate,createDueDate } from '../services/ApiServices';
// import DatePicker from 'react-datepicker';
// import "react-datepicker/dist/react-datepicker.css";

// const Reminder=({cardId})=> {
//     const [dueDate, setDueDate] = useState(null);

//       // Ambil due date berdasarkan cardId
//       useEffect(() => {
//         const fetchDueDate = async () => {
//           try {
//             const response = await getDueDateByCardId(cardId);
//             if (response.data.length > 0) {
//               setDueDate(new Date(response.data[0].due_date)); // Ambil due_date pertama dari card
//             } else {
//               setDueDate(null); // Tidak ada due date
//             }
//           } catch (error) {
//             console.error("Failed to fetch due date", error);
//           }
//         };
//         fetchDueDate();
//       }, [cardId]);

//         // Handle perubahan due date
//         const handleDateChange = async (date) => {
//             setDueDate(date);
          
//             const formattedDate = date.toISOString(); // Convert to ISO string format
          
//             try {
//               if (dueDate) {
//                 // Jika sudah ada due date, update
//                 await updateDueDate(dueDate.id, { due_date: formattedDate });
//               } else {
//                 // Jika belum ada due date, buat yang baru
//                 await createDueDate({ card_id: cardId, due_date: formattedDate });
//               }
//             } catch (error) {
//               console.error("Failed to save due date: " , error);
//             }
//           };
          

//   return (
//     <div>
//          <h3>Due Date for Card {cardId}</h3>
//          <DatePicker
//             selected={dueDate}
//             onChange={handleDateChange}
//             showTimeSelect
//             dateFormat="Pp"
//             placeholderText="Select Due Date"
//          />
//     </div>
//   )
// }

// export default Reminder