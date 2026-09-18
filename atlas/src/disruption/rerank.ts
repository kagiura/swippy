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

function itineraryDurationSeconds(itinerary: Itinerary): number {
	const raw = itinerary.duration ?? itinerary.durationSeconds;
	return typeof raw === "number" ? raw : 0;
}

function disruptionPenalty(itinerary: Itinerary): number {
	const legs = (itinerary.legs ?? []) as AnnotatedLeg[];
	return legs.reduce((total, leg) => {
		const effect = leg.disruption?.effect;
		return total + (effect ? (EFFECT_PENALTY_SECONDS[effect] ?? 0) : 0);
	}, 0);
}

function sortByDuration(itineraries: Itinerary[]): Itinerary[] {
	return [...itineraries].sort(
		(a, b) => itineraryDurationSeconds(a) - itineraryDurationSeconds(b),
	);
}

export function rankItineraries(itineraries: Itinerary[]): {
	itineraries: Itinerary[];
	rerankApplied: boolean;
} {
	if (!config.enableRerank) {
		return { itineraries: sortByDuration(itineraries), rerankApplied: false };
	}

	try {
		const ranked = [...itineraries].sort(
			(a, b) =>
				itineraryDurationSeconds(a) +
				disruptionPenalty(a) -
				(itineraryDurationSeconds(b) + disruptionPenalty(b)),
		);
		return { itineraries: ranked, rerankApplied: true };
	} catch (error) {
		console.error("[rerank] failed, falling back to duration sort", error);
		return { itineraries: sortByDuration(itineraries), rerankApplied: false };
	}
}
