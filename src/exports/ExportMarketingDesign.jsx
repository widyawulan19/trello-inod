import React from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { getAllDataMarketingDesign, getAllMarketingDesignJoined } from "../services/ApiServices";
import "../style/pages/MarketingDesign.css";

const ExportMarketingDesign = () => {
  const handleExport = async () => {
    try {
      const response = await getAllMarketingDesignJoined();
      const data = response.data;

      if (!data || data.length === 0) {
        alert("❌ Tidak ada data untuk diexport");
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Marketing Design");

      // 🔹 Definisikan kolom sesuai struktur database
      worksheet.columns = [
        { header: "No", key: "no", width: 5 },
        { header: "Input By", key: "input_by_name", width: 20 },
        { header: "Acc By", key: "acc_by_name", width: 20 },
        { header: "Buyer Name", key: "buyer_name", width: 25 },
        { header: "Order Code", key: "code_order", width: 20 },
        { header: "Order Number", key: "order_number", width: 15 },
        { header: "Account", key: "account_name", width: 20 },
        { header: "Deadline", key: "deadline", width: 15 },
        { header: "Jumlah Design", key: "jumlah_design", width: 15 },
        { header: "Jumlah Revisi", key: "jumlah_revisi", width: 15 },
        { header: "Order Type", key: "order_type_name", width: 15 },
        { header: "Offer Type", key: "offer_type_name", width: 15 },
        { header: "Style", key: "style_name", width: 20 },
        { header: "Resolution", key: "resolution", width: 20 },
        { header: "Price Normal", key: "price_normal", width: 15 },
        { header: "Price Discount", key: "price_discount", width: 15 },
        { header: "Discount %", key: "discount_percentage", width: 15 },
        { header: "Required Files", key: "required_files", width: 30 },
        { header: "Project Type", key: "project_type_name", width: 25 },
        // { header: "Duration", key: "duration", width: 15 },
        { header: "Reference", key: "reference", width: 25 },
        { header: "File & Chat", key: "file_and_chat", width: 35 },
        { header: "Detail Project", key: "detail_project", width: 50 },
        { header: "Created At", key: "create_at", width: 20 },
        { header: "Updated At", key: "update_at", width: 20 },
        { header: "Is Accepted", key: "is_accepted", width: 15 }
      ];

      // 🔹 Tambahkan data
      data.forEach((item, index) => {
        worksheet.addRow({
          no: index + 1,
          input_by_name: item.input_by_name,
          acc_by_name: item.acc_by_name,
          buyer_name: item.buyer_name,
          code_order: item.code_order,
          order_number: item.order_number,
          account_name: item.account_name,
          deadline: item.deadline ? new Date(item.deadline).toLocaleDateString() : "-",
          jumlah_design: item.jumlah_design,
          jumlah_revisi: item.jumlah_revisi,
          order_type_name: item.order_type_name,
          offer_type_name: item.offer_type_name,
          style_name: item.style_name,
          resolution: item.resolution,
          price_normal: item.price_normal,
          price_discount: item.price_discount,
          discount_percentage: item.discount_percentage,
          required_files: item.required_files,
          project_type_name: item.project_type_name,
          // duration: item.duration,
          reference: item.reference,
          file_and_chat: item.file_and_chat,
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
          fgColor: { argb: "FF2196F3" } // biru
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

      // 🔹 Border semua cell
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

      // 🔹 Generate file
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), "marketing_design.xlsx");
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

export default ExportMarketingDesign;
