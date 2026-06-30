import type { ReactNode } from "react";
import type { MouseEvent } from "react";
import { Link } from "react-router";

type AdminDropdownItemProps = {
  tag?: "a" | "button";
  to?: string;
  onClick?: () => void;
  onItemClick?: () => void;
  className?: string;
  children: ReactNode;
};

export function AdminDropdownItem({
  tag = "button",
  to,
  onClick,
  onItemClick,
  className = "",
  children,
}: AdminDropdownItemProps) {
  const combinedClassName = (
    className || "block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
  ).trim();

  function handleClick(event: MouseEvent) {
    if (tag === "button") {
      event.preventDefault();
    }

    onClick?.();
    onItemClick?.();
  }

  if (tag === "a" && to) {
    return (
      <Link className={combinedClassName} to={to} onClick={handleClick}>
        {children}
      </Link>
    );
  }

  return (
    <button className={combinedClassName} type="button" onClick={handleClick}>
      {children}
    </button>
  );
}
