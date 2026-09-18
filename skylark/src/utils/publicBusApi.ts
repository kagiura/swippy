import { PublicBusArrivalResponse } from "@/types/publicBus";

export async function getPublicBusArrivals(
	busStopCode: string,
	serviceNo?: string,
): Promise<PublicBusArrivalResponse> {
	const params = new URLSearchParams({ BusStopCode: busStopCode });
	if (serviceNo) params.set("ServiceNo", serviceNo);

	const response = await fetch(`/api/bus?${params.toString()}`);
	if (!response.ok) {
		throw new Error("Unable to load public bus arrivals");
	}

	return response.json();
}