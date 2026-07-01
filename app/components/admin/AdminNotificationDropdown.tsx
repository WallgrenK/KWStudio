import { Link } from "react-router";
import { AdminDropdownItem } from "~/components/admin/AdminDropdownItem";

const notifications = [
  {
    name: "Maja Lind",
    text: "sent a new website redesign enquiry",
    project: "Lind Studio",
    type: "Lead",
    time: "5 min ago",
    status: "online",
  },
  {
    name: "KWStudio",
    text: "created a website report draft",
    project: "June site health",
    type: "Report",
    time: "1 hr ago",
    status: "online",
  },
  {
    name: "Northbound",
    text: "is ready for project review",
    project: "Strategy Site",
    type: "Project",
    time: "Yesterday",
    status: "offline",
  },
];

export function AdminNotificationDropdown() {
  return (
    <details className="admin-native-dropdown relative">
      <summary className="relative flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700">
        <span className="absolute top-0.5 right-0 z-10 h-2 w-2 rounded-full bg-orange-400">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
        </span>
        <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </summary>

      <div className="absolute -right-[240px] z-[100000] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg sm:w-[361px] lg:right-0">
        <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-3">
          <h5 className="text-lg font-semibold text-gray-800">Notification</h5>
        </div>
        <ul className="custom-scrollbar flex h-auto flex-col overflow-y-auto">
          {notifications.map((notification) => (
            <li key={`${notification.name}-${notification.time}`}>
              <AdminDropdownItem className="flex gap-3 rounded-lg border-b border-gray-100 px-4.5 py-3 hover:bg-gray-100">
                <span className="relative z-1 block h-10 w-full max-w-10 rounded-full">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2E75BD] text-xs font-bold text-white">
                    {notification.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span
                    className={`absolute right-0 bottom-0 z-10 h-2.5 w-full max-w-2.5 rounded-full border-[1.5px] border-white ${
                      notification.status === "online" ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                </span>

                <span className="block">
                  <span className="mb-1.5 block space-x-1 text-sm text-gray-500">
                    <span className="font-medium text-gray-800">{notification.name}</span>
                    <span>{notification.text}</span>
                    <span className="font-medium text-gray-800">{notification.project}</span>
                  </span>

                  <span className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{notification.type}</span>
                    <span className="h-1 w-1 rounded-full bg-gray-400" />
                    <span>{notification.time}</span>
                  </span>
                </span>
              </AdminDropdownItem>
            </li>
          ))}
        </ul>
        <Link
          to="/admin/reports"
          className="mt-3 block rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          View All Notifications
        </Link>
      </div>
    </details>
  );
}
