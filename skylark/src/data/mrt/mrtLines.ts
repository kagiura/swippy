import { centroid } from "@turf/centroid";
import { distance } from "@turf/distance";
import { featureCollection, lineString, point } from "@turf/helpers";
import { length } from "@turf/length";
import { lineIntersect } from "@turf/line-intersect";
import { lineSlice } from "@turf/line-slice";
import { lineSliceAlong } from "@turf/line-slice-along";
import { nearestPointOnLine } from "@turf/nearest-point-on-line";
import { pointToLineDistance } from "@turf/point-to-line-distance";

import type {
	Feature,
	FeatureCollection,
	LineString,
	Point,
	Position,
} from "geojson";
import {
	CCLLine,
	CCLSpurLine,
	CCLSpurStations,
	CCLStations,
	DTLLine,
	DTLStations,
	EWLLine,
	EWLSpurLine,
	EWLSpurStations,
	EWLStations,
	NELLine,
	NELStations,
	NSLLine,
	NSLStations,
	TELLine,
	TELStations,
} from "./mrtLinesData";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LineCode = "NSL" | "EWL" | "CGA" | "NEL" | "CCL" | "DTL" | "TEL";

export interface MrtStationProperties {
	name: string;
	lines: LineCode[];
	interchange: boolean;
}

export interface MrtSegmentProperties {
	line: LineCode;
	from: string;
	to: string;
}

export type MrtStations = FeatureCollection<Point, MrtStationProperties>;
export type MrtSegments = FeatureCollection<LineString, MrtSegmentProperties>;

export interface MrtMap {
	stations: MrtStations;
	segments: MrtSegments;
}

// ---------------------------------------------------------------------------
// Source data
// ---------------------------------------------------------------------------

// One "track" = one physical LineString + the stations that sit on it.
// The CCL spur is a separate track, but it uses the CCL code, so it is
// merged into the CCL. The EWL spur uses its own code (CGA).
//
// Assumptions about the source data:
//  - each line file has one LineString feature (the first one is used)
//  - each spur station list includes its junction station
//    (Tanah Merah for CGA, Promenade for the CCL spur)
//  - a loop track is closed (first coordinate = last coordinate)
interface Track {
	code: LineCode;
	line: FeatureCollection<LineString>;
	stations: FeatureCollection<Point, { name: string }>;
	loop?: boolean; // closed ring: the last station connects back to the first
}

const TRACKS: Track[] = [
	{ code: "NSL", line: NSLLine, stations: NSLStations },
	{ code: "EWL", line: EWLLine, stations: EWLStations },
	{ code: "CGA", line: EWLSpurLine, stations: EWLSpurStations },
	{ code: "NEL", line: NELLine, stations: NELStations },
	{ code: "CCL", line: CCLLine, stations: CCLStations, loop: true },
	{ code: "CCL", line: CCLSpurLine, stations: CCLSpurStations },
	{ code: "DTL", line: DTLLine, stations: DTLStations },
	{ code: "TEL", line: TELLine, stations: TELStations },
];

const trackGeometry = (track: Track): Feature<LineString> =>
	track.line.features[0];

// "HarbourFront" and "Harbourfront" must count as the same station.
const nameKey = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "");

// ---------------------------------------------------------------------------
// Group the source stations by name
// ---------------------------------------------------------------------------

interface StationEntry {
	name: string; // the first spelling seen
	// One item for each track that lists this station.
	sources: { track: Track; location: Feature<Point> }[];
}

function groupStations(): Map<string, StationEntry> {
	const entries = new Map<string, StationEntry>();

	for (const track of TRACKS) {
		for (const station of track.stations.features) {
			const key = nameKey(station.properties.name);
			const entry = entries.get(key) ?? {
				name: station.properties.name,
				sources: [],
			};

			entry.sources.push({ track, location: station });
			entries.set(key, entry);
		}
	}

	return entries;
}

// Line codes of a station, without repeats (the CCL spur repeats "CCL").
const linesOf = (entry: StationEntry): LineCode[] => [
	...new Set(entry.sources.map((source) => source.track.code)),
];

// ---------------------------------------------------------------------------
// 1a. Low fidelity stations: one point per station, interchanges merged
// ---------------------------------------------------------------------------

// A crossing farther than this (km) from the station's own locations is a
// different place, not this interchange.
const MAX_CROSSING_KM = 0.15;

// Generate the best location for a station based on its points and tracks.
// Easiest way is find the closest intersection of the tracks the station sits on.
// If there are more than two tracks, pick the location closest to all of them.
// Tracks that come close but never cross keep one of the original locations.
function pickLocation(entry: StationEntry) {
	const locations = entry.sources.map((source) => source.location);
	const trackLines = entry.sources.map((source) => trackGeometry(source.track));
	const center = centroid(featureCollection(locations));

	// Every point where two of the station's tracks cross, near the station.
	const crossings: Feature<Point>[] = [];
	for (let i = 0; i < trackLines.length; i++) {
		for (let j = i + 1; j < trackLines.length; j++) {
			const found = lineIntersect(trackLines[i], trackLines[j]).features;
			crossings.push(
				...found.filter((c) => distance(c, center) <= MAX_CROSSING_KM),
			);
		}
	}

	// The original locations are always candidates, so they are the fallback.
	const candidates = [...crossings, ...locations];

	const scored = candidates.map((candidate) => {
		const totalKm = trackLines
			.map((track) => pointToLineDistance(candidate, track))
			.reduce((a, b) => a + b, 0);
		return {
			coordinates: candidate.geometry.coordinates,
			// Whole metres, so tiny rounding errors count as a tie.
			// A crossing of two tracks scores 0, so with two tracks the
			// crossing closest to the station wins.
			totalMetres: Math.round(totalKm * 1000),
			centerKm: distance(candidate, center),
		};
	});

	scored.sort(
		(a, b) => a.totalMetres - b.totalMetres || a.centerKm - b.centerKm,
	);
	return scored[0].coordinates;
}

function buildLowFiStations(entries: Map<string, StationEntry>): MrtStations {
	return featureCollection(
		[...entries.values()].map((entry) => {
			const lines = linesOf(entry);
			return point(pickLocation(entry), {
				name: entry.name,
				lines,
				interchange: lines.length > 1,
			});
		}),
	);
}

// ---------------------------------------------------------------------------
// 1b. High fidelity stations: one point per station per line, at its own
//     original location. `lines` holds one code; `interchange` is still true
//     for a station that serves more than one line.
// ---------------------------------------------------------------------------

function buildHighFiStations(entries: Map<string, StationEntry>): MrtStations {
	const features: Feature<Point, MrtStationProperties>[] = [];

	for (const entry of entries.values()) {
		const interchange = linesOf(entry).length > 1;
		const seenCodes = new Set<LineCode>();

		for (const { track, location } of entry.sources) {
			if (seenCodes.has(track.code)) continue; // CCL spur repeats its junction
			seenCodes.add(track.code);

			features.push(
				point(location.geometry.coordinates, {
					name: entry.name,
					lines: [track.code],
					interchange,
				}),
			);
		}
	}

	return featureCollection(features);
}

// ---------------------------------------------------------------------------
// 2. Segments (track between each pair of consecutive stations)
// ---------------------------------------------------------------------------

// "shared": cut each track at the station's one shared location (low fidelity).
// "own": cut each track at the location listed on that track (high fidelity).
type CutAt = "shared" | "own";

// `lowStations` gives the station names and the shared locations.
function buildSegments(lowStations: MrtStations, cutAt: CutAt): MrtSegments {
	const byKey = new Map(
		lowStations.features.map((f) => [nameKey(f.properties.name), f]),
	);

	const segments: Feature<LineString, MrtSegmentProperties>[] = [];
	const seen = new Set<string>(); // spur data can overlap the main line

	function addSegment(
		line: LineCode,
		from: string,
		to: string,
		coordinates: Position[],
	) {
		const id = `${line}:${[from, to].sort().join("|")}`;
		if (seen.has(id)) return;
		seen.add(id);

		segments.push(lineString(coordinates, { line, from, to }));
	}

	for (const track of TRACKS) {
		const trackLine = trackGeometry(track);

		// Order the stations by their distance along the track.
		const ordered = track.stations.features
			.map((station) => {
				const shared = byKey.get(nameKey(station.properties.name));
				const cut: Feature<Point> =
					cutAt === "shared" && shared ? shared : station;

				return {
					name: shared?.properties.name ?? station.properties.name,
					cut,
					distanceAlong: nearestPointOnLine(trackLine, cut).properties.location,
				};
			})
			.sort((a, b) => a.distanceAlong - b.distanceAlong);

		for (let i = 0; i < ordered.length - 1; i++) {
			const a = ordered[i];
			const b = ordered[i + 1];

			// lineSlice snaps both cut points onto the track and adds the
			// cut vertices, so stations do not need a vertex on the line.
			const slice = lineSlice(a.cut, b.cut, trackLine);
			addSegment(track.code, a.name, b.name, slice.geometry.coordinates);
		}

		if (track.loop) {
			// Last station back to the first, through the point where the track
			// closes. The slice runs on the track repeated twice, so it can
			// pass the end.
			const first = ordered[0];
			const last = ordered[ordered.length - 1];

			const coords = trackLine.geometry.coordinates;
			const twoLaps = lineString([...coords, ...coords.slice(1)]);
			const lapKm = length(trackLine);

			const slice = lineSliceAlong(
				twoLaps,
				last.distanceAlong,
				first.distanceAlong + lapKm,
			);
			addSegment(track.code, last.name, first.name, slice.geometry.coordinates);
		}
	}

	return featureCollection(segments);
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

const entries = groupStations();
const lowFiStations = buildLowFiStations(entries);

// Interchanges merged into one point. Segments meet at that point.
export const mrtLowFi: MrtMap = {
	stations: lowFiStations,
	segments: buildSegments(lowFiStations, "shared"),
};

// Interchanges kept apart, one point per line. Segments follow those points.
export const mrtHighFi: MrtMap = {
	stations: buildHighFiStations(entries),
	segments: buildSegments(lowFiStations, "own"),
};
