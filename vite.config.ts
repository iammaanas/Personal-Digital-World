import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The site is hosted beneath /Personal-Digital-World/ on GitHub Pages.
export default defineConfig({
  base: "/Personal-Digital-World/",
  plugins: [react()],
});
