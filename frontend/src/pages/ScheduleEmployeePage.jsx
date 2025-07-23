import React, { useEffect, useState } from 'react'
import { createEmployeeSchedule, getAllEmployeeSchedule1, getAllShift, getDays, updateShiftByEmployeeAndDay } from '../services/ApiServices';
import { useSnackbar } from '../context/Snackbar';
import { IoTrashBin } from 'react-icons/io5';

const ScheduleEmployeePage=()=> {
    //STATE
    const [schedules, setSchedules] = useState([]);
    const [days, setDays] = useState([]);
    const [showShift, setShowShift] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedShiftId, setSelectedShiftId] = useState({});
    const [shiftOptions, setShiftOptions] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const {showSnackbar} = useSnackbar();
    //state form create
    const [name, setName] = useState('');
    const [divisi, setDivisi] = useState('');


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

    //7. show form
    const handleShowForm = () =>{
        setShowForm(!showForm);
    }

    //FUNCTION CREATE SCHEDULE
    // 8. change shift di saat buat data baru
    const handleChangeShift = (dayId, shiftId) =>{
        setSelectedShiftId((prev) => ({
            ...prev,
            [dayId]:shiftId
        }))
    }

    // 9. fungsi submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        const schedules = Object.entries(selectedShiftId).map(([day_id, shift_id]) => ({
          day_id: parseInt(day_id),
          shift_id,
        }));
    
        try {
          await createEmployeeSchedule({ name, divisi, schedules });
          showSnackbar('Jadwal baru berhasil dibuat!','success')
          setName('');
          setDivisi('');
          setSelectedShiftId({});
          fetchDataSchedule();
        } catch (error) {
          console.error('Error:', error);
          showSnackbar('Gagal menyimpan jadwal!', 'error')
        }
      };


    //END FUNCTION CREATE SCHEDULE


    //USEEFFECT 
    useEffect(()=>{
        fetchDataSchedule()
        fetchDays()
        fetchShifts()
    },[])

    //LOG

  return (
    <div style={{ padding: "20px", backgroundColor:'white' }}>
        <div onClick={handleShowForm}>Add New</div>
        
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
              <th>Action</th>
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
                                    onClick={() => handleShiftChange(emp.employee_id, day.id, shift.id)}
                                    style={{
                                        padding: "6px 10px",
                                        cursor: "pointer",
                                        borderBottom: "1px solid #eee",
                                    }}
                                    >
                                    {shift.name}
                                    </li>
                                ))}
                                </ul>
                            </div>
                            )}
                    </td>
                    );
                })}
                <td><div><IoTrashBin/></div></td>
                </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <div className='form-create-modal'>
            <h2>Buat Jadwal Karyawan Baru</h2>
                <form onSubmit={handleSubmit}>
                    <div>
                    <label>Nama:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    </div>

                    <div>
                    <label>Divisi:</label>
                    <input
                        type="text"
                        value={divisi}
                        onChange={(e) => setDivisi(e.target.value)}
                        required
                    />
                    </div>

                    <div>
                    <h4>Pilih Shift per Hari:</h4>
                    {days.map((day) => (
                        <div key={day.id}>
                        <strong>{day.name}</strong>
                        <select
                            value={selectedShiftId[day.id] || ''}
                            onChange={(e) => handleChangeShift(day.id, parseInt(e.target.value))}
                        >
                            <option value="">--Pilih Shift--</option>
                            {shiftOptions.map((shift) => (
                            <option key={shift.id} value={shift.id}>
                                {shift.name}
                            </option>
                            ))}
                        </select>
                        </div>
                    ))}
                    </div>

                    <button type="submit">Simpan Jadwal</button>
                </form>
        </div>
      )}
    </div>
  )
}

export default ScheduleEmployeePage