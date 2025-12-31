/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./App.tsx",
        "./index.tsx"
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    green: '#098827',
                    gold: '#E9BE25',
                    black: '#000000',
                }
            }
        },
    },
    plugins: [],
    darkMode: 'class',
}
