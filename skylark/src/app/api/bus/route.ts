import { NextResponse } from "next/server";

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

function normalizeArrival(arrival?: DataMallArrival) {
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

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const busStopCode = searchParams.get("BusStopCode");
	const serviceNo = searchParams.get("ServiceNo");
	const apiUrl = process.env.LTA_BUS_ARRIVAL_URL;
	const accountKey = process.env.DATAMALL_API_KEY;

	if (!busStopCode || !/^\d{5}$/.test(busStopCode)) {
		return NextResponse.json(
			{ error: "BusStopCode must be a five-digit code" },
			{ status: 400 },
		);
	}

	if (!apiUrl || !accountKey) {
		return NextResponse.json(
			{ error: "BUS_ARRIVAL_URL and DATAMALL_API_KEY are not configured" },
			{ status: 500 },
		);
	}

	const params = new URLSearchParams({ BusStopCode: busStopCode });
	if (serviceNo) params.set("ServiceNo", serviceNo);

	const response = await fetch(
		`${apiUrl}?${params.toString()}`,
		{
			headers: {
				AccountKey: accountKey,
				accept: "application/json",
			},
			next: { revalidate: 10 },
		},
	);

	if (!response.ok) {
		return NextResponse.json(
			{ error: "Public bus arrival service unavailable" },
			{ status: response.status },
		);
	}

	const data = (await response.json()) as DataMallResponse;
	return NextResponse.json({
		busStopCode: data.BusStopCode || busStopCode,
		services: (data.Services || []).map((service) => ({
			serviceNo: service.ServiceNo,
			operator: service.Operator,
			arrivals: [
				normalizeArrival(service.NextBus),
				normalizeArrival(service.NextBus2),
				normalizeArrival(service.NextBus3),
			].filter((arrival): arrival is NonNullable<typeof arrival> => !!arrival),
		})),
	});
}