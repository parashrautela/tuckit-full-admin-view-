/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── shadcn semantic tokens ──────────────────────────────
        // Driven by the HSL-triplet CSS vars in index.css. The
        // `<alpha-value>` placeholder is what makes opacity modifiers
        // (bg-muted/50, ring-ring/50) work on a var-backed colour.
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },

        // ── Semantic status scale ───────────────────────────────
        success: {
          DEFAULT: "hsl(var(--success) / <alpha-value>)",
          bg: "hsl(var(--success-bg) / <alpha-value>)",
          foreground: "hsl(var(--success-foreground) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "hsl(var(--warning) / <alpha-value>)",
          bg: "hsl(var(--warning-bg) / <alpha-value>)",
          foreground: "hsl(var(--warning-foreground) / <alpha-value>)",
        },
        danger: {
          DEFAULT: "hsl(var(--danger) / <alpha-value>)",
          bg: "hsl(var(--danger-bg) / <alpha-value>)",
          foreground: "hsl(var(--danger-foreground) / <alpha-value>)",
        },
        info: {
          DEFAULT: "hsl(var(--info) / <alpha-value>)",
          bg: "hsl(var(--info-bg) / <alpha-value>)",
          foreground: "hsl(var(--info-foreground) / <alpha-value>)",
        },
        // Merges into Tailwind's built-in neutral scale — neutral-100
        // etc. keep working alongside neutral-bg / neutral-foreground.
        neutral: {
          bg: "hsl(var(--neutral-bg) / <alpha-value>)",
          foreground: "hsl(var(--neutral-foreground) / <alpha-value>)",
        },

        primary: {
          DEFAULT: "#F97316", // Tuckit orange — single accent
          hover: "#EA580C",
          light: "#FFF7ED",
          dark: "#C2410C",
        },
        brand: {
          orange: '#FF7000',
          dark: '#1A1917',
          card: '#FFFFFF',
          muted: '#7C766F',
          border: '#E7E3DE',
          bg: '#FAF9F7',
        },
        surface: {
          canvas: '#FAF9F7',
          '1': '#FFFFFF',
          '2': '#F3F1EE',
        },
        ink: {
          DEFAULT: '#2B2926',
          muted: '#7C766F',
          subtle: '#A8A19A',
          tertiary: '#D3CDC5',
        },
        hairline: {
          DEFAULT: '#E7E3DE',
          soft: '#F3F1EE',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        'xs': '4px',
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        'xxl': '24px',
        'pill': '9999px',
        'full': '9999px',
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgb(0 0 0 / 0.03)',
        '2xs': '0 1px 1px 0 rgb(0 0 0 / 0.02)',
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'sidebar': '1px 0 3px 0 rgb(0 0 0 / 0.04)',
      },
      width: {
        'sidebar': '256px',
        'sidebar-collapsed': '64px',
      },
    },
  },
  plugins: [],
}
