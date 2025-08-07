import React from 'react'
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { getAllDataMarketing } from '../services/ApiServices';

const ExportDataMarketing=()=> {
    const handleExport = async () => {
        try {
        const response = await getAllDataMarketing(); // ambil data dari endpoint
        const data = response.data; // sesuaikan dengan struktur responsenya

        // Buat worksheet dan workbook
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'DataMarketing');

        // Convert ke Blob dan save
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const file = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(file, 'data_marketing.xlsx');

        } catch (error) {
        console.error('Gagal export data:', error);
        }
    };

  return (
    <button 
        onClick={handleExport}
        style={{
            fontSize:'12px',
            border:'1px solid #fff',
            borderRadius:'6px',
            cursor:'pointer',
            color:'white',
            padding:'5px 10px',
            backgroundColor:'#6E30DC'
        }}
    >
      Export to Excel
    </button>
  )
}

export default ExportDataMarketing