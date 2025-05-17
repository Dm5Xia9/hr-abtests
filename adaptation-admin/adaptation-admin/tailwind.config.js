/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
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
      colors: {
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "fadeIn": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 }
        },
        "scaleIn": {
          "0%": { transform: "scale(0.95)", opacity: 0 },
          "100%": { transform: "scale(1)", opacity: 1 }
        },
        "slideUp": {
          "0%": { transform: "translateY(10px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 }
        },
        "slideDown": {
          "0%": { transform: "translateY(-10px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 }
        },
        "pulse": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.7 }
        },
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-2px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(2px)" }
        },
        "pageFlipLeft": {
          "0%": { 
            transform: "rotateY(0deg)", 
            transformOrigin: "left center",
            boxShadow: "0 0 0 rgba(0, 0, 0, 0)"
          },
          "100%": { 
            transform: "rotateY(-25deg)", 
            transformOrigin: "left center",
            boxShadow: "10px 0 15px rgba(0, 0, 0, 0.1)"
          }
        },
        "pageFlipRight": {
          "0%": { 
            transform: "rotateY(0deg)", 
            transformOrigin: "right center",
            boxShadow: "0 0 0 rgba(0, 0, 0, 0)"
          },
          "100%": { 
            transform: "rotateY(25deg)", 
            transformOrigin: "right center",
            boxShadow: "-10px 0 15px rgba(0, 0, 0, 0.1)"
          }
        },
        "slideInLeft": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" }
        },
        "slideInRight": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fadeIn": "fadeIn 0.5s ease-out",
        "scaleIn": "scaleIn 0.4s ease-out",
        "slideUp": "slideUp 0.3s ease-out",
        "slideDown": "slideDown 0.3s ease-out",
        "pulse": "pulse 2s ease-in-out infinite",
        "shake": "shake 0.5s ease-in-out",
        "pageFlipLeft": "pageFlipLeft 0.4s ease-out",
        "pageFlipRight": "pageFlipRight 0.4s ease-out",
        "slideInLeft": "slideInLeft 0.4s ease-out",
        "slideInRight": "slideInRight 0.4s ease-out"
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: "hsl(var(--foreground))",
            a: {
              color: "hsl(var(--primary))",
              "&:hover": {
                color: "hsl(var(--primary))",
              },
            },
            strong: {
              color: "hsl(var(--foreground))",
            },
            code: {
              color: "hsl(var(--foreground))",
            },
            h1: {
              color: "hsl(var(--foreground))",
            },
            h2: {
              color: "hsl(var(--foreground))",
            },
            h3: {
              color: "hsl(var(--foreground))",
            },
            h4: {
              color: "hsl(var(--foreground))",
            },
            blockquote: {
              color: "hsl(var(--muted-foreground))",
            },
            hr: {
              borderColor: "hsl(var(--border))",
            },
            ol: {
              color: "hsl(var(--foreground))",
            },
            ul: {
              color: "hsl(var(--foreground))",
            },
            li: {
              color: "hsl(var(--foreground))",
            },
            "ol > li::marker": {
              color: "hsl(var(--muted-foreground))",
            },
            "ul > li::marker": {
              color: "hsl(var(--muted-foreground))",
            },
            th: {
              color: "hsl(var(--foreground))",
            },
            "thead th": {
              color: "hsl(var(--foreground))",
            },
            tbody: {
              color: "hsl(var(--foreground))",
            },
            tr: {
              borderBottomColor: "hsl(var(--border))",
            },
          },
        },
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
  ],
} 