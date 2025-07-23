import React, { useEffect, useState } from 'react';
import { createEmployeeSchedule } from '../services/ApiServices';
import { getDays, getAllShift } from '../services/ApiServices';

const CreateScheduleForm = () => {
  const [name, setName] = useState('');
  const [divisi, setDivisi] = useState('');
  const [days, setDays] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [selectedShifts, setSelectedShifts] = useState({}); // { day_id: shift_id }

  // Fetch days and shifts
  useEffect(() => {
    const fetchData = async () => {
      const dayRes = await getDays();
      const shiftRes = await getAllShift();
      setDays(dayRes.data);
      setShifts(shiftRes.data);
    };
    fetchData();
  }, []);

  const handleShiftChange = (dayId, shiftId) => {
    setSelectedShifts((prev) => ({
      ...prev,
      [dayId]: shiftId,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const schedules = Object.entries(selectedShifts).map(([day_id, shift_id]) => ({
      day_id: parseInt(day_id),
      shift_id,
    }));

    try {
      await createEmployeeSchedule({ name, divisi, schedules });
      alert('Jadwal berhasil dibuat!');
      setName('');
      setDivisi('');
      setSelectedShifts({});
    } catch (error) {
      console.error('Error:', error);
      alert('Gagal menyimpan jadwal!');
    }
  };

  return (
    <div>
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
                value={selectedShifts[day.id] || ''}
                onChange={(e) => handleShiftChange(day.id, parseInt(e.target.value))}
              >
                <option value="">--Pilih Shift--</option>
                {shifts.map((shift) => (
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
  );
};

export default CreateScheduleForm;
