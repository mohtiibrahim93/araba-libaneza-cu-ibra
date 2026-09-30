import { useI18n } from "@/lib/i18n";
import { GraduationCap, Globe, ShieldCheck, Star } from "lucide-react";

const TrustBand = () => {
  const { t } = useI18n();

  const items = [
    {
      icon: GraduationCap,
      label: t.trustStudents,
    },
    {
      icon: Globe,
      label: t.trustNative,
    },
    {
      icon: ShieldCheck,
      label: t.trustRefund,
    },
    {
      icon: Star,
      label: t.trustReviews,
    },
  ];

  return (
    // Two columns everywhere: the band sits in the narrow form column on the
    // level pages, where four pill badges were squeezed into circles.
    <ul className="mt-6 grid grid-cols-2 gap-2.5">
      {items.map((item) => (
        <li
          key={item.label}
          className="flex items-center gap-2 rounded-xl border border-[#E7E1D6] bg-card px-3 py-2.5 text-xs font-medium leading-tight text-foreground dark:border-border"
        >
          <item.icon className="h-4 w-4 shrink-0 text-brand-green" aria-hidden="true" />
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  );
};

export default TrustBand;
