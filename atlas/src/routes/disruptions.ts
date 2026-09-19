import { Hono } from "hono";
import { getActiveAlerts } from "../disruption/activeAlerts";

export const disruptionsRoute = new Hono().get("/", (c) => {
	return c.json({ alerts: getActiveAlerts() });
});
