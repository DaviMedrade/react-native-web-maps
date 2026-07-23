# MapView

Prop/event/method support relative to `react-native-maps`. Adapted from the
upstream project's documentation and corrected for this implementation.

Legend: ✅ supported · ❌ not supported · 🤔 needs investigation · 🌲 planned

## Props

| Prop                            | Status | Notes                                                       |
| ------------------------------- | ------ | ----------------------------------------------------------- |
| `provider`                      | ✅     | Only accepts `google` (required)                            |
| `region`                        | 🌲     | Controlled region not implemented yet                       |
| `initialRegion`                 | ✅     | Deltas set the initial viewport when `initialCamera` absent |
| `initialCamera`                 | ✅     |                                                             |
| `customMapStyle`                | ✅     |                                                             |
| `showsUserLocation`             | ✅     | One-shot geolocation; browser prompts for permission        |
| `followsUserLocation`           | ✅     | Holds a position watch and pans the camera                  |
| `showsScale`                    | ✅     |                                                             |
| `zoomEnabled`                   | ✅     |                                                             |
| `zoomTapEnabled`                | ✅     |                                                             |
| `zoomControlEnabled`            | ✅     |                                                             |
| `minZoomLevel` / `maxZoomLevel` | ✅     | Passed through unnormalized; Google's usable range is ~0-22 |
| `rotateEnabled`                 | ✅     |                                                             |
| `googleMapsApiKey`              | ✅     | Web-only prop (see `WebMapViewExtraProps`)                  |
| `loadingFallback`               | ✅     | Web-only prop; rendered while the Maps JS API loads         |
| `options`                       | ✅     | Web-only prop; merged into Google `MapOptions`              |
| `showsMyLocationButton`         | ❌     | Ignored                                                     |
| `userLocationPriority`          | ❌     | Ignored                                                     |
| `showsIndoors`                  | ❌     | Ignored                                                     |
| `toolbarEnabled`                | ❌     | Ignored                                                     |
| `loadingEnabled`                | ❌     | Ignored; use `loadingFallback`                              |
| `moveOnMarkerPress`             | ❌     | Ignored                                                     |
| `mapType`, `liteMode`, others   | ❌     |                                                             |

## Events

Access event data via `e.nativeEvent`.

| Event name               | Status | Notes                                                                                                         |
| ------------------------ | ------ | ------------------------------------------------------------------------------------------------------------- |
| `onMapReady`             | ✅     |                                                                                                               |
| `onRegionChange`         | ✅     | Fires while the viewport moves                                                                                |
| `onRegionChangeComplete` | ✅     | Fires after any camera settle (pan, zoom, programmatic); also fires once after initial load, matching Android |
| `onUserLocationChange`   | ✅     | Holds a position watch while bound                                                                            |
| `onPress`                | ✅     |                                                                                                               |
| `onDoublePress`          | ✅     |                                                                                                               |
| `onPanDrag`              | ✅     |                                                                                                               |
| Marker/indoor/KML events | ❌     |                                                                                                               |

## Methods

| Method name                                                     | Status | Notes                                           |
| --------------------------------------------------------------- | ------ | ----------------------------------------------- |
| `getCamera` / `setCamera` / `animateCamera`                     | ✅     | `animateCamera` moves instantly                 |
| `animateToRegion`                                               | ✅     | Preserves centre + zoom; duration not supported |
| `getMapBoundaries` / `setMapBoundaries`                         | ✅     |                                                 |
| `fitToCoordinates`                                              | ✅     |                                                 |
| `pointForCoordinate` / `coordinateForPoint`                     | ✅     |                                                 |
| `addressForCoordinate`                                          | ✅     | Uses the Google Geocoder                        |
| `takeSnapshot`, `fitToElements`, `fitToSuppliedMarkers`, others | ❌     | Warn and no-op                                  |
