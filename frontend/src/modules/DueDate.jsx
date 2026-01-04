import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import '../style/modules/DueDate.css';
import 'react-datepicker/dist/react-datepicker.css';

import { 
  getAllDueDateByCardId, 
  addNewDueDate, 
  updateDueDate, 
  updateCardDueDate,
  updateDueDateTesting
} from "../services/ApiServices"; // Sesuaikan dengan lokasi file API
import { HiXMark } from "react-icons/hi2";
import BootstrapTooltip from "../components/Tooltip";
import { useSnackbar } from "../context/Snackbar";
import { FaClock } from "react-icons/fa6";
import { useUser } from "../context/UserContext";

const DueDate = ({ 
  // userId,
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

  const {showSnackbar} = useSnackbar()
  const {user} = useUser();
  const userId = user?.id;

  /* =======================
  DEBUGING
  ======================= */
useEffect(() => {
  console.log('PARENT selectedDueDateId:', selectedDueDateId);
}, [selectedDueDateId]);



  const handleDateChange = (date) => {
    setSelectedDate(date);
  };


const handleSaveDueDate = async () => {
  if (!selectedDate) {
    showSnackbar('Pilih due date terlebih dahulu', 'warning');
    return;
  }

  try {
    setLoading(true);
    const formattedDate = selectedDate.toISOString();

    if (selectedDueDateId) {
      // ======================
      // UPDATE DUE DATE
      // ======================
      await updateDueDateTesting(
        selectedDueDateId,  // id due_date
        userId,             // userId (wajib dari API)
        { due_date: formattedDate }
      );

      showSnackbar('Due date berhasil diperbarui', 'success');
    } else {
      // ======================
      // ADD NEW DUE DATE
      // ======================
      await addNewDueDate({
        card_id: cardId,
        due_date: formattedDate,
      });

      showSnackbar('Due date berhasil ditambahkan', 'success');
    }

    fetchDueDates();
  } catch (error) {
    console.error('Error saving due date:', error);
    showSnackbar('Gagal menyimpan due date', 'error');
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
        <p className="due-date-loading">Loading...</p>
      ) : (
        <div className="due-container">
          <div className="due-header">
            <div className="dh-left">
              <FaClock/>
              <h5>SELECT DATE</h5>
            </div>          
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

