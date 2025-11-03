import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import '../style/modules/DueDate.css';
import 'react-datepicker/dist/react-datepicker.css';

import { 
  getAllDueDateByCardId, 
  addNewDueDate, 
  updateDueDate 
} from "../services/ApiServices"; // Sesuaikan dengan lokasi file API
import { HiXMark } from "react-icons/hi2";
import BootstrapTooltip from "../components/Tooltip";
import { useSnackbar } from "../context/Snackbar";

const DueDate = ({ 
    cardId , 
    onClose,
    dueDates,
    setDueDates,
    selectedDate,
    setSelectedDate,
    selectedDueDateId,
    setSelectedDueDateId,
    loading,
    setLoading,
    fetchDueDates
  }) => {
  // const [dueDates, setDueDates] = useState([]);
  // const [selectedDate, setSelectedDate] = useState(null);
  // const [selectedDueDateId, setSelectedDueDateId] = useState(null);
  // const [loading, setLoading] = useState(false);
  const {showSnackbar} = useSnackbar()

  // useEffect(() => {
  //   fetchDueDates();
  // }, [cardId]);

  // const fetchDueDates = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await getAllDueDateByCardId(cardId);
  //     console.log("Fetched Due Dates:", response.data);

  //     if (response.data.length > 0) {
  //       setDueDates(response.data);
  //       setSelectedDate(new Date(response.data[0].due_date));
  //       setSelectedDueDateId(response.data[0].id);
  //     } else {
  //       setDueDates([]);
  //       setSelectedDate(null);
  //       setSelectedDueDateId(null);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching due dates:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleSaveDueDate = async () => {
    if (!selectedDate) {
      alert("Pilih due date terlebih dahulu!");
      return;
    }

    try {
      setLoading(true);
      const formattedDate = selectedDate.toISOString();

      if (selectedDueDateId) {
        await updateDueDate(selectedDueDateId, { due_date: formattedDate });
        // alert("Due date berhasil diperbarui!");
        showSnackbar('Due date berhasil diperbarui','success')
      } else {
        await addNewDueDate({ card_id: cardId, due_date: formattedDate });
        // alert("Due date berhasil ditambahkan!");
        showSnackbar('Due data berhasil ditambahkan','success')
      }

      fetchDueDates();
    } catch (error) {
      console.error("Error saving due date:", error);
      // alert("Gagal menyimpan due date");
      showSnackbar('Gagal menyimpan due date','error')
    } finally {
      setLoading(false);
    }
  };

  const getDueDateClass = (date) => {
    if (!date) return "";

    const now = new Date();
    const timeDiff = date.getTime() - now.getTime();
    const oneDay = 24 * 60 * 60 * 1000;

    if (timeDiff <= oneDay) {
      return "due-red"; // < 24 jam
    } else if (timeDiff <= 2 * oneDay) {
      return "due-orange"; // < 2 hari
    } else if (timeDiff <= 3 * oneDay) {
      return "due-blue"; // < 3 hari
    } else {
      return "due-normal"; // > 3 hari
    }
  };

  return (
    <div className="due-date-picker">
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <div className="due-container">
          <div className="due-header">
            <h5>SELECT DATE</h5>
            <BootstrapTooltip title='Close' placement='top'>
              <HiXMark className="dh-icon" onClick={onClose}/>
            </BootstrapTooltip>
          </div>
          <div className='date-input-con'>
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="dd MMMM yyyy, HH:mm"
              placeholderText="Pilih due date & waktu"
              className={`date-sbox ${getDueDateClass(selectedDate)}`}
              popperClassName="custom-datepicker"
              popperPlacement="bottom-start"
            />

            <button
              onClick={handleSaveDueDate}
              disabled={!selectedDate}
              className="btn-date"
            >
              {selectedDueDateId ? "Update Due" : "Add Due"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
  
};

export default DueDate;

// return (
//   <div className="due-date-picker">
//     {loading ? (
//       <p>Loading...</p>
//     ) : (
//       <div className="due-container">
//         <div className="date-input-con">
//           <DatePicker 
//             selected={selectedDate} 
//             onChange={handleDateChange}
//             showTimeSelect
//             timeFormat="HH:mm"
//             timeIntervals={15}
//             dateFormat="dd MMMM yyyy, HH:mm"
//             placeholderText="Pilih due date & waktu"
//             className={`date-box ${getDueDateClass(selectedDate)}`}
//           />
//           <button onClick={handleSaveDueDate} disabled={!selectedDate}>
//             {selectedDueDateId ? "Update Due Date" : "Add Due Date"}
//           </button>
//         </div>
//       </div>
//     )}
//   </div>
// );