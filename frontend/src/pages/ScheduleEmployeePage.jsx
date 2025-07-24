import React, { useEffect, useState } from 'react'
import { createEmployeeSchedule, getAllEmployeeSchedule1, getAllShift, getDays, updateShiftByEmployeeAndDay } from '../services/ApiServices';
import { useSnackbar } from '../context/Snackbar';
import { IoTrashBin, IoInformationCircle } from 'react-icons/io5';
import '../style/pages/ScheduleEmployeePage.css';
import { HiXMark } from 'react-icons/hi2';
import { FaCalendarPlus, FaUserAlt, FaCalendarMinus, FaCircle } from "react-icons/fa";
import { FaBuilding, FaCloudSun, FaFaceGrinBeam, FaMoon, FaSun } from "react-icons/fa6";

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
    //state filter
    const [filterDivisi,setFilterDivisi] = useState('');
    const [showDivisi, setShowDivisi] = useState(false); 


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
    const handleCloseForm = () =>{
        setShowForm(false);
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
          setShowForm(false);
        } catch (error) {
          console.error('Error:', error);
          showSnackbar('Gagal menyimpan jadwal!', 'error')
        }
      };
    //END FUNCTION CREATE SCHEDULE

    // 10. function show dropdown divisi
    const handleShowDivisi = () =>{
        setShowDivisi(!showDivisi);
    }

    // 11. function icon schedule
    const iconSchedule = {
        "Pagi": <FaSun/>,
        "Siang": <FaCloudSun/>,
        "Malam": <FaMoon/>,
        "Libur": <FaFaceGrinBeam/>
    }

    // 12. function color schedule
    const colorSchedule = 
        {
            "Pagi":{
                "backgroundColor":"#F0FDF4",
                "color":"#1D7F40",
                "borderColor":"#BFF7D2"
            },
            "Siang":{
                "backgroundColor":"#FFF7ED",
                "color":"#C0421B",
                "borderColor":"#FDD6AD"
            },
            "Malam":{
                "backgroundColor":"#FAF5FF",
                "color":"#7D2ECB",
                "borderColor":"#E9D6FE"
            },
            "Libur":{
                "backgroundColor":"#E5E7EB",
                "color":"#504DE1",
                "borderColor":"#EEF2FE"
            }
        }
    

    //USEEFFECT 
    useEffect(()=>{
        fetchDataSchedule()
        fetchDays()
        fetchShifts()
    },[])

    //LOG

  return (
    <div className='employee-schedule-container'>
        <div className="schedule-header">
            <div className="sh-left">
                <h3>🗓️ SCHEDULE MEMBER</h3>
                <div className="sh-desc">
                    <strong>Atur Shift, Pantau Kehadiran, dan Pastikan Operasional Berjalan Lancar</strong>
                    <p>Kelola jadwal kerja karyawan dengan mudah dan fleksibel. Dengan fitur penjadwalan otomatis dan tampilan yang intuitif, Anda dapat memastikan setiap shift terisi tanpa tumpang tindih atau kekosongan.</p>
                </div>
            </div>
            <div className="sh-right">
                <div className='schedule-filter' onClick={handleShowDivisi}>
                    <label>Filter Divisi</label>
                </div>
                <div className='schedule-form' onClick={handleShowForm}>Add New</div>
                {showDivisi && (
                    <div className='filter-modal'>
                        <ul className='filter-box'>
                            <li className='filter-li'
                            onClick={() => setFilterDivisi('')}
                            >
                            Semua Divisi
                            </li>
                            {[...new Set(schedules.map(emp => emp.divisi))].map((div, i) => (
                            <li
                                key={i}
                                onClick={() => setFilterDivisi(div)}
                                className='filter-li'
                            >
                                {div}
                            </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
        
        
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
            {schedules
                .filter(emp => !filterDivisi || emp.divisi === filterDivisi)
                .map((emp, rowIndex) =>(
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
                            className='schedule-shift-box'
                            style={{
                                backgroundColor: colorSchedule[emp[key]]?.backgroundColor || "#fff",
                                border: `1px solid ${colorSchedule[emp[key]]?.borderColor || "#ccc"}`,
                                color: colorSchedule[emp[key]]?.color || "#000",
                            }}
                        >
                        {iconSchedule[emp[key]] || null}
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
            <div className="create-content">
                <div className="create-header">
                    <div className="ch-left">
                        <div className="ch-icon">
                            <FaCalendarPlus/>
                        </div>
                        <div className="ch-desc">
                            <h2>Tambah Jadwal Karyawan Baru</h2>
                            <p>Atur jadwal shift karyawan dengan mudah</p>        
                        </div>
                    </div>
                    
                    <HiXMark className='create-icon' onClick={handleCloseForm}/>
                </div>
                
                <form className='create-main-form' onSubmit={handleSubmit}>
                    <div className="box-identitas">
                        <div className="bi-title">
                            <IoInformationCircle className='bi-icon'/>
                            <h4>Informasi Karyawan</h4>
                        </div>
                        
                        <div className="isi-box-identitas">
                            <div className='box-identitas'>
                                <label>Nama Karyawan <span>*</span></label>
                                <div className="box-input">
                                    <FaUserAlt className='box-icon'/>
                                    <input
                                        type="text"
                                        placeholder='Masukkan nama lengkap'
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />    
                                </div>
                            </div>

                            <div className='box-identitas'>
                                <label>Divisi <span>*</span></label>
                                <div className="box-input">
                                    <FaBuilding className='box-icon'/>
                                    <input
                                        type="text"
                                        placeholder='Masukkan Divisi'
                                        value={divisi}
                                        onChange={(e) => setDivisi(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                        
                    </div>
                
                    <div className='box-shift'>
                        <div className="shift-title">
                            <div className="st-left">
                                <FaCalendarMinus className='shift-icon'/>
                                <h4>Jadwal Mingguan</h4>
                            </div>
                            <div className="st-right">
                                <IoInformationCircle className='st-icon'/>
                                <p>Pilih shift untuk setiap hari dalam seminggu</p>
                            </div>
                        </div>
                        
                        <div className="shift-content">
                            {days.map((day) => (
                            <div key={day.id} className='shift-con'>
                                <div className="sc-title">
                                    <FaCircle className='sc-icon'/>
                                    <strong>{day.name}</strong>
                                </div>
                                
                                <div
                                    className='shift-option'
                                    onClick={() =>
                                        setSelectedShiftId((prev) => ({
                                        ...prev,
                                        openDay: prev.openDay === day.id ? null : day.id
                                    }))
                                    }
                                >
                                {shiftOptions.find(shift => shift.id === selectedShiftId[day.id])?.name || '--Pilih Shift--'}
                                </div>

                                {selectedShiftId.openDay === day.id && (
                                <ul className='shift-list'>
                                    {shiftOptions.map((shift) => (
                                    <li
                                        className='shift-li'
                                        key={shift.id}
                                        onClick={() => {
                                        handleChangeShift(day.id, shift.id);
                                        setSelectedShiftId((prev) => ({ ...prev, openDay: null })); // tutup dropdown
                                        }}
                                    >
                                        {shift.name}
                                    </li>
                                    ))}
                                </ul>
                                )}
                            </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="btn-submit">
                        <button type="submit">Simpan Jadwal</button>
                    </div>
                
                </form>
            </div>
        </div>
        )}

    </div>
  )
}

export default ScheduleEmployeePage