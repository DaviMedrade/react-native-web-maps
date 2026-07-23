// Rewritten from @teovilla/react-native-web-maps v0.9.5
// upstream: packages/react-native-web-maps/src/hooks/use-user-location.tsx (MIT, (c) 2022 Teodoro Villanueva — see LICENSE-upstream)
// Modified; fixes applied: F4. See TODO.md.
// Deviation: uses the browser's navigator.geolocation directly instead of
// expo-location — the geolocation calls themselves trigger the permission
// prompt, so there is no separate permission step.

import { useCallback, useEffect, useState } from "react";
import type { UserLocationChangeEvent } from "react-native-maps";

interface UseUserLocationOptions {
	showUserLocation: boolean;
	followUserLocation: boolean;
	onUserLocationChange?: (event: UserLocationChangeEvent) => void;
}

export function useUserLocation(
	options: UseUserLocationOptions,
): GeolocationPosition | undefined {
	const { showUserLocation, followUserLocation, onUserLocationChange } =
		options;

	const [position, setPosition] = useState<GeolocationPosition>();

	const handlePosition = useCallback(
		(pos: GeolocationPosition) => {
			setPosition(pos);
			// GeolocationCoordinates uses null for unavailable values; 0 is a
			// valid heading/speed/altitude, hence ?? rather than ||.
			onUserLocationChange?.({
				nativeEvent: {
					coordinate: {
						latitude: pos.coords.latitude,
						longitude: pos.coords.longitude,
						altitude: pos.coords.altitude ?? 0,
						heading: pos.coords.heading ?? 0,
						accuracy: pos.coords.accuracy,
						speed: pos.coords.speed ?? 0,
						timestamp: pos.timestamp,
						isFromMockProvider: false,
					},
				},
			} as unknown as UserLocationChangeEvent);
		},
		[onUserLocationChange],
	);

	// F4: showsUserLocation alone must resolve a position (native draws the dot
	// without followsUserLocation). Show-only needs a single fix; a follow
	// camera or a change listener needs a continuous watch.
	const wantsWatch = followUserLocation || onUserLocationChange != null;
	const wantsOneShot = showUserLocation && !wantsWatch;

	useEffect(() => {
		if (!wantsWatch && !wantsOneShot) {
			return;
		}

		// SSR / non-secure contexts (e.g. Next.js server render).
		if (typeof navigator === "undefined" || !navigator.geolocation) {
			console.warn(
				"[WARNING] navigator.geolocation is unavailable; user location is disabled",
			);
			return;
		}

		const onError = (error: GeolocationPositionError) => {
			console.warn(
				`[WARNING] Could not resolve user location: ${error.message}`,
			);
		};

		if (wantsWatch) {
			const watchId = navigator.geolocation.watchPosition(
				handlePosition,
				onError,
			);
			return () => navigator.geolocation.clearWatch(watchId);
		}

		let cancelled = false;
		navigator.geolocation.getCurrentPosition((pos) => {
			if (!cancelled) {
				handlePosition(pos);
			}
		}, onError);
		return () => {
			cancelled = true;
		};
	}, [wantsWatch, wantsOneShot, handlePosition]);

	return position;
}
