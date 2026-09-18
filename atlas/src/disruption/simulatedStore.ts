// In-memory store for disruptions injected via /simulate/* for testing -
// no persistence needed, this is a hackathon testing aid, not real data.

import type { DisruptionAlert } from "./types";

const simulated = new Map<string, DisruptionAlert>();

export function addSimulatedAlert(
	input: Omit<DisruptionAlert, "id" | "source" | "createdAt">,
): DisruptionAlert {
	const alert: DisruptionAlert = {
		...input,
		id: crypto.randomUUID(),
		source: "simulated",
		createdAt: Date.now(),
	};
	simulated.set(alert.id, alert);
	return alert;
}

export function removeSimulatedAlert(id: string): boolean {
	return simulated.delete(id);
}

export function clearSimulatedAlerts(): void {
	simulated.clear();
}

export function listSimulatedAlerts(): DisruptionAlert[] {
	return [...simulated.values()];
}
