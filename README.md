# react-native-web-maps

Web implementation of the [`react-native-maps`](https://github.com/react-native-maps/react-native-maps)
API for apps running on [react-native-web](https://necolas.github.io/react-native-web/),
rendering with the Google Maps JavaScript API.

Based on [`@teovilla/react-native-web-maps`](https://github.com/teovillanueva/react-native-web-maps)
by Teodoro Villanueva (MIT) — restructured as a standalone, git-installable
package and maintained independently. Portions of the source are ported from
that project; see [`LICENSE-upstream`](LICENSE-upstream).

**Currently implemented:** `MapView` (default export), `Marker`, `Circle`.
Remaining components are staged in [`TODO.md`](TODO.md).

## Installation

This package is not published to npm — install it as a git dependency:

```bash
npm install github:DaviMedrade/react-native-web-maps
```

The install builds `dist/` automatically (via the `prepare` script). Metro
consumers use `src/` directly through the `react-native`/`source` fields, so
no build output is required for Expo apps.

Peer dependencies your app must provide: `react`, `react-native`,
`react-native-maps`, and `@react-google-maps/api`.

## Usage

Your app keeps importing from `react-native-maps`; on web, alias it to this
package.

### Expo / Metro

```js
// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
	if (platform === "web" && moduleName === "react-native-maps") {
		return context.resolveRequest(context, "react-native-web-maps", platform);
	}
	return (defaultResolveRequest ?? context.resolveRequest)(
		context,
		moduleName,
		platform,
	);
};

module.exports = config;
```

### Next.js / webpack

```js
// next.config.js
module.exports = {
	webpack: (config) => {
		config.resolve.alias = {
			...(config.resolve.alias || {}),
			"react-native-maps$": "react-native-web-maps",
		};
		return config;
	},
};
```

### Google Maps API key

The map loads the Google Maps JS API with the key passed via the
`googleMapsApiKey` prop. To keep the extra web-only props type-checked
(instead of casting them away), build them against the exported type:

```tsx
import type { WebMapViewExtraProps } from "react-native-web-maps";

const webMapProps = {
	googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
} satisfies WebMapViewExtraProps;

<MapView provider="google" {...webMapProps} />;
```

`provider="google"` is required — Google Maps is the only supported provider.

## Behavior notes

- `onRegionChangeComplete` fires after **any** camera settle — pan, zoom, or
  programmatic move — and also once after the map's initial load (matching
  Android's behavior).
- `animateToRegion` moves instantly; transition duration is not expressible
  in the Google Maps JS API.
- `showsUserLocation` alone resolves the position once (the browser prompts
  for permission); a continuous watch is only held when `followsUserLocation`
  or `onUserLocationChange` is set. The camera follows the user only with
  `followsUserLocation`.
- `loadingFallback` (web-only prop) renders while the Maps JS API loads.

### Props without a web analogue

These are accepted and silently ignored so cross-platform code keeps working:

| Prop                    | Component | Note                          |
| ----------------------- | --------- | ----------------------------- |
| `showsMyLocationButton` | MapView   |                               |
| `loadingEnabled`        | MapView   | use `loadingFallback` instead |
| `userLocationPriority`  | MapView   |                               |
| `showsIndoors`          | MapView   |                               |
| `toolbarEnabled`        | MapView   |                               |
| `moveOnMarkerPress`     | MapView   |                               |
| `tracksViewChanges`     | Marker    | web markers are live DOM      |

Per-component prop support tables live in [`docs/components/`](docs/components/).

## Development

Tooling is managed with [mise](https://mise.jdx.dev/) (`mise install` sets up
node). Tasks: `mise run format`, `mise run lint`, `mise run typecheck`,
`mise run test`, `mise run build`.

Tests run with Vitest — pure logic in node, components in a real headless
Chromium (`npx playwright install chromium` once before the first run).

Release checklist: all tasks green, then prove git-installability from a
scratch directory:

```bash
npm install git+file:///path/to/react-native-web-maps
test -f node_modules/react-native-web-maps/dist/module/index.web.js
```

Remaining work is tracked in [`TODO.md`](TODO.md).

## License

MIT — see [`LICENSE`](LICENSE). Contains code ported from
`@teovilla/react-native-web-maps`, MIT, Copyright (c) 2022 Teodoro
Villanueva — see [`LICENSE-upstream`](LICENSE-upstream).
