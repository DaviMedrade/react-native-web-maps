// Native entry point. On native platforms the real react-native-maps is used;
// this module exists only so Metro's platform resolution has a non-web target.
// The web implementation lives in index.web.ts (resolved via the .web platform
// extension). The marker-clusterer utilities, which do work on native, will be
// re-exported from here once ported (milestone M5).
export {};
