import React, { useEffect, useState, useRef } from 'react';
import {
  getAllEmployeeSchedule1,
  createEmployeeSchedule,
  updateEmployeeShift1,
  getDays,
  getAllShift,
} from '../services/ApiServices';

const ScheduleEmployeePage = () => {
  const [schedules, setSchedules] = useState([]);
  const [formSchedules, setFormSchedules] = useState([]);
  const [days, setDays] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [name, setName] = useState('');
  const [divisi, setDivisi] = useState('');
  const [editingCell, setEditingCell] = useState({});
  const [openDropdown, setOpenDropdown] = useState(false)

  //dropdown shift
  const handleDropdownShift = (employeeId, day)=>{
    setOpenDropdown(prev => {
        const key = `${employeeId}=${day}`;
        return{
            ...prev,
            [key]: !prev[key]
        }
    })
  }
  const hendleSelect = (employeeId, day, value) =>{
    hadnleShi
  }


const handleShiftChange = async (employeeId, dayName, newShifName)

  const selectRef = useRef(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [resDays, resShifts, resSchedules] = await Promise.all([
          getDays(),
          getAllShift(),
          getAllEmployeeSchedule1(),
        ]);

        setDays(resDays.data);
        setShifts(resShifts.data);
        setSchedules(resSchedules.data);

        const defaultForm = resDays.data.map((day) => ({
          day_id: day.id,
          shift_id: '',
        }));
        setFormSchedules(defaultForm);
      } catch (err) {
        console.error(err);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectRef.current) {
      selectRef.current.focus();
    }
  }, [editingCell]);

  const handleScheduleChange = (dayId, shiftId) => {
    setFormSchedules((prev) =>
      prev.map((s) =>
        s.day_id === dayId ? { ...s, shift_id: parseInt(shiftId) } : s
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name,
      divisi,
      schedules: formSchedules.filter((s) => s.shift_id !== ''),
    };

    try {
      await createEmployeeSchedule(payload);
      alert('Jadwal berhasil disimpan!');
      setName('');
      setDivisi('');
      setFormSchedules(days.map((day) => ({ day_id: day.id, shift_id: '' })));
      const res = await getAllEmployeeSchedule1();
      setSchedules(res.data);
    } catch (error) {
      console.error(error);
      alert('Gagal menyimpan jadwal.');
    }
  };

  const handleInlineShiftChange = async (employeeId, dayId, newShiftId) => {
    try {
      await updateEmployeeShift1(employeeId, {
        schedules: [{ day_id: dayId, shift_id: parseInt(newShiftId) }],
      });
      alert('Shift berhasil diupdate.');

      setEditingCell({});
      const res = await getAllEmployeeSchedule1();
      setSchedules(res.data);
    } catch (error) {
      console.error(error);
      alert('Gagal update shift.');
    }
  };

  useEffect(() => {
  const fetchShifts = async () => {
    try {
      const response = await getAllShift(); // dari API service kamu
      setShifts(response.data); // simpan ke state
    } catch (error) {
      console.error("Gagal fetch shifts", error);
    }
  };

  fetchShifts();
}, []);


  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Employee Schedules</h2>

      {/* TABEL */}
      <table className="w-full border border-gray-300 mb-8 text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-3 py-2">Name</th>
            <th className="border px-3 py-2">Division</th>
            {days.map((day) => (
              <th key={day.id} className="border px-3 py-2 capitalize">
                {day.name}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {schedules.map((emp) => (
            <tr key={emp.employee_id} className="text-center">
              <td className="border px-2 py-1">{emp.name}</td>
              <td className="border px-2 py-1">{emp.divisi}</td>
              {days.map((day) => {
                const key = `${emp.employee_id}-${day}`
                return (
                  <td
                    key={day.id}
                    className="border px-2 py-1 cursor-pointer hover:bg-gray-100"
                  >
                    {/* <div onClick={()=> }>

                    </div> */}
                    {isEditing ? (
                      <select
                        ref={selectRef}
                        value={currentShiftId || ''}
                        onChange={(e) =>
                          handleInlineShiftChange(
                            emp.employee_id,
                            day.id,
                            e.target.value
                          )
                        }
                        onBlur={() => setEditingCell({})}
                        className="border border-gray-400 rounded px-1 py-0.5 text-sm"
                      >
                        <option value="">-</option>
                        {shifts.map((shift) => (
                          <option key={shift.id} value={shift.id}>
                            {shift.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      currentShift?.name || '-'
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* FORM TAMBAH */}
      <h3 className="text-lg font-semibold mb-2">Tambah Jadwal Karyawan</h3>
      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <label>Nama:</label>
          <input
            className="border p-1 ml-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Divisi:</label>
          <input
            className="border p-1 ml-2"
            value={divisi}
            onChange={(e) => setDivisi(e.target.value)}
            required
          />
        </div>

        <div>
          <h4 className="font-medium">Jadwal Shift:</h4>
          {days.map((day) => (
            <div key={day.id}>
              <label>{day.name}:</label>
              <select
                className="border ml-2"
                value={
                  formSchedules.find((s) => s.day_id === day.id)?.shift_id || ''
                }
                onChange={(e) => handleScheduleChange(day.id, e.target.value)}
              >
                <option value="">-- Pilih Shift --</option>
                {shifts.map((shift) => (
                  <option key={shift.id} value={shift.id}>
                    {shift.name} ({shift.start_time} - {shift.end_time})
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="mt-2 bg-blue-500 text-white px-4 py-1 rounded"
        >
          Simpan Jadwal
        </button>
      </form>
    </div>
  );
};

export default ScheduleEmployeePage;
