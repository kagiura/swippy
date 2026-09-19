// Sample response from LTA DataMall's TrainServiceAlerts endpoint - note this
// is LTA's own bespoke JSON schema, distinct from the GTFSRealTimeTrainServiceAlerts
// protobuf feed already wired up in feeds/trainAlerts.ts. Kept here purely as
// a realistic fixture for POST /simulate/sample, so testing doesn't require
// hand-crafting a disruption payload.

import type { DisruptionAlert, LineCode } from "./types";
import { LINE_CODES } from "./types";

interface AffectedSegment {
	Line: string;
	Direction: string;
	Stations: string;
	FreePublicBus: string;
	FreeMRTShuttle: string;
	MRTShuttleDirection: string;
}

interface TrainServiceAlertsValue {
	Status: number;
	AffectedSegments: AffectedSegment[];
	Message: { Content: string; CreatedDate: string }[];
}

export interface TrainServiceAlertsPayload {
	value: TrainServiceAlertsValue;
}

export const SAMPLE_TRAIN_SERVICE_ALERTS: TrainServiceAlertsPayload = {
	value: {
		Status: 2,
		AffectedSegments: [
			{
				Line: "EWL",
				Direction: "Both",
				Stations: "EW8,EW7,EW6,EW5,EW4,EW3,EW2,EW1",
				FreePublicBus: "EW8,EW7,EW6,EW5,EW4,EW3,EW2,EW1",
				FreeMRTShuttle:
					"EW21|CC22,EW23,EW24|NS1,EW27;NS9,NS13,NS16,NS17|CC15;EW8|CC9,EW5,EW2;NS1|EW24,NS4|BP1",
				MRTShuttleDirection: "Both",
			},
			{
				Line: "NSL",
				Direction: "Jurong East",
				Stations: "NS17,NS16,NS15,NS14,NS13,NS11,NS10,NS9",
				FreePublicBus: "",
				FreeMRTShuttle:
					"EW21|CC22,EW23,EW24|NS1,EW27;NS9,NS13,NS16,NS17|CC15;EW8|CC9,EW5,EW2;NS1|EW24,NS4|BP1",
				MRTShuttleDirection: "Both",
			},
		],
		Message: [
			{
				Content:
					"1811hrs: EWL - Additional travelling time of 30 minutes between Paya Lebar and Pasir Ris stations due to a train fault at Paya Lebar station. 1811hrs: NSL - No train service between Bishan and Woodlands stations towards Jurong East station due to a signal fault. Free bus rides are available at designated bus stops.",
				CreatedDate: "2017-12-11 18:12:06",
			},
			{
				Content:
					"1756hrs: NSL - No train service between Bishan and Woodlands stations towards Jurong East station due to a signal fault. Free bus shuttle are available at designated bus stops.",
				CreatedDate: "2017-12-11 17:56:50",
			},
		],
	},
};

type SimulatedAlertInput = Omit<DisruptionAlert, "id" | "source" | "createdAt">;

// Status 1 = normal service, so nothing to report.
const STATUS_NORMAL = 1;

export function parseTrainServiceAlerts(
	payload: TrainServiceAlertsPayload,
): SimulatedAlertInput[] {
	const { value } = payload;
	if (value.Status === STATUS_NORMAL) return [];

	const description = value.Message[0]?.Content ?? "";

	return value.AffectedSegments.flatMap((segment): SimulatedAlertInput[] => {
		const lineCode = segment.Line as LineCode;
		if (!LINE_CODES.includes(lineCode)) return [];

		const bridgingBusStops = segment.FreePublicBus
			? segment.FreePublicBus.split(",").filter(Boolean)
			: [];

		return [
			{
				lineCode,
				// FreePublicBus is the clearest per-segment signal we have;
				// FreeMRTShuttle repeats the same reference list across
				// segments, so it isn't used to distinguish effect here.
				effect: bridgingBusStops.length > 0 ? "bridging-bus" : "delay",
				affectedStations: segment.Stations.split(",").filter(Boolean),
				bridgingBusStops:
					bridgingBusStops.length > 0 ? bridgingBusStops : undefined,
				description,
			},
		];
	});
}
