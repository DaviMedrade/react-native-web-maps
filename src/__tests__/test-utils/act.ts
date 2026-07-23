import { act as reactAct } from "react";

// vitest-browser-react owns IS_REACT_ACT_ENVIRONMENT: it raises the flag only
// while its own render/rerender/unmount act is running and resets it to false
// afterwards. Tests that drive updates from outside React (map callbacks,
// geolocation callbacks) must do the same around their own act calls, or React
// warns that the environment does not support act.
export async function act(callback: () => void | Promise<void>): Promise<void> {
	const scope = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
	scope.IS_REACT_ACT_ENVIRONMENT = true;
	try {
		await reactAct(callback);
	} finally {
		scope.IS_REACT_ACT_ENVIRONMENT = false;
	}
}
