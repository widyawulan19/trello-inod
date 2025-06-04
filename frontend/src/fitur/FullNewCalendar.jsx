// import React from 'react'
// import FullCalendar from '@fullcalendar/react';
// import dayGridPlugin from '@fullcalendar/daygrid';
// import interactionPlugin from "@fullcalendar/interaction"; // untuk klik & drag event
// import '@fullcalendar/common/main.css';
// import '@fullcalendar/daygrid/main.css';


// const FullNewCalendar=()=> {
//     const handleDateClick = (info) =>{
//         alert(`Tanggal diklik: ${info.dateStr}`)
//     }

//   return (
//     <div>
//       <h2>Kalender Event</h2>
//       <FullCalendar
//         plugins={[dayGridPlugin, interactionPlugin]}
//         initialView="dayGridMonth"
//         weekends={true}
//         dateClick={handleDateClick}
//         events={[
//           { title: 'Meeting', date: '2025-05-20' },
//           { title: 'Launch Project', date: '2025-05-22' },
//         ]}
//       />
//     </div>
//   )
// }

// export default FullNewCalendar