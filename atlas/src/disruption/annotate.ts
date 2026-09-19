// Tags itinerary legs with any disruption affecting them. Matches against
// OneMap's actual leg shape (mode, route, from/to.{name,stopId,stopCode}) -
// station matching uses stopCode (e.g. "NE8") since that's what both the
// TrainServiceAlerts sample and OneMap's legs use, avoiding a name-normalization
// mismatch. GTFS-RT-sourced alerts don't populate affectedStations yet (see
// mapping.ts), so those alerts fall back to matching the whole line.

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

interface LegEndpoint {
	name?: string;
	stopId?: string;
	stopCode?: string;
}

// A leg's line is derived from its stop codes' letter prefix (e.g. "NE8" -> "NE"),
// since OneMap's `route` field is a full line name ("NORTH EAST LINE"), not a code.
function legLineCode(leg: AnnotatedLeg): string | null {
	const to = leg.to as LegEndpoint | undefined;
	const from = leg.from as LegEndpoint | undefined;
	const stopCode = to?.stopCode ?? from?.stopCode;
	const prefix = stopCode?.match(/^[A-Za-z]+/)?.[0];
	if (prefix) return prefix.toUpperCase();

	// Fallback for other/simulated leg shapes that expose a code directly.
	const raw = leg.routeId ?? leg.lineCode;
	return typeof raw === "string" ? raw.toUpperCase() : null;
}

function legStationCodes(leg: AnnotatedLeg): string[] {
	const from = leg.from as LegEndpoint | undefined;
	const to = leg.to as LegEndpoint | undefined;
	return [from?.stopCode, to?.stopCode].filter((v): v is string => !!v);
}

function alertAffectsLeg(alert: DisruptionAlert, leg: AnnotatedLeg): boolean {
	// Walking/transfer legs shouldn't be tagged just because they end at a
	// disrupted station - only the transit leg itself is actually affected.
	if (leg.transitLeg === false) return false;

	const rawLine = legLineCode(leg);
	if (!rawLine) return false;

	const legLine = resolveLineCode(rawLine) ?? rawLine;
	if (legLine !== alert.lineCode) return false;

	if (alert.affectedStations.length === 0) return true;

	const legStations = new Set(legStationCodes(leg).map(nameKey));
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
