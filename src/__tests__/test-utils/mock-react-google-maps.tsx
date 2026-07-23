// vi.mock factory for @react-google-maps/api: the Google Maps *service* is
// mocked; the browser rendering the stand-in DOM is real. GoogleMap exposes
// its latest props so tests can drive onLoad/onIdle/onDragStart directly.

import type { ReactNode } from "react";

type Handler = (...args: unknown[]) => unknown;
type MapProps = { children?: ReactNode } & Record<string, unknown>;

export const lastMapProps: { current: MapProps | null } = { current: null };

export function getMapHandler(name: string): Handler {
	const handler = lastMapProps.current?.[name];
	if (typeof handler !== "function") {
		throw new Error(`GoogleMap prop "${name}" is not bound`);
	}
	return handler as Handler;
}

export function hasMapHandler(name: string): boolean {
	return typeof lastMapProps.current?.[name] === "function";
}

export function createReactGoogleMapsMock() {
	return {
		useJsApiLoader: () => ({ isLoaded: true }),
		useGoogleMap: () => null,
		GoogleMap: (props: MapProps) => {
			lastMapProps.current = props;
			return <div data-testid="google-map">{props.children as ReactNode}</div>;
		},
		Marker: (props: { children?: ReactNode }) => (
			<div data-testid="gm-marker">{props.children}</div>
		),
		OverlayViewF: (props: { children?: ReactNode }) => (
			<div data-testid="gm-overlay">{props.children}</div>
		),
		Circle: (props: { options?: unknown }) => (
			<div
				data-testid="gm-circle"
				data-options={JSON.stringify(props.options)}
			/>
		),
	};
}
