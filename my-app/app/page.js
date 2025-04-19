"use client";
import Link from "next/link";
import Navbar from "./navbar";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center p-8 bg-gray-50">
        {/* Header Section */}
        <header className="w-full max-w-3xl text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            💊 Find Affordable Medications Near You
          </h1>
          <p className="text-lg sm:text-xl mb-6">
            Quickly compare pharmacy prices and availability near you.
          </p>
          <div className="space-y-2 text-md mb-6">
            <p>✅ Save on prescriptions</p>
            <p>✅ View locations on an interactive map</p>
            <p>✅ Simple and fast results</p>
          </div>
          <div className="flex justify-center space-x-4 mb-12">
            <Link href="/med-avail">
              <button className="flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600">
                <span>🔍</span>
                <span>Search Now</span>
              </button>
            </Link>
            <Link href="/view-reminders">
              <button className="flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600">
                <span>🗓️</span>
                <span>View Schedule</span>
              </button>
            </Link>
            <Link href="/about">
              <button className="flex items-center space-x-2 px-6 py-3 bg-gray-800 text-white rounded hover:bg-gray-900">
                <span>ℹ️</span>
                <span>Learn More</span>
              </button>
            </Link>
          </div>
        </header>

        {/* Most Popular Medications */}
        <section className="w-full max-w-3xl bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">Most Popular Medications</h2>
          <div className="grid grid-cols-2 gap-4 text-center">
            <span className="p-2 border rounded">Adderall</span>
            <span className="p-2 border rounded">Lipitor</span>
            <span className="p-2 border rounded">Metformin</span>
            <span className="p-2 border rounded">Xanax</span>
            <span className="p-2 border rounded">Amoxicillin</span>
            <span className="p-2 border rounded">Ibuprofen</span>
          </div>
        </section>
      </div>
    </>
  );
}