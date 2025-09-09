import React, { useState, useEffect, useRef } from "react";
import '../style/pages/EditMarketingForm.css'
import { HiPlus } from "react-icons/hi2";
import { FaPlus } from "react-icons/fa6";

const CustomDropdown = ({
  options = [],          // data list
  value,
  onChange,
  newItem,
  setNewItem,
  addNew,
  placeholder = "Pilih item",   // placeholder default untuk field utama
  searchPlaceholder = "Search...", // placeholder untuk search input
  addPlaceholder = "Add new...",   // placeholder untuk add new input
  loading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef();

  const handleSelect = (id) => {
    onChange(id);
    setIsOpen(false);
    setSearch("");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dropdown-custom-container" ref={ref}>
      {/* Dropdown Trigger */}
      <div
      className='dropdown-trigger'
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{options.find(o => o.id === value)?.name || placeholder}</span>
        <span className={isOpen ? "rotate-180 transition-transform" : "transition-transform"}>▼</span>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <ul className='menu-ul'>
          {/* Search Input */}
          <li>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              disabled={loading}
            />
          </li>

          {/* Loading */}
          {loading && <li className="p-2 text-center text-gray-500">Loading...</li>}

          {/* Empty state */}
          {!loading && filteredOptions.length === 0 && (
            <li className="p-2 text-center text-gray-500">Data tidak tersedia</li>
          )}

           {/* List options */}
          <div className="menu-option">
          {!loading && filteredOptions.map((o) => (
            
              <li
                key={o.id}
                className='li-option'
                onClick={() => handleSelect(o.id)}
              >
                {o.name}
              </li>
          ))}
          </div>

          {/* Add new */}
          {!loading && (
            <li className='new-li'>
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder={addPlaceholder}
              />
              <button
                type="button"
                onClick={addNew}
              >
                <FaPlus/>
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default CustomDropdown;
