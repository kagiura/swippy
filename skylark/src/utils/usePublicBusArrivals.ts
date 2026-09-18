import useSWR from "swr";

import {
	getPublicBusServicesForStop,
	getPublicBusStop,
} from "@/data/publicBus";
import { PublicBusArrivalResponse } from "@/types/publicBus";
import { getPublicBusArrivals } from "./publicBusApi";

async function fetchStopArrivals(busStopCode: string, serviceNo?: string) {
	const services = serviceNo
		? getPublicBusServicesForStop(busStopCode).filter(
			(service) => service.serviceNo === serviceNo,
		)
		: getPublicBusServicesForStop(busStopCode);
	const responses = await Promise.all(
		services.map((service) =>
			getPublicBusArrivals(busStopCode, service.serviceNo),
		),
	);

	return responses.reduce<PublicBusArrivalResponse["services"]>(
		(allServices, response) => allServices.concat(response.services),
		[],
	);
}

export default function usePublicBusArrivals(
	busStopCode?: string,
	serviceNo?: string,
) {
	const stop = busStopCode ? getPublicBusStop(busStopCode) : undefined;
	const { data, error, isLoading, isValidating } = useSWR(
		stop ? ["public-bus-arrivals", stop.code, serviceNo || "all"] : null,
		([, code, service]) =>
			fetchStopArrivals(code, service === "all" ? undefined : service),
		{ refreshInterval: 30_000 },
	);

	return {
		stop,
		services: data || [],
		error,
		isLoading,
		isValidating,
	};
}