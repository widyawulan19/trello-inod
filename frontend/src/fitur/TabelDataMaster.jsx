import React, { useState, useMemo } from "react";
import '../style/fitur/TabelDataMaster.css'
import { FiSearch } from "react-icons/fi";

const TabelDataMaster = ({
  title,
  data,
  columns,
  onAdd,
  onEdit,
  onDelete,
  btnName
}) => {

  const [searchTerm, setSearchTerm] = useState("");

  // Filter data berdasarkan nama (kolom pertama atau key tertentu)
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter((row) =>
      columns.some(col =>
        String(row[col.key])?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, data, columns]);

  return (
    <div className="table-master-container">
      <div className="table-header">
        <h2>Data Master : {title}</h2>

        <div className="table-btn">
          <div className="table-input">
            <FiSearch className="icon-table"/>
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="table-search-input"
            />
          </div>
          
          {onAdd && <button className="add" onClick={onAdd}>+ Add New {btnName}</button>}
          <button>Export Data</button>
        </div>
      </div>

      <div className="master-table">
        <table className="table-box">
          <thead>
            <tr>
              <th>No</th>
              {columns.map(col => <th key={col.key}>{col.label}</th>)}
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? "even-row" : "odd-row"}>
                <td>{i + 1}</td>
                {columns.map(col => <td key={col.key}>{row[col.key]}</td>)}
                <td>
                  {onEdit && <button onClick={() => onEdit(row)}>Edit</button>}
                  {onDelete && <button onClick={() => onDelete(row)}>Delete</button>}
                </td>
              </tr>
            ))}

            {filteredData.length === 0 && (
              <tr>
                <td colSpan={columns.length + 2} style={{textAlign: "center"}}>
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TabelDataMaster;
