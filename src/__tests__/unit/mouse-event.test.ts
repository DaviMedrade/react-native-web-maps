import { describe, expect, it } from "vitest";
import { mapMouseEventToMapEvent } from "../../utils/mouse-event";

interface MappedEvent {
	nativeEvent: {
		action?: string;
		coordinate: { latitude: number; longitude: number };
		position: { x: number; y: number };
	};
}

describe("mapMouseEventToMapEvent", () => {
	it("uses the event coordinates when present", () => {
		const event = {
			latLng: { lat: () => -23.55, lng: () => -46.63 },
			stop: () => {},
		} as unknown as google.maps.MapMouseEvent;
		const mapped = mapMouseEventToMapEvent<MappedEvent>(
			event,
			{ latitude: 1, longitude: 2 },
			null,
			"press",
		);
		expect(mapped.nativeEvent.coordinate).toEqual({
			latitude: -23.55,
			longitude: -46.63,
		});
		expect(mapped.nativeEvent.action).toBe("press");
	});

	it("treats 0 as a valid event coordinate, not a missing one", () => {
		const event = {
			latLng: { lat: () => 0, lng: () => 0 },
			stop: () => {},
		} as unknown as google.maps.MapMouseEvent;
		const mapped = mapMouseEventToMapEvent<MappedEvent>(event, {
			latitude: 5,
			longitude: 6,
		});
		expect(mapped.nativeEvent.coordinate).toEqual({
			latitude: 0,
			longitude: 0,
		});
	});

	it("falls back to the default coordinate without an event", () => {
		const mapped = mapMouseEventToMapEvent<MappedEvent>(null, {
			latitude: 5,
			longitude: 6,
		});
		expect(mapped.nativeEvent.coordinate).toEqual({
			latitude: 5,
			longitude: 6,
		});
	});

	it("coerces non-numeric default coordinates to 0", () => {
		const mapped = mapMouseEventToMapEvent<MappedEvent>(null, {
			latitude: {} as unknown as number,
			longitude: undefined as unknown as number,
		});
		expect(mapped.nativeEvent.coordinate).toEqual({
			latitude: 0,
			longitude: 0,
		});
	});

	it("defaults position to the origin without a projection", () => {
		const mapped = mapMouseEventToMapEvent<MappedEvent>(null, {
			latitude: 1,
			longitude: 2,
		});
		expect(mapped.nativeEvent.position).toEqual({ x: 0, y: 0 });
	});
});
