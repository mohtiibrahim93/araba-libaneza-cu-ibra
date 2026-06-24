import { leadStatusLabels, LEAD_STATUSES } from "./types";
import type { LeadStatus } from "./types";

interface Props {
  counts: Record<LeadStatus | "total", number>;
  onSelect: (status: LeadStatus | "all") => void;
}

const PrivateLeadStats = ({ counts, onSelect }: Props) => (
  <div className="mb-6 grid gap-3 sm:grid-cols-4">
    <button
      type="button"
      onClick={() => onSelect("all")}
      className="rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-muted"
    >
      <p className="text-xs font-medium text-muted-foreground">Lead-uri private</p>
      <p className="mt-1 text-2xl font-bold text-foreground">{counts.total}</p>
    </button>
    {LEAD_STATUSES.map((status) => (
      <button
        key={status}
        type="button"
        onClick={() => onSelect(status)}
        className="rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-muted"
      >
        <p className="text-xs font-medium text-muted-foreground">
          Private · {leadStatusLabels[status]}
        </p>
        <p className="mt-1 text-2xl font-bold text-foreground">{counts[status]}</p>
      </button>
    ))}
  </div>
);

export default PrivateLeadStats;