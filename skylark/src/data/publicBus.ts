import type { PublicBusStop } from "@/types/publicBus";
import busStops from "./busrouter/v1/raw/bus-stops.datamall.json";
import services from "./busrouter/v1/services.json";

type ServiceRecord = {
	name: string;
	routes: string[][];
};

const serviceRecords = services as Record<string, ServiceRecord>;

// export const PUBLIC_BUS_SERVICE_COLOR = "#91dc00";
export const PUBLIC_BUS_SERVICE_COLOR = "#93C83D";

export const publicBusStops: PublicBusStop[] = busStops.map((stop) => ({
	code: stop.BusStopCode,
	roadName: stop.RoadName,
	description: stop.Description,
	latitude: stop.Latitude,
	longitude: stop.Longitude,
}));

export function getPublicBusStop(code: string) {
	return publicBusStops.find((stop) => stop.code === code);
}

export function getPublicBusServicesForStop(code: string) {
	return Object.entries(serviceRecords)
		.filter(([, service]) =>
			service.routes.some((route) => route.includes(code)),
		)
		.map(([serviceNo, service]) => ({
			serviceNo,
			name: service.name,
			routes: service.routes,
		}));
}

export function getPublicBusService(serviceNo: string) {
	const service = serviceRecords[serviceNo];
	if (!service) return undefined;

	return {
		serviceNo,
		name: service.name,
		routes: service.routes,
	};
}
