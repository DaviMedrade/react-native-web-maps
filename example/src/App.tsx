// Manual regression checklist for the core components — each control maps to
// a fix in TODO.md (F1-F8).

import { useRef, useState } from "react";
import MapView, { Circle, Marker } from "react-native-maps";
import type { WebMapViewExtraProps } from "react-native-maps";
import type { LatLng, Region } from "react-native-maps";

const SAO_PAULO: LatLng = { latitude: -23.55052, longitude: -46.633308 };

// F8: the extra web props stay type-checked via `satisfies`.
const webMapProps = {
	googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "",
	loadingFallback: <p style={{ padding: 16 }}>Loading Google Maps…</p>,
} satisfies WebMapViewExtraProps;

interface MapHandle {
	animateToRegion?: (region: Region, duration?: number) => void;
}

export function App() {
	const mapRef = useRef<MapHandle>(null);
	const [markers, setMarkers] = useState<LatLng[]>([]);
	const [showUser, setShowUser] = useState(false);
	const [regionEvents, setRegionEvents] = useState(0);
	const [lastRegion, setLastRegion] = useState("–");

	const addMarker = () => {
		// F1: each new marker must appear immediately, with no map interaction.
		const jitter = () => (Math.random() - 0.5) * 0.04;
		setMarkers((current) => [
			...current,
			{
				latitude: SAO_PAULO.latitude + jitter(),
				longitude: SAO_PAULO.longitude + jitter(),
			},
		]);
	};

	return (
		<div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
			<div
				style={{
					display: "flex",
					flexWrap: "wrap",
					gap: 12,
					alignItems: "center",
					padding: 12,
				}}
			>
				<button onClick={addMarker}>Add marker (F1)</button>
				<button
					onClick={() =>
						// F6: must recentre without changing feel of zoom wildly,
						// and log exactly one region-complete event (F3).
						mapRef.current?.animateToRegion?.(
							{ ...SAO_PAULO, latitudeDelta: 0.05, longitudeDelta: 0.05 },
							1000,
						)
					}
				>
					Animate to centre (F6)
				</button>
				<label>
					<input
						type="checkbox"
						checked={showUser}
						onChange={(e) => setShowUser(e.target.checked)}
					/>
					Show my location (F4)
				</label>
				<span>
					onRegionChangeComplete: {regionEvents}× — last: {lastRegion} (F2/F3)
				</span>
			</div>
			<div style={{ flex: 1, display: "flex" }}>
				<MapView
					provider="google"
					ref={mapRef as never}
					// F5: nonzero deltas must set the initial viewport.
					initialRegion={{
						...SAO_PAULO,
						latitudeDelta: 0.1,
						longitudeDelta: 0.1,
					}}
					showsUserLocation={showUser}
					onRegionChangeComplete={(region) => {
						// F2: this closure must always see fresh state.
						setRegionEvents((count) => count + 1);
						setLastRegion(
							`${region.latitude.toFixed(4)}, ${region.longitude.toFixed(4)} ` +
								`(Δ ${region.latitudeDelta.toFixed(3)})`,
						);
					}}
					{...webMapProps}
				>
					{markers.map((coordinate, index) => (
						<Marker key={index} coordinate={coordinate} />
					))}
					{/* F7: the circle outline must be thin (1px), not Google's default 3. */}
					<Circle
						center={SAO_PAULO}
						radius={400}
						strokeWidth={1}
						strokeColor="#1380FF"
						fillColor="rgba(19, 128, 255, 0.15)"
					/>
				</MapView>
			</div>
		</div>
	);
}
