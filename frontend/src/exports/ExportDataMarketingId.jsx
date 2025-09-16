import React from 'react'
import ExcelJs from "exceljs"
import { saveAs } from 'file-saver'
import { getAllDataMarketingJoinedById } from '../services/ApiServices'
import { useSnackbar } from '../context/Snackbar'
import '../style/pages/DataMarketing.css'

const ExportDataMarketingId = ({ marketingId }) => {
  const { showSnackbar } = useSnackbar();

  //DEBUG
  console.log('data marketingId diterima di halaman export data marketing:', marketingId)

  const handleExport = async () => {
    try {
      const response = await getAllDataMarketingJoinedById(marketingId);
      let rawData = response.data;

      console.log("Raw export data:", rawData);

      // 🔹 Pastikan selalu dalam bentuk array
      if (!Array.isArray(rawData)) {
        rawData = rawData ? [rawData] : [];
      }

      if (rawData.length === 0) {
        showSnackbar('Tidak ada data yang ditemukan untuk diexport!', 'error');
        return;
      }

      const workbook = new ExcelJs.Workbook();
      const worksheet = workbook.addWorksheet("Data Marketing");

      // 🔹 Kolom sesuai hasil join
      worksheet.columns = [
        { header: "No", key: "no", width: 5 },
        { header: "Input By", key: "input_by_name", width: 20 },
        { header: "Acc By", key: "acc_by_name", width: 20 },
        { header: "Buyer Name", key: "buyer_name", width: 25 },
        { header: "Order Code", key: "code_order", width: 20 },
        { header: "Order Number", key: "order_number", width: 15 },
        { header: "Account", key: "account_name", width: 20 },
        { header: "Deadline", key: "deadline", width: 15 },
        { header: "Jumlah Revisi", key: "jumlah_revisi", width: 15 },
        { header: "Order Type", key: "order_type_name", width: 15 },
        { header: "Offer Type", key: "offer_type_name", width: 15 },
        { header: "Jenis Track", key: "track_type_name", width: 15 },
        { header: "Genre", key: "genre_name", width: 15 },
        { header: "Price Normal", key: "price_normal", width: 15 },
        { header: "Price Discount", key: "price_discount", width: 15 },
        { header: "Discount", key: "discount", width: 15 },
        { header: "Basic Price", key: "basic_price", width: 15 },
        { header: "Kupon Diskon", key: "kupon_diskon_name", width: 20 },
        { header: "Gig Link", key: "gig_link", width: 30 },
        { header: "Required Files", key: "required_files", width: 30 },
        { header: "Project Type", key: "project_type_name", width: 20 },
        { header: "Duration", key: "duration", width: 15 },
        { header: "Reference Link", key: "reference_link", width: 30 },
        { header: "File & Chat Link", key: "file_and_chat_link", width: 30 },
        { header: "Detail Project", key: "detail_project", width: 40 },
        { header: "Accept Status", key: "accept_status_name", width: 20 },
        { header: "Create At", key: "create_at", width: 20 },
        { header: "Update At", key: "update_at", width: 20 }
      ];

      // 🔹 Isi data ke baris
      rawData.forEach((item, index) => {
        worksheet.addRow({
          no: index + 1,
          input_by_name: item.input_by_name,
          acc_by_name: item.acc_by_name,
          buyer_name: item.buyer_name,
          code_order: item.code_order,
          order_number: item.order_number,
          account_name: item.account_name,
          deadline: item.deadline ? new Date(item.deadline).toLocaleDateString() : "-",
          jumlah_revisi: item.jumlah_revisi,
          order_type_name: item.order_type_name,
          offer_type_name: item.offer_type_name,
          track_type_name: item.track_type_name || "-", // ✅ pakai field dari hasil join
          genre_name: item.genre_name,
          price_normal: item.price_normal,
          price_discount: item.price_discount,
          discount: item.discount,
          basic_price: item.basic_price,
          kupon_diskon_name: item.kupon_diskon_name || "-",
          gig_link: item.gig_link,
          required_files: item.required_files,
          project_type_name: item.project_type_name,
          duration: item.duration,
          reference_link: item.reference_link,
          file_and_chat_link: item.file_and_chat_link,
          detail_project: item.detail_project,
          accept_status_name: item.accept_status_name || "Pending",
          create_at: item.create_at ? new Date(item.create_at).toLocaleString() : "-",
          update_at: item.update_at ? new Date(item.update_at).toLocaleString() : "-"
        });
      });

      // 🔹 Styling header
      worksheet.getRow(1).eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF4CAF50" }
        };
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
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

      // 🔹 Save file
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), "data_marketing.xlsx");
    } catch (error) {
      console.error('Gagal export data:', error);
      showSnackbar('Export data gagal, cek console untuk detailnya.', 'error');
    }
  };

  return (
    <button onClick={handleExport} className="btn-export">
      Export Excel
    </button>
  )
}

export default ExportDataMarketingId
