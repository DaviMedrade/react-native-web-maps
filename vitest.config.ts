import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		projects: [
			{
				test: {
					name: "unit",
					environment: "node",
					include: ["src/__tests__/unit/**/*.test.ts"],
				},
			},
			{
				test: {
					name: "browser",
					include: ["src/__tests__/browser/**/*.test.tsx"],
					setupFiles: ["src/__tests__/test-utils/setup.ts"],
					browser: {
						enabled: true,
						provider: playwright(),
						headless: true,
						screenshotFailures: false,
						instances: [{ browser: "chromium" }],
					},
				},
			},
		],
	},
});
