{showForm && (
        <div className='form-create-modal'>
            <div className="create-content">
                <div className="create-header">
                    <h2>Tambah Jadwal Karyawan Baru</h2>
                    <HiXMark className='create-icon'/>
                </div>
                
                <form className='create-main-form' onSubmit={handleSubmit}>
                    <div className="box-identitas">
                        <h4>Masukkan Identitas Karyawan:</h4>
                        <div className="isi-box-identitas">
                            <div className='box-identitas'>
                                <label>Nama:</label>
                                <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                />
                            </div>

                            <div className='box-identitas'>
                                <label>Divisi:</label>
                                <input
                                type="text"
                                value={divisi}
                                onChange={(e) => setDivisi(e.target.value)}
                                required
                                />
                            </div>
                        </div>
                        
                    </div>
                
                    <div className='box-shift'>
                        <h4>Pilih Shift per Hari:</h4>
                        {days.map((day) => (
                        <div key={day.id} style={{ marginBottom: '10px', position: 'relative' }}>
                            <strong>{day.name}</strong>
                            <div
                            style={{
                                padding: '5px',
                                border: '1px solid #ccc',
                                marginTop: '5px',
                                cursor: 'pointer',
                                backgroundColor: '#fff',
                                width: '200px'
                            }}
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
                            <ul
                                style={{
                                listStyle: 'none',
                                padding: 0,
                                margin: 0,
                                border: '1px solid #ccc',
                                position: 'absolute',
                                backgroundColor: 'white',
                                zIndex: 1000,
                                width: '200px'
                                }}
                            >
                                {shiftOptions.map((shift) => (
                                <li
                                    key={shift.id}
                                    style={{
                                    padding: '5px',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid #eee'
                                    }}
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

                <button type="submit">Simpan Jadwal</button>
                </form>