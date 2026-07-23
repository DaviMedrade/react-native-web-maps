// F7 regression: Circle forwards strokeWidth as Google's strokeWeight.

import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { Circle } from "../../index.web";

vi.mock("@react-google-maps/api", async () =>
	(
		await import("../test-utils/mock-react-google-maps")
	).createReactGoogleMapsMock(),
);

describe("Circle (F7)", () => {
	it("forwards strokeWidth as strokeWeight", async () => {
		const screen = await render(
			<Circle
				center={{ latitude: -23.55, longitude: -46.63 }}
				radius={500}
				strokeWidth={4}
				strokeColor="#ff0000"
				fillColor="rgba(255,0,0,0.2)"
				zIndex={7}
			/>,
		);

		const circle = screen.getByTestId("gm-circle");
		await expect.element(circle).toBeInTheDocument();
		const options = JSON.parse(
			(await circle.element()).getAttribute("data-options") ?? "{}",
		);
		expect(options.strokeWeight).toBe(4);
		expect(options.strokeColor).toBe("#ff0000");
		expect(options.zIndex).toBe(7);
	});
});
