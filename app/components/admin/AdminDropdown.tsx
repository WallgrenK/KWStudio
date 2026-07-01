import type { ReactNode, RefObject } from "react";
import { useEffect, useRef } from "react";

type AdminDropdownProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  containerRef?: RefObject<HTMLElement | null>;
  triggerRef?: RefObject<HTMLElement | null>;
};

export function AdminDropdown({
  isOpen,
  onClose,
  children,
  className = "",
  containerRef,
  triggerRef,
}: AdminDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      const isInsideContainer = containerRef?.current?.contains(target);
      const isInsideDropdown = dropdownRef.current?.contains(target);
      const isInsideTrigger = triggerRef?.current?.contains(target);

      if (!isInsideContainer && !isInsideDropdown && !isInsideTrigger) {
        onClose();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [containerRef, onClose, triggerRef]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={dropdownRef}
      className={`absolute right-0 z-40 mt-2 rounded-xl border border-gray-200 bg-white shadow-theme-lg ${className}`.trim()}
    >
      {children}
    </div>
  );
}
