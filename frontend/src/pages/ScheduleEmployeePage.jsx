import React, { useEffect, useState } from 'react'
import { getAllEmployeeSchedule1, getAllShift, getDays, updateShiftByEmployeeAndDay } from '../services/ApiServices';

const ScheduleEmployeePage=()=> {
    //STATE
    const [schedules, setSchedules] = useState([]);
    const [days, setDays] = useState([]);
    const [showShift, setShowShift] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedShiftId, setSelectedShiftId] = useState(null);
    const [shiftOptions, setShiftOptions] = useState([]);


    //FUNCTION
    //1. fungsi fetch data schedule
    const fetchDataSchedule = async() =>{
        try{
            setLoading(true)
            const response = await getAllEmployeeSchedule1();
            setSchedules(response.data)
        }catch(error){
            console.log('Error fetch data schedule:', error)
        }finally{
            setLoading(false)
        }
    }

    //2. fetch data days 
    const fetchDays = async () =>{
        try{
            const response = await getDays();
            setDays(response.data)
        }catch(error){
            console.error('Error fetching data:', error)
        }
    }

    // 3. Format nama hari jadi lowercase untuk akses ke object (senin, selasa, dst)
    const formatDayKey = (name) => name.toLowerCase();

    // 4. fungsi untuk menampilkan data shift 
    const fetchShifts = async () =>{
        try{
            const response = await getAllShift();
            setShiftOptions(response.data)
        }catch(error){
            console.log('Error fetching shift data:', error);
        }
    }

    // 5. function show shift 
    const handleShowShift = (rowIndex, dayId) => {
        if (showShift?.rowIndex === rowIndex && showShift?.dayId === dayId) {
            setShowShift(null); // toggle off
        } else {
            setShowShift({ rowIndex, dayId }); // set unique key
        }
    };
    
    // 6. fungsi change shift
    const handleShiftChange = async (employeeId, dayId, shiftId) => {
        try {
            console.log("employeeId:", employeeId); // harus angka
            console.log("dayId:", dayId);
            await updateShiftByEmployeeAndDay(employeeId, dayId, { shift_id: shiftId });
            console.log("Shift berhasil diupdate");
            fetchDataSchedule(); // Refresh data
            setShowShift(null); // Tutup dropdown
        } catch (error) {
            console.error("Gagal update shift:", error);
        }
    };


    //USEEFFECT 
    useEffect(()=>{
        fetchDataSchedule()
        fetchDays()
        fetchShifts()
    },[])

    //LOG

  return (
    <div style={{ padding: "20px", backgroundColor:'white' }}>
      <h2>Jadwal Karyawan</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table border="1" cellPadding="10" cellSpacing="0" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ backgroundColor: "#f0f0f0" }}>
            <tr>
              <th>Nama</th>
              <th>Divisi</th>
              {days.map((day) => (
                <th key={day.id}>{day.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {schedules.map((emp, rowIndex) => (
                <tr key={rowIndex}>
                <td>{emp.name}</td>
                <td>{emp.divisi}</td>
                {days.map((day) => {
                    const key = formatDayKey(day.name);
                    const isDropdownVisible =
                    showShift?.rowIndex === rowIndex && showShift?.dayId === day.id;

                    return (
                    <td key={day.id}>
                        <div
                        onClick={() => handleShowShift(rowIndex, day.id)}
                        style={{ cursor: "pointer" }}
                        >
                        {emp[key] || "-"}
                        </div>

                        {isDropdownVisible && (
                            <div style={{ position: "relative" }}>
                                <ul
                                style={{
                                    listStyle: "none",
                                    padding: "8px",
                                    margin: 0,
                                    backgroundColor: "#fff",
                                    border: "1px solid #ccc",
                                    position: "absolute",
                                    zIndex: 1000,
                                    width: "100%",
                                    color:'red'
                                }}
                                >
                                {shiftOptions.map((shift) => (
                                    <li
                                    key={shift.id}
                                    onClick={() => handleShiftChange(emp.id, day.id, shift.id)}
                                    style={{
                                        padding: "6px 10px",
                                        cursor: "pointer",
                                        borderBottom: "1px solid #eee",
                                    }}
                                    >
                                    {shift.name}|{shift.id}
                                    </li>
                                ))}
                                </ul>
                            </div>
                            )}

                    </td>
                    );
                })}
                </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default ScheduleEmployeePage