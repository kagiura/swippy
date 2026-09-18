// Background poller for real-time disruption alerts. LTA's exact payload
// format (plain JSON vs GTFS-Realtime protobuf) hasn't been confirmed yet -
// parseAlerts() is isolated so it can be swapped once a real sample has been
// pulled, without touching the polling/caching plumbing around it.

import { Poller } from "../cache/poller";
import { config } from "../config";
import type { DisruptionAlert } from "../disruption/types";

async function fetchTrainAlerts(): Promise<DisruptionAlert[]> {
	if (!config.lta.trainAlertUrl) {
		// Not configured yet - keep the poller idle rather than erroring every tick.
		return [];
	}

	const response = await fetch(config.lta.trainAlertUrl, {
		headers: config.lta.accountKey
			? { AccountKey: config.lta.accountKey }
			: undefined,
	});

	if (!response.ok) {
		throw new Error(`Train alert feed responded with ${response.status}`);
	}

	// TODO: replace with real parsing once the payload shape is confirmed
	// (see plan: pull a sample with the LTA key before finalizing this).
	const raw = await response.json();
	return parseAlerts(raw);
}

function parseAlerts(_raw: unknown): DisruptionAlert[] {
	// Placeholder: unknown payload shape, so no alerts are produced yet.
	return [];
}

const poller = new Poller(
	"trainAlerts",
	config.pollIntervalMs.trainAlerts,
	fetchTrainAlerts,
);

export function startTrainAlertsPoller() {
	poller.start();
}

export function getLiveTrainAlerts(): DisruptionAlert[] {
	return poller.getState().data ?? [];
}

export function getTrainAlertsHealth() {
	return {
		lastSuccessAt: poller.getState().lastSuccessAt,
		lastError: poller.getState().lastError,
		stale: poller.isStale(),
	};
}
