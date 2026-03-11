import { useI18n } from "@/lib/i18n";
import { Check } from "lucide-react";
import groupImg from "@/assets/group-course.jpg";
import privateImg from "@/assets/private-course.jpg";

const ProgramsSection = () => {
  const { t } = useI18n();

  const programs = [
    {
      badge: t.groupBadge,
      title: t.groupCardTitle,
      desc: t.groupCardDesc,
      feats: [t.groupFeat1, t.groupFeat2, t.groupFeat3, t.groupFeat4],
      cta: t.groupRegister,
      href: "#inscriere",
      img: groupImg,
    },
    {
      badge: t.privateBadge,
      title: t.privateCardTitle,
      desc: t.privateCardDesc,
      feats: [t.privateFeat1, t.privateFeat2, t.privateFeat3, t.privateFeat4],
      cta: t.privateRegister,
      href: "#private",
      img: privateImg,
    },
  ];

  return (
    <section id="courses" className="py-20 px-6 bg-muted/50 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-primary mb-2 block">{t.programsBadge}</span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">{t.programsTitle}</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">{t.programsDesc}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {programs.map((p) => (
            <div key={p.title} className="bg-background rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <img src={p.img} alt={p.title} className="w-full h-52 object-cover" />
              <div className="p-6">
                <span className="inline-block text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
                  {p.badge}
                </span>
                <h3 className="text-xl font-bold text-foreground mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{p.desc}</p>
                <ul className="space-y-2 mb-6">
                  {p.feats.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={p.href}
                  className="block w-full text-center py-3 text-sm font-semibold border border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {p.cta}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProgramsSection;
