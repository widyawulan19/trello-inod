import React, { useEffect, useState } from 'react';
import { getWeeklyEmployeeSchedule, updateEmployeeShift, getAllShift } from '../services/ApiServices';
import '../style/modules/EmployeeSchedule.css'
import { HiMagnifyingGlass, HiMiniCalendarDateRange } from 'react-icons/hi2';
import { HiOutlineFilter } from 'react-icons/hi';

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', "Jumat", 'Sabtu', 'Minggu'];
const DIVISION = ['Marketing Design', 'Marketing Musik','Operational', 'Produksi Design', 'Produksi Musik', 'IT'];

const SHIFT_COLORS = {
  Pagi: '#FFF9C4',
  Siang: '#B3E5FC',
  Malam: '#C5CAE9',
  Libur: '#C8E6C9',
};

const EmployeeSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [shiftOptions, setShiftOptions] = useState([]);
  const [openDropdown, setOpenDropdown] = useState({})
  const [selectedFilter, setSelectedFilter] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [scheduleRes, shiftRes] = await Promise.all([
      getWeeklyEmployeeSchedule(),
      getAllShift()
    ]);
    console.log('Schedule Data:', scheduleRes.data);
    setSchedules(scheduleRes.data);
    setShiftOptions(shiftRes.data);
  };

const handleShiftChange = async (employeeId, dayName, newShiftName) => {
  try {
    const selectedShift = shiftOptions.find(
      shift => shift.status_shift === newShiftName
    );
    const shiftId = selectedShift?.shift_id || null;
    const dayId = DAYS.indexOf(dayName) + 1;

    console.log('Mengirim:', { employeeId, dayId, shiftId });

    await updateEmployeeShift({
      employee_id: employeeId,
      day_id: dayId,
      shift_id: shiftId,
    });

    fetchData(); // Refresh
  } catch (error) {
    console.error('Gagal update shift:', error?.response?.data || error.message);
    alert('Gagal update shift: ' + (error?.response?.data?.message || error.message));
  }
};

//Fungsi dropdown shift
const handleDropdownShift = (employeeId, day)=>{
  setOpenDropdown(prev => {
    const key = `${employeeId}-${day}`;
    return{
      ...prev,
      [key]: !prev[key]
    }
  })
}

const handleSelect = (employeeId, day, value) => {
    handleShiftChange(employeeId, day, value);
    handleDropdownShift(employeeId, day); // close dropdown
  };

//SHOW FROPFOWN FITLER
const handleDropdownFilter = () =>{
  setShowFilterDropdown(!showFilterDropdown)
}

const filteredSchedules = !selectedFilter
  ? schedules
  : schedules.filter(emp => emp.employee_divisi === selectedFilter);



  return (
    <div className="schedule-container">
      <div className="schedule-header">
        <div className="sh-left">
          <h3>🗓️ SCHEDULE MEMBER</h3>
          <div className="sh-desc">
            <strong>Atur Shift, Pantau Kehadiran, dan Pastikan Operasional Berjalan Lancar</strong>
            <p>Kelola jadwal kerja karyawan dengan mudah dan fleksibel. Dengan fitur penjadwalan otomatis dan tampilan yang intuitif, Anda dapat memastikan setiap shift terisi tanpa tumpang tindih atau kekosongan.</p>
          </div>
        </div>

        <div className="sh-right">
          <button onClick={handleDropdownFilter}>
            <HiOutlineFilter/>
             FILTER SCHEDULE
            </button>
          {/* <div className="sh-search">
            <HiMagnifyingGlass style={{marginLeft:'5px'}}/>
            <input type="text" />
          </div> */}

          {/* SHOW DROPDOWN FILTER  */}
            {showFilterDropdown && (
              <div className='dropdown-filter'>
                <li 
                  className='df-semua-divisi'
                  onClick={() => {
                    setSelectedFilter('');
                    setShowFilterDropdown(false);
                  }}
                >
                  Semua Divisi
                </li>
                {DIVISION.map(option => (
                  <li
                    className='df-all'
                    key={option}
                    onClick={() => {
                      setSelectedFilter(option);
                      setShowFilterDropdown(false);
                    }}
                  >
                    {option}
                  </li>
                ))}
              </div>
            )}
        </div>
        
      </div>
    
    <div className="table-employee">
      <table border="1" cellPadding="8" cellSpacing='0'>
        <thead>
          <tr>
            <th>Nama Karyawan</th>
            <th>Divisi</th>
            {DAYS.map(day => (
              <th key={day}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredSchedules.map((emp, idx) => (
            <tr key={idx}>
              <td>{emp.Nama}</td>
              <td>{emp.employee_divisi}</td>
              {DAYS.map(day => {
                const key = `${emp.employee_id}-${day}`;
                return (
                  <td
                    key={day}
                    style={{
                      backgroundColor: SHIFT_COLORS[emp[day]] || '#fff',
                      cursor: 'pointer',
                      position: 'relative',
                      textAlign:'center'
                    }}
                  >
                    <div onClick={() => handleDropdownShift(emp.employee_id, day)}>
                      {emp[day] || 'Pilih Shift'}
                    </div>
                    {openDropdown[key] && (
                      <ul className='option-dropdown'>
                        {/* <li onClick={() => handleSelect(emp.employee_id, day, 'Libur')}>
                          Libur
                        </li> */}
                        {shiftOptions.map(opt => (
                          <li key={opt.shift_id} onClick={() => handleSelect(emp.employee_id, day, opt.status_shift)}>
                            {opt.status_shift}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default EmployeeSchedule;
