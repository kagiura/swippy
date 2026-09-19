import { Hono } from "hono";
import { config } from "./config";
import { startTrainAlertsPoller } from "./feeds/trainAlerts";
import { getHealth } from "./health";
import { busArrivalRoute } from "./routes/bus-arrival";
import { disruptionsRoute } from "./routes/disruptions";
import { isbRoute } from "./routes/isb";
import { routingRoute } from "./routes/routing";
import { simulateRoute } from "./routes/simulate";

const app = new Hono()
	.get("/health", (c) => c.json(getHealth()))
	.route("/routing", routingRoute)
	.route("/bus-arrival", busArrivalRoute)
	// .route("/isb", isbRoute)
	.route("/disruptions", disruptionsRoute)
	.route("/simulate", simulateRoute);

startTrainAlertsPoller();

// Chained so the combined route types are inferred - required for the
// hono/client RPC type inference to see every route, not just /health.
export type AppType = typeof app;

export default {
	port: config.port,
	fetch: app.fetch,
};
