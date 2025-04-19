"use client";

import Navbar from "../navbar";
import { useEffect, useState } from "react";

export default function MedicationConflicts() {
    const [allMeds, setAllMeds] = useState([]);
    const [query, setQuery] = useState("");
    const [filtered, setFiltered] = useState([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [results, setResults] = useState(null); // Store scraping results
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
            const fetchData = async () => {
                const res = await fetch("/data/medication_names.json");
                const data = await res.json();
                setAllMeds(data);
            };
            fetchData();
    }, []);

    useEffect(() => {
      if (query === "") {
        setFiltered([]);
        setActiveIndex(-1);
        return;
      }

      const search = query.toLowerCase();
      const matches = allMeds
        .filter((name) => name.toLowerCase().includes(search))
        .sort()
        .slice(0, 5);
      setFiltered(matches);
      setActiveIndex(-1);
    }, [query, allMeds]);

    const toTitleCase = (str) =>
      str
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    const handleResultClick = async (name) => {
      setQuery(toTitleCase(name));
      setFiltered([]);
      setActiveIndex(-1);

      // Call the backend API
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/drug-conflicts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ drugName: name }),
        });
        const data = await res.json();
        setResults(data.results);
      } catch (err) {
        console.log(err);
        setError("Failed to fetch medication conflicts.");
      } finally {
        setLoading(false);
      }
    };

    return (
      <>
        <Navbar />
        <div className="flex justify-center min-h-screen p-4 pt-24 bg-gray-50">
          <div className="w-1/2 relative">
            <h1 className="text-2xl font-semibold mb-4 text-center">
              Harmful Medication Interactions
            </h1>

            {/* Search bar */}
            <input
              type="text"
              placeholder="Search medication..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
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
              }}
              className="w-full p-3 bg-white border border-gray-300 rounded outline-none"
            />

            {/* Result dropdown */}
            <ul
              className={`absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 shadow ${
                filtered.length > 0 ? "" : "hidden"
              }`}
              role="listbox"
            >
              {filtered.map((name, idx) => (
                <li
                  key={idx}
                  id={`med-option-${idx}`}
                  role="option"
                  aria-selected={activeIndex === idx}
                  className={`px-3 py-2 cursor-pointer ${
                    activeIndex === idx ? "bg-gray-200" : "hover:bg-gray-100"
                  }`}
                  onClick={() => handleResultClick(name)}
                >
                  {toTitleCase(name)}
                </li>
              ))}
            </ul>

            {/* Display results */}
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {results && (
              <div className="mt-4">
                <h2 className="text-xl font-semibold mb-2">Drug Conflicts:</h2>
                <ul className="space-y-3">
                  {[...results]
                    .sort((a, b) => b.seriousness - a.seriousness)
                    .map((item, idx) => (
                      <li
                        key={idx}
                        className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-lg font-medium">
                            {toTitleCase(item.drug)}
                          </span>
                          <span
                            className={`text-sm font-semibold ${
                              item.seriousness === 3
                                ? "text-red-600"
                                : item.seriousness === 2
                                ? "text-yellow-600"
                                : "text-green-600"
                            }`}
                          >
                            Severity:{" "}
                            {item.seriousness === 3
                              ? "High ⚠️"
                              : item.seriousness === 2
                              ? "Moderate ⚠"
                              : "Low ✅"}
                          </span>
                        </div>
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline text-sm"
                        >
                          View interaction details
                        </a>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }