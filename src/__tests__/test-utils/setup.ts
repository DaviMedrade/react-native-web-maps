import { vi } from "vitest";

// Tests drive React state updates from outside event handlers (map callbacks,
// geolocation callbacks), so they wrap them in act().
(
	globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

// Minimal google.maps globals for code paths that construct API objects
// directly (LatLngBounds in the imperative handle, Point in mouse mapping).
class FakeLatLngBounds {
	extend() {
		return this;
	}
}

class FakePoint {
	constructor(
		public x: number,
		public y: number,
	) {}
}

(globalThis as { google?: unknown }).google = {
	maps: {
		LatLngBounds: FakeLatLngBounds,
		Point: FakePoint,
	},
};

export interface GeolocationStub {
	getCurrentPosition: ReturnType<typeof vi.fn>;
	watchPosition: ReturnType<typeof vi.fn>;
	clearWatch: ReturnType<typeof vi.fn>;
}

// Replaces the real browser geolocation so tests never hit the permission
// prompt. Returns the stub for per-test wiring of success callbacks.
export function stubGeolocation(): GeolocationStub {
	const geolocation: GeolocationStub = {
		getCurrentPosition: vi.fn(),
		watchPosition: vi.fn(() => 42),
		clearWatch: vi.fn(),
	};
	Object.defineProperty(navigator, "geolocation", {
		value: geolocation,
		configurable: true,
	});
	return geolocation;
}

export function fakeGeolocationPosition(
	latitude = -23.55,
	longitude = -46.63,
): GeolocationPosition {
	return {
		timestamp: 1700000000000,
		coords: {
			latitude,
			longitude,
			accuracy: 10,
			altitude: null,
			altitudeAccuracy: null,
			heading: null,
			speed: null,
		},
	} as GeolocationPosition;
}
