import { describe, expect, it } from "vitest";
import {
	boundsToRegion,
	isDegenerateRegion,
	regionToBounds,
	regionToZoom,
} from "../../utils/region";

const region = (
	latitude: number,
	longitude: number,
	latitudeDelta: number,
	longitudeDelta: number,
) => ({ latitude, longitude, latitudeDelta, longitudeDelta });

describe("regionToBounds", () => {
	it("spreads half the delta on each side of the center", () => {
		expect(regionToBounds(region(10, 20, 2, 4))).toEqual({
			north: 11,
			south: 9,
			east: 22,
			west: 18,
		});
	});
});

describe("boundsToRegion", () => {
	it("derives center and deltas from the corners", () => {
		const bounds = {
			getNorthEast: () => ({ lat: () => 11, lng: () => 22 }),
			getSouthWest: () => ({ lat: () => 9, lng: () => 18 }),
			getCenter: () => ({ lat: () => 10, lng: () => 20 }),
		} as unknown as google.maps.LatLngBounds;
		expect(boundsToRegion(bounds)).toEqual(region(10, 20, 2, 4));
	});
});

describe("regionToZoom", () => {
	it("computes zoom from longitude delta and map width", () => {
		// 360° across a 256px-wide map is the whole world at zoom 0.
		expect(regionToZoom(region(0, 0, 1, 360), 256)).toBe(0);
		// Halving the visible span adds one zoom level.
		expect(regionToZoom(region(0, 0, 1, 180), 256)).toBe(1);
		// Wider viewport shows more tiles at the same zoom.
		expect(regionToZoom(region(0, 0, 1, 360), 512)).toBe(1);
	});

	it("clamps to Google's usable range", () => {
		expect(regionToZoom(region(0, 0, 1, 0.000001), 4096)).toBe(22);
		expect(regionToZoom(region(0, 0, 1, 360), 64)).toBe(0);
	});
});

describe("isDegenerateRegion", () => {
	it("rejects zero and negative deltas", () => {
		expect(isDegenerateRegion(region(0, 0, 0, 0))).toBe(true);
		expect(isDegenerateRegion(region(1, 1, 0, 2))).toBe(true);
		expect(isDegenerateRegion(region(1, 1, 2, -1))).toBe(true);
	});

	it("accepts real regions", () => {
		expect(isDegenerateRegion(region(-23.55, -46.63, 0.1, 0.1))).toBe(false);
	});
});
