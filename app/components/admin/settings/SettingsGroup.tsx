import type { ReactNode } from "react";
import { useSettingsContext } from "./SettingsContext";

type SettingsGroupProps = {
  label: string;
  description?: string;
  htmlFor?: string;
  children: ReactNode;
};

function highlightLabel(label: string, query: string, isMatch: boolean) {
  if (!query.trim() || !isMatch) {
    return label;
  }

  const normalizedQuery = query.trim().toLowerCase();
  const lowerLabel = label.toLowerCase();
  const index = lowerLabel.indexOf(normalizedQuery);
  if (index === -1) {
    return label;
  }

  const before = label.slice(0, index);
  const match = label.slice(index, index + normalizedQuery.length);
  const after = label.slice(index + normalizedQuery.length);

  return (
    <>
      {before}
      <mark className="rounded bg-amber-100 px-0.5 text-gray-800">{match}</mark>
      {after}
    </>
  );
}

export function SettingsGroup({ label, description, htmlFor, children }: SettingsGroupProps) {
  const { searchQuery, matchedLabels } = useSettingsContext();
  const isMatch = matchedLabels.has(label);

  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-1 text-xs font-medium text-gray-500">
      <span className={isMatch ? "text-gray-800" : undefined}>
        {highlightLabel(label, searchQuery, isMatch)}
      </span>
      {description ? <span className="font-normal text-gray-400">{description}</span> : null}
      {children}
    </label>
  );
}

export function settingsInputClassName(disabled = false) {
  return `h-11 w-full rounded-lg border border-gray-200 px-4 text-sm text-gray-800 ${
    disabled ? "cursor-not-allowed bg-gray-50 text-gray-500" : "bg-white"
  }`;
}

export function SettingsFieldRow({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

export function SettingsFieldStack({ children }: { children: ReactNode }) {
  return <div className="space-y-4">{children}</div>;
}
