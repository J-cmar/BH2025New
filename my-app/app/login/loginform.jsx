"use client";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Navbar from "../navbar";

export default function LoginForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [mode, setMode] = useState("login"); // or "signup"
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	const handleAuth = async (e) => {
		e.preventDefault();
		setLoading(true);
		setMessage("");
		setError("");

		if (!email || !password) {
			setError("Please enter both email and password.");
			setLoading(false);
			return;
		}

		try {
			let res;
			if (mode === "login") {
				res = await supabase.auth.signInWithPassword({
					email,
					password,
				});
			} else {
				res = await supabase.auth.signUp({
					email,
					password,
				});
			}

			if (res.error) {
				setError(res.error.message);
			} else {
				setMessage(
					mode === "signup"
						? "Check your email to confirm your account."
						: "Login successful!"
				);
				if (mode === "login") window.location.href = "/";
			}
		} catch (err) {
			setError("Unexpected error.");
		}

		setLoading(false);
	};

	return (<>
		<Navbar className="navbar" />
		<div className="max-w-md mx-auto mt-20 p-6 border rounded bg-white shadow">
			<h2 className="text-2xl font-bold mb-4 text-center">
				{mode === "login" ? "Log In" : "Sign Up"}
			</h2>

			<form onSubmit={handleAuth}>
				<input
					type="email"
					placeholder="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className="w-full p-3 mb-3 border rounded"
					required
				/>
				<input
					type="password"
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					className="w-full p-3 mb-4 border rounded"
					required
				/>
				<button
					type="submit"
					className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
					disabled={loading}
				>
					{loading
						? "Please wait..."
						: mode === "login"
						? "Log In"
						: "Sign Up"}
				</button>
			</form>

			<p className="mt-4 text-center text-sm text-gray-600">
				{mode === "login" ? (
					<>
						Don't have an account?{" "}
						<button
							className="text-blue-600 underline"
							onClick={() => setMode("signup")}
						>
							Sign up here
						</button>
					</>
				) : (
					<>
						Already have an account?{" "}
						<button
							className="text-blue-600 underline"
							onClick={() => setMode("login")}
						>
							Log in here
						</button>
					</>
				)}
			</p>

			{message && (
				<p className="mt-3 text-green-600 text-center">{message}</p>
			)}
			{error && (
				<p className="mt-3 text-red-600 text-center">{error}</p>
			)}
		</div>
		</>
	);
}
