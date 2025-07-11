import React, { useEffect, useState } from 'react';
import { getAllDataArchive } from '../services/ApiServices';

const ArchiveUniversal = () => {
  const [archiveData, setArchiveData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState(''); // untuk search by entity_type

  const fetchArchiveData = async () => {
    setLoading(true);
    try {
      const response = await getAllDataArchive();
      setArchiveData(response.data);
      setFilteredData(response.data); // set awal
    } catch (error) {
      console.error('Error fetching archive data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchiveData();
  }, []);

  const handleFilterChange = (e) => {
    const selectedType = e.target.value.toLowerCase();
    setFilterType(selectedType);

    if (selectedType === '') {
      setFilteredData(archiveData); // reset
    } else {
      const filtered = archiveData.filter(item =>
        item.entity_type.toLowerCase().includes(selectedType)
      );
      setFilteredData(filtered);
    }
  };

  return (
    <div className="p-4">
      <h2 className="mb-4 text-xl font-semibold">Archived Data</h2>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by entity_type (e.g. boards)"
          value={filterType}
          onChange={handleFilterChange}
          className="w-full max-w-sm p-2 border rounded"
        />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="space-y-4">
          {filteredData.map((item) => (
            <li key={item.id} className="p-3 border rounded shadow-sm">
              <p><strong>Entity Type:</strong> {item.entity_type}</p>
              <p><strong>Entity ID:</strong> {item.entity_id}</p>
              <p><strong>Archived At:</strong> {new Date(item.archived_at).toLocaleString()}</p>
              <p><strong>User ID:</strong> {item.user_id ?? '-'}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ArchiveUniversal;
