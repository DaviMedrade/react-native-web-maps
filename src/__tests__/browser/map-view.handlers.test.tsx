// F2 regression: a rerendered onRegionChangeComplete must not be a stale
// first-render closure (upstream pinned it via wrong useCallback deps and a
// stale memo binding).

import { useState } from "react";
import { act } from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import MapView from "../../index.web";
import { getMapHandler } from "../test-utils/mock-react-google-maps";
import { createFakeMap } from "../test-utils/fake-map";
import { stubGeolocation } from "../test-utils/setup";

vi.mock("@react-google-maps/api", async () =>
	(
		await import("../test-utils/mock-react-google-maps")
	).createReactGoogleMapsMock(),
);

describe("MapView handler freshness (F2)", () => {
	it("calls the latest handler after a rerender, not the first one", async () => {
		stubGeolocation();
		const handlerA = vi.fn();
		const handlerB = vi.fn();

		const screen = await render(
			<MapView
				provider="google"
				googleMapsApiKey="test-key"
				onRegionChangeComplete={handlerA}
			/>,
		);
		await act(async () => {
			getMapHandler("onLoad")(createFakeMap());
		});

		await screen.rerender(
			<MapView
				provider="google"
				googleMapsApiKey="test-key"
				onRegionChangeComplete={handlerB}
			/>,
		);
		await act(async () => {
			getMapHandler("onIdle")();
		});

		expect(handlerB).toHaveBeenCalledTimes(1);
		expect(handlerA).not.toHaveBeenCalled();
	});

	it("gives the handler fresh state closed over by the consumer", async () => {
		stubGeolocation();
		const observed: number[] = [];

		function Consumer() {
			const [count, setCount] = useState(0);
			return (
				<>
					<button onClick={() => setCount((c) => c + 1)}>bump</button>
					<MapView
						provider="google"
						googleMapsApiKey="test-key"
						onRegionChangeComplete={() => observed.push(count)}
					/>
				</>
			);
		}

		const screen = await render(<Consumer />);
		await act(async () => {
			getMapHandler("onLoad")(createFakeMap());
		});

		await screen.getByRole("button", { name: "bump" }).click();
		await act(async () => {
			getMapHandler("onIdle")();
		});

		expect(observed).toEqual([1]);
	});
});
