import { Hono } from "hono";
import { getActiveAlerts } from "../disruption/activeAlerts";

export const disruptionsRoute = new Hono();

disruptionsRoute.get("/", (c) => {
	return c.json({ alerts: getActiveAlerts() });
});
