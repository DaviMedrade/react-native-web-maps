// Ported from @teovilla/react-native-web-maps v0.9.5
// upstream: packages/react-native-web-maps/src/components/user-location-marker.tsx (MIT, (c) 2022 Teodoro Villanueva — see LICENSE-upstream)
// Modified; fixes applied: none. See TODO.md.
// Deviations: plain <div> + CSS instead of react-native View/StyleSheet (this
// file only ever renders on web), and browser GeolocationCoordinates instead
// of expo-location's LocationObjectCoords.

import type { CSSProperties } from "react";
import { Marker } from "./marker.web";

interface UserLocationMarkerProps {
	coordinates: GeolocationCoordinates;
}

const dotStyle: CSSProperties = {
	backgroundColor: "#1380FF",
	width: 18,
	height: 18,
	borderRadius: 9999,
	border: "2px solid white",
	boxShadow: "0 5px 6.68px rgba(0, 0, 0, 0.36)",
};

export function UserLocationMarker(props: UserLocationMarkerProps) {
	return (
		<Marker
			coordinate={{
				latitude: props.coordinates.latitude,
				longitude: props.coordinates.longitude,
			}}
			anchor={{ x: 0.5, y: 0.5 }}
		>
			<div style={dotStyle} />
		</Marker>
	);
}
