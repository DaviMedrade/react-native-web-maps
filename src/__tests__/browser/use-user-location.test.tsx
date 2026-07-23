// F4 regression: showsUserLocation alone resolves a position (one-shot) and
// renders the dot; watching is reserved for follow/listener consumers; the
// watch is cleaned up on unmount; the camera only follows with
// followsUserLocation.

import { act } from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import MapView from "../../index.web";
import { getMapHandler } from "../test-utils/mock-react-google-maps";
import { createFakeMap } from "../test-utils/fake-map";
import { fakeGeolocationPosition, stubGeolocation } from "../test-utils/setup";

vi.mock("@react-google-maps/api", async () =>
	(
		await import("../test-utils/mock-react-google-maps")
	).createReactGoogleMapsMock(),
);

describe("user location (F4)", () => {
	it("resolves a one-shot position and shows the dot with showsUserLocation alone", async () => {
		const geolocation = stubGeolocation();
		geolocation.getCurrentPosition.mockImplementation(
			(success: PositionCallback) => success(fakeGeolocationPosition()),
		);

		const screen = await render(
			<MapView
				provider="google"
				googleMapsApiKey="test-key"
				showsUserLocation
			/>,
		);
		await act(async () => {
			getMapHandler("onLoad")(createFakeMap());
		});

		expect(geolocation.getCurrentPosition).toHaveBeenCalledTimes(1);
		expect(geolocation.watchPosition).not.toHaveBeenCalled();
		await expect.element(screen.getByTestId("gm-overlay")).toBeVisible();
	});

	it("watches and cleans up when following", async () => {
		const geolocation = stubGeolocation();
		const screen = await render(
			<MapView
				provider="google"
				googleMapsApiKey="test-key"
				showsUserLocation
				followsUserLocation
			/>,
		);

		expect(geolocation.watchPosition).toHaveBeenCalledTimes(1);
		expect(geolocation.getCurrentPosition).not.toHaveBeenCalled();

		await screen.unmount();
		expect(geolocation.clearWatch).toHaveBeenCalledWith(42);
	});

	it("pans the camera to the position only when following", async () => {
		const geolocation = stubGeolocation();
		let deliverPosition: PositionCallback | undefined;
		geolocation.watchPosition.mockImplementation(
			(success: PositionCallback) => {
				deliverPosition = success;
				return 42;
			},
		);

		const fakeMap = createFakeMap();
		await render(
			<MapView
				provider="google"
				googleMapsApiKey="test-key"
				showsUserLocation
				followsUserLocation
			/>,
		);
		await act(async () => {
			getMapHandler("onLoad")(fakeMap);
		});
		await act(async () => {
			deliverPosition?.(fakeGeolocationPosition(-23.55, -46.63));
		});

		expect(fakeMap.panTo).toHaveBeenCalledWith({ lat: -23.55, lng: -46.63 });
	});

	it("does not pan the camera with showsUserLocation alone", async () => {
		const geolocation = stubGeolocation();
		geolocation.getCurrentPosition.mockImplementation(
			(success: PositionCallback) => success(fakeGeolocationPosition()),
		);

		const fakeMap = createFakeMap();
		await render(
			<MapView
				provider="google"
				googleMapsApiKey="test-key"
				showsUserLocation
			/>,
		);
		await act(async () => {
			getMapHandler("onLoad")(fakeMap);
		});

		expect(fakeMap.panTo).not.toHaveBeenCalled();
	});
});
