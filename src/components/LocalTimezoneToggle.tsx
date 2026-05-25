import { useMemo } from "react";
import { Globe } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useI18n } from "@/lib/i18n";
import {
  getLocalTz,
  isLocalDifferentFromBucharest,
  setShowLocalTz,
  shortTzLabel,
  useShowLocalTz,
} from "@/lib/timezone";

interface Props {
  className?: string;
}

const LocalTimezoneToggle = ({ className }: Props) => {
  const { t } = useI18n();
  const enabled = useShowLocalTz();
  const show = useMemo(() => isLocalDifferentFromBucharest(), []);
  if (!show) return null;
  const tz = getLocalTz();
  return (
    <div
      className={
        "flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs " +
        (className ?? "")
      }
    >
      <Globe className="w-3.5 h-3.5 text-muted-foreground" />
      <label htmlFor="tz-local-toggle" className="flex-1 cursor-pointer">
        <span className="font-medium text-foreground">{t.tzToggleLabel}</span>
        <span className="ml-1 text-muted-foreground">
          ({shortTzLabel(tz)})
        </span>
      </label>
      <Switch
        id="tz-local-toggle"
        checked={enabled}
        onCheckedChange={setShowLocalTz}
      />
    </div>
  );
};

export default LocalTimezoneToggle;