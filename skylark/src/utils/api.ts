import { parse } from "valibot";
import isbServices from "@/data/isbServices.json";
import {
	type ActiveBusResult,
	type RoutingProfile,
	type RoutingResponse,
	RoutingResponseSchema,
	type ShuttleServiceResult,
} from "@/types/schema";
import { atlasClient } from "@/utils/atlasClient";

export type RoutingQuery = {
	start: string;
	end: string;
	date: string;
	time: string;
	routeType?: "pt";
	profile?: RoutingProfile;
};

export async function getTransitRoute({
	start,
	end,
	date,
	time,
	routeType = "pt",
	profile = "balanced",
}: RoutingQuery): Promise<RoutingResponse> {
	const response = await atlasClient.routing.$get({
		query: { routeType, start, end, date, time, profile },
	});
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
