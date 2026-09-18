// Bus arrival proxy, cache-aside keyed by stop code so concurrent requests
// for the same stop share one upstream call (see cache/keyedCache.ts).
// Normalization logic migrated from
// skylark/src/app/api/bus/route.ts.

import { KeyedCache } from "../cache/keyedCache";
import { config } from "../config";

type DataMallArrival = {
	OriginCode: string;
	DestinationCode: string;
	EstimatedArrival: string;
	Monitored: number;
	Load: string;
	Feature: string;
	Type: string;
	VisitNumber: string;
};

type DataMallService = {
	ServiceNo: string;
	Operator: string;
	NextBus?: DataMallArrival;
	NextBus2?: DataMallArrival;
	NextBus3?: DataMallArrival;
};

type DataMallResponse = {
	BusStopCode: string;
	Services?: DataMallService[];
};

export interface NormalizedArrival {
	originCode: string;
	destinationCode: string;
	estimatedArrival: string | null;
	monitored: number;
	load: string;
	feature: string;
	type: string;
	visitNumber: string;
}

export interface NormalizedBusArrivals {
	busStopCode: string;
	services: {
		serviceNo: string;
		operator: string;
		arrivals: NormalizedArrival[];
	}[];
}

function normalizeArrival(arrival?: DataMallArrival): NormalizedArrival | null {
	if (!arrival) return null;

	return {
		originCode: arrival.OriginCode,
		destinationCode: arrival.DestinationCode,
		estimatedArrival: arrival.EstimatedArrival || null,
		monitored: arrival.Monitored,
		load: arrival.Load,
		feature: arrival.Feature,
		type: arrival.Type,
		visitNumber: arrival.VisitNumber,
	};
}

const cache = new KeyedCache<NormalizedBusArrivals>(
	config.pollIntervalMs.busArrival,
);

async function fetchBusArrivals(
	busStopCode: string,
	serviceNo?: string | null,
): Promise<NormalizedBusArrivals> {
	const params = new URLSearchParams({ BusStopCode: busStopCode });
	if (serviceNo) params.set("ServiceNo", serviceNo);

	const response = await fetch(
		`${config.lta.busArrivalUrl}?${params.toString()}`,
	);

	if (!response.ok) {
		throw new Error(`Bus arrival feed responded with ${response.status}`);
	}

	const data = (await response.json()) as DataMallResponse;
	return {
		busStopCode: data.BusStopCode || busStopCode,
		services: (data.Services || []).map((service) => ({
			serviceNo: service.ServiceNo,
			operator: service.Operator,
			arrivals: [
				normalizeArrival(service.NextBus),
				normalizeArrival(service.NextBus2),
				normalizeArrival(service.NextBus3),
			].filter((arrival): arrival is NormalizedArrival => !!arrival),
		})),
	};
}

export function getBusArrivals(busStopCode: string, serviceNo?: string | null) {
	// ServiceNo narrows the response but not the upstream cache key, since the
	// full-stop response already contains every service.
	return cache.get(busStopCode, () => fetchBusArrivals(busStopCode, null));
}
