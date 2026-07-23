// F6 regression: animateToRegion preserves the caller's centre and zoom
// intent (panTo + setZoom) instead of re-fitting bounds.

import { act, createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import type RNMapView from "react-native-maps";
import MapView from "../../index.web";
import { getMapHandler } from "../test-utils/mock-react-google-maps";
import { createFakeMap } from "../test-utils/fake-map";
import { stubGeolocation } from "../test-utils/setup";
import { regionToZoom } from "../../utils/region";

vi.mock("@react-google-maps/api", async () =>
	(
		await import("../test-utils/mock-react-google-maps")
	).createReactGoogleMapsMock(),
);

describe("MapView imperative handle (F6)", () => {
	it("animateToRegion pans and zooms without fitting bounds", async () => {
		stubGeolocation();
		const fakeMap = createFakeMap();
		const ref = createRef<Partial<RNMapView>>();
		await render(
			<MapView
				provider="google"
				googleMapsApiKey="test-key"
				ref={ref as never}
			/>,
		);
		await act(async () => {
			getMapHandler("onLoad")(fakeMap);
		});

		const region = {
			latitude: -23.55,
			longitude: -46.63,
			latitudeDelta: 0.2,
			longitudeDelta: 0.4,
		};
		act(() => {
			ref.current?.animateToRegion?.(region, 1000);
		});

		expect(fakeMap.panTo).toHaveBeenCalledWith({ lat: -23.55, lng: -46.63 });
		expect(fakeMap.setZoom).toHaveBeenCalledWith(regionToZoom(region, 1024));
		expect(fakeMap.fitBounds).not.toHaveBeenCalled();
	});

	it("animateToRegion ignores degenerate regions", async () => {
		stubGeolocation();
		const fakeMap = createFakeMap();
		const ref = createRef<Partial<RNMapView>>();
		await render(
			<MapView
				provider="google"
				googleMapsApiKey="test-key"
				ref={ref as never}
			/>,
		);
		await act(async () => {
			getMapHandler("onLoad")(fakeMap);
		});

		act(() => {
			ref.current?.animateToRegion?.(
				{ latitude: 0, longitude: 0, latitudeDelta: 0, longitudeDelta: 0 },
				1000,
			);
		});

		expect(fakeMap.panTo).not.toHaveBeenCalled();
		expect(fakeMap.setZoom).not.toHaveBeenCalled();
	});
});
