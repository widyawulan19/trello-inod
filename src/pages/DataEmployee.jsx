import React, { useState, useEffect } from 'react';
import { getScheduleEmployee, getDays, getAllShift, updateSchedule} from '../services/ApiServices';
import '../style/pages/DataEmployee.css';
import { HiOutlineFilter, HiOutlineSearch, HiOutlinePlus } from 'react-icons/hi';
import { HiOutlineCalendarDateRange, HiOutlineChevronDown, HiOutlineChevronUp, HiOutlineEllipsisHorizontal } from "react-icons/hi2";
import AddDataEmployee from '../modules/AddDataEmployee';

const DataEmployee = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [filterDivisi, setFilterDivisi] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [schedule, setSchedule] = useState([]);
  const [days, setDays] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [showSchedule, setShowSchedule] = useState(false)

  const handleShowForm = (e) =>{
    e.stopPropagation()
    setShowForm(!showForm)
  }

const handleCloseForm = () =>{
  setShowForm(false)
}

useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const response = await getScheduleEmployee();
                setSchedule(response.data);
                setEmployees(response.data)
                setFilteredEmployees(response.data)
            } catch (error) {
                console.error("Error fetching schedule:", error);
            }
        };

        const fetchDays = async () => {
            try {
                const response = await getDays();
                console.log("Days:", response.data);
                setDays(response.data);
            } catch (error) {
                console.error("Error fetching days:", error);
            }
        };

        const fetchShifts = async () => {
            try {
                const response = await getAllShift();
                console.log("Shifts Data:", response.data);
                setShifts(response.data);
            } catch (error) {
                console.error("Error fetching shifts:", error);
            }
        };

        fetchSchedule();
        fetchDays();
        fetchShifts();
    }, []);

    // Fungsi untuk mengupdate jadwal
    const handleChangeShift = async (employee_id, dayName, newShift) => {
      try {
          const shift = shifts.find((s) => s.status_shift === newShift);
          const dayIndex = days.indexOf(dayName) + 1; // Cari index hari berdasarkan nama
  
          if (!shift || dayIndex < 1) return;
  
          // Kirim data ke API untuk update jadwal
          await updateSchedule({ employee_id, days_id: dayIndex, shift_id: shift.shift_id });
  
          // **Perbarui state `employees` untuk langsung menampilkan perubahan**
          setEmployees((prevEmployees) =>
              prevEmployees.map((emp) =>
                  emp.employee_id === employee_id
                      ? {
                            ...emp,
                            schedule: { ...emp.schedule, [dayName]: newShift }, // Update shift pada hari tertentu
                        }
                      : emp
              )
          );
  
          // Perbarui state `schedule` juga agar tetap konsisten dengan `employees`
          setSchedule((prevSchedule) =>
              prevSchedule.map((emp) =>
                  emp.employee_id === employee_id
                      ? {
                            ...emp,
                            schedule: { ...emp.schedule, [dayName]: newShift },
                        }
                      : emp
              )
          );
      } catch (error) {
          console.error("Error updating schedule:", error);
      }
  };
  

   // **Filter dan Search menggunakan useEffect**
     useEffect(() => {
       let filtered = [...employees]; // Salin data asli
   
       if (filterDivisi) {
         filtered = filtered.filter((employee) =>
           employee.divisi?.toLowerCase().includes(filterDivisi.toLowerCase())
         );
       }
   
       if (searchTerm) {
         filtered = filtered.filter((employee) =>
           employee.name?.toLowerCase().includes(searchTerm.toLowerCase())
         );
       }
   
       setFilteredEmployees(filtered);
     }, [employees, filterDivisi, searchTerm]);
   
     const handleFilterChange = (selectedDivisi) => {
       setFilterDivisi(selectedDivisi);
       setIsDropdownOpen(false);
     };
   
     const handleSearchChange = (event) => {
       setSearchTerm(event.target.value);
     }; 
  
    // Fungsi untuk toggle dropdown schedule
    const handleShowSchedule = (e, employeeId, day) => {
      e.stopPropagation();
      setEmployees((prevEmployees) =>
        prevEmployees.map((emp) =>
          emp.employee_id === employeeId
            ? {
                ...emp,
                scheduleVisibility: {
                  ...emp.scheduleVisibility,
                  [day]: !emp.scheduleVisibility?.[day], // toggle visibility for the specific day
                },
              }
            : emp
        )
      );
    };


  return (
    <div className='de-main-container'>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className="de-panel">
        <div className="dep-left2">
          <h5>MEMBER SCHEDULE</h5>
        </div>
        
        <div className="dep-right2">
          <div className="dep-left">
              <button className='dep-filter' onClick={()=> setIsDropdownOpen(!isDropdownOpen)}>
              <HiOutlineFilter />
              Filter
              </button>
              <button className='de-search'>
                  <HiOutlineSearch />
                  {/* Input pencarian */}
                  <input
                      type="text"
                      placeholder="Search by name..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                  />
              </button>
          </div>
          {/* SHOW FILTER DROPDOWN */}
          {isDropdownOpen && (
            <ul className="fill-dropdown-menu">
              <li onClick={() => handleFilterChange('')}>All</li>
              <li onClick={() => handleFilterChange('produksi')}>PRODUKSI</li>
              <li onClick={() => handleFilterChange('marketing')}>MARKETING</li>
              <li onClick={() => handleFilterChange('design')}>DESIGN</li>
              <li onClick={() => handleFilterChange('operational')}>OPERATIONAL</li>
            </ul>
          )}

          <div className="dep-right">
            <button onClick={handleShowForm}>
            <HiOutlinePlus />
            Add Data
            </button>
            <button>
            <HiOutlineCalendarDateRange />
            Schedule
            </button>
          </div>
          {/* SHOW FORM CREATE */}
          {showForm && (
              <div className="form-create">
                  <AddDataEmployee onClose={handleCloseForm}/>
              </div>
          )}
        </div>
        
      </div>

      <div className="de-container">
        <table cellPadding="10" cellSpacing="0">
          <thead>
            <tr>
              <th style={{ borderTopLeftRadius: '8px' }}>No</th>
              <th>Name</th>
              <th>Username</th>
              <th>Divisi</th>
              {days.map((day,index)=>(
                <th key={index}>{day}</th>
              ))}
              <th style={{ borderTopRightRadius: '8px' }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee, index) => (
                <tr key={employee.employee_id}>
                  <td>{index + 1}</td>
                  <td>{employee.name}</td>
                  <td>{employee.username}</td>
                  <td>{employee.divisi}</td>
                  {days.map((day) => {
                    const shift = employee.schedule?.[day] || "Libur"; // Ambil shift atau default "Libur"
                    let cellStyle = {};

                    // Tentukan warna berdasarkan shift
                    if (shift === "Pagi") {
                      cellStyle = { backgroundColor: '#C2EFD4', color: 'green', fontWeight: 'bold', textAlign: 'center' };
                    } else if (shift === "Siang") {
                      cellStyle = { backgroundColor: '#EFE9C2', color: 'orange', fontWeight: 'bold', textAlign: 'center' };
                    } else if (shift === "Malam") {
                      cellStyle = { backgroundColor: '#96C7F6', color: '#2E73B5', fontWeight: 'bold', textAlign: 'center' };
                    } else if (shift === "Libur") {
                      cellStyle = { backgroundColor: '#EFC2C2', color: 'red', fontWeight: 'bold', textAlign: 'center' };
                    }

                    return (
                      <td key={day} className="dp-cont">
                        <button
                          onClick={(e) => handleShowSchedule(e, employee.employee_id, day)}
                          style={{ ...cellStyle, padding: '5px 10px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                        >
                          {shift}
                          <HiOutlineChevronDown style={{ marginLeft: '5px' }} />
                        </button>
                        {employee.scheduleVisibility?.[day] && (
                          <div className="schedule">
                            <h5>Select Schedule</h5>
                            <div className="ul-schedule">
                              {shifts.map((shift) => (
                                <div
                                  key={shift.shift_id}
                                  onClick={() => handleChangeShift(employee.employee_id, day, shift.status_shift)}
                                  className="li-schedule"
                                >
                                  {shift.status_shift}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })}

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={days.length + 4} style={{ textAlign: "center" }}>
                  Data tidak ditemukan...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataEmployee;


// {days.map((day) => (
//   <td key={day}>
//     <select
//       value={employee.schedule?.[day] || "Libur"}
//       onChange={(e) => handleChangeShift(employee.employee_id, day, e.target.value)}
//     >
//       {shifts.map((shift) => (
//         <option key={shift.shift_id} value={shift.status_shift}>
//           {shift.status_shift}
//         </option>
//       ))}
//     </select>
//   </td>
// ))}