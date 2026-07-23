// Ported from @teovilla/react-native-web-maps v0.9.5
// upstream: packages/react-native-web-maps/src/components/marker.web.tsx (MIT, (c) 2022 Teodoro Villanueva — see LICENSE-upstream)
// Modified; fixes applied: F11 (marker side). See TODO.md.

import React from "react";
import {
	Marker as GMMarker,
	OverlayViewF as GMOverlayView,
	useGoogleMap,
} from "@react-google-maps/api";
import type { MapMarkerProps, Point } from "react-native-maps";
import { mapMouseEventToMapEvent } from "../utils/mouse-event";
import { CalloutContext, isCalloutElement } from "./callout-context";
import type { CalloutContextType } from "./callout-context";

interface MarkerState {
	calloutVisible: boolean;
}

// Wrapped in a class component to provide showCallout()/hideCallout() on
// consumer refs, matching react-native-maps. forwardRef + useImperativeHandle
// is not sufficient: it returns a ForwardRefExoticComponent which does not
// render inside the MapView.
export class Marker extends React.Component<MapMarkerProps, MarkerState> {
	constructor(props: MapMarkerProps) {
		super(props);
		this.state = { calloutVisible: false };
	}

	showCallout() {
		this.setState({ calloutVisible: true });
	}

	hideCallout() {
		this.setState({ calloutVisible: false });
	}

	render(): React.ReactNode {
		return (
			<MarkerF
				{...this.props}
				calloutVisible={this.state.calloutVisible}
				toggleCalloutVisible={() =>
					this.setState({ calloutVisible: !this.state.calloutVisible })
				}
			/>
		);
	}
}

interface MarkerFProps extends MapMarkerProps {
	calloutVisible: boolean;
	toggleCalloutVisible: () => void;
}

// 22 x 40 is the default Google Maps marker size.
const DEFAULT_MARKER_SIZE = { width: 22, height: 40 };

function MarkerF(props: MarkerFProps) {
	const map = useGoogleMap();

	const [markerSize, setMarkerSize] = React.useState(DEFAULT_MARKER_SIZE);

	// F11 (marker side): measure custom marker content with a callback ref +
	// ResizeObserver, so the size stays correct when content resizes after
	// mount (e.g. a remote image finishing its load).
	const resizeObserverRef = React.useRef<ResizeObserver | null>(null);
	const measureMarker = React.useCallback((node: HTMLDivElement | null) => {
		resizeObserverRef.current?.disconnect();
		resizeObserverRef.current = null;
		if (!node) {
			return;
		}
		const update = () => {
			setMarkerSize((prev) =>
				prev.width === node.clientWidth && prev.height === node.clientHeight
					? prev
					: { width: node.clientWidth, height: node.clientHeight },
			);
		};
		update();
		const observer = new ResizeObserver(update);
		observer.observe(node);
		resizeObserverRef.current = observer;
	}, []);

	const onMarkerPress = (e?: google.maps.MapMouseEvent) => {
		props.onPress?.(
			mapMouseEventToMapEvent(e, props.coordinate, map, "marker-press"),
		);
		props.toggleCalloutVisible();
	};

	const hasNonCalloutChildren = React.useMemo(
		() =>
			React.Children.toArray(props.children).some(
				(child) => !isCalloutElement(child),
			),
		[props.children],
	);

	// Default anchor values from react-native-maps
	// (https://github.com/react-native-maps/react-native-maps/blob/master/docs/marker.md)
	const anchor: Point = props.anchor ?? { x: 0.5, y: 1 };
	const calloutAnchor: Point = props.calloutAnchor ?? { x: 0.5, y: 0 };

	const calloutContextValue: CalloutContextType = {
		calloutVisible: props.calloutVisible,
		toggleCalloutVisible: props.toggleCalloutVisible,
		coordinate: props.coordinate,
		markerSize,
		anchor: calloutAnchor,
	};

	return (
		<CalloutContext.Provider value={calloutContextValue}>
			{hasNonCalloutChildren ? (
				<GMOverlayView
					mapPaneName="overlayMouseTarget"
					position={{
						lat: Number(props.coordinate.latitude),
						lng: Number(props.coordinate.longitude),
					}}
					getPixelPositionOffset={(w, h) => ({
						x: -(w * anchor.x),
						y: -(h * anchor.y),
					})}
				>
					<div ref={measureMarker} onClick={() => onMarkerPress()}>
						{props.children}
					</div>
				</GMOverlayView>
			) : (
				<GMMarker
					draggable={props.draggable}
					title={props.title}
					onClick={(e) => onMarkerPress(e)}
					onDrag={(e) =>
						props.onDrag?.(
							mapMouseEventToMapEvent(e, props.coordinate, map, ""),
						)
					}
					onDragStart={(e) =>
						props.onDragStart?.(
							mapMouseEventToMapEvent(e, props.coordinate, map, ""),
						)
					}
					onDragEnd={(e) =>
						props.onDragEnd?.(
							mapMouseEventToMapEvent(e, props.coordinate, map, ""),
						)
					}
					options={{
						clickable: props.tappable,
						opacity: props.opacity,
						draggable: props.draggable,
						anchorPoint: props.anchor
							? new google.maps.Point(props.anchor.x, props.anchor.y)
							: null,
					}}
					position={{
						lat: Number(props.coordinate.latitude),
						lng: Number(props.coordinate.longitude),
					}}
				>
					{props.children}
				</GMMarker>
			)}
		</CalloutContext.Provider>
	);
}
