// Very simple testing API for triggering fake disruptions - a hackathon aid,
// so validation is minimal and CORS is wide open (no secrets exposed here).

import { Hono } from "hono";
import { cors } from "hono/cors";
import {
	addSimulatedAlert,
	clearSimulatedAlerts,
	listSimulatedAlerts,
	removeSimulatedAlert,
} from "../disruption/simulatedStore";
import type {
	DisruptionAlert,
	DisruptionEffect,
	LineCode,
} from "../disruption/types";

export const simulateRoute = new Hono();

simulateRoute.use("*", cors({ origin: "*" }));

const VALID_LINES: LineCode[] = [
	"NSL",
	"EWL",
	"CGA",
	"NEL",
	"CCL",
	"DTL",
	"TEL",
];
const VALID_EFFECTS: DisruptionEffect[] = [
	"no-service",
	"reduced-service",
	"delay",
	"bridging-bus",
];

interface SimulateBody {
	lineCode?: string;
	effect?: string;
	affectedStations?: string[];
	bridgingBusStops?: string[];
	description?: string;
}

simulateRoute.get("/disruption", (c) => {
	return c.json({ alerts: listSimulatedAlerts() });
});

simulateRoute.post("/disruption", async (c) => {
	const body = await c.req.json<SimulateBody>().catch(() => null);

	if (!body || !VALID_LINES.includes(body.lineCode as LineCode)) {
		return c.json(
			{ error: `lineCode must be one of ${VALID_LINES.join(", ")}` },
			400,
		);
	}
	if (!VALID_EFFECTS.includes(body.effect as DisruptionEffect)) {
		return c.json(
			{ error: `effect must be one of ${VALID_EFFECTS.join(", ")}` },
			400,
		);
	}

	const alert: DisruptionAlert = addSimulatedAlert({
		lineCode: body.lineCode as LineCode,
		effect: body.effect as DisruptionEffect,
		affectedStations: body.affectedStations ?? [],
		bridgingBusStops: body.bridgingBusStops,
		description: body.description ?? "Simulated disruption",
	});

	return c.json({ alert }, 201);
});

simulateRoute.delete("/disruption/:id", (c) => {
	const removed = removeSimulatedAlert(c.req.param("id"));
	return c.json({ removed });
});

simulateRoute.post("/reset", (c) => {
	clearSimulatedAlerts();
	return c.json({ ok: true });
});
