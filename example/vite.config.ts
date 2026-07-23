import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// The alias exercises the exact source-consumption path a Metro consumer
// uses: react-native-maps → this package's web entry, straight from src/.
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"react-native-maps": path.resolve(__dirname, "../src/index.web.ts"),
		},
		// The aliased sources live outside this app root, so their imports of
		// react etc. would resolve to the repo root's node_modules — a second
		// React copy, which breaks hooks at runtime. Force one copy of each.
		dedupe: ["react", "react-dom", "@react-google-maps/api"],
	},
	server: {
		fs: { allow: [".."] },
		// Opt-in for serving through a reverse proxy / tunnel with a public
		// hostname: EXAMPLE_ALLOWED_HOST=maps.example.dev npm run dev
		allowedHosts: process.env.EXAMPLE_ALLOWED_HOST
			? [process.env.EXAMPLE_ALLOWED_HOST]
			: [],
	},
});
