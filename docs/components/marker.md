# Marker

Prop/event/method support relative to `react-native-maps`. Adapted from the
upstream project's documentation and corrected for this implementation.

Legend: ✅ supported · ❌ not supported · 🤔 needs investigation · 🌲 planned

Custom children render as live DOM in a map overlay; their size is tracked
with a `ResizeObserver`, so content that resizes after mount (e.g. a remote
image finishing its load) stays measured correctly.

## Props

| Prop                | Status | Notes                                    |
| ------------------- | ------ | ---------------------------------------- |
| `coordinate`        | ✅     |                                          |
| `title`             | ✅     |                                          |
| `anchor`            | ✅     | Defaults to `{x: 0.5, y: 1}` like native |
| `calloutAnchor`     | ✅     | Defaults to `{x: 0.5, y: 0}` like native |
| `draggable`         | ✅     |                                          |
| `tappable`          | ✅     |                                          |
| `opacity`           | ✅     |                                          |
| `image` / `icon`    | 🌲     |                                          |
| `pinColor`          | 🤔     |                                          |
| `tracksViewChanges` | ❌     | Ignored; web markers are live DOM        |
| `rotation`, `flat`  | ❌     |                                          |

## Events

| Event name    | Status |
| ------------- | ------ |
| `onPress`     | ✅     |
| `onDragStart` | ✅     |
| `onDrag`      | ✅     |
| `onDragEnd`   | ✅     |

## Methods

| Method name                 | Status | Notes                              |
| --------------------------- | ------ | ---------------------------------- |
| `showCallout`               | ✅     | Callout ships in a later milestone |
| `hideCallout`               | ✅     |                                    |
| `animateMarkerToCoordinate` | ❌     |                                    |
