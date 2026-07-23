# TODO

Fixes and improvements to implement in this rewrite as the upstream sources are
ported. Check items off (`- [x]`, noting the implementing file) as they land.

Porting rules:

- Fetch upstream reference sources from the **v0.9.5 tag** so line numbers below
  line up:
  `https://raw.githubusercontent.com/teovillanueva/react-native-web-maps/v0.9.5/packages/react-native-web-maps/src/<path>`
- Paths below are relative to that `src/` directory.
- Every ported file carries this attribution header, and the upstream license
  text is kept at `LICENSE-upstream`:

  ```
  // Ported from @teovilla/react-native-web-maps v0.9.5
  // upstream: packages/react-native-web-maps/src/<path> (MIT, (c) 2022 Teodoro Villanueva — see LICENSE-upstream)
  // Modified; fixes applied: <F-ids or "none">. See TODO.md.
  ```

## Core (milestone M1)

- [x] **F1 — Render map children reactively** (critical)
      `components/map-view.tsx:284-365` — upstream memoizes the `GoogleMap` node
      with `props.children` absent from the dependency array, so markers/circles
      added after first render don't appear until a gesture invalidates the memo.
      Fix by dropping the `useMemo`/`cloneElement` wrapper entirely and rendering
      `<GoogleMap>` directly (`@react-google-maps/api` diffs props itself);
      `react-hooks/exhaustive-deps: error` keeps the bug class out.
      **Done:** src/components/map-view.tsx.

- [x] **F2 — Keep `onRegionChangeComplete` closures fresh** (critical)
      `components/map-view.tsx:85-104, 284-365` — two stacked staleness sources:
      the `useCallback` for `_onRegionChangeComplete` depends on
      `props.onRegionChange` (wrong prop), and the handlers bound inside the memo
      never refresh. Fix: correct deps to `[map, onRegionChangeComplete,
isGesture]`; the memo removal in F1 covers the second half.
      **Done:** src/components/map-view.tsx.

- [x] **F3 — Fire `onRegionChangeComplete` after any camera settle** (high)
      `components/map-view.tsx:290` — upstream binds it to `onDragEnd`, so zoom
      and programmatic moves never fire it; native fires after any settle. Bind
      to `onIdle`; keep `onDragStart`/`onDragEnd` only driving the `isGesture`
      flag. Note: `onIdle` also fires once on initial settle (Android parity) —
      document.
      **Done:** src/components/map-view.tsx.

- [x] **F4 — `showsUserLocation` alone shows the dot** (medium)
      `hooks/use-user-location.tsx:43-54` — upstream gates position resolution
      on `followUserLocation`, so show-only consumers get a permission prompt
      and no dot. Rewrite the hook on `navigator.geolocation` (no expo-location):
      show-only → one-shot `getCurrentPosition`; follow or a change listener →
      `watchPosition`; `clearWatch` via a local watch id in the effect cleanup
      (also fixes upstream's stale-subscription leak where the watch lived in
      `useState`); `panTo` stays gated on `followsUserLocation` alone.
      **Done:** src/hooks/use-user-location.ts.

- [x] **F5 — Derive initial zoom from `initialRegion` deltas** (medium)
      `components/map-view.tsx:292` — upstream reads only `initialCamera?.zoom
|| 3`; `initialRegion` deltas are used for the centre but not the zoom.
      Fix: on map load, when `initialCamera` is absent and `initialRegion` is
      present, `fitBounds(regionToBounds(initialRegion))`. Guard: skip when
      either delta is zero (degenerate bounds snap to max zoom; consumers pass
      all-zero regions before geolocation resolves).
      **Done:** src/components/map-view.tsx.

- [x] **F6 — `animateToRegion` preserves caller intent** (low)
      `components/map-view.tsx:153-173` — upstream converts the region to
      bounds and `fitBounds`, discarding duration and re-zooming. Fix:
      `panTo(center)` + `setZoom(regionToZoom(region, mapWidth))`. Duration is
      not expressible in the Maps JS API — document as a divergence.
      **Done:** src/components/map-view.tsx + src/utils/region.ts.

- [x] **F7 — `Circle` forwards `strokeWidth`** (low)
      `components/circle.tsx:10-14` — `strokeWidth` is dropped (Google default
      `strokeWeight` is 3). Map `strokeWidth → strokeWeight`; also forward
      `onPress` and `tappable → clickable`, and check `MapCircleProps` for other
      representable props.
      **Done:** src/components/circle.tsx.

- [x] **F8 — `googleMapsApiKey` in the public prop types** (low)
      `override-types.ts` — upstream reads the prop but doesn't augment
      `MapViewProps`, forcing consumers into an `as object` cast that disables
      checking for the whole spread. Expose the extra props
      (`googleMapsApiKey`, `googleMapsMapId`, `loadingFallback`, `options`) in
      the public types. Module augmentation is impossible against current
      react-native-maps (`MapViewProps` is a type alias), so they're exported
      as `WebMapViewExtraProps`/`WebMapViewProps` for consumers to check
      against.
      **Done:** src/override-types.ts.

- [ ] **F9 — Zoom-level normalization: verify only** (low)
      `components/map-view.tsx:332-333` — `minZoomLevel`/`maxZoomLevel` pass
      straight to `minZoom`/`maxZoom`; scales are believed to coincide for the
      Google provider (usable range ~0-22). Keep passthrough with a comment;
      confirm against device behavior before changing anything.

- [x] **F10 — Document props without a web analogue** (informational)
      `showsMyLocationButton`, `loadingEnabled` (this package has
      `loadingFallback`), `userLocationPriority`, `showsIndoors`,
      `toolbarEnabled`, `moveOnMarkerPress`, `tracksViewChanges` (Marker) are
      accepted and ignored. JSDoc on the component + README table; no runtime
      warnings.
      **Done:** src/components/map-view.tsx (JSDoc) + README.md (table).

- [x] **Imperative handle correctness** (from porting review)
      `components/map-view.tsx` — `useImperativeHandle` deps must be the real
      list (upstream used `[map]`, leaving stale props in
      `addressForCoordinate`); reimplement `addressForCoordinate` with
      `google.maps.Geocoder` instead of expo-location.
      **Done:** src/components/map-view.tsx.

## Staged components (milestones M2+; audit each before porting, add items here)

- [ ] **F11 — Measure markers with `ResizeObserver`** (Callout prerequisite;
      the marker side lands in M1)
      `components/marker.web.tsx:60-67` — upstream measures the marker element
      in an effect keyed on `ref.current` (not reactive), so callouts anchor
      against a stale size when marker content (e.g. a remote image) loads
      late. Use a callback ref + `ResizeObserver`.

- [ ] M2 Callout audit · [ ] M3 Polygon/Polyline audit (check for F7-style
      dropped props: `strokeWidth`, `lineDashPattern`, `tappable`) · [ ] M4
      Geojson audit · [ ] M5 marker-clusterer audit · [ ] M6 heat-map audit
      (needs a `libraries` pass-through on MapView — the JS API loader can't be
      called twice with different options).
