import { forwardRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { scrollToAnchor, scrollToAnchorWhenReady } from "@/lib/scrollToAnchor";

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  /** In-page anchor like "#courses" (or full path with hash like "/#courses") */
  to: string;
};

/**
 * Anchor that always works, even when the user is on a non-root route.
 * - If on "/", smooth-scrolls to the target.
 * - Otherwise, navigates to "/" then scrolls to the target after mount.
 */
const AnchorLink = forwardRef<HTMLAnchorElement, Props>(
  ({ to, onClick, children, ...rest }, ref) => {
    const location = useLocation();
    const navigate = useNavigate();

    const hash = to.startsWith("#") ? to : to.slice(to.indexOf("#"));
    const id = hash.replace(/^#/, "");
    const href = "/" + hash;

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e);
      if (e.defaultPrevented) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      if (location.pathname !== "/") {
        navigate("/" + hash);
        scrollToAnchorWhenReady(id);
        return;
      }
      scrollToAnchor(id, { updateHash: true });
    };

    return (
      <a ref={ref} href={href} onClick={handleClick} {...rest}>
        {children}
      </a>
    );
  }
);
AnchorLink.displayName = "AnchorLink";

export default AnchorLink;
