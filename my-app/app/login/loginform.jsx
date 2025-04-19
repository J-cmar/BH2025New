"use client";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AuthForm() {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [mode, setMode] = useState("login"); // 'login' or 'signup'

	const handleAuth = async (e) => {
		e.preventDefault();
		setLoading(true);
		setMessage("");

		const action = mode === "login" ? "signInWithOtp" : "signUp";
		const { error } =
			mode === "login"
				? await supabase.auth.signInWithOtp({ email })
				: await supabase.auth.signUp({ email });

		if (error) {
			setMessage("Error: " + error.message);
		} else {
			setMessage("Check your email for a magic link!");
		}
		setLoading(false);
	};

	return (
		<div className="max-w-md mx-auto mt-20 p-6 border rounded bg-white shadow">
			<h2 className="text-2xl font-semibold mb-4 text-center">
				{mode === "login" ? "Login" : "Sign Up"}
			</h2>
			<form onSubmit={handleAuth}>
				<input
					type="email"
					placeholder="Your email"
					className="w-full p-3 border mb-4 rounded"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
				/>
				<button
					type="submit"
					className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
					disabled={loading}
				>
					{loading
						? "Sending..."
						: mode === "login"
						? "Send Login Link"
						: "Send Sign Up Link"}
				</button>
			</form>

			<p className="mt-4 text-center text-sm">
				{mode === "login" ? (
					<>
						Don't have an account?{" "}
						<button
							className="text-blue-600 underline"
							onClick={() => setMode("signup")}
						>
							Sign Up
						</button>
					</>
				) : (
					<>
						Already have an account?{" "}
						<button
							className="text-blue-600 underline"
							onClick={() => setMode("login")}
						>
							Log In
						</button>
					</>
				)}
			</p>

			{message && (
				<p className="text-sm mt-4 text-center text-gray-600">
					{message}
				</p>
			)}
		</div>
	);
}
