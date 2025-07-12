import React, { useState, useEffect } from 'react';
import { searchCards } from '../services/ApiServices';
import '../style/fitur/SearchCard.css';
import { IoSearchOutline } from 'react-icons/io5';
import { IoIosCard } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';

const SearchCard = ({ workspaceId }) => {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (keyword.trim() && workspaceId) {
        handleSearch();
      } else {
        setResults([]);
      }
    }, 400);

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

    const extractMatchingSnippet = (description, keyword, contextLength = 30) => {
        if (!description || !keyword) return '';

        const lowerDesc = description.toLowerCase();
        const lowerKeyword = keyword.toLowerCase();
        const index = lowerDesc.indexOf(lowerKeyword);

        if (index === -1) return '';

        // Ambil sedikit konteks sebelum dan sesudah keyword
        const start = Math.max(index - contextLength, 0);
        const end = Math.min(index + keyword.length + contextLength, description.length);
        let snippet = description.slice(start, end);

        // Tambahkan ... jika dipotong di awal/akhir
        if (start > 0) snippet = '... ' + snippet;
        if (end < description.length) snippet = snippet + ' ...';

        // Highlight keyword
        const regex = new RegExp(`(${keyword})`, 'gi');
        const highlighted = snippet.replace(regex, '<mark>$1</mark>');

        return highlighted;
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

    {keyword !== '' && (
      <div className="search-card-result">
        {keyword && results.length === 0 && (
          <p className='no-res'>No results found.</p>
        )}

        {results.length > 0 && (
          <ul className="search-result-list">
            {results.map((card) => (
              <li
                    key={card.card_id}
                    className="p-3 mb-2 border rounded cursor-pointer search-result-item hover:bg-gray-100"
                    onClick={() => navigate(
                        `/workspaces/${card.workspace_id}/board/${card.board_id}/lists/${card.list_id}/cards/${card.card_id}`
                    )}
                >
                <div className='card-title'>
                    <strong>{card.title}</strong>
                </div>
                <p
                    className="p-desc"
                    dangerouslySetInnerHTML={{ __html: extractMatchingSnippet(card.description, keyword) }}
                ></p>

                <p className="p-contex">
                 Workspace: <strong>{card.workspace_name}</strong> | Board: <strong>{card.board_name}</strong> | List: <strong>{card.list_name}</strong> 
                {/* List: <strong>{card.list_name}</strong> | Board: <strong>{card.board_name}</strong> |  */}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
      )}
      
    </div>
  );
};

export default SearchCard;
