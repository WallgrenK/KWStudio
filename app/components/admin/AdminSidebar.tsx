import type { ReactNode } from "react";
import { Link, useLocation } from "react-router";
import {
  Banknote,
  Bot,
  BriefcaseBusiness,
  FileText,
  Globe2,
  FolderKanban,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import { useSidebar } from "~/components/admin/SidebarContext";

type NavItem = {
  name: string;
  icon: ReactNode;
  path: string;
  activePaths?: string[];
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    title: "MAIN",
    items: [{ name: "Dashboard", path: "/admin", icon: <LayoutDashboard /> }],
  },
  {
    title: "WORKSPACE",
    items: [
      {
        name: "Leads",
        path: "/admin/leads",
        icon: <Users />,
        activePaths: ["/admin/leads", "/admin/pipeline", "/admin/follow-ups", "/admin/proposals"],
      },
      {
        name: "Projects",
        path: "/admin/projects",
        icon: <FolderKanban />,
        activePaths: ["/admin/projects", "/admin/tasks", "/admin/files"],
      },
      {
        name: "Documents",
        path: "/admin/documents",
        icon: <FileText />,
        activePaths: ["/admin/documents"],
      },
      { name: "Clients", path: "/admin/clients", icon: <BriefcaseBusiness /> },
      {
        name: "Websites",
        path: "/admin/websites",
        icon: <Globe2 />,
        activePaths: ["/admin/websites", "/admin/reports", "/admin/analyzer", "/admin/seo", "/admin/uptime"],
      },
      {
        name: "Finance",
        path: "/admin/finance",
        icon: <Banknote />,
        activePaths: ["/admin/finance", "/admin/invoices", "/admin/payments", "/admin/expenses", "/admin/bookkeeping"],
      },
      {
        name: "AI Hub",
        path: "/admin/ai-tools",
        icon: <Bot />,
        activePaths: ["/admin/ai-tools", "/admin/proposal-generator", "/admin/copywriter", "/admin/lead-finder", "/admin/email"],
      },
    ],
  },
  {
    title: "SYSTEM",
    items: [{ name: "Settings", path: "/admin/settings", icon: <Settings /> }],
  },
];

export function AdminSidebar() {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, closeMobileSidebar } = useSidebar();
  const location = useLocation();
  const showLabels = isExpanded || isHovered || isMobileOpen;

  function isActive(item: NavItem) {
    if (item.path === "/admin") {
      return location.pathname === item.path;
    }

    const paths = item.activePaths ?? [item.path];
    return paths.some((path) => location.pathname === path || location.pathname.startsWith(`${path}/`));
  }

  return (
    <aside
      className={`fixed mt-16 flex h-screen flex-col border-r border-gray-200 bg-white px-5 text-gray-900 transition-all duration-300 ease-in-out top-0 left-0 z-50 lg:mt-0 ${
        isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"
      } ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`flex py-8 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
        <Link to="/admin" onClick={closeMobileSidebar}>
          {showLabels ? (
            <span className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2E75BD] text-sm font-bold text-white">
                KW
              </span>
              <span className="block">
                <span className="block text-base font-semibold text-gray-900">KWStudio</span>
                <span className="block text-xs font-medium text-gray-500">Admin</span>
              </span>
            </span>
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2E75BD] text-xs font-bold text-white">
              KW
            </span>
          )}
        </Link>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            {navSections.map((section) => (
              <div key={section.title}>
                <h2
                  className={`mb-4 flex text-xs uppercase leading-[20px] text-gray-400 ${
                    !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                  }`}
                >
                  {showLabels ? section.title : <span className="h-1 w-5 rounded-full bg-gray-300" />}
                </h2>
                <ul className="flex flex-col gap-1.5">
                  {section.items.map((item) => (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={closeMobileSidebar}
                        className={`menu-item group ${
                          isActive(item) ? "menu-item-active" : "menu-item-inactive"
                        } ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
                      >
                        <span
                          className={`menu-item-icon-size ${
                            isActive(item) ? "menu-item-icon-active" : "menu-item-icon-inactive"
                          }`}
                        >
                          {item.icon}
                        </span>
                        {showLabels ? <span className="menu-item-text">{item.name}</span> : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        {showLabels ? (
          <div className="mx-auto mb-10 w-full max-w-60 rounded-2xl bg-gray-50 px-4 py-5 text-center">
            <h3 className="mb-2 font-semibold text-gray-900">KWStudio Admin</h3>
            <p className="mb-4 text-sm text-gray-500">
              Direct URL access only for v1. Public navigation stays clean.
            </p>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
