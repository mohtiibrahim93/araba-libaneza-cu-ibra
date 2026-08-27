import type { ReactNode } from "react";

interface Credit {
  /**
   * Author and licence exactly as the source states them, e.g.
   * "Rafy, CC BY-SA 3.0, via Wikimedia Commons".
   */
  text: string;
  /** Link to the source file page, so the attribution is verifiable. */
  href?: string;
}

interface Props {
  src: string;
  /** Describes the image for screen readers and for search engines. */
  alt: string;
  /** Visible explanation of what the image shows. */
  caption: ReactNode;
  /**
   * Required on purpose. Most usable maps and diagrams are licensed CC BY /
   * CC BY-SA, which permit commercial reuse only *with* attribution. Making
   * this a required prop means an image cannot be added to a page without
   * someone stating where it came from — the compliance step is enforced by
   * the type checker rather than by remembering.
   */
  credit: Credit;
  /** Tailwind width override; wide maps want the full column, tall ones less. */
  className?: string;
}

/**
 * An image with a caption and a mandatory source credit.
 */
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
        {credit.href ? (
          <a
            href={credit.href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="underline hover:text-foreground"
          >
            {credit.text}
          </a>
        ) : (
          credit.text
        )}
      </span>
    </figcaption>
  </figure>
);

export default CreditedFigure;
