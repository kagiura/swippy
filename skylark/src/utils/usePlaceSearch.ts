import { useCallback, useEffect, useRef, useState } from "react";

import { type GeocoderResult, searchPlaces } from "@/utils/geocoderApi";

export interface UsePlaceSearchOptions {
	/** Text of the place that is already selected. The hook does not search for it. */
	selectedLabel?: string;
	/** Wait time after the last key press, in milliseconds. */
	debounceMs?: number;
	/** Minimum number of characters before the hook searches. */
	minLength?: number;
}

export interface UsePlaceSearchResult {
	query: string;
	setQuery: (query: string) => void;
	results: GeocoderResult[];
	loading: boolean;
	error: Error | null;
	/** Puts the result name in the query and clears the list. Does not search again. */
	select: (result: GeocoderResult) => void;
}

export function usePlaceSearch({
	selectedLabel,
	debounceMs = 300,
	minLength = 2,
}: UsePlaceSearchOptions = {}): UsePlaceSearchResult {
	const [query, setQuery] = useState(selectedLabel ?? "");
	const [results, setResults] = useState<GeocoderResult[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const requestId = useRef(0);
	// The hook skips the search when the query equals this text.
	const settledQuery = useRef(selectedLabel?.trim() ?? "");

	// Keep the query the same as the label that the parent sets.
	useEffect(() => {
		if (selectedLabel === undefined) return;
		settledQuery.current = selectedLabel.trim();
		setQuery(selectedLabel);
	}, [selectedLabel]);

	useEffect(() => {
		const currentRequest = ++requestId.current;
		const trimmedQuery = query.trim();

		if (
			trimmedQuery.length < minLength ||
			trimmedQuery === settledQuery.current
		) {
			setResults((previous) => (previous.length > 0 ? [] : previous));
			setLoading(false);
			setError(null);
			return;
		}

		const timeout = window.setTimeout(async () => {
			setLoading(true);
			setError(null);
			try {
				const nextResults = await searchPlaces(trimmedQuery);
				if (currentRequest === requestId.current) setResults(nextResults);
			} catch (caught) {
				if (currentRequest === requestId.current) {
					setResults([]);
					setError(
						caught instanceof Error ? caught : new Error("Place search failed"),
					);
				}
			} finally {
				if (currentRequest === requestId.current) setLoading(false);
			}
		}, debounceMs);

		return () => window.clearTimeout(timeout);
	}, [query, minLength, debounceMs]);

	const select = useCallback((result: GeocoderResult) => {
		requestId.current++; // Ignore any request that is still active.
		settledQuery.current = result.name.trim();
		setQuery(result.name);
		setResults([]);
		setLoading(false);
		setError(null);
	}, []);

	return { query, setQuery, results, loading, error, select };
}
