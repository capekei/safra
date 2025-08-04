import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        glass: "20px",
        "glass-lg": "24px",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar-background)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
        // Liquid Glass custom colors
        glass: {
          background: "var(--glass-background)",
          border: "var(--glass-border)", 
          shadow: "var(--glass-shadow)",
          card: {
            background: "var(--glass-card-background)",
            border: "var(--glass-card-border)",
            shadow: "var(--glass-card-shadow)",
          }
        }
      },
      backdropBlur: {
        glass: "30px",
        "glass-card": "20px",
        "glass-button": "15px",
      },
      backdropSaturate: {
        glass: "150%",
        "glass-card": "120%", 
        "glass-button": "110%",
      },
      backdropBrightness: {
        glass: "110%",
      },
      boxShadow: {
        glass: "0 8px 32px var(--glass-shadow)",
        "glass-card": "0 4px 16px var(--glass-card-shadow)",
        "glass-button": "0 2px 8px var(--glass-card-shadow)",
        "glass-hover": "0 12px 24px hsla(0, 0%, 0%, 0.1)",
        "glass-active": "0 16px 32px hsla(0, 0%, 0%, 0.12)",
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "ticker-scroll": "scroll-left 30s linear infinite",
        "float": "float 3s ease-in-out infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
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
        "scroll-left": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system", 
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
        ],
        mono: [
          '"SF Mono"',
          "Monaco",
          '"Inconsolata"',
          '"Roboto Mono"',
          '"Source Code Pro"',
          "monospace",
        ],
        ticker: [
          '"Bitcount Prop Single"',
          "monospace",
          "system-ui",
        ],
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },
      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem",
      },
      screens: {
        "3xl": "1600px",
      },
      zIndex: {
        "60": "60",
        "70": "70",
        "80": "80",
        "90": "90",
        "100": "100",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"), 
    require("@tailwindcss/typography"),
    // Custom plugin for Liquid Glass utilities
    function({ addUtilities, theme }: any) {
      const glassUtilities = {
        '.glass-effect': {
          background: 'var(--glass-background)',
          backdropFilter: 'blur(30px) saturate(150%) brightness(110%)',
          border: '1px solid var(--glass-border)',
          boxShadow: theme('boxShadow.glass'),
          borderRadius: theme('borderRadius.glass'),
        },
        '.glass-card': {
          background: 'var(--glass-card-background)',
          backdropFilter: 'blur(20px) saturate(120%)',
          border: '1px solid var(--glass-card-border)',
          boxShadow: theme('boxShadow.glass-card'),
          borderRadius: theme('borderRadius.md'),
          transition: 'all 0.3s ease',
        },
        '.glass-card:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme('boxShadow.glass-hover'),
        },
        '.glass-button': {
          background: 'var(--glass-card-background)',
          backdropFilter: 'blur(15px) saturate(110%)',
          border: '1px solid var(--glass-card-border)',
          boxShadow: theme('boxShadow.glass-button'),
          borderRadius: theme('borderRadius.lg'),
          transition: 'all 0.3s ease',
        },
        '.glass-button:hover': {
          background: 'hsla(120, 100%, 50%, 0.1)',
          borderColor: 'hsl(120, 100%, 50%)',
        },
        '.glass-pill': {
          background: 'var(--glass-card-background)',
          backdropFilter: 'blur(15px) saturate(110%)',
          border: '1px solid var(--glass-card-border)',
          boxShadow: theme('boxShadow.glass-button'),
          borderRadius: '9999px',
          transition: 'all 0.3s ease',
        },
        '.glass-pill:hover': {
          background: 'hsla(120, 100%, 50%, 0.1)',
          borderColor: 'hsl(120, 100%, 50%)',
        },
        '.glass-pill.active': {
          background: 'hsla(120, 100%, 50%, 0.1)',
          borderColor: 'hsl(120, 100%, 50%)',
          color: 'hsl(120, 100%, 30%)',
        },
        '.ghost-logo': {
          width: '32px',
          height: '32px',
          background: 'linear-gradient(135deg, hsl(0, 0%, 94%) 0%, hsl(0, 0%, 88%) 100%)',
          borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
          position: 'relative',
          transition: 'transform 0.3s ease',
          '&:hover': {
            transform: 'scale(1.1)',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '8px',
            left: '8px',
            width: '6px',
            height: '6px',
            background: 'hsl(0, 0%, 20%)',
            borderRadius: '50%',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '6px',
            height: '6px',
            background: 'hsl(0, 0%, 20%)',
            borderRadius: '50%',
          },
        },
        '.ticker-scroll': {
          animation: 'scroll-left 30s linear infinite',
        },
        '.whatsapp-green': {
          backgroundColor: 'hsl(142, 70%, 49%)',
          '&:hover': {
            backgroundColor: 'hsl(142, 70%, 45%)',
          },
        },
        '.image-glass-overlay': {
          background: 'linear-gradient(180deg, transparent 0%, hsla(0, 0%, 0%, 0.1) 50%, hsla(0, 0%, 0%, 0.3) 100%)',
        },
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.currency-dop::before': {
          content: '"RD$ "',
        },
        '.line-clamp-1': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '1',
        },
        '.line-clamp-2': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '2',
        },
        '.line-clamp-3': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '3',
        },
      };

      addUtilities(glassUtilities);
    }
  ],
} satisfies Config;
