import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "react-router-dom";

const AUDIO_RE = /\.(mp3|m4a|ogg|wav)(\?.*)?$/i;

/**
 * Renders an owner-edited article body (Markdown, GFM tables included).
 * Conventions the admin editor relies on:
 *  - images: standard ![alt](url) — rendered responsive;
 *  - audio: a plain link to an .mp3/.m4a/.ogg/.wav file becomes an inline
 *    audio player (so "adding audio to words" needs no HTML);
 *  - internal links (/cursuri, /trial…) stay client-side navigations.
 */
const MarkdownBody = ({ markdown }: { markdown: string }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      a: ({ href = "", children }) => {
        if (AUDIO_RE.test(href)) {
          return (
            <span className="block my-3">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <audio controls preload="none" src={href} className="w-full max-w-md" />
            </span>
          );
        }
        if (href.startsWith("/")) return <Link to={href}>{children}</Link>;
        return (
          <a href={href} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        );
      },
      img: ({ src = "", alt = "" }) => (
        <img src={src} alt={alt} loading="lazy" className="max-w-full h-auto rounded-lg my-4" />
      ),
      table: ({ children }) => (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse [&_th]:text-left [&_th]:py-2 [&_th]:pr-3 [&_th]:font-semibold [&_th]:text-muted-foreground [&_th]:border-b [&_th]:border-border [&_td]:py-2.5 [&_td]:pr-3 [&_td]:align-top [&_tr]:border-b [&_tr]:border-border/60">
            {children}
          </table>
        </div>
      ),
    }}
  >
    {markdown}
  </ReactMarkdown>
);

export default MarkdownBody;
