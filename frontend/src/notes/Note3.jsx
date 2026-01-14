      {/* Pilih Bulan */}
      <div className="dp-select">
          <div className="select-bulan">
            <label>Pilih Bulan:</label>

            {/* Trigger */}
            <div
              className="month-trigger"
              onClick={() => setOpenMonth(!openMonth)}
            >
              {selectedMonth
                ? new Date(selectedMonth).toLocaleString("id-ID", {
                    month: "long",
                    year: "numeric",
                  })
                : "Pilih Bulan"}

              <span className={ openMonth ? "chevron rotate-180" : "chevron"}> ▼ </span>
            </div>

            {/* Dropdown */}
            {openMonth && (
              <div className="month-dropdown">
                {/* SEARCH INPUT */}
                <div className="search-box">
                  <HiOutlineSearch size={15}/>
                  <input
                    type="text"
                    placeholder="Cari bulan..."
                    value={monthSearch}
                    onChange={(e) => setMonthSearch(e.target.value)}
                    className="month-search"
                  />
                </div>
                

                <div className='month-dropdown-item'>
                  <ul>
                    {filteredMonthData.length > 0 ? (
                      filteredMonthData.map((item, idx) => (
                        <li
                          key={idx}
                          className={`month-item ${
                            selectedMonth === item.month
                              ? "active"
                              : ""
                          }`}
                          onClick={() => {
                            handleMonthChange({
                              target: { value: item.month },
                            });
                            setOpenMonth(false);
                            setMonthSearch("");
                          }}
                        >
                          {new Date(item.month).toLocaleString(
                            "id-ID",
                            {
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </li>
                      ))
                    ) : (
                      <li className="month-empty">
                        Bulan tidak ditemukan
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>



        {/* Pilih Periode */}
        {uniquePeriods.length > 0 && (
            <div className="select-periode">
            <label className="mr-2 font-semibold">Pilih Periode:</label>
            <select
                value={selectedPeriod || ""}
                onChange={(e) => setSelectedPeriod(e.target.value)} // jika period string
            >
                <option value="">-- Semua Periode --</option>
                {uniquePeriods.map((period, idx) => (
                <option key={idx} value={period}>
                    Periode {getPeriodLabel(period)}
                </option>
                ))}
            </select>
            </div>
        )}
      </div>


{/* Pilih Periode */}
{uniquePeriods.length > 0 && (
  <div className="select-periode">
    <label className="mr-2 font-semibold">
      Pilih Periode:
    </label>

    {/* Trigger */}
    <div
      className="period-trigger"
      onClick={() => setOpenPeriod(!openPeriod)}
    >
      {selectedPeriod
        ? `Periode ${getPeriodLabel(selectedPeriod)}`
        : "-- Semua Periode --"}

      <span
        className={
          openPeriod
            ? "chevron rotate-180"
            : "chevron"
        }
      >
        ▼
      </span>
    </div>

    {/* Dropdown */}
    {openPeriod && (
      <ul className="period-dropdown">
        {/* All option */}
        <li
          className={`period-item ${
            selectedPeriod === "" ? "active" : ""
          }`}
          onClick={() => {
            setSelectedPeriod("");
            setOpenPeriod(false);
          }}
        >
          -- Semua Periode --
        </li>

        {uniquePeriods.map((period, idx) => (
          <li
            key={idx}
            className={`period-item ${
              selectedPeriod === period
                ? "active"
                : ""
            }`}
            onClick={() => {
              setSelectedPeriod(period);
              setOpenPeriod(false);
            }}
          >
            Periode {getPeriodLabel(period)}
          </li>
        ))}
      </ul>
    )}
  </div>
)}


export const getTodayReportMarketing = async () => {
  try {
    const response = await axios.get(`${API_URL}/marketing/reports/today`);
    return response.data;
  } catch (error) {
    console.error('gagal mengambil data report hari ini', error);
    return [];
  }
};