import { getTrainAlertsHealth } from "./feeds/trainAlerts";

export function getHealth() {
	const trainAlerts = getTrainAlertsHealth();

	return {
		ok: !trainAlerts.stale,
		feeds: {
			trainAlerts,
		},
	};
}
