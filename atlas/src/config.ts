// Central place for env-driven settings; keeps `process.env` reads out of feature code.

const num = (value: string | undefined, fallback: number) => {
	const parsed = Number(value);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const bool = (value: string | undefined, fallback: boolean) =>
	value === undefined ? fallback : value === "true";

export const config = {
	port: num(process.env.PORT, 8787),

	routingApiUrl: process.env.ROUTING_API_URL,
	onemapApiToken: process.env.ONEMAP_API_TOKEN,

	// Comma-separated list of allowed frontend origins - set this via env vars
	// per-environment (e.g. Cloud Run) rather than hardcoding a deployed URL.
	corsAllowedOrigins: (
		process.env.CORS_ALLOWED_ORIGINS ?? "http://localhost:3000"
	)
		.split(",")
		.map((origin) => origin.trim())
		.filter(Boolean),

	lta: {
		accountKey: process.env.LTA_DATAMALL_API,
		busArrivalUrl:
			process.env.LTA_BUS_ARRIVAL_URL ??
			"https://onestoptransport.sg/api/bus-arrival",
		trainAlertUrl:
			process.env.LTA_TRAIN_ALERT_URL ??
			"https://datamall2.mytransport.sg/ltaodataservice/GTFSRealTimeTrainServiceAlerts",
	},

	isb: {
		baseUrl: process.env.ISB_BASE_URL ?? "https://nnextbus.nus.edu.sg",
		username: process.env.ISB_USERNAME,
		password: process.env.ISB_PASSWORD,
	},

	// Minimum time between upstream calls per feed, not a client-facing rate limit.
	pollIntervalMs: {
		busArrival: num(process.env.BUS_ARRIVAL_POLL_MS, 20_000),
		trainAlerts: num(process.env.TRAIN_ALERT_POLL_MS, 60_000),
	},

	// Rerank can be fully disabled to fall back to plain duration-sorted itineraries.
	enableRerank: bool(process.env.ENABLE_RERANK, true),
} as const;
