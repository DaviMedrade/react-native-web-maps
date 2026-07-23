import { describe, expect, it } from "vitest";
import { transformRNCameraObject } from "../../utils/camera";

describe("transformRNCameraObject", () => {
	it("maps the react-native-maps camera fields to Google's", () => {
		expect(
			transformRNCameraObject({
				pitch: 30,
				heading: 90,
				zoom: 12,
				center: { latitude: -23.55, longitude: -46.63 },
			}),
		).toEqual({
			tilt: 30,
			heading: 90,
			zoom: 12,
			center: { lat: -23.55, lng: -46.63 },
		});
	});

	it("leaves center undefined when absent", () => {
		expect(transformRNCameraObject({ zoom: 5 }).center).toBeUndefined();
	});
});
