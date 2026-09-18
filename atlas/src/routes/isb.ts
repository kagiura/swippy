import { Hono } from "hono";
import { fetchIsb } from "../feeds/isb";

export const isbRoute = new Hono();

isbRoute.get("/", async (c) => {
	const endpoint = c.req.query("endpoint");
	const query = c.req.query("query");

	if (!endpoint) {
		return c.json({ error: "endpoint is required" }, 400);
	}

	const data = await fetchIsb(endpoint, query ?? "");
	return c.json(data);
});
