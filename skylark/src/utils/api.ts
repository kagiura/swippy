import {
	ActiveBusResult,
	RoutingResponse,
	RoutingResponseSchema,
	ShuttleServiceResult,
} from "@/types/schema";
import isbServices from "@/data/isbServices.json";
import { parse } from "valibot";

export type RoutingQuery = {
	start: string;
	end: string;
	date: string;
	time: string;
	routeType?: "pt";
};

export async function getTransitRoute({
	start,
	end,
	date,
	time,
	routeType = "pt",
}: RoutingQuery): Promise<RoutingResponse> {
	const params = new URLSearchParams({ routeType, start, end, date, time });
	const response = await fetch(`/api/routing?${params}`);
	if (!response.ok) {
		throw new Error(`Routing request failed with status ${response.status}`);
	}

	return parse(RoutingResponseSchema, await response.json());
}
export async function getISBTimings(
	stopId: string,
): Promise<ShuttleServiceResult> {
	// api: ./api/isb
	// method: GET
	// params: { endpoint: 'ShuttleService', query: `busstopname=${stopId}` }
	// return: ShuttleServiceResult

	const response = await fetch(
		`/api/isb?endpoint=ShuttleService&query=busstopname=${stopId}`,
	);
	const data = await response.json();

	return data.ShuttleServiceResult;
}

export async function getISBPositions(
	routeId: string,
): Promise<ActiveBusResult> {
	// api: ./api/isb
	// method: GET
	// params: { endpoint: 'ActiveBus', query: `route_code=${routeId}` }
	// return: ActiveBusResult

	const response = await fetch(
		`/api/isb?endpoint=ActiveBus&query=route_code=${routeId}`,
	);
	const data = await response.json();

	return data.ActiveBusResult;
}

export async function getISBPositionsAll() {
	// api: ./api/isb
	// method: GET
	// params: none
	// return: (ActiveBusResult & {service: string})[]

	const serviceIds = isbServices.map((service) => service.name);
	// const serviceIds: string[] = []; //jammed to stop it spamming during debugging

	// allow some to error, since some services may not have active buses
	// and we don't want to crash the whole app
	const data = await Promise.allSettled<ActiveBusResult & { service: string }>(
		serviceIds.map(async (service) => {
			const response = await fetch(
				`/api/isb?endpoint=ActiveBus&query=route_code=${service}`,
			);
			const result = await response.json();

			return { ...result.ActiveBusResult, service };
		}),
	);

	// filter out any rejected promises
	const fulfilledData = data
		.filter(
			(
				result,
			): result is PromiseFulfilledResult<
				ActiveBusResult & { service: string }
			> => result.status === "fulfilled",
		)
		.map((result) => result.value);

	// console.log("data", data, fulfilledData);

	return fulfilledData;
}
