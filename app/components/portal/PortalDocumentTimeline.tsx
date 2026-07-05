import { PortalCard } from "~/components/portal/PortalSection";
import type { PortalDocumentDetailDto } from "~/types/documents";

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatEventTitle(eventType: string): string {
  return eventType
    .replace(/^document_/, "")
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

type PortalDocumentTimelineProps = {
  timeline: PortalDocumentDetailDto["timeline"];
};

export function PortalDocumentTimeline({ timeline }: PortalDocumentTimelineProps) {
  if (!timeline.length) {
    return (
      <PortalCard padding="md">
        <h2 className="text-base font-semibold text-gray-900">Timeline</h2>
        <p className="mt-3 text-sm text-gray-500">No activity yet.</p>
      </PortalCard>
    );
  }

  return (
    <PortalCard padding="md">
      <h2 className="text-base font-semibold text-gray-900">Timeline</h2>
      <ol className="mt-4 space-y-4" aria-label="Document activity timeline">
        {timeline.map((event) => (
          <li key={event.id} className="relative border-l-2 border-gray-200 pl-4">
            <span className="absolute -left-[5px] top-1.5 size-2 rounded-full bg-kw-brand" aria-hidden="true" />
            <p className="text-sm font-medium text-gray-800">{formatEventTitle(event.eventType)}</p>
            <p className="mt-0.5 text-xs text-gray-500">{formatDateTime(event.createdAt)}</p>
            {typeof event.metadata.comment === "string" && event.metadata.comment ? (
              <p className="mt-2 text-sm text-gray-600">{event.metadata.comment}</p>
            ) : null}
          </li>
        ))}
      </ol>
    </PortalCard>
  );
}
