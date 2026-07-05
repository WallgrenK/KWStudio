import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { MoreHorizontal, Search } from "lucide-react";
import { AdminNotificationDropdown } from "~/components/admin/AdminNotificationDropdown";
import { AdminUserDropdown } from "~/components/admin/AdminUserDropdown";
import { useSidebar } from "~/components/admin/SidebarContext";

type AdminHeaderProps = {
  displayName: string;
  email: string;
  onSignOut: () => Promise<void>;
};

export function AdminHeader({ displayName, email, onSignOut }: AdminHeaderProps) {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const inputRef = useRef<HTMLInputElement>(null);
  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="sticky top-0 z-[99999] flex w-full border-b border-gray-200 bg-white">
      <div className="flex min-h-[76px] grow flex-wrap items-center gap-3 px-3 py-3 sm:gap-4 lg:flex-nowrap lg:px-6 lg:py-0">
          <button
            className="z-[99999] flex h-10 w-10 items-center justify-center rounded-lg border-gray-200 text-gray-500 lg:h-11 lg:w-11 lg:border"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
            type="button"
          >
            {isMobileOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z"
                  fill="currentColor"
                />
              </svg>
            )}
          </button>

          <Link to="/admin" className="lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-kw-brand text-sm font-bold text-white">
              KW
            </span>
          </Link>

          <button
            onClick={toggleApplicationMenu}
            className="z-[99999] flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 lg:hidden"
            type="button"
          >
            <MoreHorizontal size={24} aria-hidden="true" />
          </button>

          <div className="order-last hidden w-full lg:order-none lg:block lg:w-auto">
            <form>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2">
                  <Search className="text-gray-500" size={20} aria-hidden="true" />
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search or type command..."
                  className="h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pr-14 pl-12 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-kw-brand focus:ring-3 focus:ring-kw-brand/10 focus:outline-hidden xl:w-[430px]"
                />

                <button
                  className="absolute top-1/2 right-2.5 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 px-[7px] py-[4.5px] text-xs -tracking-[0.2px] text-gray-500"
                  type="button"
                >
                  <span>Ctrl</span>
                  <span>K</span>
                </button>
              </div>
            </form>
          </div>

        <div
          className={`${
            isApplicationMenuOpen ? "flex" : "hidden"
          } ml-auto w-full items-center justify-between gap-4 lg:flex lg:w-auto lg:justify-end`}
        >
          <div className="flex items-center gap-2 2xsm:gap-3">
            <AdminNotificationDropdown />
          </div>
          <AdminUserDropdown displayName={displayName} email={email} onSignOut={onSignOut} />
        </div>
      </div>
    </header>
  );
}
