import type { Region } from "react-native-maps";

// Conversion between react-native-maps regions (center + deltas) and Google
// Maps bounds/zoom. The half-delta bounds arithmetic mirrors what
// react-native-maps' Android implementation does when it applies a region.

const MIN_ZOOM = 0;
const MAX_ZOOM = 22;
const TILE_SIZE = 256;

export function regionToBounds(
	region: Region,
): google.maps.LatLngBoundsLiteral {
	return {
		north: region.latitude + region.latitudeDelta / 2,
		south: region.latitude - region.latitudeDelta / 2,
		east: region.longitude + region.longitudeDelta / 2,
		west: region.longitude - region.longitudeDelta / 2,
	};
}

export function boundsToRegion(bounds: google.maps.LatLngBounds): Region {
	const northEast = bounds.getNorthEast();
	const southWest = bounds.getSouthWest();
	const center = bounds.getCenter();
	return {
		latitude: center.lat(),
		longitude: center.lng(),
		latitudeDelta: Math.abs(northEast.lat() - southWest.lat()),
		longitudeDelta: Math.abs(northEast.lng() - southWest.lng()),
	};
}

export function regionToZoom(region: Region, mapWidthPx: number): number {
	const zoom = Math.log2(
		(360 * (mapWidthPx / TILE_SIZE)) / region.longitudeDelta,
	);
	return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

// A region with a zero/negative delta (e.g. a placeholder passed before
// geolocation resolves) must never be fitted: degenerate bounds collapse to a
// point and snap the map to maximum zoom.
export function isDegenerateRegion(region: Region): boolean {
	return region.latitudeDelta <= 0 || region.longitudeDelta <= 0;
}
