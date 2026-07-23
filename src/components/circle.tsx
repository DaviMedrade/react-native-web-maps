// Ported from @teovilla/react-native-web-maps v0.9.5
// upstream: packages/react-native-web-maps/src/components/circle.tsx (MIT, (c) 2022 Teodoro Villanueva — see LICENSE-upstream)
// Modified; fixes applied: F7. See TODO.md.
// react-native-maps' Circle is purely presentational (no press events in
// MapCircleProps), so only style props are forwarded.

import { Circle as GMCircle } from "@react-google-maps/api";
import type { MapCircleProps } from "react-native-maps";

export function Circle(props: MapCircleProps) {
	return (
		<GMCircle
			center={{ lat: props.center.latitude, lng: props.center.longitude }}
			radius={props.radius}
			options={{
				fillColor: props.fillColor,
				strokeColor: props.strokeColor,
				strokeWeight: props.strokeWidth,
				zIndex: props.zIndex,
			}}
		/>
	);
}
