// F1 regression: children added after first render must appear without any
// map interaction (upstream froze them inside a stale memo).

import { act } from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import MapView, { Marker } from "../../index.web";
import { getMapHandler } from "../test-utils/mock-react-google-maps";
import { createFakeMap } from "../test-utils/fake-map";
import { stubGeolocation } from "../test-utils/setup";

vi.mock("@react-google-maps/api", async () =>
	(
		await import("../test-utils/mock-react-google-maps")
	).createReactGoogleMapsMock(),
);

describe("MapView children (F1)", () => {
	it("renders a marker added after mount without any interaction", async () => {
		stubGeolocation();
		const screen = await render(
			<MapView provider="google" googleMapsApiKey="test-key" />,
		);
		await act(async () => {
			getMapHandler("onLoad")(createFakeMap());
		});

		await screen.rerender(
			<MapView provider="google" googleMapsApiKey="test-key">
				<Marker coordinate={{ latitude: -23.55, longitude: -46.63 }}>
					<span>PDV</span>
				</Marker>
			</MapView>,
		);

		await expect.element(screen.getByText("PDV")).toBeVisible();
	});
});
