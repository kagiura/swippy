// Tags itinerary legs with any disruption affecting them. The upstream
// routing response shape (onestoptransport.sg) hasn't been pinned down yet,
// so this works defensively over duck-typed legs and no-ops (leaves the leg
// untouched) whenever it can't confidently resolve a line/station match -
// safer than mis-tagging on a guessed schema.

import { nameKey, resolveLineCode } from "./mapping";
import type { DisruptionAlert } from "./types";

export interface AnnotatedLeg {
	[key: string]: unknown;
	disruption?: {
		effect: DisruptionAlert["effect"];
		description: string;
		bridgingBusStops?: string[];
	};
}

export interface Itinerary {
	[key: string]: unknown;
	legs?: AnnotatedLeg[];
}

// Best-effort extraction of a leg's line code + stations, since the upstream
// leg shape isn't confirmed yet (mode/route/from/to naming may differ).
function legLineCode(leg: AnnotatedLeg): string | null {
	const raw = leg.routeId ?? leg.route ?? leg.lineCode ?? leg.mode;
	return typeof raw === "string" ? raw.toUpperCase() : null;
}

function legStationNames(leg: AnnotatedLeg): string[] {
	const from = leg.from;
	const to = leg.to;
	const names = [
		typeof from === "string" ? from : (from as { name?: string })?.name,
		typeof to === "string" ? to : (to as { name?: string })?.name,
	].filter((v): v is string => typeof v === "string");
	return names;
}

function alertAffectsLeg(alert: DisruptionAlert, leg: AnnotatedLeg): boolean {
	const rawLine = legLineCode(leg);
	if (!rawLine) return false;

	const legLine = resolveLineCode(rawLine) ?? rawLine;
	if (legLine !== alert.lineCode) return false;

	if (alert.affectedStations.length === 0) return true;

	const legStations = new Set(legStationNames(leg).map(nameKey));
	return alert.affectedStations.some((station) =>
		legStations.has(nameKey(station)),
	);
}

export function annotateItinerary(
	itinerary: Itinerary,
	alerts: DisruptionAlert[],
): Itinerary {
	if (!itinerary.legs) return itinerary;

	const legs = itinerary.legs.map((leg) => {
		const match = alerts.find((alert) => alertAffectsLeg(alert, leg));
		if (!match) return leg;

		return {
			...leg,
			disruption: {
				effect: match.effect,
				description: match.description,
				bridgingBusStops: match.bridgingBusStops,
			},
		} satisfies AnnotatedLeg;
	});

	return { ...itinerary, legs };
}
