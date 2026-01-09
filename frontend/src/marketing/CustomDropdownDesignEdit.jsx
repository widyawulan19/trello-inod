import React, { useState, useEffect, useRef } from "react";
import '../style/pages/EditMarketingForm.css'
import { HiPlus } from "react-icons/hi2";
import { FaPlus } from "react-icons/fa6";

const CustomDropdownDesignEdit = ({
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
      <div className='dropdown-trigger' onClick={() => setIsOpen(!isOpen)}>
        <span>{options.find(o => o.id === value)?.name || placeholder}</span>
        <span className={isOpen ? "rotate-180 transition-transform" : "transition-transform"}>▼</span>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="menu-custom-dropdown">
          {/* search input  */}
          <div className="menu-search">
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              disabled={loading}
              className="input-menu-ul" 
            />
          </div>

          {/* loading  */}
          {loading && <li className="p-2 text-center text-gray-500">Loading...</li>}

          {/* Empty state */}
          {!loading && filteredOptions.length === 0 && (
            <li className="p-2 text-center text-gray-500">Data tidak tersedia</li>
          )}

          {/* item dropdown  */}
          <div className="menu-ul">
            <ul>
              {!loading && filteredOptions.map((o) => (
                  <li
                    key={o.id}
                    className='li-option'
                    onClick={() => handleSelect(o.id)}
                  >
                    {o.name}
                  </li>
              ))}
            </ul>
          </div>

          {/* button add  */}
          {!loading && (
            <div className="btn-new-add">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder={addPlaceholder}
                className="input-new"
              />
              <button type="button" onClick={addNew}>
                <FaPlus/>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomDropdownDesignEdit;

