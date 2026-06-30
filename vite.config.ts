import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), basicSsl()],
  server: {
    https: {},
    host: "localhost",
    port: 5173,
  },
  resolve: {
    tsconfigPaths: true,
  },
});
