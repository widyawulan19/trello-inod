import { useEffect, useState } from "react";

const TabelDataMaster = ({ title, endpoint, columns, onEdit, onDelete }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => setData(data));
  }, [endpoint]);

  return (
    <div className="fade">
      <h2>{title}</h2>

      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {columns.map((col) => (
                <td key={col.key}>{row[col.key]}</td>
              ))}
              <td>
                <button onClick={() => onEdit(row)}>Edit</button>
                <button onClick={() => onDelete(row)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TabelDataMaster;
