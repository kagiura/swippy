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

// Duplicated from skylark/src/data/mrt/mrtLines.ts's `mrtLines` export
// (kept as a static copy rather than a cross-package import, to keep atlas
// decoupled from skylark's dependency tree). MRT only for now.
export const MRT_LINES: { code: LineCode; name: string }[] = [
	{ code: "NSL", name: "North-South Line" },
	{ code: "EWL", name: "East-West Line" },
	{ code: "CGL", name: "Changi Airport Branch Line" },
	{ code: "NEL", name: "North East Line" },
	{ code: "CCL", name: "Circle Line" },
	{ code: "DTL", name: "Downtown Line" },
	{ code: "TEL", name: "Thomson-East Coast Line" },
	{ code: "BPLRT", name: "Bukit Panjang LRT" },
	{ code: "SKLRT", name: "Sengkang LRT" },
	{ code: "PGLRT", name: "Punggol LRT" },
];

// LTA's GTFS route_id is the first two letters of the LineCode (NS -> NSL, EW -> EWL, etc).
export const gtfsRouteIdToLineCode: Record<string, LineCode> =
	Object.fromEntries(MRT_LINES.map(({ code }) => [code.slice(0, 2), code]));

// Station name (normalized via nameKey) -> GTFS stop_id. Empty until built.
// Populate via registerStation() so the reverse lookup stays in sync.
const stationNameToGtfsStopId = new Map<string, string>();
const gtfsStopIdToStationName = new Map<string, string>();

export function registerStation(stationName: string, gtfsStopId: string) {
	stationNameToGtfsStopId.set(nameKey(stationName), gtfsStopId);
	gtfsStopIdToStationName.set(gtfsStopId, stationName);
}

export function resolveLineCode(gtfsRouteId: string): LineCode | null {
	return gtfsRouteIdToLineCode[gtfsRouteId] ?? null;
}

export function resolveGtfsStopId(stationName: string): string | null {
	return stationNameToGtfsStopId.get(nameKey(stationName)) ?? null;
}

export function resolveStationName(gtfsStopId: string): string | null {
	return gtfsStopIdToStationName.get(gtfsStopId) ?? null;
}
