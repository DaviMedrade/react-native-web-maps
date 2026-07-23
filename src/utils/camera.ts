// Ported from @teovilla/react-native-web-maps v0.9.5
// upstream: packages/react-native-web-maps/src/utils/camera.ts (MIT, (c) 2022 Teodoro Villanueva — see LICENSE-upstream)
// Modified; fixes applied: none. See TODO.md.

import type { Camera } from "react-native-maps";

export function transformRNCameraObject(
	camera: Partial<Camera>,
): google.maps.CameraOptions {
	return {
		tilt: camera.pitch,
		heading: camera.heading,
		zoom: camera.zoom,
		center: camera.center
			? {
					lat: camera.center.latitude,
					lng: camera.center.longitude,
				}
			: undefined,
	};
}
