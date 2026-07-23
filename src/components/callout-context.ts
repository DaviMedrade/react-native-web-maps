// Derived from @teovilla/react-native-web-maps v0.9.5
// upstream: packages/react-native-web-maps/src/components/callout.tsx (MIT, (c) 2022 Teodoro Villanueva — see LICENSE-upstream)
// Modified; fixes applied: none. See TODO.md.
// The context lives in its own module so Marker doesn't import the Callout
// component (ported in a later milestone).

import { createContext } from "react";
import type { LatLng, Point } from "react-native-maps";

export interface CalloutContextType {
	calloutVisible: boolean;
	toggleCalloutVisible: () => void;
	coordinate: LatLng;
	markerSize: { width: number; height: number };
	anchor: Point;
}

export const CalloutContext = createContext<CalloutContextType | null>(null);

// Marker needs to tell Callout children apart from custom marker content
// without importing the Callout component. Callout sets this static flag on
// itself; isCalloutElement checks it.
export const IS_CALLOUT = Symbol.for("react-native-web-maps.Callout");

export function isCalloutElement(child: unknown): boolean {
	const type = (child as { type?: unknown } | null | undefined)?.type;
	return (
		(typeof type === "function" || typeof type === "object") &&
		type !== null &&
		IS_CALLOUT in type
	);
}
