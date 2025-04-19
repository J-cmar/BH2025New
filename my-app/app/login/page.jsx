"use client";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function LoginForm() {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");

	const handleLogin = async (e) => {
		e.preventDefault();
		setLoading(true);
		setMessage("");

		const { error } = await supabase.auth.signInWithOtp({ email });

		if (error) {
			setMessage("Login error: " + error.message);
		} else {
			setMessage("Check your email for the login link!");
		}
		setLoading(false);
	};

	return (
		<div className="max-w-md mx-auto p-4 border rounded bg-white">
			<h2 className="text-xl mb-4">Login</h2>
			<form onSubmit={handleLogin}>
				<input
					type="email"
					className="w-full p-2 border mb-4"
					placeholder="Enter your email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
				<button
					type="submit"
					className="w-full p-2 bg-blue-600 text-white"
					disabled={loading}
				>
					{loading ? "Sending..." : "Send Magic Link"}
				</button>
			</form>
			{message && <p className="mt-4 text-sm text-gray-600">{message}</p>}
		</div>
	);
}
