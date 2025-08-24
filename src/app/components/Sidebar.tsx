"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import {
  HomeIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  BuildingStorefrontIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/solid";

const navLinks = [
  {
    href: "/offers",
    label: "Browse",
    icon: <HomeIcon className="w-6 h-6" />,
    show: () => true,
  },
  {
    href: "/profile",
    label: "Profile",
    icon: <UserCircleIcon className="w-6 h-6" />,
    show: () => true,
  },
  {
    href: "/admin",
    label: "Admin",
    icon: <BuildingStorefrontIcon className="w-6 h-6" />,
    show: (role: string) => role === "RESTAURANT",
  },
  {
    href: "/register-food",
    label: "Register Food",
    icon: <PlusCircleIcon className="w-6 h-6" />,
    show: (role: string) => role === "RESTAURANT",
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: <Cog6ToothIcon className="w-6 h-6" />,
    show: () => true,
  },
];

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Desktop sidebar
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col bg-white/90 shadow-lg border-r border-green-100 z-20 transition-all duration-200 ${collapsed ? "w-20" : "w-64"} min-h-screen`}>
        <div className="flex items-center gap-3 p-6">
          <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center font-bold text-green-700 text-2xl shadow">
            ZW
          </div>
          {!collapsed && <span className="text-xl font-bold text-green-700">Zero Waste</span>}
          <button
            className="ml-auto text-green-700 hover:bg-green-50 rounded p-1"
            onClick={() => setCollapsed((c) => !c)}
            aria-label="Toggle sidebar"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path d={collapsed ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <nav className="flex-1 flex flex-col gap-2 px-2">
          {navLinks
            .filter((link) => link.show(session?.user?.role ?? ""))
            .map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition group
                  ${pathname === link.href
                    ? "bg-green-100 text-green-700"
                    : "text-gray-700 hover:bg-green-50 hover:text-green-700"}
                  ${collapsed ? "justify-center" : ""}
                `}
              >
                {link.icon}
                {!collapsed && <span>{link.label}</span>}
              </Link>
            ))}
          <button
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition group text-red-600 hover:bg-red-50 hover:text-red-700 ${collapsed ? "justify-center" : ""}`}
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <ArrowRightOnRectangleIcon className="w-6 h-6" />
            {!collapsed && <span>Logout</span>}
          </button>
        </nav>
        <div className={`mt-auto pt-8 text-xs text-gray-400 text-center pb-4 ${collapsed ? "hidden" : ""}`}>
          &copy; {new Date().getFullYear()} Zero Waste
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed md:hidden bottom-0 left-0 right-0 z-30 bg-white/90 border-t border-green-100 shadow-lg flex justify-around py-2">
        {navLinks
          .filter((link) => link.show(session?.user?.role ?? ""))
          .map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center px-2 py-1 rounded transition
                ${pathname === link.href
                  ? "text-green-700"
                  : "text-gray-500 hover:text-green-700"}
              `}
            >
              {link.icon}
              <span className="text-xs">{link.label}</span>
            </Link>
          ))}
        <button
          className="flex flex-col items-center justify-center px-2 py-1 rounded text-red-600 hover:text-red-700 transition"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <ArrowRightOnRectangleIcon className="w-6 h-6" />
          <span className="text-xs">Logout</span>
        </button>
      </nav>
    </>
  );
}