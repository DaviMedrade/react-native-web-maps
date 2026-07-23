// Ported from @teovilla/react-native-web-maps v0.9.5
// upstream: packages/react-native-web-maps/src/utils/mouse-event.ts (MIT, (c) 2022 Teodoro Villanueva — see LICENSE-upstream)
// Modified; fixes applied: none. See TODO.md.
// Deviation: coordinate fallbacks use ?? / Number-coercion helpers instead of ||,
// so a legal latitude/longitude of 0 is not treated as missing.

import type { AnimatedRegion, LatLng } from "react-native-maps";

function toFiniteNumber(value: unknown): number {
	const n = Number(value);
	return Number.isFinite(n) ? n : 0;
}

export function mapMouseEventToMapEvent<T>(
	e?: google.maps.MapMouseEvent | null,
	defaultCoordinate?: LatLng | AnimatedRegion | null,
	map?: google.maps.Map | null,
	action?: string,
) {
	const latitude =
		e?.latLng?.lat() ?? toFiniteNumber(defaultCoordinate?.latitude);
	const longitude =
		e?.latLng?.lng() ?? toFiniteNumber(defaultCoordinate?.longitude);

	return {
		preventDefault: e?.stop,
		stopPropagation: e?.stop,
		nativeEvent: {
			action,
			coordinate: { latitude, longitude },
			position: map?.getProjection()?.fromLatLngToPoint({
				lat: latitude,
				lng: longitude,
			}) || { x: 0, y: 0 },
		},
	} as T;
}
