import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

export default {
  darkMode: ['class'], // Keep dark mode enabled via class
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}', // Ensure all relevant paths are included
  ],
  prefix: '', // Keep prefix empty unless needed
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      // --- NEW: Map Tailwind colors to CSS Variables ---
      colors: {
        border: 'hsl(var(--border))',
        'border-light': 'hsl(var(--border-light))', // Added if you use border-light utility
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))', // Focus ring color

        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        'background-subtle': 'hsl(var(--background-subtle))', // Added
        'background-muted': 'hsl(var(--background-muted))', // Added

        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          hover: 'hsl(var(--primary-hover))', // Added
          light: 'hsl(var(--primary-light))', // Added
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
          hover: 'hsl(var(--accent-hover))', // Added
          light: 'hsl(var(--accent-light))', // Added
        },
        // Map text variables (optional, as foreground covers default text)
        'text-primary': 'hsl(var(--text-primary))',
        'text-secondary': 'hsl(var(--text-secondary))',
        'text-muted': 'hsl(var(--text-muted))',

        // Status Colors
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--primary-foreground))', // Assuming white/light text on success bg
          hover: 'hsl(var(--success-hover))',
          light: 'hsl(var(--success-light))',
        },
        error: {
          DEFAULT: 'hsl(var(--error))',
          foreground: 'hsl(var(--primary-foreground))', // Assuming white/light text on error bg
          hover: 'hsl(var(--error-hover))',
          light: 'hsl(var(--error-light))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--primary-foreground))', // Assuming white/light text on warning bg
          hover: 'hsl(var(--warning-hover))',
          light: 'hsl(var(--warning-light))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          foreground: 'hsl(var(--primary-foreground))', // Assuming white/light text on info bg
          hover: 'hsl(var(--info-hover))',
          light: 'hsl(var(--info-light))',
        },

        // Component Colors
        destructive: {
          DEFAULT: 'hsl(var(--error))', // Map destructive to error
          foreground: 'hsl(var(--primary-foreground))', // Assuming white/light text
        },
        muted: {
          DEFAULT: 'hsl(var(--background-muted))', // Map muted bg
          foreground: 'hsl(var(--text-muted))', // Map muted text
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Sidebar Colors (can be used with utilities like bg-sidebar, text-sidebar-primary)
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))', // Use DEFAULT for bg-sidebar
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      // --- Keep existing borderRadius, keyframes, animation ---
      borderRadius: {
        lg: 'var(--radius)', // Uses the CSS variable defined in index.css
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
      },
    },
  },
  plugins: [tailwindcssAnimate], // Keep the animation plugin
} satisfies Config;
