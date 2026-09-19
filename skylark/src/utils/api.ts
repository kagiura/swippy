import { parse, safeParse } from "valibot";
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
	const result = safeParse(RoutingResponseSchema, await response.json());
	if (!result.success) {
		console.log(result.issues);
		throw new Error(`Failed to parse routing response: ${result.issues}`);
	}
	return result.output;
}

export async function getLiveDisruptions() {
	const response = await atlasClient.disruptions.$get();
	if (!response.ok) {
		throw new Error(
			`Live disruptions request failed with status ${response.status}`,
		);
	}

	return (await response.json()).alerts;
}
