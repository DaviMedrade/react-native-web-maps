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
	},
	server: {
		fs: { allow: [".."] },
	},
});
