import { getLiveTrainAlerts } from "../feeds/trainAlerts";
import { listSimulatedAlerts } from "./simulatedStore";
import type { DisruptionAlert } from "./types";

export function getActiveAlerts(): DisruptionAlert[] {
	return [...getLiveTrainAlerts(), ...listSimulatedAlerts()];
}
