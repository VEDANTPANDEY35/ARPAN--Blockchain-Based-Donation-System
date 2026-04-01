/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    primary: '#2A4D3E', // Deep Forest Green
                    secondary: '#D0E3C5', // Soft Sage
                    accent: '#E8CA88', // Elegant gold
                    dark: '#1B263B', // Deep Navy/Slate
                    muted: '#7A8B99', // Muted slate
                    light: '#F7F5F0', // Elegant Cream/Beige
                    border: '#E8E5DF', // Soft border matching cream
                    trust: '#4A6FA5', // Calm Trust blue
                    success: '#3A7D44', // Refined success green
                }
            },
            fontSize: {
                '8xl': '6rem',
                '9xl': '8rem',
                '10xl': '10rem',
            },
            fontFamily: {
                inter: ['Inter', 'sans-serif'],
                poppins: ['Poppins', 'sans-serif'],
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'shimmer': 'shimmer 2s infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                }
            }
        },
    },
    plugins: [],
}
