"use client";
import Link from "next/link";
import { useState } from "react";

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <aside className="md:w-64 bg-white/90 shadow-lg p-6 border-r border-green-100 z-20 flex flex-col">
      {/* Mobile: Dropdown toggle */}
      <div className="md:hidden flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center font-bold text-green-700 text-2xl shadow">
            ZW
          </div>
          <span className="text-xl font-bold text-green-700">Zero Waste</span>
        </div>
        <button
          className="text-green-700 border border-green-700 rounded px-3 py-1"
          onClick={() => setSidebarOpen((open) => !open)}
          aria-label="Toggle navigation"
        >
          {sidebarOpen ? "Close" : "Menu"}
        </button>
      </div>
      {/* Sidebar nav: always visible on md+, dropdown on mobile */}
      <nav
        className={`flex-col gap-4 items-center md:items-start md:flex ${
          sidebarOpen ? "flex" : "hidden"
        } md:mt-0 mt-2`}
      >
        <Link href="/offers" className="text-green-700 font-semibold bg-green-50 rounded px-3 py-2">
          Browse Restaurants
        </Link>
        <Link href="/profile" className="text-gray-700 hover:text-green-700 px-3 py-2 rounded transition">
          Profile
        </Link>
        {/* logout button */}
        <button
          className="text-red-600 hover:text-red-700 px-3 py-2 rounded transition"
          onClick={() => {
            // Handle logout logic here
          }}
        >
          Logout
        </button>
      </nav>
      {/* Desktop logo/title */}
      <div className="hidden md:flex items-center gap-3 mb-8 mt-4">
        <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center font-bold text-green-700 text-2xl shadow">
          ZW
        </div>
        <span className="text-xl font-bold text-green-700">Zero Waste</span>
      </div>
      <div className="mt-auto pt-8 text-xs text-gray-400 hidden md:block">
        &copy; {new Date().getFullYear()} Zero Waste
      </div>
    </aside>
  );
}