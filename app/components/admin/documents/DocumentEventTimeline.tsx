import { Timeline, type TimelineItem } from "~/components/admin/Timeline";
import type { DocumentEventDto } from "~/types/documents";

function formatEventTitle(eventType: string): string {
  return eventType
    .replace(/^document_/, "")
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function eventDetail(event: DocumentEventDto): string | undefined {
  const metadata = event.metadata ?? {};
  const parts: string[] = [];
  if (typeof metadata.versionNumber === "number") {
    parts.push(`Version ${metadata.versionNumber}`);
  }
  if (metadata.cached === true) {
    parts.push("Cached render");
  }
  if (typeof metadata.warningCount === "number" && metadata.warningCount > 0) {
    parts.push(`${metadata.warningCount} warning(s)`);
  }
  if (typeof metadata.comment === "string" && metadata.comment) {
    parts.push(metadata.comment);
  }
  if (parts.length) return parts.join(" · ");
  return event.actor_type ? `Actor: ${event.actor_type}` : undefined;
}

type DocumentEventTimelineProps = {
  events: DocumentEventDto[];
};

export function DocumentEventTimeline({ events }: DocumentEventTimelineProps) {
  const items: TimelineItem[] = events.map((event) => ({
    id: event.id,
    title: formatEventTitle(event.event_type),
    meta: formatDateTime(event.created_at),
    detail: eventDetail(event),
  }));

  if (!items.length) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
        <h2 className="text-lg font-semibold text-gray-800">Events</h2>
        <p className="mt-4 text-sm text-gray-500">No events.</p>
      </section>
    );
  }

  return <Timeline title="Events" items={items} />;
}
