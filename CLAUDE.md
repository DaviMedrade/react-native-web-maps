# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A TypeScript rewrite of [@teovilla/react-native-web-maps](https://github.com/teovilla/react-native-web-maps) — a web implementation of the `react-native-maps` API for react-native-web, rendering with the Google Maps JS API. This is not a direct fork: the repo structure is intentionally different from upstream. Treat the upstream source as reference material when porting behavior, not as something to mirror file-for-file.

## Conventions

- Package manager: npm
- Indentation: tabs
- Aim for API compatibility with `react-native-maps` prop/component names so consumers can alias the package on web.

## Fix checklist

`TODO.md` lists the fixes to implement while porting (F1-F11 and porting rules, including MIT attribution). Consult it before porting any upstream file so fixes land with the port, and check items off as they do. Working notes that analyze upstream code are temporary — don't keep them in the repo once their milestone completes.
