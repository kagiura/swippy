import { getLiveTrainAlerts } from "../feeds/trainAlerts";
import { listSimulatedAlerts } from "./simulatedStore";
import type { DisruptionAlert } from "./types";

export function getActiveAlerts(): DisruptionAlert[] {
	return [...getLiveTrainAlerts(), ...listSimulatedAlerts()].sort((a, b) => {
		// sort in severity order: "no-service" > "bridging-bus" > "delay" > "reduced-service"
		const severityOrder = [
			"no-service",
			"bridging-bus",
			"delay",
			"reduced-service",
		];
		const aSeverity = severityOrder.indexOf(a.effect);
		const bSeverity = severityOrder.indexOf(b.effect);
		return aSeverity - bSeverity;
	});
}
