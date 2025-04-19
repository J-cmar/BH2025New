"use client";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient.js";
import Navbar from "../navbar";

export default function MedicationInfo() {
	const [medication, setMedication] = useState("");
	const [type, setType] = useState("");
	const [days, setDays] = useState([]);
	const [times, setTimes] = useState([]);

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
			<form onSubmit={handleSubmit} className="p-4 space-y-4">
				<input
					type="text"
					placeholder="Enter the medication name"
					value={medication}
					onChange={(e) => setMedication(e.target.value)}
					className="border p-2 w-full"
				/>
				<input
					type="text"
					placeholder="Enter the type/purpose of the medication"
					value={type}
					onChange={(e) => setType(e.target.value)}
					className="border p-2 w-full"
				/>

				<input
					type="text"
					placeholder="Enter the dosage days"
					onChange={(e) => setDays(e.target.value.split(","))}
					className="border p-2 w-full"
				/>
				<input
					type="text"
					placeholder="Enter the dosage times"
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
