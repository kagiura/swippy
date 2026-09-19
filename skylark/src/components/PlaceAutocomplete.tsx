"use client";

import { Box, Text, TextField } from "@radix-ui/themes";
import { useEffect, useRef, useState } from "react";
import { type GeocoderResult, searchPlaces } from "@/utils/geocoderApi";
import styles from "./PlaceAutocomplete.module.css";

export default function PlaceAutocomplete({
	label,
	value,
	selectedLabel,
	onSelect,
}: {
	label: string;
	value: string;
	selectedLabel: string;
	onSelect: (result: GeocoderResult) => void;
}) {
	const [query, setQuery] = useState(selectedLabel);
	const [results, setResults] = useState<GeocoderResult[]>([]);
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const requestId = useRef(0);

	useEffect(() => {
		setQuery(selectedLabel);
	}, [selectedLabel]);

	useEffect(() => {
		const trimmedQuery = query.trim();
		if (trimmedQuery.length < 2 || trimmedQuery === selectedLabel) {
			setResults([]);
			return;
		}

		const currentRequest = ++requestId.current;
		const timeout = window.setTimeout(async () => {
			setLoading(true);
			try {
				const nextResults = await searchPlaces(trimmedQuery);
				if (currentRequest === requestId.current) {
					setResults(nextResults);
					setOpen(true);
				}
			} finally {
				if (currentRequest === requestId.current) setLoading(false);
			}
		}, 300);

		return () => window.clearTimeout(timeout);
	}, [query, selectedLabel]);

	function selectResult(result: GeocoderResult) {
		setQuery(result.name);
		setResults([]);
		setOpen(false);
		onSelect(result);
	}

	return (
		<Box className={styles.wrapper}>
			<Text size="2" weight="bold">
				{label}
			</Text>
			<TextField.Root
				value={query}
				placeholder="Search a place"
				onChange={(event) => {
					setQuery(event.target.value);
					setOpen(true);
				}}
				onFocus={() => results.length > 0 && setOpen(true)}
				onBlur={() => window.setTimeout(() => setOpen(false), 150)}
			/>
			{open && (loading || results.length > 0) && (
				<Box className={styles.results} role="listbox">
					{loading && (
						<Text color="gray" size="2">
							Searching...
						</Text>
					)}
					{results.map((result) => (
						<button
							key={`${result.latitude}-${result.longitude}-${result.name}`}
							type="button"
							onMouseDown={(event) => event.preventDefault()}
							onClick={() => selectResult(result)}
						>
							<strong>{result.name}</strong>
							<span>{result.address}</span>
						</button>
					))}
				</Box>
			)}
			{/* <Text size="1" color="gray">{value}</Text> */}
		</Box>
	);
}
