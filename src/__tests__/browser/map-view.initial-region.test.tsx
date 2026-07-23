// F5 regression: without initialCamera, the initial viewport is fitted from
// initialRegion's deltas — except when the region is degenerate (zero deltas).

import { act } from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import MapView from "../../index.web";
import { getMapHandler } from "../test-utils/mock-react-google-maps";
import { createFakeMap } from "../test-utils/fake-map";
import { stubGeolocation } from "../test-utils/setup";

vi.mock("@react-google-maps/api", async () =>
	(
		await import("../test-utils/mock-react-google-maps")
	).createReactGoogleMapsMock(),
);

describe("MapView initial region (F5)", () => {
	it("fits the map to initialRegion bounds on load", async () => {
		stubGeolocation();
		const fakeMap = createFakeMap();
		await render(
			<MapView
				provider="google"
				googleMapsApiKey="test-key"
				initialRegion={{
					latitude: -23.55,
					longitude: -46.63,
					latitudeDelta: 0.2,
					longitudeDelta: 0.4,
				}}
			/>,
		);
		await act(async () => {
			getMapHandler("onLoad")(fakeMap);
		});

		expect(fakeMap.fitBounds).toHaveBeenCalledWith({
			north: expect.closeTo(-23.45, 10),
			south: expect.closeTo(-23.65, 10),
			east: expect.closeTo(-46.43, 10),
			west: expect.closeTo(-46.83, 10),
		});
	});

	it("skips the fit for degenerate (zero-delta) regions", async () => {
		stubGeolocation();
		const fakeMap = createFakeMap();
		await render(
			<MapView
				provider="google"
				googleMapsApiKey="test-key"
				initialRegion={{
					latitude: 0,
					longitude: 0,
					latitudeDelta: 0,
					longitudeDelta: 0,
				}}
			/>,
		);
		await act(async () => {
			getMapHandler("onLoad")(fakeMap);
		});

		expect(fakeMap.fitBounds).not.toHaveBeenCalled();
	});

	it("prefers initialCamera when both are given", async () => {
		stubGeolocation();
		const fakeMap = createFakeMap();
		await render(
			<MapView
				provider="google"
				googleMapsApiKey="test-key"
				initialCamera={{
					center: { latitude: 1, longitude: 2 },
					heading: 0,
					pitch: 0,
					zoom: 15,
					altitude: 0,
				}}
				initialRegion={{
					latitude: -23.55,
					longitude: -46.63,
					latitudeDelta: 0.2,
					longitudeDelta: 0.4,
				}}
			/>,
		);
		await act(async () => {
			getMapHandler("onLoad")(fakeMap);
		});

		expect(fakeMap.fitBounds).not.toHaveBeenCalled();
	});
});
