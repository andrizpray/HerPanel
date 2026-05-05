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
                sans: ['Syne', ...defaultTheme.fontFamily.sans],
                mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
            },
            colors: {
                // NexPanel palette
                nexBg: '#080c10',
                nexBg2: '#0d1117',
                nexBg3: '#111820',
                nexPanel: '#131c26',
                nexBorder: '#1e2d3d',
                nexBorder2: '#253447',
                nexAccent: '#00d4ff',
                nexAccent2: '#0095ff',
                nexAccent3: '#00ff88',
                nexWarn: '#ff6b35',
                nexDanger: '#ff3a3a',
                nexText: '#c8d8e8',
                nexText2: '#7a9bb5',
                nexText3: '#3d5a70',
            },
        },
    },

    plugins: [forms],
};
