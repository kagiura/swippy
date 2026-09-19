import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { config } from "./config";
import { startTrainAlertsPoller } from "./feeds/trainAlerts";
import { getHealth } from "./health";
import { busArrivalRoute } from "./routes/bus-arrival";
import { disruptionsRoute } from "./routes/disruptions";
import { isbRoute } from "./routes/isb";
import { routingRoute } from "./routes/routing";
import { simulateRoute } from "./routes/simulate";

// "*" in CORS_ALLOWED_ORIGINS opts out of origin allow-listing entirely.
const corsOrigin = config.corsAllowedOrigins.includes("*")
	? "*"
	: config.corsAllowedOrigins;

const app = new Hono()
	.use("*", cors({ origin: corsOrigin }))
	.get("/health", (c) => c.json(getHealth()))
	.route("/routing", routingRoute)
	.route("/bus-arrival", busArrivalRoute)
	.route("/disruptions", disruptionsRoute)
	.route("/simulate", simulateRoute);

app.use(logger());

startTrainAlertsPoller();

// Chained so the combined route types are inferred - required for the
// hono/client RPC type inference to see every route, not just /health.
export type AppType = typeof app;

export default {
	port: config.port,
	fetch: app.fetch,
};
