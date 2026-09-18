export type PublicBusStop = {
	code: string;
	roadName: string;
	description: string;
	latitude: number;
	longitude: number;
};

export type PublicBusArrival = {
	originCode: string;
	destinationCode: string;
	estimatedArrival: string | null;
	monitored: number;
	load: string;
	feature: string;
	type: string;
	visitNumber: string;
};

export type PublicBusService = {
	serviceNo: string;
	operator: string;
	arrivals: PublicBusArrival[];
};

export type PublicBusArrivalResponse = {
	busStopCode: string;
	services: PublicBusService[];
};