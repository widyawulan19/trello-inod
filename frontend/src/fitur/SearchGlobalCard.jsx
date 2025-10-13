import React, { useState, useEffect } from 'react';
import { searchCardsByUser } from '../services/ApiServices';
import '../style/fitur/SearchCard.css';
import { IoSearchOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { FaCreditCard } from 'react-icons/fa6';

const SearchGlobalCard = ({ userId }) => {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (keyword.trim() && userId) {
        handleSearch();
      } else {
        setResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [keyword, userId]);

  const handleSearch = async () => {
    try {
      const response = await searchCardsByUser(keyword, userId);
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

    const start = Math.max(index - contextLength, 0);
    const end = Math.min(index + keyword.length + contextLength, description.length);
    let snippet = description.slice(start, end);

    if (start > 0) snippet = '... ' + snippet;
    if (end < description.length) snippet = snippet + ' ...';

    const regex = new RegExp(`(${keyword})`, 'gi');
    const highlighted = snippet.replace(regex, '<mark>$1</mark>');

    return highlighted;
  };

  return (
    <div className="search-global-container">
      <IoSearchOutline size={18} />
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Search your cards across all workspaces..."
      />

      {keyword !== '' && (
        <div className="search-global-result">
          <div className="search-header">
            <h2>
              <div className="sgh-icon">
                <FaCreditCard />
              </div>
              Search results
            </h2>
          </div>

          {results.length === 0 && <p className="no-res">No results found.</p>}

          {results.length > 0 && (
            <ul className="search-result-list">
              {results.map((card) => (
                <li
                  key={card.card_id}
                  className={`p-3 mb-2 border rounded cursor-pointer search-result-item hover:bg-gray-100 ${
                    card.status === 'Archive' ? 'archive-card' : ''
                  }`}
                  onClick={() => {
                    navigate(
                      `/layout/workspaces/${card.workspace_id}/board/${card.board_id}/lists/${card.list_id}/cards/${card.card_id}`
                    );
                    setKeyword('');
                  }}
                >
                  <div className="card-title">
                    <strong>{card.title}</strong>
                    {card.status === 'Archive' && (
                      <span className="archive-badge">Archive</span>
                    )}
                  </div>
                  <p
                    className="p-desc"
                    dangerouslySetInnerHTML={{
                      __html: extractMatchingSnippet(card.description, keyword),
                    }}
                  ></p>

                  <p className="p-contex">
                    Workspace: <strong>{card.workspace_name}</strong> | Board: <strong>{card.board_name}</strong> | List: <strong>{card.list_name}</strong>
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

export default SearchGlobalCard;
