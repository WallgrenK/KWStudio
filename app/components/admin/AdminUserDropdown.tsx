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
      </button>

      <AdminDropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg"
      >
        <div>
          <span className="block text-sm font-medium text-gray-700">KWStudio</span>
          <span className="mt-0.5 block text-xs text-gray-500">admin@kwstudio.se</span>
        </div>

        <ul className="flex flex-col gap-1 border-b border-gray-200 pt-4 pb-3">
          <li>
            <AdminDropdownItem
              onItemClick={closeDropdown}
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
              onItemClick={closeDropdown}
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
              onItemClick={closeDropdown}
              tag="a"
              to="/admin/reports"
              className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700"
            >
              <Info className="text-gray-500 group-hover:text-gray-700" size={24} aria-hidden="true" />
              Support
            </AdminDropdownItem>
          </li>
        </ul>
        <Link
          to="/admin"
          className="group mt-3 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700"
        >
          <LogOut className="text-gray-500 group-hover:text-gray-700" size={24} aria-hidden="true" />
          Sign out
        </Link>
      </AdminDropdown>
    </div>
  );
}
