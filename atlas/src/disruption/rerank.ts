// Optional server-side reranking of itineraries by disruption-awareness.
// Deliberately isolated: disable ENABLE_RERANK or delete this module's call
// site in routes/routing.ts and behavior safely falls back to sorting by
// duration, same as the frontend would do on its own.

import { config } from "../config";
import type { AnnotatedLeg, Itinerary } from "./annotate";

const EFFECT_PENALTY_SECONDS: Record<string, number> = {
	"no-service": 10_000,
	"reduced-service": 300,
	delay: 120,
	"bridging-bus": 600,
};

export const RANKING_PROFILES = [
	"balanced",
	"fastest",
	"fewer-transfers",
] as const;
export type RankingProfile = (typeof RANKING_PROFILES)[number];

export function isRankingProfile(value: string): value is RankingProfile {
	return (RANKING_PROFILES as readonly string[]).includes(value);
}

// Per-second-equivalent weights applied to each factor before summing into a
// single score - higher weight makes that factor matter more to the ranking.
const PROFILE_WEIGHTS: Record<
	RankingProfile,
	{ duration: number; disruption: number; transfer: number; walk: number }
> = {
	balanced: { duration: 1, disruption: 1, transfer: 300, walk: 0.5 },
	// Cares almost entirely about getting there fast; transfers/walking are
	// only tie-breakers.
	fastest: { duration: 1, disruption: 1, transfer: 60, walk: 0.1 },
	// Heavily penalizes each transfer and second spent walking, even at the
	// cost of a longer overall trip.
	"fewer-transfers": {
		duration: 0.3,
		disruption: 1,
		transfer: 1200,
		walk: 2,
	},
};

function itineraryDurationSeconds(itinerary: Itinerary): number {
	const raw = itinerary.duration ?? itinerary.durationSeconds;
	return typeof raw === "number" ? raw : 0;
}

function itineraryTransfers(itinerary: Itinerary): number {
	const raw = itinerary.transfers;
	if (typeof raw === "number") return raw;

	const legs = (itinerary.legs ?? []) as AnnotatedLeg[];
	const transitLegs = legs.filter((leg) => leg.mode !== "WALK").length;
	return Math.max(0, transitLegs - 1);
}

function itineraryWalkSeconds(itinerary: Itinerary): number {
	const raw = itinerary.walkTime;
	return typeof raw === "number" ? raw : 0;
}

function disruptionPenalty(itinerary: Itinerary): number {
	const legs = (itinerary.legs ?? []) as AnnotatedLeg[];
	return legs.reduce((total, leg) => {
		const effect = leg.disruption?.effect;
		return total + (effect ? (EFFECT_PENALTY_SECONDS[effect] ?? 0) : 0);
	}, 0);
}

function score(itinerary: Itinerary, profile: RankingProfile): number {
	const weights = PROFILE_WEIGHTS[profile];
	const e = {
		itinerary,
		profile,
		weights,
		duration: itineraryDurationSeconds(itinerary),
		disruption: disruptionPenalty(itinerary),
		transfers: itineraryTransfers(itinerary),
		walk: itineraryWalkSeconds(itinerary),
		scorept1: itineraryDurationSeconds(itinerary) * weights.duration,
		scorept2: disruptionPenalty(itinerary) * weights.disruption,
		scorept3: itineraryTransfers(itinerary) * weights.transfer,
		scorept4: itineraryWalkSeconds(itinerary) * weights.walk,
	};
	console.log("scoring in detail: ", e);
	return (
		itineraryDurationSeconds(itinerary) * weights.duration +
		disruptionPenalty(itinerary) * weights.disruption +
		itineraryTransfers(itinerary) * weights.transfer +
		itineraryWalkSeconds(itinerary) * weights.walk
	);
}

function sortByDuration(itineraries: Itinerary[]): Itinerary[] {
	return [...itineraries].sort(
		(a, b) => itineraryDurationSeconds(a) - itineraryDurationSeconds(b),
	);
}

export function rankItineraries(
	itineraries: Itinerary[],
	profile: RankingProfile = "balanced",
): {
	itineraries: Itinerary[];
	rerankApplied: boolean;
} {
	if (!config.enableRerank) {
		return { itineraries: sortByDuration(itineraries), rerankApplied: false };
	}

	try {
		const ranked = [...itineraries].sort(
			(a, b) => score(a, profile) - score(b, profile),
		);
		return { itineraries: ranked, rerankApplied: true };
	} catch (error) {
		console.error("[rerank] failed, falling back to duration sort", error);
		return { itineraries: sortByDuration(itineraries), rerankApplied: false };
	}
}
