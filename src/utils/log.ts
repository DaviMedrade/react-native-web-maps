// Ported from @teovilla/react-native-web-maps v0.9.5
// upstream: packages/react-native-web-maps/src/utils/log.ts (MIT, (c) 2022 Teodoro Villanueva — see LICENSE-upstream)
// Modified; fixes applied: none. See TODO.md.

export function logDeprecationWarning(methodName: string) {
	console.warn(
		`[WARNING] Method ${methodName} is deprecated therefore not implemented. Check https://github.com/react-native-maps/react-native-maps/blob/master/docs/mapview.md#types`,
	);
}

export function logMethodNotImplementedWarning(methodName: string) {
	console.warn(`[WARNING] Method ${methodName} is not implemented on web`);
}
