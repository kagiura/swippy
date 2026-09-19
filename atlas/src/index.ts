import { Hono } from "hono";
import { config } from "./config";
import { startTrainAlertsPoller } from "./feeds/trainAlerts";
import { getHealth } from "./health";
import { busArrivalRoute } from "./routes/bus-arrival";
import { disruptionsRoute } from "./routes/disruptions";
import { isbRoute } from "./routes/isb";
import { routingRoute } from "./routes/routing";
import { simulateRoute } from "./routes/simulate";

const app = new Hono();

app.get("/health", (c) => c.json(getHealth()));
app.route("/routing", routingRoute);
app.route("/bus-arrival", busArrivalRoute);
// app.route("/isb", isbRoute);
app.route("/disruptions", disruptionsRoute);
app.route("/simulate", simulateRoute);

startTrainAlertsPoller();

export default {
	port: config.port,
	fetch: app.fetch,
};
