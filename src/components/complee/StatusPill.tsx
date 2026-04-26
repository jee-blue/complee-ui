import type { Priority, Status } from "@/data/results";
import { StatusPill as UIStatusPill } from "@/components/ui/status-pill";

const statusTone: Record<Status, "success" | "warn" | "danger"> = {
  Covered: "success",
  Partial: "warn",
  Missing: "danger",
};

export function StatusPill({ status }: { status: Status }) {
  return (
    <UIStatusPill tone={statusTone[status]} size="sm" dot>
      {status}
    </UIStatusPill>
  );
}

const priorityTone: Record<Priority, "danger" | "warn" | "brand" | "neutral"> = {
  Critical: "danger",
  High: "warn",
  Medium: "brand",
  Low: "neutral",
};

export function PriorityPill({ priority }: { priority: Priority }) {
  // Original priority pill had no border and slightly tighter padding.
  return (
    <UIStatusPill
      tone={priorityTone[priority]}
      size="sm"
      borderless
      className="px-2"
    >
      {priority}
    </UIStatusPill>
  );
}
