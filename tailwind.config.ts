import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#101114",
        soft: "#6b7280",
        surface: "#f6f7f8",
        accent: "#2563eb",
        accentSoft: "#dbeafe",
        line: "rgba(17, 24, 39, 0.08)",
      },
      boxShadow: {
        panel: "0 18px 48px rgba(15, 23, 42, 0.06)",
        float: "0 24px 80px rgba(15, 23, 42, 0.12)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      backgroundImage: {
        halo:
          "radial-gradient(circle at top left, rgba(37,99,235,0.12), transparent 32%), radial-gradient(circle at 85% 10%, rgba(15,23,42,0.07), transparent 24%)",
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "var(--font-noto-sans-jp)"],
      },
    },
  },
  plugins: [],
};

export default config;
