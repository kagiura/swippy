// Background poller for real-time disruption alerts. LTA's GTFSRealTimeTrainServiceAlerts
// endpoint returns a JSON wrapper with a short-lived link to the actual GTFS-RT
// protobuf feed - both are re-fetched every tick rather than cached, since the
// link's 15-minute expiry is unrelated to how often the underlying data changes.

import GtfsRealtimeBindings from "gtfs-realtime-bindings";
import { Poller } from "../cache/poller";
import { config } from "../config";
import { resolveLineCode, resolveStationName } from "../disruption/mapping";
import type { DisruptionAlert, DisruptionEffect } from "../disruption/types";

const { Alert } = GtfsRealtimeBindings.transit_realtime;

interface LinkWrapper {
	value?: { Link?: string; link?: string }[];
	link?: string;
}

function effectFromProto(effect: number | null | undefined): DisruptionEffect {
	switch (effect) {
		case Alert.Effect.NO_SERVICE:
			return "no-service";
		case Alert.Effect.REDUCED_SERVICE:
		case Alert.Effect.MODIFIED_SERVICE:
			return "reduced-service";
		default:
			return "delay";
	}
}

function textOf(
	translated?: { translation?: { text?: string | null }[] | null } | null,
): string {
	return translated?.translation?.[0]?.text ?? "";
}

async function fetchAlertLink(): Promise<string> {
	const response = await fetch(config.lta.trainAlertUrl, {
		headers: config.lta.accountKey
			? { AccountKey: config.lta.accountKey, accept: "application/json" }
			: undefined,
	});

	if (!response.ok) {
		throw new Error(`Train alert feed responded with ${response.status}`);
	}

	const wrapper = (await response.json()) as LinkWrapper;
	const link =
		wrapper.value?.[0]?.Link ?? wrapper.value?.[0]?.link ?? wrapper.link;
	if (!link) throw new Error("Train alert feed response had no link");

	return link;
}

async function fetchTrainAlerts(): Promise<DisruptionAlert[]> {
	if (!config.lta.accountKey) {
		// Not configured yet - keep the poller idle rather than erroring every tick.
		return [];
	}

	const link = await fetchAlertLink();
	const pbResponse = await fetch(link);
	if (!pbResponse.ok) {
		throw new Error(
			`Train alert .pb fetch responded with ${pbResponse.status}`,
		);
	}

	const buffer = new Uint8Array(await pbResponse.arrayBuffer());
	const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(buffer);

	return feed.entity.flatMap((entity): DisruptionAlert[] => {
		const alert = entity.alert;
		if (!alert) return [];

		const description =
			textOf(alert.descriptionText) || textOf(alert.headerText);
		// LTA alerts describe bridging buses in free text rather than a
		// structured field - approximate it with a keyword match for now.
		const isBridgingBus = /bridging bus/i.test(description);

		return (alert.informedEntity ?? []).flatMap(
			(informed): DisruptionAlert[] => {
				const lineCode = informed.routeId
					? resolveLineCode(informed.routeId)
					: null;
				if (!lineCode) {
					if (informed.routeId && !warnedRouteIds.has(informed.routeId)) {
						warnedRouteIds.add(informed.routeId);
						console.warn(
							`[trainAlerts] unmapped GTFS route_id "${informed.routeId}" - add it to mapping.ts`,
						);
					}
					return []; // unmapped route - skip until mapping.ts is populated
				}

				const stationName = informed.stopId
					? resolveStationName(informed.stopId)
					: null;

				return [
					{
						id: `${entity.id}:${lineCode}:${informed.stopId ?? "line"}`,
						lineCode,
						effect: isBridgingBus
							? "bridging-bus"
							: effectFromProto(alert.effect),
						affectedStations: stationName ? [stationName] : [],
						description,
						source: "live",
						createdAt: Date.now(),
					},
				];
			},
		);
	});
}

const poller = new Poller(
	"trainAlerts",
	config.pollIntervalMs.trainAlerts,
	fetchTrainAlerts,
);

// Surfaces unmapped GTFS route ids once each, instead of silently dropping
// every alert on that route until mapping.ts is populated.
const warnedRouteIds = new Set<string>();

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
