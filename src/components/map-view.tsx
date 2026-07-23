// Ported from @teovilla/react-native-web-maps v0.9.5
// upstream: packages/react-native-web-maps/src/components/map-view.tsx (MIT, (c) 2022 Teodoro Villanueva — see LICENSE-upstream)
// Modified; fixes applied: F1, F2, F3, F5, F6, F9, F10. See TODO.md.

import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import type { ForwardedRef } from "react";
import {
	forwardRef,
	memo,
	useCallback,
	useEffect,
	useImperativeHandle,
	useState,
} from "react";
import type {
	Address,
	Camera,
	EdgePadding,
	LatLng,
	Point,
	Region,
	SnapshotOptions,
} from "react-native-maps";
import type RNMapView from "react-native-maps";
import type { WebMapViewProps } from "../override-types";
import { transformRNCameraObject } from "../utils/camera";
import {
	logDeprecationWarning,
	logMethodNotImplementedWarning,
} from "../utils/log";
import { mapMouseEventToMapEvent } from "../utils/mouse-event";
import {
	boundsToRegion,
	isDegenerateRegion,
	regionToBounds,
	regionToZoom,
} from "../utils/region";
import { useUserLocation } from "../hooks/use-user-location";
import { UserLocationMarker } from "./user-location-marker";

/**
 * Props accepted but ignored on web (no analogue in the Maps JS API):
 * `showsMyLocationButton`, `loadingEnabled` (use `loadingFallback`),
 * `userLocationPriority`, `showsIndoors`, `toolbarEnabled`,
 * `moveOnMarkerPress`, and `tracksViewChanges` on Marker.
 */
function MapViewComponent(
	props: WebMapViewProps,
	ref: ForwardedRef<Partial<RNMapView>>,
) {
	const {
		children,
		customMapStyle,
		followsUserLocation,
		googleMapsApiKey,
		initialCamera,
		initialRegion,
		loadingFallback,
		maxZoomLevel,
		minZoomLevel,
		onDoublePress,
		onMapReady,
		onPanDrag,
		onPress,
		onRegionChange,
		onRegionChangeComplete,
		onUserLocationChange,
		options,
		provider,
		rotateEnabled,
		showsScale,
		showsUserLocation,
		zoomControlEnabled,
		zoomEnabled,
		zoomTapEnabled,
	} = props;

	const [map, setMap] = useState<google.maps.Map | null>(null);
	const [isGesture, setIsGesture] = useState(false);

	const userLocation = useUserLocation({
		showUserLocation: showsUserLocation ?? false,
		followUserLocation: followsUserLocation ?? false,
		onUserLocationChange,
	});

	// The JS API loader keeps global state and throws if it ever runs again
	// with different options — additional libraries (e.g. "visualization" for
	// heat maps) must be requested here, in this single call site.
	const { isLoaded } = useJsApiLoader({
		googleMapsApiKey: googleMapsApiKey ?? "",
	});

	const _onMapReady = useCallback(
		(loadedMap: google.maps.Map) => {
			setMap(loadedMap);
			// F5: without initialCamera, the initial viewport comes from
			// initialRegion's deltas, not a hardcoded zoom.
			if (
				!initialCamera &&
				initialRegion &&
				!isDegenerateRegion(initialRegion)
			) {
				loadedMap.fitBounds(regionToBounds(initialRegion));
			}
			onMapReady?.();
		},
		[initialCamera, initialRegion, onMapReady],
	);

	const _onDragStart = useCallback(() => {
		setIsGesture(true);
	}, []);

	const _onRegionChange = useCallback(() => {
		const bounds = map?.getBounds();
		if (bounds) {
			onRegionChange?.(boundsToRegion(bounds), { isGesture });
		}
	}, [map, onRegionChange, isGesture]);

	// F3: bound to onIdle, which fires after ANY camera settle (pan, zoom or
	// programmatic move) — matching native. Like Android, it also fires once
	// after the initial settle. onDragStart/onDragEnd only drive isGesture.
	const _onRegionChangeComplete = useCallback(() => {
		const bounds = map?.getBounds();
		if (bounds) {
			onRegionChangeComplete?.(boundsToRegion(bounds), { isGesture });
		}
		setIsGesture(false);
	}, [map, onRegionChangeComplete, isGesture]);

	useImperativeHandle(
		ref,
		() => ({
			async getCamera(): Promise<Camera> {
				const center = map?.getCenter();
				return {
					altitude: 0,
					heading: map?.getHeading() ?? 0,
					pitch: map?.getTilt() ?? 0,
					zoom: map?.getZoom() ?? 0,
					center: {
						latitude: center?.lat() ?? 0,
						longitude: center?.lng() ?? 0,
					},
				};
			},
			setCamera(camera: Partial<Camera>): void {
				map?.moveCamera(transformRNCameraObject(camera));
			},
			animateCamera(
				camera: Partial<Camera>,
				_opts?: { duration?: number },
			): void {
				map?.moveCamera(transformRNCameraObject(camera));
			},
			async getMapBoundaries(): Promise<{
				northEast: LatLng;
				southWest: LatLng;
			}> {
				const bounds = map?.getBounds();
				const northEast = bounds?.getNorthEast();
				const southWest = bounds?.getSouthWest();
				return {
					northEast: {
						latitude: northEast?.lat() ?? 0,
						longitude: northEast?.lng() ?? 0,
					},
					southWest: {
						latitude: southWest?.lat() ?? 0,
						longitude: southWest?.lng() ?? 0,
					},
				};
			},
			// F6: preserve the caller's centre and zoom intent instead of
			// fitting bounds (which re-zoomed). Duration is not expressible in
			// the Maps JS API; the transition is instant — documented divergence.
			animateToRegion(region: Region, _duration?: number): void {
				if (!map || isDegenerateRegion(region)) {
					return;
				}
				map.panTo({ lat: region.latitude, lng: region.longitude });
				map.setZoom(regionToZoom(region, map.getDiv().offsetWidth));
			},
			fitToCoordinates(
				coordinates?: LatLng[],
				fitOptions?: { edgePadding?: EdgePadding; animated?: boolean },
			): void {
				const bounds = new google.maps.LatLngBounds();
				coordinates?.forEach((c) =>
					bounds.extend({ lat: c.latitude, lng: c.longitude }),
				);
				map?.fitBounds(bounds, fitOptions?.edgePadding as google.maps.Padding);
			},
			setMapBoundaries(northEast: LatLng, southWest: LatLng): void {
				const bounds = new google.maps.LatLngBounds();
				bounds.extend({ lat: northEast.latitude, lng: northEast.longitude });
				bounds.extend({ lat: southWest.latitude, lng: southWest.longitude });
				map?.fitBounds(bounds);
			},
			async pointForCoordinate(coordinate: LatLng): Promise<Point> {
				const point = map?.getProjection()?.fromLatLngToPoint({
					lat: coordinate.latitude,
					lng: coordinate.longitude,
				});
				return point ?? { x: 0, y: 0 };
			},
			async coordinateForPoint(point: Point): Promise<LatLng> {
				const coord = map
					?.getProjection()
					?.fromPointToLatLng(new google.maps.Point(point.x, point.y));
				return { latitude: coord?.lat() ?? 0, longitude: coord?.lng() ?? 0 };
			},
			async takeSnapshot(_options?: SnapshotOptions): Promise<string> {
				logMethodNotImplementedWarning("takeSnapshot");
				return "";
			},
			// Reimplemented with the Maps JS Geocoder (part of the core API —
			// no extra library load) instead of expo-location.
			async addressForCoordinate(coordinate: LatLng): Promise<Address> {
				const geocoder = new google.maps.Geocoder();
				const { results } = await geocoder.geocode({
					location: { lat: coordinate.latitude, lng: coordinate.longitude },
				});
				const result = results?.[0];
				if (!result) {
					return null as unknown as Address;
				}
				const component = (type: string) =>
					result.address_components.find((c) => c.types.includes(type));
				const long = (type: string) => component(type)?.long_name ?? "";
				return {
					administrativeArea: long("administrative_area_level_1"),
					country: long("country"),
					countryCode: component("country")?.short_name ?? "",
					locality: long("locality"),
					postalCode: long("postal_code"),
					name: result.formatted_address,
					subAdministrativeArea: long("administrative_area_level_2"),
					subLocality: long("sublocality") || long("locality"),
					thoroughfare: long("route"),
				};
			},
			animateToNavigation(
				_location: LatLng,
				_bearing: number,
				_angle: number,
				_duration?: number,
			): void {
				logDeprecationWarning("animateToNavigation");
			},
			animateToCoordinate(_latLng: LatLng, _duration?: number): void {
				logDeprecationWarning("animateToCoordinate");
			},
			animateToBearing(_bearing: number, _duration?: number): void {
				logDeprecationWarning("animateToBearing");
			},
			animateToViewingAngle(_angle: number, _duration?: number): void {
				logDeprecationWarning("animateToViewingAngle");
			},
			fitToElements(_options?: {
				edgePadding?: EdgePadding;
				animated?: boolean;
			}): void {
				logMethodNotImplementedWarning("fitToElements");
			},
			fitToSuppliedMarkers(
				_markers: string[],
				_options?: { edgePadding?: EdgePadding; animated?: boolean },
			): void {
				logMethodNotImplementedWarning("fitToSuppliedMarkers");
			},
			setIndoorActiveLevelIndex(_index: number): void {
				logMethodNotImplementedWarning("setIndoorActiveLevelIndex");
			},
		}),
		[map],
	);

	// Camera follow is gated on followsUserLocation alone; the dot itself only
	// needs showsUserLocation (F4, in use-user-location).
	useEffect(() => {
		if (followsUserLocation && userLocation) {
			map?.panTo({
				lat: userLocation.coords.latitude,
				lng: userLocation.coords.longitude,
			});
		}
	}, [followsUserLocation, userLocation, map]);

	if (provider !== "google") {
		console.warn(
			'[WARNING] react-native-web-maps only supports Google Maps for now. Please pass "google" as the provider prop',
		);
		return null;
	}

	if (!isLoaded) {
		return <>{loadingFallback ?? null}</>;
	}

	// F1/F2: the GoogleMap node is rendered directly — no memo, no
	// cloneElement — so children and handlers are always current.
	return (
		<GoogleMap
			onLoad={_onMapReady}
			onBoundsChanged={_onRegionChange}
			onDragStart={_onDragStart}
			onIdle={_onRegionChangeComplete}
			mapContainerStyle={{ flex: 1 }}
			zoom={initialCamera?.zoom ?? 3}
			heading={initialCamera?.heading}
			tilt={initialCamera?.pitch}
			onDrag={() => {
				const center = map?.getCenter();
				onPanDrag?.(
					mapMouseEventToMapEvent(
						null,
						center && { latitude: center.lat(), longitude: center.lng() },
						map,
						undefined,
					),
				);
			}}
			onClick={(e) => onPress?.(mapMouseEventToMapEvent(e, null, map, "press"))}
			onDblClick={(e) =>
				onDoublePress?.(mapMouseEventToMapEvent(e, null, map, "press"))
			}
			center={
				map
					? map.getCenter()
					: {
							lat:
								initialCamera?.center.latitude ?? initialRegion?.latitude ?? 0,
							lng:
								initialCamera?.center.longitude ??
								initialRegion?.longitude ??
								0,
						}
			}
			options={{
				scrollwheel: zoomEnabled,
				disableDoubleClickZoom: !zoomTapEnabled,
				zoomControl: zoomControlEnabled,
				rotateControl: rotateEnabled,
				// F9: react-native-maps zoom levels are believed to coincide with
				// Google's for the google provider (usable range ~0-22); passed
				// through unnormalized until verified against device behavior.
				minZoom: minZoomLevel,
				maxZoom: maxZoomLevel,
				scaleControl: showsScale,
				styles: customMapStyle as google.maps.MapTypeStyle[] | undefined,
				...(options ?? {}),
			}}
		>
			{showsUserLocation && userLocation && (
				<UserLocationMarker coordinates={userLocation.coords} />
			)}
			{children}
		</GoogleMap>
	);
}

export const MapView = memo(forwardRef(MapViewComponent));
