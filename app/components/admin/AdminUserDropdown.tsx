<<<<<<< HEAD
import { useState } from "react";
import { Link } from "react-router";
import { Info, LogOut, Settings, UserCircle } from "lucide-react";
import { AdminDropdown } from "~/components/admin/AdminDropdown";
import { AdminDropdownItem } from "~/components/admin/AdminDropdownItem";

export function AdminUserDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="dropdown-toggle flex items-center text-gray-700"
        type="button"
      >
        <span className="mr-3 flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[#2E75BD] text-sm font-bold text-white">
          KW
        </span>

        <span className="mr-1 block text-sm font-medium">KWStudio</span>
        <svg
          className={`stroke-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
=======
import { Info, LogOut, Settings, UserCircle } from "lucide-react";
import { AdminDropdownItem } from "~/components/admin/AdminDropdownItem";

type AdminUserDropdownProps = {
  displayName: string;
  email: string;
  onSignOut: () => Promise<void>;
};

function initialsFromName(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  const initials = parts.length > 1
    ? `${parts[0][0]}${parts[1][0]}`
    : value.slice(0, 2);

  return initials.toUpperCase();
}

export function AdminUserDropdown({ displayName, email, onSignOut }: AdminUserDropdownProps) {
  const initials = initialsFromName(displayName || email || "KW");

  async function handleLogout() {
    try {
      await onSignOut();
    } catch (error) {
      console.error("Could not sign out.", error);
    }
  }

  return (
    <details className="admin-native-dropdown relative">
      <summary className="flex cursor-pointer list-none items-center rounded-lg text-gray-700 transition-colors hover:text-gray-900 focus:outline-none focus:ring-3 focus:ring-[#2E75BD]/10">
        <span className="mr-3 flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[#2E75BD] text-sm font-bold text-white">
          {initials}
        </span>
        <span className="mr-1 block text-sm font-medium">{displayName}</span>
        <svg
          className="admin-native-dropdown-arrow stroke-gray-500 transition-transform duration-200"
>>>>>>> 437883a (SCB API update)
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
<<<<<<< HEAD
      </button>

      <AdminDropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg"
      >
        <div>
          <span className="block text-sm font-medium text-gray-700">KWStudio</span>
          <span className="mt-0.5 block text-xs text-gray-500">admin@kwstudio.se</span>
=======
      </summary>

      <div className="absolute right-0 z-[100000] mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg">
        <div>
          <span className="block text-sm font-medium text-gray-700">{displayName}</span>
          <span className="mt-0.5 block text-xs text-gray-500">{email}</span>
>>>>>>> 437883a (SCB API update)
        </div>

        <ul className="flex flex-col gap-1 border-b border-gray-200 pt-4 pb-3">
          <li>
            <AdminDropdownItem
<<<<<<< HEAD
              onItemClick={closeDropdown}
=======
>>>>>>> 437883a (SCB API update)
              tag="a"
              to="/admin/settings"
              className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700"
            >
              <UserCircle className="text-gray-500 group-hover:text-gray-700" size={24} aria-hidden="true" />
              Edit profile
            </AdminDropdownItem>
          </li>
          <li>
            <AdminDropdownItem
<<<<<<< HEAD
              onItemClick={closeDropdown}
=======
>>>>>>> 437883a (SCB API update)
              tag="a"
              to="/admin/settings"
              className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700"
            >
              <Settings className="text-gray-500 group-hover:text-gray-700" size={24} aria-hidden="true" />
              Account settings
            </AdminDropdownItem>
          </li>
          <li>
            <AdminDropdownItem
<<<<<<< HEAD
              onItemClick={closeDropdown}
=======
>>>>>>> 437883a (SCB API update)
              tag="a"
              to="/admin/reports"
              className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700"
            >
              <Info className="text-gray-500 group-hover:text-gray-700" size={24} aria-hidden="true" />
              Support
            </AdminDropdownItem>
          </li>
        </ul>
<<<<<<< HEAD
        <Link
          to="/admin"
          className="group mt-3 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700"
        >
          <LogOut className="text-gray-500 group-hover:text-gray-700" size={24} aria-hidden="true" />
          Sign out
        </Link>
      </AdminDropdown>
    </div>
=======

        <button
          type="button"
          onClick={handleLogout}
          className="group mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700"
        >
          <LogOut className="text-gray-500 group-hover:text-gray-700" size={24} aria-hidden="true" />
          Sign out
        </button>
      </div>
    </details>
>>>>>>> 437883a (SCB API update)
  );
}
