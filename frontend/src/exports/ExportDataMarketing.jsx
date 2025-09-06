import React from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { getAllDataMarketing } from "../services/ApiServices";
import "../style/pages/DataMarketing.css";

const ExportDataMarketing = () => {
  const handleExport = async () => {
    try {
      const response = await getAllDataMarketing();
      const data = response.data;

      if (!data || data.length === 0) {
        alert("❌ Tidak ada data untuk diexport");
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Data Marketing");

      // 🔹 Definisikan kolom sesuai field di database
      worksheet.columns = [
        { header: "No", key: "no", width: 5 },
        { header: "Input By", key: "input_by", width: 20 },
        { header: "Acc By", key: "acc_by", width: 20 },
        { header: "Buyer Name", key: "buyer_name", width: 25 },
        { header: "Order Code", key: "code_order", width: 20 },
        { header: "Order Number", key: "order_number", width: 15 },
        { header: "Account", key: "account", width: 20 },
        { header: "Deadline", key: "deadline", width: 15 },
        { header: "Jumlah Revisi", key: "jumlah_revisi", width: 15 },
        { header: "Order Type", key: "order_type", width: 15 },
        { header: "Offer Type", key: "offer_type", width: 15 },
        { header: "Jenis Track", key: "jenis_track", width: 15 },
        { header: "Genre", key: "genre", width: 15 },
        { header: "Price Normal", key: "price_normal", width: 15 },
        { header: "Price Discount", key: "price_discount", width: 15 },
        { header: "Discount", key: "discount", width: 15 },
        { header: "Basic Price", key: "basic_price", width: 15 },
        { header: "Gig Link", key: "gig_link", width: 30 },
        { header: "Required Files", key: "required_files", width: 30 },
        { header: "Project Type", key: "project_type", width: 20 },
        { header: "Duration", key: "duration", width: 15 },
        { header: "Reference Link", key: "reference_link", width: 30 },
        { header: "File & Chat Link", key: "file_and_chat_link", width: 30 },
        { header: "Detail Project", key: "detail_project", width: 40 },
        { header: "Create At", key: "create_at", width: 20 },
        { header: "Update At", key: "update_at", width: 20 },
        { header: "Is Accepted", key: "is_accepted", width: 15 }
      ];

      // 🔹 Isi data ke baris
      data.forEach((item, index) => {
        worksheet.addRow({
          no: index + 1,
          input_by: item.input_by,
          acc_by: item.acc_by,
          buyer_name: item.buyer_name,
          code_order: item.code_order,
          order_number: item.order_number,
          account: item.account,
          deadline: item.deadline ? new Date(item.deadline).toLocaleDateString() : "-",
          jumlah_revisi: item.jumlah_revisi,
          order_type: item.order_type,
          offer_type: item.offer_type,
          jenis_track: item.jenis_track,
          genre: item.genre,
          price_normal: item.price_normal,
          price_discount: item.price_discount,
          discount: item.discount,
          basic_price: item.basic_price,
          gig_link: item.gig_link,
          required_files: item.required_files,
          project_type: item.project_type,
          duration: item.duration,
          reference_link: item.reference_link,
          file_and_chat_link: item.file_and_chat_link,
          detail_project: item.detail_project,
          create_at: item.create_at ? new Date(item.create_at).toLocaleString() : "-",
          update_at: item.update_at ? new Date(item.update_at).toLocaleString() : "-",
          is_accepted: item.is_accepted ? "Yes" : "No"
        });
      });

      // 🔹 Styling header
      worksheet.getRow(1).eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF4CAF50" } // hijau
        };
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } }; // putih
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" }
        };
      });

      // 🔹 Border untuk semua cell
      worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" }
          };
          if (rowNumber > 1) {
            cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
          }
        });
      });

      // 🔹 Generate dan save file
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), "data_marketing.xlsx");

    } catch (error) {
      console.error("❌ Gagal export data:", error);
    }
  };

  return (
    <button onClick={handleExport} className="btn-export">
      Export Excel
    </button>
  );
};

export default ExportDataMarketing;
