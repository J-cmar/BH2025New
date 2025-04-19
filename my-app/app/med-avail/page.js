"use client";
import { useEffect, useState } from "react";
import Navbar from "../navbar";
import Map from "../components/map";
import { useRouter } from 'next/navigation';

export default function MedicationAvailabilityPage() {
    const [allMeds, setAllMeds] = useState([]);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState(null); // Store scraping results
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expandedIndices, setExpandedIndices] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch("/data/medication_names.json");
            const data = await res.json();
            setAllMeds(data);
        };
        fetchData();
    }, []);

    const toTitleCase = (str) =>
        str
            .toLowerCase()
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

    const handleSearch = async () => {
        if (!query.trim()) return;

        // Call the backend API
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/scrape", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ drugName: query }),
            });
            const data = await res.json();
            setResults(data.results);
        } catch (err) {
            console.log(err);
            setError("Failed to fetch medication availability.");
        } finally {
            setLoading(false);
        }
    };

    const toggleExpanded = (idx) => {
        if (expandedIndices.includes(idx)) {
            setExpandedIndices(expandedIndices.filter((i) => i !== idx));
        } else {
            setExpandedIndices([...expandedIndices, idx]);
        }
    };

    return (
        <>
            <Navbar />
            <div className="flex justify-center min-h-screen p-4 pt-24 bg-gray-50">
                <div className="w-1/2 relative">
                    <h1 className="text-2xl font-semibold mb-4 text-center">
                        Medication Availability
                    </h1>

                    {/* Search bar */}
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            placeholder="Search medication..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full p-3 bg-white border border-gray-300 rounded outline-none"
                        />
                        <button
                            onClick={handleSearch}
                            className="p-3 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Search
                        </button>
                    </div>

                    {/* Display results */}
                    {loading && <p>Loading...</p>}
                    {error && <p className="text-red-500">{error}</p>}
                    {results && (
                        <div className="mt-4">
                            <h2 className="text-xl font-semibold">Results:</h2>
                            <ul className="space-y-4">
                                {results.map((store, idx) => (
                                    <li key={idx} className="border p-4 rounded shadow">
                                        <div className="flex justify-between items-center">
                                            <span>
                                                <strong>{store.name}</strong>: {store.price}
                                            </span>
                                            <button
                                                onClick={() => toggleExpanded(idx)}
                                                className="text-blue-500 hover:underline"
                                            >
                                                {expandedIndices.includes(idx)
                                                    ? "Hide Locations"
                                                    : "Show Locations"}
                                            </button>
                                        </div>
                                        {expandedIndices.includes(idx) && (
                                            <div className="mt-4">
                                                {/* Render the map for this store */}
                                                <Map addresses={store.locations} />
                                                {/* List the locations */}
                                                <ul className="mt-2 list-disc pl-5">
                                                    {store.locations.map((location, locIdx) => (
                                                        <li key={locIdx}>{location}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
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