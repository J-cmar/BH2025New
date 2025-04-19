"use client";
import { useEffect, useState } from "react";
import Navbar from "../navbar";
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
} from "@mui/material";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function RecallInformationPage() {
	const [allMeds, setAllMeds] = useState([]);
	const [query, setQuery] = useState("");
	const [filtered, setFiltered] = useState([]);
	const [activeIndex, setActiveIndex] = useState(-1);
	const [lookbackWeeks, setLookbackWeeks] = useState(1);
	const [recallResults, setRecallResults] = useState([]);
	const [searched, setSearched] = useState(false);

	const [user, setUser] = useState(null);
	const router = useRouter();

	useEffect(() => {
	  const getUser = async () => {
		const { data } = await supabase.auth.getSession();
		setUser(data?.session?.user || null);
	  };
	  getUser();
	}, []);
	
  useEffect(() => {
    if (searched && query.trim()) {
      handleResultClick(query);
    }
  }, [lookbackWeeks]);

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
    
		if (!name || !lookbackWeeks) {
			console.log(
				"🚫 Medication or lookback period missing. Skipping API call."
			);
			return;
		}

		setQuery(toTitleCase(name));
		setFiltered([]);
		setActiveIndex(-1);

		const now = new Date();
		const endDate = formatFDA(now);
		const pastDate = new Date(now);
		pastDate.setDate(pastDate.getDate() - lookbackWeeks * 7);
		const startDate = formatFDA(pastDate);
		setSearched(true);
		const url = `https://api.fda.gov/drug/enforcement.json?search=report_date:[${startDate}+TO+${endDate}]&limit=500`;

		try {
			const res = await fetch(url);
			const data = await res.json();

			console.log("🧪 API Query:", url);

			if (data.results && data.results.length > 0) {
				console.log("✅ Recalls found:");
				const matchingResults = data.results.filter((recall) => {
					const fieldsToSearch = [
						recall.brand_name,
						recall.generic_name,
						recall.product_description,
					];

					return fieldsToSearch.some((field) =>
						field?.toLowerCase().includes(name.toLowerCase())
					);
				});

				setRecallResults(matchingResults);
			} else {
				console.log("⚠️ No recall results found.");
				setRecallResults([]);
			}
		} catch (err) {
			console.error("API call failed:", err);
		}
	};

	const formatFDA = (date) => {
		return date.toISOString().slice(0, 10).replace(/-/g, "");
	};

	return (
		<>
			<Navbar />
			<div className="min-h-screen p-4 pt-24 bg-gray-50 flex flex-col items-center">
				<div className="w-full max-w-3xl relative">
					<h1 className="text-2xl font-semibold mb-4 text-center">
						Recall Information
					</h1>

					{/* Look-back selector */}
					<FormControl
						fullWidth
						variant="outlined"
						className="mb-4 bg-white"
					>
						<InputLabel id="lookback-label">
							Look-back Period
						</InputLabel>
						<Select
							labelId="lookback-label"
							value={lookbackWeeks}
							onChange={(e) => {
								setLookbackWeeks(e.target.value);
							}}
							label="Look-back Period"
							renderValue={(selected) => (
								<span>
									{selected} week{selected > 1 ? "s" : ""}
									<span className="text-gray-400">
										{" "}
										(from today)
									</span>
								</span>
							)}
						>
							{[1, 2, 3, 4].map((week) => (
								<MenuItem key={week} value={week}>
									{week} week{week > 1 ? "s" : ""}
								</MenuItem>
							))}
						</Select>
					</FormControl>

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
								setActiveIndex(
									(prev) => (prev + 1) % filtered.length
								);
							} else if (e.key === "ArrowUp") {
								e.preventDefault();
								setActiveIndex((prev) =>
									prev <= 0 ? filtered.length - 1 : prev - 1
								);
							} else if (e.key === "Enter") {
								e.preventDefault();
								setFiltered([]);
								handleResultClick(query);
								if (activeIndex >= 0) {
									handleResultClick(filtered[activeIndex]);
								}
							}
						}}
						className="w-full p-3 bg-white border border-gray-300 rounded outline-none"
					/>
					{user && query.trim() && (
						<>
						<button
							onClick={async () => {
							const { error } = await supabase
								.from("watchlist")
								.insert([{ user_id: user.id,       
									email: user.email, // add email here
									medication_name: query.trim() }]);

							if (error) {
								console.error("Error adding to watchlist:", error.message);
							} else {
								alert(`${query.trim()} added to your watchlist.`);
							}
							}}
							className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
						>
							Add to Watchlist
						</button>
						<button
						onClick={() => router.push("/watchlist")}
						className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
					  >
						View Watchlist
					  </button>
					  </>
					)}


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
									activeIndex === idx
										? "bg-gray-200"
										: "hover:bg-gray-100"
								}`}
								onClick={() => handleResultClick(name)}
							>
								{toTitleCase(name)}
							</li>
						))}
					</ul>
				</div>

				{/* Full-width recall table */}
				{searched && recallResults.length === 0 && (
					<div className="mt-8 text-center text-gray-500 text-lg">
						No recalls found for "{query}" in the past{" "}
						{lookbackWeeks} week{lookbackWeeks > 1 ? "s" : ""}.
					</div>
				)}
				{recallResults.length > 0 && (
					<div className="w-full mt-12">
						<TableContainer component={Paper} className="w-full">
							<Table>
								<TableHead>
									<TableRow>
										<TableCell>
											<strong>Brand</strong>
										</TableCell>
										<TableCell>
											<strong>Generic</strong>
										</TableCell>
										<TableCell>
											<strong>Description</strong>
										</TableCell>
										<TableCell>
											<strong>Reason</strong>
										</TableCell>
										<TableCell>
											<strong>Status</strong>
										</TableCell>
										<TableCell>
											<strong>Report Date</strong>
										</TableCell>
										<TableCell>
											<strong>State</strong>
										</TableCell>
										<TableCell>
											<strong>City</strong>
										</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{recallResults.map((recall, idx) => (
										<TableRow key={idx}>
											<TableCell>
												{recall.brand_name || "N/A"}
											</TableCell>
											<TableCell>
												{recall.generic_name || "N/A"}
											</TableCell>
											<TableCell>
												{recall.product_description ||
													"N/A"}
											</TableCell>
											<TableCell>
												{recall.reason_for_recall ||
													"N/A"}
											</TableCell>
											<TableCell>
												{recall.status || "N/A"}
											</TableCell>
											<TableCell>
												{recall.report_date || "N/A"}
											</TableCell>
											<TableCell>
												{recall.state || "N/A"}
											</TableCell>
											<TableCell>
												{recall.city || "N/A"}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
					</div>
				)}
			</div>
		</>
	);
}
