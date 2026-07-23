// Ported from @teovilla/react-native-web-maps v0.9.5
// upstream: packages/react-native-web-maps/src/override-types.ts (MIT, (c) 2022 Teodoro Villanueva — see LICENSE-upstream)
// Modified; fixes applied: F8. See TODO.md.
// Deviation: current react-native-maps defines MapViewProps as a type alias,
// which TypeScript cannot augment via declare-module interface merging (the
// upstream approach). The web-specific props are exported as a standalone
// type instead.

import type { ReactElement } from "react";
import type { MapViewProps } from "react-native-maps";

/** Props this package reads on web in addition to react-native-maps' own. */
export interface WebMapViewExtraProps {
	googleMapsApiKey?: string;
	googleMapsMapId?: string;
	loadingFallback?: ReactElement;
	options?: google.maps.MapOptions;
}

/**
 * Full prop surface of the web MapView (F8). Consumers aliasing
 * react-native-maps to this package can keep the extra props type-checked by
 * building them against this type instead of casting them away:
 *
 * ```ts
 * import type { WebMapViewExtraProps } from "react-native-web-maps";
 * const webMapProps = {
 * 	googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
 * } satisfies WebMapViewExtraProps;
 * // ...
 * <MapView {...webMapProps} />
 * ```
 */
export type WebMapViewProps = MapViewProps & WebMapViewExtraProps;
