/**
 * One page container for every full-width section.
 *
 * Before this existed each section picked its own width — the homepage ran
 * 1152, 1024, 1280, 896 and 768 down the page, so the content edge jumped by up
 * to 256px as you scrolled and nothing lined up vertically.
 *
 * 7xl (1280px) is the base; from 2xl up it widens to 88rem (1408px) so large
 * monitors are not mostly margin. Reading-width blocks (FAQ answers, the CTA
 * copy) stay narrow *inside* this container rather than shrinking it, so
 * section edges align while line length stays comfortable.
 */
export const CONTAINER = "max-w-7xl 2xl:max-w-[88rem] mx-auto";

/** Horizontal gutter, paired with CONTAINER on the section wrapper. */
export const GUTTER = "px-4 sm:px-6 lg:px-8";

/** Vertical rhythm for a standard content section. */
export const SECTION_Y = "py-16 md:py-20";
