import { Hono } from "hono";
import { getBusArrivals } from "../feeds/busArrival";

export const busArrivalRoute = new Hono();

busArrivalRoute.get("/", async (c) => {
	const busStopCode = c.req.query("BusStopCode");
	const serviceNo = c.req.query("ServiceNo");

	if (!busStopCode || !/^\d{5}$/.test(busStopCode)) {
		return c.json({ error: "BusStopCode must be a five-digit code" }, 400);
	}

	try {
		const data = await getBusArrivals(busStopCode);
		if (!serviceNo) return c.json(data);

		return c.json({
			...data,
			services: data.services.filter(
				(service) => service.serviceNo === serviceNo,
			),
		});
	} catch {
		return c.json({ error: "Public bus arrival service unavailable" }, 502);
	}
});
