import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
                mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
            },
            colors: {
                // Professional dark palette
                hpBg: '#0f1117',
                hpBg2: '#1a1d27',
                hpBg3: '#242836',
                hpSurface: '#1a1d27',
                hpBorder: '#2a2e3b',
                hpBorder2: '#363b4d',
                hpAccent: '#6366f1',     // Indigo — primary accent
                hpAccent2: '#818cf8',    // Indigo lighter
                hpWarn: '#f59e0b',       // Amber
                hpDanger: '#ef4444',     // Red
                hpSuccess: '#22c55e',    // Green
                hpText: '#f1f5f9',       // Slate-50
                hpText2: '#94a3b8',      // Slate-400
                hpText3: '#64748b',      // Slate-500
            },
        },
    },

    plugins: [forms],
};
