/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds - Light & Clean
        ivory: '#f8f6f3',
        cream: '#f0ebe3',
        parchment: '#e5ddd1',
        stone: '#d4cdc3',
        
        // Primary - Royal Navy
        navy: {
          DEFAULT: '#1e3a5f',
          deep: '#132742',
          light: '#2d5a87',
        },
        
        // Accent - Burgundy/Wine
        burgundy: '#722f37',
        wine: '#5c2028',
        rose: '#9c4a52',
        
        // Gold Accents
        gold: {
          DEFAULT: '#b8860b',
          light: '#d4a84b',
          muted: '#a67c00',
        },
        
        // Status Colors
        sage: '#4a7c59',
        terracotta: '#c67b5c',
        slate: '#5a6275',
        
        // Text - High Contrast
        ink: '#1a1a1a',
        charcoal: '#2d2d2d',
        graphite: '#4a4a4a',
        
        // Legacy mappings
        midnight: '#1e3a5f',
        teal: '#2d5a87',
        coral: '#722f37',
        mint: '#4a7c59',
        lavender: '#5a6275',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}

