// import React from "react";
// import ExcelJS from "exceljs";
// import { saveAs } from "file-saver";
// import { getAllDataMarketingJoined } from "../services/ApiServices";
// import "../style/pages/DataMarketing.css";

// const ExportDataMarketing = () => {
//   const handleExport = async () => {
//     try {
//       const response = await getAllDataMarketingJoined();
//       const data = response.data;

//       if (!data || data.length === 0) {
//         alert("❌ Tidak ada data untuk diexport");
//         return;
//       }

//       const workbook = new ExcelJS.Workbook();
//       const worksheet = workbook.addWorksheet("Data Marketing");

//       // 🔹 Kolom sesuai hasil join
//       worksheet.columns = [
//         { header: "No", key: "no", width: 5 },
//         { header: "Input By", key: "input_by_name", width: 20 },
//         { header: "Acc By", key: "acc_by_name", width: 20 },
//         { header: "Buyer Name", key: "buyer_name", width: 25 },
//         { header: "Order Code", key: "code_order", width: 20 },
//         { header: "Order Number", key: "order_number", width: 15 },
//         { header: "Account", key: "account_name", width: 20 },
//         { header: "Deadline", key: "deadline", width: 15 },
//         { header: "Jumlah Revisi", key: "jumlah_revisi", width: 15 },
//         { header: "Order Type", key: "order_type_name", width: 15 },
//         { header: "Offer Type", key: "offer_type_name", width: 15 },
//         { header: "Jenis Track", key: "track_type_name", width: 15 },
//         { header: "Genre", key: "genre_name", width: 15 },
//         { header: "Price Normal", key: "price_normal", width: 15 },
//         { header: "Price Discount", key: "price_discount", width: 15 },
//         { header: "Discount", key: "discount", width: 15 },
//         { header: "Basic Price", key: "basic_price", width: 15 },
//         { header: "Kupon Diskon", key: "kupon_diskon_name", width: 20 },
//         { header: "Gig Link", key: "gig_link", width: 30 },
//         { header: "Required Files", key: "required_files", width: 30 },
//         { header: "Project Type", key: "project_type_name", width: 20 },
//         { header: "Duration", key: "duration", width: 15 },
//         { header: "Reference Link", key: "reference_link", width: 30 },
//         { header: "File & Chat Link", key: "file_and_chat_link", width: 30 },
//         { header: "Detail Project", key: "detail_project", width: 40 },
//         { header: "Accept Status", key: "accept_status_name", width: 20 },
//         { header: "Create At", key: "create_at", width: 20 },
//         { header: "Update At", key: "update_at", width: 20 }
//       ];

//       // 🔹 Isi data ke baris
//       data.forEach((item, index) => {
//         worksheet.addRow({
//           no: index + 1,
//           input_by_name: item.input_by_name,
//           acc_by_name: item.acc_by_name,
//           buyer_name: item.buyer_name,
//           code_order: item.code_order,
//           order_number: item.order_number,
//           account_name: item.account_name,
//           deadline: item.deadline ? new Date(item.deadline).toLocaleDateString() : "-",
//           jumlah_revisi: item.jumlah_revisi,
//           order_type: item.order_type_name,
//           offer_type: item.offer_type_name,
//           jenis_track: item.jenis_track,
//           genre: item.genre_name,
//           price_normal: item.price_normal,
//           price_discount: item.price_discount,
//           discount: item.discount,
//           basic_price: item.basic_price,
//           kupon_diskon_name: item.kupon_diskon_name || "-",
//           gig_link: item.gig_link,
//           required_files: item.required_files,
//           project_type: item.project_type_name,
//           duration: item.duration,
//           reference_link: item.reference_link,
//           file_and_chat_link: item.file_and_chat_link,
//           detail_project: item.detail_project,
//           accept_status_name: item.accept_status_name || "Pending",
//           create_at: item.create_at ? new Date(item.create_at).toLocaleString() : "-",
//           update_at: item.update_at ? new Date(item.update_at).toLocaleString() : "-"
//         });
//       });

//       // 🔹 Styling header
//       worksheet.getRow(1).eachCell((cell) => {
//         cell.fill = {
//           type: "pattern",
//           pattern: "solid",
//           fgColor: { argb: "FF4CAF50" } // hijau
//         };
//         cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
//         cell.alignment = { vertical: "middle", horizontal: "center" };
//         cell.border = {
//           top: { style: "thin" },
//           left: { style: "thin" },
//           bottom: { style: "thin" },
//           right: { style: "thin" }
//         };
//       });

//       // 🔹 Border semua cell
//       worksheet.eachRow((row, rowNumber) => {
//         row.eachCell((cell) => {
//           cell.border = {
//             top: { style: "thin" },
//             left: { style: "thin" },
//             bottom: { style: "thin" },
//             right: { style: "thin" }
//           };
//           if (rowNumber > 1) {
//             cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
//           }
//         });
//       });

//       // 🔹 Save file
//       const buffer = await workbook.xlsx.writeBuffer();
//       saveAs(new Blob([buffer]), "data_marketing_joined.xlsx");

//     } catch (error) {
//       console.error("❌ Gagal export data:", error);
//     }
//   };

//   return (
//     <button onClick={handleExport} className="btn-export">
//       Export Excel
//     </button>
//   );
// };

// export default ExportDataMarketing;


// // Endpoint untuk export data ke Google Sheets
// app.post("/api/export-to-sheet", async (req, res) => {
//     try {
//         const { marketingData } = req.body; // data dari frontend
//         const client = await auth.getClient();
//         const sheets = google.sheets({ version: "v4", auth: client });

//         await sheets.spreadsheets.values.append({
//             spreadsheetId,
//             range: "Sheet1!A:Z", // range sheet yang mau diisi
//             valueInputOption: "RAW",
//             requestBody: {
//                 values: [[
//                     marketingData.buyer_name,
//                     marketingData.code_order,
//                     marketingData.order_number,
//                     marketingData.deadline,
//                     marketingData.project_type_name,
//                 ]],
//             },
//         });

//         res.json({ success: true, message: "✅ Data berhasil masuk ke Google Sheet" });
//     } catch (error) {
//         console.error("❌ Error:", error);
//         res.status(500).json({ success: false, message: "Gagal update Google Sheet" });
//     }
// });


// import React, { useEffect, useState } from "react";
// import { getAllDataMarketingJoined, exportDataMarketingToSheets } from "../services/ApiServices";

// const MarketingDashboard = () => {
//   const [marketingList, setMarketingList] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // Fetch semua data marketing
//   const fetchMarketingData = async () => {
//     try {
//       setLoading(true);
//       const res = await getAllDataMarketingJoined();
//       setMarketingList(res.data);
//     } catch (err) {
//       console.error("❌ Gagal fetch data:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Kirim satu data ke Google Sheets
//   const handleExportToSheet = async (marketingData) => {
//     try {
//       setLoading(true);
//       await exportDataMarketingToSheets({ marketingData }); // pastikan service kirim body { marketingData }
//       alert(`✅ Data "${marketingData.buyer_name}" berhasil dikirim ke Google Sheets`);
//     } catch (err) {
//       console.error("❌ Gagal kirim ke Sheets:", err);
//       alert(`❌ Gagal kirim data "${marketingData.buyer_name}"`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchMarketingData();
//   }, []);

//   return (
//     <div className="container p-4 mx-auto">
//       <h1 className="mb-4 text-2xl font-bold">Marketing Dashboard</h1>

//       {loading && <p>Loading...</p>}

//       <table className="min-w-full border">
//         <thead>
//           <tr>
//             <th className="px-4 py-2 border">Buyer</th>
//             <th className="px-4 py-2 border">Code Order</th>
//             <th className="px-4 py-2 border">Order Number</th>
//             <th className="px-4 py-2 border">Deadline</th>
//             <th className="px-4 py-2 border">Project Type</th>
//             <th className="px-4 py-2 border">Action</th>
//           </tr>
//         </thead>
//         <tbody>
//           {marketingList.map((item) => (
//             <tr key={item.marketing_design_id}>
//               <td className="px-4 py-2 border">{item.buyer_name}</td>
//               <td className="px-4 py-2 border">{item.code_order}</td>
//               <td className="px-4 py-2 border">{item.order_number}</td>
//               <td className="px-4 py-2 border">{item.deadline}</td>
//               <td className="px-4 py-2 border">{item.project_type}</td>
//               <td className="px-4 py-2 border">
//                 <button
//                   className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
//                   onClick={() => handleExportToSheet(item)}
//                 >
//                   Export to Sheets
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default MarketingDashboard;



//        values: [[
//                     marketingData.input_by_name,
//                     marketingData.acc_by_name,
//                     marketingData.buyer_name,
//                     marketingData.code_order,
//                     marketingData.order_number,
//                     marketingData.account_name,
//                     marketingData.Deadline,
//                     marketingData.jumlah_revisi,
//                     marketingData.order_type_name,
//                     marketingData.offer_type_name,
//                     marketingData.jenis_track,
//                     marketingData.genre_name,
//                     marketingData.price_normal,
//                     marketingData.price_discount,
//                     marketingData.discount,
//                     marketingData.basic_price,
//                     marketingData.kupon_diskon_name,
//                     marketingData.gig_link,
//                     marketingData.required_files,
//                     marketingData.project_type_name,
//                     marketingData.duration,
//                     marektingData.reference_link,
//                     marketingData.file_and_chat_link,
//                     marketingData.detail_project,
//                     marketingData.accept_status_name
//                 ]],
//             },
//         });


//         import { useEffect, useState } from "react";
//         import { getAllDataMarketingJoined, exportDataMarketingToSheets } from "../services/ApiServices";
        
//         const ExportDataMarketingExample = () => {
//           const [marketingList, setMarketingList] = useState([]);
//           const [loading, setLoading] = useState(false);
        
//           // Fetch semua data marketing
//           const fetchMarketingData = async () => {
//             try {
//               setLoading(true);
//               const res = await getAllDataMarketingJoined();
//               setMarketingList(res.data);
//             } catch (err) {
//               console.error("❌ Gagal fetch data:", err);
//             } finally {
//               setLoading(false);
//             }
//           };
        
//           // Kirim satu data ke Google Sheets
//           const handleExportToSheet = async (marketingData) => {
//             try {
//               setLoading(true);
        
//               // Map data sesuai dengan urutan kolom di Google Sheets
//               const sheetData = {
//                 input_by_name: marketingData.input_by_name,
//                 acc_by_name: marketingData.acc_by_name,
//                 buyer_name: marketingData.buyer_name,
//                 code_order: marketingData.code_order,
//                 order_number: marketingData.order_number,
//                 account_name: marketingData.account_name,
//                 Deadline: marketingData.Deadline,
//                 jumlah_revisi: marketingData.jumlah_revisi,
//                 order_type_name: marketingData.order_type_name,
//                 offer_type_name: marketingData.offer_type_name,
//                 jenis_track: marketingData.jenis_track,
//                 genre_name: marketingData.genre_name,
//                 price_normal: marketingData.price_normal,
//                 price_discount: marketingData.price_discount,
//                 discount: marketingData.discount,
//                 basic_price: marketingData.basic_price,
//                 kupon_diskon_name: marketingData.kupon_diskon_name,
//                 gig_link: marketingData.gig_link,
//                 required_files: marketingData.required_files,
//                 project_type_name: marketingData.project_type_name,
//                 duration: marketingData.duration,
//                 reference_link: marketingData.reference_link,
//                 file_and_chat_link: marketingData.file_and_chat_link,
//                 detail_project: marketingData.detail_project,
//                 accept_status_name: marketingData.accept_status_name,
//               };
        
//               await exportDataMarketingToSheets(sheetData);
//               alert(`✅ Data "${marketingData.buyer_name}" berhasil dikirim ke Google Sheets`);
//             } catch (err) {
//               console.error("❌ Gagal kirim ke Sheets:", err);
//               alert(`❌ Gagal kirim data "${marketingData.buyer_name}"`);
//             } finally {
//               setLoading(false);
//             }
//           };
        
//           useEffect(() => {
//             fetchMarketingData();
//           }, []);
        
//           return (
//             <div className="container p-4 mx-auto" style={{border:'1px solid red', overflowX:'auto'}}>
//               <h1 className="mb-4 text-2xl font-bold">Marketing Dashboard</h1>
        
//               {loading && <p>Loading...</p>}
        
//               <table className="min-w-full border">
//                 <thead>
//                   <tr>
//                     <th className="px-4 py-2 border">Input By</th>
//                     <th className="px-4 py-2 border">Acc By</th>
//                     <th className="px-4 py-2 border">Buyer Name</th>
//                     <th className="px-4 py-2 border">Code Order</th>
//                     <th className="px-4 py-2 border">Order Number</th>
//                     <th className="px-4 py-2 border">Account</th>
//                     <th className="px-4 py-2 border">Deadline</th>
//                     <th className="px-4 py-2 border">Revisi</th>
//                     <th className="px-4 py-2 border">Order Type</th>
//                     <th className="px-4 py-2 border">Offer Type</th>
//                     <th className="px-4 py-2 border">Jenis Track</th>
//                     <th className="px-4 py-2 border">Genre</th>
//                     <th className="px-4 py-2 border">Price Normal</th>
//                     <th className="px-4 py-2 border">Price Discount</th>
//                     <th className="px-4 py-2 border">Discount</th>
//                     <th className="px-4 py-2 border">Basic Price</th>
//                     <th className="px-4 py-2 border">Kupon Diskon</th>
//                     <th className="px-4 py-2 border">Gig Link</th>
//                     <th className="px-4 py-2 border">Required Files</th>
//                     <th className="px-4 py-2 border">Project Type</th>
//                     <th className="px-4 py-2 border">Duration</th>
//                     <th className="px-4 py-2 border">Reference Link</th>
//                     <th className="px-4 py-2 border">File & Chat Link</th>
//                     <th className="px-4 py-2 border">Detail Project</th>
//                     <th className="px-4 py-2 border">Status</th>
//                     <th className="px-4 py-2 border">Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {marketingList.map((item) => (
//                     <tr key={item.marketing_design_id}>
//                       <td className="px-4 py-2 border">{item.input_by_name}</td>
//                       <td className="px-4 py-2 border">{item.acc_by_name}</td>
//                       <td className="px-4 py-2 border">{item.buyer_name}</td>
//                       <td className="px-4 py-2 border">{item.code_order}</td>
//                       <td className="px-4 py-2 border">{item.order_number}</td>
//                       <td className="px-4 py-2 border">{item.account_name}</td>
//                       <td className="px-4 py-2 border">{item.Deadline}</td>
//                       <td className="px-4 py-2 border">{item.jumlah_revisi}</td>
//                       <td className="px-4 py-2 border">{item.order_type_name}</td>
//                       <td className="px-4 py-2 border">{item.offer_type_name}</td>
//                       <td className="px-4 py-2 border">{item.jenis_track}</td>
//                       <td className="px-4 py-2 border">{item.genre_name}</td>
//                       <td className="px-4 py-2 border">{item.price_normal}</td>
//                       <td className="px-4 py-2 border">{item.price_discount}</td>
//                       <td className="px-4 py-2 border">{item.discount}</td>
//                       <td className="px-4 py-2 border">{item.basic_price}</td>
//                       <td className="px-4 py-2 border">{item.kupon_diskon_name}</td>
//                       <td className="px-4 py-2 border">{item.gig_link}</td>
//                       <td className="px-4 py-2 border">{item.required_files}</td>
//                       <td className="px-4 py-2 border">{item.project_type_name}</td>
//                       <td className="px-4 py-2 border">{item.duration}</td>
//                       <td className="px-4 py-2 border">{item.reference_link}</td>
//                       <td className="px-4 py-2 border">{item.file_and_chat_link}</td>
//                       <td className="px-4 py-2 border">{item.detail_project}</td>
//                       <td className="px-4 py-2 border">{item.accept_status_name}</td>
//                       <td className="px-4 py-2 border">
//                         <button
//                           className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
//                           onClick={() => handleExportToSheet(item)}
//                         >
//                           Export to Sheets
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           );
//         };
        
//         export default ExportDataMarketingExample;
        



// import React, { useEffect, useState } from "react";
// import { getAllMarketing, getAllMarketingExports } from "./services/marketingService";
// import { exportMarketing } from "./services/marketingExportService";

// const MarketingList = () => {
//   const [marketingList, setMarketingList] = useState([]);
//   const [marketingExports, setMarketingExports] = useState([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const marketing = await getAllMarketing();
//       const exportsData = await getAllMarketingExports();
//       setMarketingList(marketing);
//       setMarketingExports(exportsData);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleTransfile = async (marketingId) => {
//     try {
//       await exportMarketing(marketingId);
//       // Update state marketingExports supaya tombol langsung berubah
//       setMarketingExports((prev) => [...prev, { marketing_id: marketingId }]);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   if (loading) return <p>Loading...</p>;

//   return (
//     <div>
//       <h2>Marketing List</h2>
//       <ul>
//         {marketingList.map((m) => {
//           const exported = isExported(m.id, marketingExports);
//           return (
//             <li key={m.id} style={{ marginBottom: "10px" }}>
//               {m.buyer_name} ({m.code_order})
//               <button
//                 onClick={() => !exported && handleTransfile(m.id)}
//                 disabled={exported}
//                 style={{
//                   marginLeft: "10px",
//                   backgroundColor: exported ? "gray" : "blue",
//                   color: "white",
//                   cursor: exported ? "not-allowed" : "pointer",
//                 }}
//               >
//                 {exported ? "Sudah Transfile" : "Belum Transfile"}
//               </button>
//             </li>
//           );
//         })}
//       </ul>
//     </div>
//   );
// };

// export default MarketingList;


// import React, { useState, useEffect } from "react";
// import { getAllMarketingExports } from "./services/marketingService";

// const DetailMarketing = ({ dataMarketings, marketingId, handleExportToSheets }) => {
//   const [marketingTransfile, setMarketingTransfile] = useState([]);
//   const [isExported, setIsExported] = useState(false);
//   const [loading, setLoading] = useState(false);

//   // Ambil data marketing_exports saat mount
//   const fetchDataTransfile = async () => {
//     try {
//       setLoading(true);
//       const response = await getAllMarketingExports();
//       setMarketingTransfile(response);
//       // cek apakah marketingId sudah ada di export
//       const exported = response.some((m) => m.marketing_id === marketingId);
//       setIsExported(exported);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchDataTransfile();
//   }, [marketingId]);

//   // handle tombol klik
//   const handleClick = async () => {
//     await handleExportToSheets(marketingId);
//     // setelah berhasil, set status exported true
//     setIsExported(true);
//   };

//   return (
//     <div className="view-dm-container">
//       <div className="vdm-header">
//         <div className="vdm-left">
//           <h4>DETAIL DATA MARKETING</h4>
//           {dataMarketings.genre} | {dataMarketings.buyer_name} | {dataMarketings.account} | {getLastFiveCodeOrder(dataMarketings.code_order)}
//         </div>
//         <div className="vdm-right">
//           <div className="export" style={{ marginRight: "5px" }}>
//             <button
//               onClick={handleClick}
//               disabled={isExported} // disable jika sudah di-transfile
//               style={{
//                 backgroundColor: isExported ? "gray" : "blue",
//                 color: "white",
//                 cursor: isExported ? "not-allowed" : "pointer",
//               }}
//             >
//               {isExported ? "Sudah Transfile" : "Transfile to SpreedSheets"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DetailMarketing;


// <CardDescriptionExample
//   card={cards}
//   cardId={cardId}
//   onClose={handleCloseModalDes}
//   handleSaveDescription={handleSaveDescription}
//   loading={loading}
//   setLoading={setLoading}
//   editingDescription={editingDescription}   // ✅ teruskan
//   setEditingDescription={setEditingDescription} // ✅ teruskan
//   newDescription={newDescription}           // ✅ teruskan
//   setNewDescription={setNewDescription}     // ✅ teruskan
//   showMore={showMore}
//   setShowMore={setShowMore}
//   linkify={linkify}
//   handleEditDescription={handleEditDescription}
//   maxChars={maxChars}
//   modules={modules}
// />