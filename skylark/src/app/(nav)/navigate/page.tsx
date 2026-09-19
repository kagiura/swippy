"use client";

import {
	Button,
	Flex,
	Heading,
	Select,
	Text,
	TextField,
} from "@radix-ui/themes";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import PlaceAutocomplete from "@/components/PlaceAutocomplete";
import type {
	RoutingItinerary,
	RoutingLeg,
	RoutingProfile,
} from "@/types/schema";
import { getTransitRoute, type RoutingQuery } from "@/utils/api";
import type { GeocoderResult } from "@/utils/geocoderApi";
import styles from "./page.module.css";

const PROFILE_OPTIONS: { value: RoutingProfile; label: string }[] = [
	{ value: "balanced", label: "Balanced" },
	{ value: "fastest", label: "Fastest arrival" },
	{ value: "fewer-transfers", label: "Fewer transfers/walking" },
];

const DEFAULT_START = "1.3081592,103.8551479";
const DEFAULT_END = "1.2739864,103.8012642";
const DEFAULT_START_LABEL = "Default origin";
const DEFAULT_END_LABEL = "Default destination";

function getDefaultDate() {
	const now = new Date();
	return `${String(now.getMonth() + 1).padStart(2, "0")}-${String(
		now.getDate(),
	).padStart(2, "0")}-${now.getFullYear()}`;
}

function getDefaultTime() {
	const now = new Date();
	return `${String(now.getHours()).padStart(2, "0")}:${String(
		now.getMinutes(),
	).padStart(2, "0")}:00`;
}

function parseCoordinates(value: string) {
	const parts = value.split(",").map((part) => Number(part.trim()));
	if (
		parts.length !== 2 ||
		parts.some((part) => !Number.isFinite(part)) ||
		parts[0] < -90 ||
		parts[0] > 90 ||
		parts[1] < -180 ||
		parts[1] > 180
	) {
		return null;
	}
	return parts as [number, number];
}

function formatDuration(seconds: number) {
	const minutes = Math.round(seconds / 60);
	if (minutes < 60) return `${minutes} min`;
	return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function formatTime(timestamp: number) {
	return new Date(timestamp).toLocaleTimeString([], {
		hour: "numeric",
		minute: "2-digit",
	});
}

function legLabel(leg: RoutingLeg) {
	if (leg.mode === "WALK") return "Walk";
	return leg.routeShortName || leg.routeLongName || leg.route || leg.mode;
}

function Itinerary({ itinerary }: { itinerary: RoutingItinerary }) {
	return (
		<article className={styles.itinerary}>
			<Flex justify="between" align="start" gap="3">
				<div>
					<Heading as="h2" size="4">
						{formatTime(itinerary.startTime)} - {formatTime(itinerary.endTime)}
					</Heading>
					<Text color="gray" size="2">
						{formatDuration(itinerary.duration)} · {itinerary.transfers}{" "}
						transfers · ${itinerary.fare}
					</Text>
				</div>
				<Text color="gray" size="2">
					{Math.round(itinerary.walkDistance)}m walk
				</Text>
			</Flex>

			<div className={styles.legs}>
				{itinerary.legs.map((leg, index) => (
					<div className={styles.leg} key={`${leg.startTime}-${index}`}>
						<Text weight="bold" size="2">
							{legLabel(leg)}
						</Text>
						<Text size="2">
							{leg.from.name} to {leg.to.name}
						</Text>
						<Text color="gray" size="1">
							{formatDuration(leg.duration)} · {Math.round(leg.distance)}m
							{leg.agencyName ? ` · ${leg.agencyName}` : ""}
						</Text>
					</div>
				))}
			</div>
		</article>
	);
}

function NavigateContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const queryString = searchParams.toString();
	const [form, setForm] = useState<RoutingQuery>({
		start: DEFAULT_START,
		end: DEFAULT_END,
		date: getDefaultDate(),
		time: getDefaultTime(),
		profile: "balanced",
	});
	const [placeLabels, setPlaceLabels] = useState({
		start: DEFAULT_START_LABEL,
		end: DEFAULT_END_LABEL,
	});
	const [route, setRoute] = useState<Awaited<
		ReturnType<typeof getTransitRoute>
	> | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const nextForm: RoutingQuery = {
			start: searchParams.get("start") || DEFAULT_START,
			end: searchParams.get("end") || DEFAULT_END,
			date: searchParams.get("date") || getDefaultDate(),
			time: searchParams.get("time") || getDefaultTime(),
			profile:
				(searchParams.get("profile") as RoutingProfile | null) || "balanced",
		};
		setForm(nextForm);
		setPlaceLabels({
			start: searchParams.get("startName") || DEFAULT_START_LABEL,
			end: searchParams.get("endName") || DEFAULT_END_LABEL,
		});

		const hasAllParams = ["start", "end", "date", "time"].every((key) =>
			searchParams.has(key),
		);
		if (!hasAllParams) {
			const params = new URLSearchParams({ ...nextForm, routeType: "pt" });
			router.replace(`/navigate?${params}`);
		}
	}, [queryString, router, searchParams]);

	const validationError = useMemo(() => {
		if (!parseCoordinates(form.start) || !parseCoordinates(form.end)) {
			return "Coordinates must use latitude,longitude format.";
		}
		if (!/^\d{2}-\d{2}-\d{4}$/.test(form.date)) {
			return "Date must use MM-DD-YYYY format.";
		}
		if (!/^\d{2}:\d{2}(:\d{2})?$/.test(form.time)) {
			return "Time must use HH:mm or HH:mm:ss format.";
		}
		return null;
	}, [form]);

	useEffect(() => {
		if (validationError || !searchParams.has("start")) return;
		let cancelled = false;
		setLoading(true);
		setError(null);
		getTransitRoute(form)
			.then((result) => {
				if (!cancelled) setRoute(result);
			})
			.catch((requestError: Error) => {
				if (!cancelled) setError(requestError.message);
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [form, searchParams, validationError]);

	function selectPlace(field: "start" | "end", result: GeocoderResult) {
		const nextForm = {
			...form,
			[field]: `${result.latitude},${result.longitude}`,
		};
		const nextLabels = { ...placeLabels, [field]: result.name };
		setForm(nextForm);
		setPlaceLabels(nextLabels);
		const params = new URLSearchParams({
			...nextForm,
			startName: nextLabels.start,
			endName: nextLabels.end,
			routeType: "pt",
		});
		router.replace(`/navigate?${params}`);
	}

	function updateField(field: "date" | "time", value: string) {
		const nextForm = { ...form, [field]: value };
		setForm(nextForm);
		const params = new URLSearchParams({
			...nextForm,
			startName: placeLabels.start,
			endName: placeLabels.end,
			routeType: "pt",
		});
		router.replace(`/navigate?${params}`);
	}

	function updateProfile(profile: RoutingProfile) {
		const nextForm = { ...form, profile };
		setForm(nextForm);
		const params = new URLSearchParams({
			...nextForm,
			startName: placeLabels.start,
			endName: placeLabels.end,
			routeType: "pt",
		});
		router.replace(`/navigate?${params}`);
	}

	function reset() {
		const nextForm: RoutingQuery = {
			start: DEFAULT_START,
			end: DEFAULT_END,
			date: getDefaultDate(),
			time: getDefaultTime(),
			profile: "balanced",
		};
		const nextLabels = {
			start: DEFAULT_START_LABEL,
			end: DEFAULT_END_LABEL,
		};
		setPlaceLabels(nextLabels);
		const params = new URLSearchParams({
			...nextForm,
			startName: nextLabels.start,
			endName: nextLabels.end,
			routeType: "pt",
		});
		router.replace(`/navigate?${params}`);
		setRoute(null);
	}

	return (
		<div className={styles.page}>
			<Heading as="h1" size="7" mb="1">
				Navigate
			</Heading>
			<Text color="gray" size="2">
				Plan a public transport route between two coordinates.
			</Text>

			<form
				className={styles.form}
				onSubmit={(event) => event.preventDefault()}
			>
				<PlaceAutocomplete
					label="Start"
					value={form.start}
					selectedLabel={placeLabels.start}
					onSelect={(result) => selectPlace("start", result)}
				/>
				<PlaceAutocomplete
					label="End"
					value={form.end}
					selectedLabel={placeLabels.end}
					onSelect={(result) => selectPlace("end", result)}
				/>
				<div className={styles.row}>
					<label>
						<Text size="2" weight="bold">
							Date
						</Text>
						<TextField.Root
							value={form.date}
							onChange={(event) => updateField("date", event.target.value)}
						/>
					</label>
					<label>
						<Text size="2" weight="bold">
							Time
						</Text>
						<TextField.Root
							value={form.time}
							onChange={(event) => updateField("time", event.target.value)}
						/>
					</label>
				</div>
				<label>
					<Text size="2" weight="bold">
						Prioritize
					</Text>
					<Select.Root
						value={form.profile || "balanced"}
						onValueChange={(value) => updateProfile(value as RoutingProfile)}
					>
						<Select.Trigger />
						<Select.Content>
							{PROFILE_OPTIONS.map((option) => (
								<Select.Item key={option.value} value={option.value}>
									{option.label}
								</Select.Item>
							))}
						</Select.Content>
					</Select.Root>
				</label>
				<Flex gap="2">
					<Button type="button" onClick={reset} variant="soft">
						Reset
					</Button>
					{validationError && (
						<Text color="red" size="2">
							{validationError}
						</Text>
					)}
				</Flex>
			</form>

			{loading && <Text color="gray">Finding routes...</Text>}
			{error && <Text color="red">{error}</Text>}
			{route && !loading && (
				<section className={styles.results}>
					<Heading as="h2" size="5">
						Routes
					</Heading>
					{route.plan.itineraries.map((itinerary, index) => (
						<Itinerary
							key={`${itinerary.startTime}-${index}`}
							itinerary={itinerary}
						/>
					))}
				</section>
			)}
		</div>
	);
}

export default function NavigatePage() {
	return (
		<Suspense fallback={<Text>Loading...</Text>}>
			<NavigateContent />
		</Suspense>
	);
}
