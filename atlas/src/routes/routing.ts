import { Hono } from "hono";
import { config } from "../config";
import { getActiveAlerts } from "../disruption/activeAlerts";
import { annotateItinerary, type Itinerary } from "../disruption/annotate";
import { rankItineraries } from "../disruption/rerank";

export const routingRoute = new Hono();

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

routingRoute.get("/", async (c) => {
	const routeType = c.req.query("routeType") || "pt";
	const start = c.req.query("start");
	const end = c.req.query("end");
	const date = c.req.query("date");
	const time = c.req.query("time");

	if (!start || !end || !date || !time) {
		return c.json({ error: "start, end, date, and time are required" }, 400);
	}

	if (routeType !== "pt") {
		return c.json({ error: "Only routeType=pt is supported" }, 400);
	}

	const upstreamUrl = new URL(config.routingApiUrl);
	upstreamUrl.searchParams.set("start", start);
	upstreamUrl.searchParams.set("end", end);
	upstreamUrl.searchParams.set("routeType", "pt");
	upstreamUrl.searchParams.set("date", date);

	try {
		upstreamUrl.searchParams.set("time", formatTime(time));
	} catch (error) {
		return c.json(
			{ error: error instanceof Error ? error.message : "Invalid time" },
			400,
		);
	}

	let data: { itineraries?: Itinerary[] } & Record<string, unknown>;
	try {
		const response = await fetch(upstreamUrl);
		data = (await response.json()) as typeof data;
		if (!response.ok) return c.json(data, response.status as never);
	} catch {
		return c.json({ error: "Routing service is unavailable" }, 502);
	}

	const alerts = getActiveAlerts();
	const itineraries = (data.itineraries ?? []).map((itinerary) =>
		annotateItinerary(itinerary, alerts),
	);
	const { itineraries: ranked, rerankApplied } = rankItineraries(itineraries);

	return c.json({ ...data, itineraries: ranked, rerankApplied });
});
