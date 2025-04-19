"use client";
import { useEffect, useState } from "react";
import Navbar from "../navbar";
import { supabase } from "../lib/supabaseClient";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from "@mui/material";

export default function WatchlistPage() {
	const [user, setUser] = useState(null);
	const [watchlist, setWatchlist] = useState([]);

	useEffect(() => {
		const getUser = async () => {
			const { data } = await supabase.auth.getSession();
			setUser(data?.session?.user || null);
		};
		getUser();
	}, []);

	useEffect(() => {
		if (user) {
			fetchWatchlist();
		}
	}, [user]);

	const fetchWatchlist = async () => {
		const { data, error } = await supabase
			.from("watchlist")
			.select("*")
			.eq("user_id", user.id);

		if (error) {
			console.error("Error fetching watchlist:", error.message);
		} else {
			setWatchlist(data || []);
		}
	};

	const handleRemove = async (id) => {
		const { error } = await supabase.from("watchlist").delete().eq("id", id);
		if (error) {
			console.error("Error removing item:", error.message);
		} else {
			setWatchlist((prev) => prev.filter((item) => item.id !== id));
		}
	};

	return (
		<>
			<Navbar />
			<div className="p-8">
				<h1 className="text-2xl font-semibold mb-4">Your Watchlist</h1>
				{watchlist.length === 0 ? (
					<p className="text-gray-500">No medications in your watchlist.</p>
				) : (
					<TableContainer component={Paper}>
						<Table>
							<TableHead>
								<TableRow>
									<TableCell><strong>Medication</strong></TableCell>
									<TableCell><strong>Actions</strong></TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{watchlist.map((item) => (
									<TableRow key={item.id}>
										<TableCell>{item.medication_name}</TableCell>
										<TableCell>
											<Button
												variant="contained"
												color="error"
												onClick={() => handleRemove(item.id)}
											>
												Remove
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				)}
			</div>
		</>
	);
}
