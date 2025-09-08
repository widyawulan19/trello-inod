import React, { useState, useEffect, useRef } from "react";

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
    <div className="relative w-full" ref={ref}>
      {/* Dropdown Trigger */}
      <div
        className="border p-2 rounded cursor-pointer flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{options.find(o => o.id === value)?.name || placeholder}</span>
        <span className={isOpen ? "rotate-180 transition-transform" : "transition-transform"}>▼</span>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <ul className="absolute z-10 w-full border bg-white max-h-56 overflow-y-auto mt-1 shadow-md rounded">
          {/* Search Input */}
          <li className="p-2 border-b">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full p-1 border rounded"
              disabled={loading}
            />
          </li>

          {/* Loading */}
          {loading && <li className="p-2 text-gray-500 text-center">Loading...</li>}

          {/* Empty state */}
          {!loading && filteredOptions.length === 0 && (
            <li className="p-2 text-gray-500 text-center">Data tidak tersedia</li>
          )}

          {/* List options */}
          {!loading && filteredOptions.map((o) => (
            <li
              key={o.id}
              className="p-2 cursor-pointer hover:bg-blue-100"
              onClick={() => handleSelect(o.id)}
            >
              {o.name}
            </li>
          ))}

          {/* Add new */}
          {!loading && (
            <li className="p-2 border-t mt-1 flex space-x-2">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder={addPlaceholder}
                className="border p-1 flex-1 rounded"
              />
              <button
                type="button"
                onClick={addNew}
                className="px-2 text-white bg-green-500 rounded hover:bg-green-600"
              >
                Tambah
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default CustomDropdown;
