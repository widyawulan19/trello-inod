import React, { useState, useEffect } from 'react';
import { searchCards } from '../services/ApiServices';
import '../style/fitur/SearchCard.css';
import { IoSearchOutline } from 'react-icons/io5';

const SearchCard = ({ workspaceId }) => {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);

  // Auto-search saat keyword berubah
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (keyword.trim() && workspaceId) {
        handleSearch();
      } else {
        setResults([]);
      }
    }, 400); // debounce 400ms

    return () => clearTimeout(delayDebounce);
  }, [keyword, workspaceId]);

  const handleSearch = async () => {
    try {
      const response = await searchCards(keyword, workspaceId);
      setResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  return (
    <div className="search-card-container">
      <IoSearchOutline size={18} />
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Search card title or description..."
      />

      <div className="search-card-result">
        {keyword && results.length === 0 && (
          <p>No results found.</p>
        )}

        {results.map((card) => (
          <div key={card.card_id} className="search-box">
            <h3>{card.title}</h3>
            <p className="p-desc">{card.description}</p>
            <p className="p-contex">
              📦 List: <strong>{card.list_name}</strong> | 🧭 Board: <strong>{card.board_name}</strong> | 🏢 Workspace: <strong>{card.workspace_name}</strong>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchCard;
