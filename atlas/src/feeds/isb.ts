// NUS ISB proxy, migrated from skylark/src/app/api/isb/route.ts. No caching
// applied here - ISB endpoints vary per query, revisit if a hot path emerges.

import { config } from "../config";

export async function fetchIsb(endpoint: string, query: string) {
	const headers = new Headers();
	if (config.isb.username && config.isb.password) {
		headers.set(
			"Authorization",
			`Basic ${btoa(`${config.isb.username}:${config.isb.password}`)}`,
		);
	}

	const response = await fetch(`${config.isb.baseUrl}/${endpoint}?${query}`, {
		headers,
	});
	return response.json();
}
