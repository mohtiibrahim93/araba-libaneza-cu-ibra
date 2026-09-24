import { Link } from "@/components/LocalizedLink";
import EnLandingLayout from "./EnLandingLayout";
import FaqGroups from "@/components/FaqGroups";
import { allFaqs } from "@/data/faq";

/**
 * The English twin of /intrebari-frecvente — every question, grouped by topic.
 *
 * Both pages render src/data/faq.ts, so the two language versions cannot drift.
 * `faq` feeds the FAQPage structured data; FaqGroups renders the visible list
 * with its topic headings.
 */
const Faq = () => (
  <EnLandingLayout
    slug="faq"
    roHref="/intrebari-frecvente"
    title="Lebanese Arabic — frequently asked questions"
    metaTitle="Lebanese Arabic Course FAQ | Price, Schedule, Levels"
    description="Answers about learning Lebanese Arabic: price, schedule, online or in person, how long until you can hold a conversation, which dialect to learn, and how the grammar works."
    crumb="FAQ"
    lead="Everything students ask before they enrol — price and schedule, how long it takes before you can hold a conversation, how Lebanese differs from Modern Standard Arabic, and how the grammar works."
    faq={allFaqs("en")}
  >
    <p>
      These are the questions we get most often, grouped by topic. For the short version —
      price, schedule and the trial lesson — see the{" "}
      <Link to="/en/learn-lebanese-arabic">course overview</Link>. For a specific format,
      read about <Link to="/en/arabic-tutor">private 1-on-1 lessons</Link> or{" "}
      <Link to="/en/arabic-classes-near-me">classes in Bucharest and online</Link>.
    </p>

    <FaqGroups lang="en" />

    <h2>Still not answered?</h2>
    <p>
      Write to us and you'll hear back the same day. The quickest way to find out whether a
      course suits you is still the{" "}
      <Link to="/trial">free 30-minute trial lesson</Link> — 0 LEI and no obligation; secure card confirmation holds the spot.
    </p>
  </EnLandingLayout>
);

export default Faq;
