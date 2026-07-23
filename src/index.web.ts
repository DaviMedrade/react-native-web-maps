// Web entry point — resolved by Metro/webpack via the .web platform extension,
// and targeted directly by the package's main/module/types fields.
// Exports grow as components are ported; see TODO.md.
export { MapView as default } from "./components/map-view";
export { Marker } from "./components/marker.web";
export { Circle } from "./components/circle";
export type { WebMapViewExtraProps, WebMapViewProps } from "./override-types";
