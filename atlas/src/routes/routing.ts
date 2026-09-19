import { Hono } from "hono";
import { config } from "../config";
import { getActiveAlerts } from "../disruption/activeAlerts";
import {
	type AnnotatedLeg,
	annotateItinerary,
	type Itinerary,
} from "../disruption/annotate";
import {
	isRankingProfile,
	type RankingProfile,
	rankItineraries,
} from "../disruption/rerank";

// Matrix of upstream requests fired per /routing call: each mode is tried at
// each max-walk-distance, and the resulting itineraries are merged and ranked
// together, rather than trusting a single OneMap request to find everything.
const MODES = ["transit", "bus", "rail"] as const;
const MAX_WALK_DISTANCES_M = [400, 800, 1200] as const;

function formatTime(time: string) {
	const [hours, minutes, seconds] = time.split(":").map(Number);
	if (
		Number.isNaN(hours) ||
		Number.isNaN(minutes) ||
		Number.isNaN(seconds) ||
		hours < 0 ||
		hours > 23 ||
		minutes < 0 ||
		minutes > 59 ||
		seconds < 0 ||
		seconds > 59
	) {
		throw new Error(`Invalid time format: ${time}`);
	}

	return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
		2,
		"0",
	)}:${String(seconds).padStart(2, "0")}`;
}

interface ComboResult {
	itineraries: Itinerary[];
	plan: Record<string, unknown>;
}

async function fetchCombo(
	baseUrl: URL,
	token: string,
	mode: string,
	maxWalkDistance: number,
): Promise<ComboResult | null> {
	const url = new URL(baseUrl);
	url.searchParams.set("mode", mode);
	url.searchParams.set("maxWalkDistance", String(maxWalkDistance));

	try {
		const response = await fetch(url, {
			headers: { Authorization: token, accept: "application/json" },
		});
		if (!response.ok) return null;

		const data = (await response.json()) as {
			plan?: { itineraries?: Itinerary[] } & Record<string, unknown>;
		};
		if (!data.plan) return null;

		return { itineraries: data.plan.itineraries ?? [], plan: data.plan };
	} catch {
		return null;
	}
}

// Distinguishes itineraries by their actual path, not the combo that found
// them - several (mode, maxWalkDistance) combos often surface the same route.
function itinerarySignature(itinerary: Itinerary): string {
	const legs = (itinerary.legs ?? []) as AnnotatedLeg[];
	const legsSig = legs
		.map((leg) => {
			const from = leg.from as { stopCode?: string } | undefined;
			const to = leg.to as { stopCode?: string } | undefined;
			return `${leg.mode}:${from?.stopCode ?? ""}:${to?.stopCode ?? ""}`;
		})
		.join(",");
	return `${itinerary.startTime}|${itinerary.endTime}|${legsSig}`;
}

function dedupeItineraries(itineraries: Itinerary[]): Itinerary[] {
	const seen = new Set<string>();
	return itineraries.filter((itinerary) => {
		const signature = itinerarySignature(itinerary);
		if (seen.has(signature)) return false;
		seen.add(signature);
		return true;
	});
}

// Chained (not a separate .get() call) so the response type is captured for
// RPC - see index.ts's AppType export.
export const routingRoute = new Hono().get("/", async (c) => {
	if (!config.routingApiUrl || !config.onemapApiToken) {
		return c.json(
			{ error: "ROUTING_API_URL and ONEMAP_API_TOKEN are not configured" },
			500,
		);
	}

	const routeType = c.req.query("routeType") || "pt";
	const start = c.req.query("start");
	const end = c.req.query("end");
	const date = c.req.query("date");
	const time = c.req.query("time");
	const profileParam = c.req.query("profile") || "balanced";

	if (!start || !end || !date || !time) {
		return c.json({ error: "start, end, date, and time are required" }, 400);
	}

	if (!isRankingProfile(profileParam)) {
		return c.json(
			{ error: `profile must be one of: balanced, fastest, fewer-transfers` },
			400,
		);
	}
	const profile: RankingProfile = profileParam;

	if (routeType !== "pt") {
		return c.json({ error: "Only routeType=pt is supported" }, 400);
	}

	const baseUrl = new URL(config.routingApiUrl);
	baseUrl.searchParams.set("start", start);
	baseUrl.searchParams.set("end", end);
	baseUrl.searchParams.set("routeType", routeType);
	baseUrl.searchParams.set("date", date);

	try {
		baseUrl.searchParams.set("time", formatTime(time));
	} catch (error) {
		return c.json(
			{ error: error instanceof Error ? error.message : "Invalid time" },
			400,
		);
	}

	const combos = MODES.flatMap((mode) =>
		MAX_WALK_DISTANCES_M.map((maxWalkDistance) => ({ mode, maxWalkDistance })),
	);

	const results = await Promise.all(
		combos.map(({ mode, maxWalkDistance }) =>
			fetchCombo(
				baseUrl,
				config.onemapApiToken as string,
				mode,
				maxWalkDistance,
			),
		),
	);

	const succeeded = results.filter((r): r is ComboResult => r !== null);
	if (succeeded.length === 0) {
		return c.json({ error: "Routing service is unavailable" }, 502);
	}

	const alerts = getActiveAlerts();
	const merged = dedupeItineraries(
		succeeded
			.flatMap((r) => r.itineraries)
			.map((itinerary) => annotateItinerary(itinerary, alerts)),
	);
	const { itineraries: ranked, rerankApplied } = rankItineraries(
		merged,
		profile,
	);

	// generate random uuid for each itinerary
	const rankedWithId = ranked.map((itinerary) => ({
		...itinerary,
		id: crypto.randomUUID(),
	}));

	return c.json({
		plan: { ...succeeded[0].plan, itineraries: ranked },
		rerankApplied,
		profile,
		combosRequested: combos.length,
		combosSucceeded: succeeded.length,
	});
});
