import { vi } from "vitest";

export interface FakeBoundsCorners {
	north: number;
	south: number;
	east: number;
	west: number;
}

export function createFakeBounds(
	corners: FakeBoundsCorners = { north: 1, south: -1, east: 1, west: -1 },
) {
	return {
		getNorthEast: () => ({ lat: () => corners.north, lng: () => corners.east }),
		getSouthWest: () => ({ lat: () => corners.south, lng: () => corners.west }),
		getCenter: () => ({
			lat: () => (corners.north + corners.south) / 2,
			lng: () => (corners.east + corners.west) / 2,
		}),
	} as unknown as google.maps.LatLngBounds;
}

export function createFakeMap(overrides: Record<string, unknown> = {}) {
	const fake = {
		getBounds: vi.fn(() => createFakeBounds()),
		getCenter: vi.fn(() => ({ lat: () => 0, lng: () => 0 })),
		getDiv: vi.fn(() => ({ offsetWidth: 1024 })),
		getHeading: vi.fn(() => 0),
		getTilt: vi.fn(() => 0),
		getZoom: vi.fn(() => 3),
		getProjection: vi.fn(() => undefined),
		panTo: vi.fn(),
		fitBounds: vi.fn(),
		setZoom: vi.fn(),
		moveCamera: vi.fn(),
		...overrides,
	};
	return fake as unknown as google.maps.Map & typeof fake;
}
