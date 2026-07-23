---
name: port-component
description: Port a component or feature from upstream @teovilla/react-native-web-maps into this repo, adapting it to this repo's structure and conventions. Use when implementing a map component (MapView, Marker, Polyline, Callout, etc.) or behavior that exists upstream.
---

Port `$ARGUMENTS` from upstream.

1. **Read the upstream implementation.** Source lives at https://github.com/teovilla/react-native-web-maps (packages/react-native-web-maps/src/). Fetch the relevant component files, including hooks/utils they import.
2. **Check the fix list.** Read `TODO.md` and identify which pending items touch the files being ported — land those fixes as part of the port. Add the upstream-attribution header (template in TODO.md's porting rules; upstream license text lives at `LICENSE-upstream`).
3. **Check the reference API.** Compare against the `react-native-maps` documentation for the same component — the prop surface we aim to be compatible with. Note any props upstream skipped.
4. **Adapt, don't copy.** Rewrite for this repo's structure and conventions: TypeScript, tabs, npm. Use `@types/google.maps` types for Google Maps JS API objects instead of `any`.
5. **Explain as you go.** The maintainer is learning RN and web maps — briefly explain non-obvious Google Maps JS API or react-native-web concepts the port relies on.
6. **Record differences.** End with a short list of intentional deviations from upstream and any `react-native-maps` props left unimplemented, and check off the `TODO.md` items the port completed (noting the implementing file).
