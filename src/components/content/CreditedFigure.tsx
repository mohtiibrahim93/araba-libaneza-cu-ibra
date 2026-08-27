import type { ReactNode } from "react";

/**
 * A Creative Commons attribution, in the four parts the licences ask for:
 * title, author, source and licence ("TASL"). Both CC BY and CC BY-SA require
 * the credit *and* a link to the licence deed, so `licenceHref` is not
 * optional — a credit that names a licence without linking it is incomplete.
 */
interface Credit {
  /** The work's title at the source, e.g. "Arabic Dialects". */
  title: string;
  /** Author exactly as the source names them. */
  author: string;
  /** Link to the file's description page, so the credit is verifiable. */
  sourceHref: string;
  /** Licence as stated at the source, e.g. "CC BY 3.0". */
  licence: string;
  /** Link to the licence deed — required by the licence itself. */
  licenceHref: string;
  /** Set when the image was cropped, recoloured or otherwise altered. */
  changes?: string;
}

interface Props {
  src: string;
  /** Describes the image for screen readers and for search engines. */
  alt: string;
  /** Visible explanation of what the image shows. */
  caption: ReactNode;
  /**
   * Required on purpose. Usable maps and diagrams are nearly always CC BY or
   * CC BY-SA, which permit commercial reuse only *with* attribution. Making
   * this a required prop means an image cannot reach a page without someone
   * stating where it came from — the compliance step is enforced by the type
   * checker rather than by remembering.
   */
  credit: Credit;
  /** Tailwind width override; wide maps want the full column, tall ones less. */
  className?: string;
}

const ext = "noopener noreferrer nofollow";

/** An image with a caption and a complete, linked source credit. */
const CreditedFigure = ({ src, alt, caption, credit, className = "w-full" }: Props) => (
  <figure className="not-prose my-6">
    <img
      src={src}
      alt={alt}
      className={`${className} mx-auto rounded-xl border border-border`}
      loading="lazy"
    />
    <figcaption className="mt-2 space-y-1 text-sm text-muted-foreground">
      <span className="block">{caption}</span>
      <span className="block text-xs">
        <a href={credit.sourceHref} target="_blank" rel={ext} className="underline hover:text-foreground">
          {credit.title}
        </a>
        {" by "}
        {credit.author}
        {", licensed under "}
        <a href={credit.licenceHref} target="_blank" rel={ext} className="underline hover:text-foreground">
          {credit.licence}
        </a>
        {credit.changes ? `. ${credit.changes}` : ""}
      </span>
    </figcaption>
  </figure>
);

export default CreditedFigure;
