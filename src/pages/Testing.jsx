import React, { useEffect, useState } from "react";
import { getScheduleEmployee,getAllShift,updateSchedule, getDays } from "../services/ApiServices";

const Testing = () => {
    const [schedule, setSchedule] = useState([]);
    const [days, setDays] = useState([]);
    const [shifts, setShifts] = useState([]);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const response = await getScheduleEmployee();
                setSchedule(response.data);
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
            const day = days.find((d) => d === dayName); // Cari ID hari berdasarkan nama
    
            if (!shift || !day) return;
    
            // Kirim data ke API untuk update jadwal
            await updateSchedule({ employee_id, days_id: days.indexOf(day) + 1, shift_id: shift.shift_id });
    
            // Perbarui data jadwal di frontend
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
    
    

    return (
        <div>
            <h2>Jadwal Karyawan</h2>
            <table border="1" cellPadding="5" cellSpacing="0">
                <thead>
                    <tr>
                        <th>Nama Karyawan</th>
                        <th>Username</th>
                        <th>Divisi</th>
                        {days.map((day,index) => (
                            <th key={index}>{day}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {schedule.length > 0 ? (
                        schedule.map((employee) => (
                            <tr key={employee.employee_id}>
                                <td>{employee.name}</td>
                                <td>{employee.username}</td>
                                <td>{employee.divisi}</td>
                                {days.map((day) => (
                                    <td key={day}>
                                        <select
                                            value={employee.schedule[day] || "Libur"}
                                            onChange={(e) => handleChangeShift(employee.employee_id, day, e.target.value)}
                                        >
                                            {/* <option value="Libur">Libur</option> */}
                                            {shifts.map((shift) => (
                                                <option key={shift.shift_id} value={shift.status_shift}>
                                                    {shift.status_shift}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={days.length + 1} style={{ textAlign: "center" }}>
                                Memuat data...
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Testing;
