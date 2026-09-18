// Lookup tables translating LTA's GTFS ids and station names into our own
// LineCode/station-name vocabulary (see skylark/src/data/mrt/mrtLines.ts).
//
// TODO: both maps are placeholders. Populate stationNameToGtfsStopId once the
// GTFS station list has been scraped/derived - see plan notes for details.

import type { LineCode } from "./types";

// "HarbourFront" and "Harbourfront" must count as the same station - same
// normalization approach as skylark's nameKey(), duplicated here to keep
// atlas decoupled from the skylark package.
export const nameKey = (name: string) =>
	name.toLowerCase().replace(/[^a-z0-9]/g, "");

// GTFS route_id -> our LineCode. Fill in real ids once confirmed against a
// sample GTFS feed.
export const gtfsRouteIdToLineCode: Record<string, LineCode> = {};

// Station name (normalized via nameKey) -> GTFS stop_id. Empty until built.
export const stationNameToGtfsStopId = new Map<string, string>();

export function resolveLineCode(gtfsRouteId: string): LineCode | null {
	return gtfsRouteIdToLineCode[gtfsRouteId] ?? null;
}

export function resolveGtfsStopId(stationName: string): string | null {
	return stationNameToGtfsStopId.get(nameKey(stationName)) ?? null;
}
