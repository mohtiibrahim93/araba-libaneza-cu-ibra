import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formTypeLabels, leadStatusLabels, LEAD_STATUSES } from "./types";
import type { CourseTypeFilter, LeadStatusFilter } from "./types";

interface Props {
  courseType: CourseTypeFilter;
  leadStatus: LeadStatusFilter;
  privateMessageSearch: string;
  onCourseTypeChange: (v: CourseTypeFilter) => void;
  onLeadStatusChange: (v: LeadStatusFilter) => void;
  onPrivateMessageSearchChange: (v: string) => void;
  onReset: () => void;
}

const RegistrationFilters = ({
  courseType,
  leadStatus,
  privateMessageSearch,
  onCourseTypeChange,
  onLeadStatusChange,
  onPrivateMessageSearchChange,
  onReset,
}: Props) => (
  <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[180px_180px_minmax(260px,360px)]">
      <div className="space-y-1.5">
        <Label>Tip curs</Label>
        <Select value={courseType} onValueChange={(v) => onCourseTypeChange(v as CourseTypeFilter)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate cursurile</SelectItem>
            <SelectItem value="group">{formTypeLabels.group}</SelectItem>
            <SelectItem value="private">Lead-uri lecții private</SelectItem>
            <SelectItem value="kids">{formTypeLabels.kids}</SelectItem>
            <SelectItem value="trial">{formTypeLabels.trial}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Status lead</Label>
        <Select value={leadStatus} onValueChange={(v) => onLeadStatusChange(v as LeadStatusFilter)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate statusurile</SelectItem>
            {LEAD_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {leadStatusLabels[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="private-message-search">Caută în mesaj</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="private-message-search"
            value={privateMessageSearch}
            onChange={(e) => onPrivateMessageSearchChange(e.target.value)}
            placeholder="ex: online, program, seară"
            className="pl-9"
          />
        </div>
      </div>
    </div>
    <Button variant="ghost" size="sm" onClick={onReset}>
      Resetează filtrele
    </Button>
  </div>
);

export default RegistrationFilters;