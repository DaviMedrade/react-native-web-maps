// F3 regression: onRegionChangeComplete fires on any camera settle (onIdle),
// carries the correct isGesture flag, and is NOT bound to onDragEnd.

import { act } from "../test-utils/act";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import MapView from "../../index.web";
import {
	getMapHandler,
	hasMapHandler,
} from "../test-utils/mock-react-google-maps";
import { createFakeMap } from "../test-utils/fake-map";
import { stubGeolocation } from "../test-utils/setup";

vi.mock("@react-google-maps/api", async () =>
	(
		await import("../test-utils/mock-react-google-maps")
	).createReactGoogleMapsMock(),
);

describe("MapView region events (F3)", () => {
	it("fires onRegionChangeComplete from onIdle with the region and isGesture=false", async () => {
		stubGeolocation();
		const onComplete = vi.fn();
		await render(
			<MapView
				provider="google"
				googleMapsApiKey="test-key"
				onRegionChangeComplete={onComplete}
			/>,
		);
		await act(async () => {
			getMapHandler("onLoad")(createFakeMap());
		});
		await act(async () => {
			getMapHandler("onIdle")();
		});

		expect(onComplete).toHaveBeenCalledWith(
			{ latitude: 0, longitude: 0, latitudeDelta: 2, longitudeDelta: 2 },
			{ isGesture: false },
		);
	});

	it("reports isGesture=true when the settle follows a drag", async () => {
		stubGeolocation();
		const onComplete = vi.fn();
		await render(
			<MapView
				provider="google"
				googleMapsApiKey="test-key"
				onRegionChangeComplete={onComplete}
			/>,
		);
		await act(async () => {
			getMapHandler("onLoad")(createFakeMap());
		});
		await act(async () => {
			getMapHandler("onDragStart")();
		});
		await act(async () => {
			getMapHandler("onIdle")();
		});

		expect(onComplete).toHaveBeenLastCalledWith(expect.anything(), {
			isGesture: true,
		});

		// The gesture flag resets once the settle has been reported.
		await act(async () => {
			getMapHandler("onIdle")();
		});
		expect(onComplete).toHaveBeenLastCalledWith(expect.anything(), {
			isGesture: false,
		});
	});

	it("does not bind the region-complete handler to onDragEnd", async () => {
		stubGeolocation();
		await render(<MapView provider="google" googleMapsApiKey="test-key" />);
		await act(async () => {
			getMapHandler("onLoad")(createFakeMap());
		});
		expect(hasMapHandler("onDragEnd")).toBe(false);
	});
});
