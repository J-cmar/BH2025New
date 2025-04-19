"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";
import Navbar from "../navbar";
import { useRouter } from "next/navigation";

export default function MedicationInfo() {
	const [medication, setMedication] = useState("");
	const [type, setType] = useState("");
	const [days, setDays] = useState([]);
	const [times, setTimes] = useState([]);
	const router = useRouter();

	const [allMeds, setAllMeds] = useState([]);
	const [filtered, setFiltered] = useState([]);
	const [activeIndex, setActiveIndex] = useState(-1);

	useEffect(() => {
		const checkUser = async () => {
			const { data } = await supabase.auth.getSession();
			if (!data.session) {
				router.push("/login");
			}
		};
		checkUser();
	}, [router]);

	// Load all medication names
	useEffect(() => {
		const fetchData = async () => {
			const res = await fetch("/data/medication_names.json");
			const data = await res.json();
			setAllMeds(data);
		};
		fetchData();
	}, []);

	// Filter dropdown as user types
	useEffect(() => {
		if (medication === "") {
			setFiltered([]);
			setActiveIndex(-1);
			return;
		}
		const search = medication.toLowerCase();
		const matches = allMeds
			.filter((name) => name.toLowerCase().includes(search))
			.sort()
			.slice(0, 5);
		setFiltered(matches);
		setActiveIndex(-1);
	}, [medication, allMeds]);

	const handleSubmit = async (e) => {
		e.preventDefault();

		const {
			data: { user },
		} = await supabase.auth.getUser();

		const { error } = await supabase.from("medication_schedule").insert([
			{
				user_id: user?.id || null,
				medication_name: medication,
				medication_type: type,
				days,
				times,
			},
		]);

		if (error) {
			alert("Failed to save: " + error.message);
		} else {
			alert("Medication reminder saved!");
		}
	};

	return (
		<>
			<Navbar className="navbar" />
<<<<<<< Updated upstream
			<form onSubmit={handleSubmit} className="p-4 space-y-4 max-w-xl mx-auto relative">
				<div className="relative">
					<input
						type="text"
						placeholder="Enter the medication name"
						value={medication}
						onChange={(e) => setMedication(e.target.value)}
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
									setMedication(filtered[activeIndex]);
									setFiltered([]);
								}
							}
						}}
						className="border p-2 w-full"
					/>
					<ul
						className={`absolute z-10 bg-white border border-gray-300 rounded mt-1 shadow w-full ${
							filtered.length > 0 ? "" : "hidden"
						}`}
					>
						{filtered.map((name, idx) => (
							<li
								key={idx}
								className={`px-3 py-2 cursor-pointer ${
									activeIndex === idx
										? "bg-gray-200"
										: "hover:bg-gray-100"
								}`}
								onClick={() => {
									setMedication(name);
									setFiltered([]);
								}}
							>
								{name}
							</li>
						))}
					</ul>
				</div>

=======
      <h1 className="text-2xl font-bold mb-2 ml-6 mt-6">Add Medications</h1>
      <p className="text-2xl font-bold mb-4 ml-6 mt-6">Use the form below to add a medication by its <br/> name, type, time and days to take</p>
      
			<form onSubmit={handleSubmit} className="p-4 space-y-4">
				<input
					type="text"
					placeholder="Enter the medication name"
					value={medication}
					onChange={(e) => setMedication(e.target.value)}
					className="border p-2 w-full"
				/>
>>>>>>> Stashed changes
				<input
					type="text"
					placeholder="Enter the type/purpose of the medication"
					value={type}
					onChange={(e) => setType(e.target.value)}
					className="border p-2 w-full"
				/>

				<input
					type="text"
					placeholder="Enter the dosage days (ie. Monday,Tuesday,...)"
					onChange={(e) => setDays(e.target.value.split(","))}
					className="border p-2 w-full"
				/>

				<input
					type="text"
					placeholder="Enter the dosage times (ie. 4:00, 13:00, 18:30)"
					onChange={(e) => setTimes(e.target.value.split(","))}
					className="border p-2 w-full"
				/>

				<button
					type="submit"
					className="bg-blue-600 text-white px-4 py-2 rounded"
				>
					Save Reminder
				</button>
			</form>
		</>
	);
}
