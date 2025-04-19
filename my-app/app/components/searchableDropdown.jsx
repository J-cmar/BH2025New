"use client";
import { useEffect, useState, useRef } from "react";

export default function SearchableDropdown({
  source,
  placeholder = "Search...",
  onSelect,
}) {
  const [allItems, setAllItems] = useState([]);
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(source);
      const data = await res.json();
      setAllItems(data);
    };
    fetchData();
  }, [source]);

  useEffect(() => {
    if (query === "") {
      setFiltered([]);
      setActiveIndex(-1);
      return;
    }

    const search = query.toLowerCase();
    const matches = allItems
      .filter((item) => item.toLowerCase().includes(search))
      .sort()
      .slice(0, 5);
    setFiltered(matches);
    setActiveIndex(-1);
  }, [query, allItems]);

  const handleResultClick = (name) => {
    setQuery(name);
    setFiltered([]);
    setActiveIndex(-1);
    onSelect?.(name);
  };

  const handleKeyDown = (e) => {
    if (filtered.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev <= 0 ? filtered.length - 1 : prev - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0) {
        handleResultClick(filtered[activeIndex]);
      }
    }
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full p-3 bg-white border border-gray-300 rounded outline-none"
        aria-autocomplete="list"
        aria-controls="dropdown-list"
        aria-activedescendant={
          activeIndex >= 0 ? `dropdown-option-${activeIndex}` : undefined
        }
      />

      <ul
        id="dropdown-list"
        ref={listRef}
        className={`absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 shadow ${
          filtered.length > 0 ? "" : "hidden"
        }`}
        role="listbox"
      >
        {filtered.map((item, idx) => (
          <li
            key={idx}
            id={`dropdown-option-${idx}`}
            role="option"
            aria-selected={activeIndex === idx}
            className={`px-3 py-2 cursor-pointer ${
              activeIndex === idx ? "bg-gray-200" : "hover:bg-gray-100"
            }`}
            onClick={() => handleResultClick(item)}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
