import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // Fluid layout scale. These interpolate continuously with the viewport
      // instead of jumping at breakpoints, so the page adapts to any screen
      // rather than to five fixed sizes.
      maxWidth: {
        // Page container. Tracks the viewport at 90vw and stops at 120rem, so
        // the side margin stays a roughly constant share of the screen instead
        // of ballooning on large monitors: ~5% at 1440, ~5% at 1920, ~12% at
        // 2560. The 90vw term is what makes it adapt; the 120rem ceiling keeps
        // a 4K monitor from stretching card rows past the point of scanning.
        content: "min(90vw, 120rem)",
      },
      spacing: {
        // Horizontal gutter: 1rem on a phone, growing to 4rem on a large
        // monitor, with every size in between.
        gutter: "clamp(1rem, 5vw, 4rem)",
        // Vertical rhythm between major sections.
        section: "clamp(3rem, 7vw, 6rem)",
        // Tighter rhythm for strips and banners.
        "section-sm": "clamp(1.75rem, 3.5vw, 3rem)",
      },
      fontSize: {
        // Fluid display sizes for headings, so type scales with the page
        // rather than stepping at md/lg.
        "display-xl": ["clamp(2.25rem, 1.4rem + 3.4vw, 4rem)", { lineHeight: "1.08" }],
        "display-lg": ["clamp(1.875rem, 1.35rem + 2.2vw, 3rem)", { lineHeight: "1.15" }],
        "display-md": ["clamp(1.5rem, 1.2rem + 1.3vw, 2.25rem)", { lineHeight: "1.22" }],
      },
      fontFamily: {
        // Serif display for headlines (Ref A mockup look); body stays system sans.
        display: ["Lora", "Georgia", "serif"],
        // Arabic script for the brand lockup line (حكي لبناني).
        arabic: ["'Noto Naskh Arabic'", "serif"],
      },
      colors: {
        // Deep cedar green + warm cream — brand tokens next to the existing red primary.
        "brand-green": "hsl(var(--brand-green))",
        cream: "hsl(var(--cream))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        cedar: "hsl(var(--cedar-green))",
        "lebanese-red": "hsl(var(--lebanese-red))",
        "stone-gold": "hsl(var(--stone-gold))",
        parchment: "hsl(var(--parchment))",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
