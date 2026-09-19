/** biome-ignore-all lint/a11y/noLabelWithoutControl: <explanation> */
/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
"use client";

import {
	Button,
	Flex,
	Heading,
	Reset,
	Select,
	Text,
	TextField,
} from "@radix-ui/themes";
import { IconWalk } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import PlaceAutocomplete from "@/components/PlaceAutocomplete";
import mrtStations from "@/data/mrt/mrtStations";
import {
	getPublicBusService,
	PUBLIC_BUS_SERVICE_COLOR,
} from "@/data/publicBus";
import type {
	RoutingItinerary,
	RoutingLeg,
	RoutingProfile,
} from "@/types/schema";
import { getTransitRoute, type RoutingQuery } from "@/utils/api";
import { getDefaultDate, getDefaultTime } from "@/utils/dateFormat";
import type { GeocoderResult } from "@/utils/geocoderApi";
import {
	type FocusedSegment,
	type FocusedStop,
	useMapState,
} from "@/utils/mapState";
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

function Itinerary({
	itinerary,
	selectedItinerary,
	setSelectedItinerary,
}: {
	itinerary: RoutingItinerary;
	selectedItinerary: RoutingItinerary | null;
	setSelectedItinerary: (itinerary: RoutingItinerary | null) => void;
}) {
	const {
		flyTo,
		pullBackCard,
		setFocusedStopName,
		setFocusedSegments,
		setFocusedStops,
		focusedSegments,
	} = useMapState();

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		// set focused stops as all stops along the route, and focused segments as segments along the whole route
		if (selectedItinerary === null) {
			setFocusedStops([]);
			setFocusedSegments([]);
			return;
		} else if (selectedItinerary.id !== itinerary.id) {
			return;
		}

		const focusedStops: FocusedStop[] = [];
		const focusedSegments: FocusedSegment[] = [];

		// const currentStop = busStopCode || "";
		// const currentStopIndex = route.indexOf(currentStop);
		// const focusedStops: FocusedStop[] = route.map((stop, i) => ({
		// 	name: stop,
		// 	status: i <= currentStopIndex ? "passed" : "upcoming",
		// }));

		// setFocusedStops(focusedStops);
		// setFocusedSegments([
		// 	{
		// 		from: route[0],
		// 		to: route[currentStopIndex],
		// 		type: "bus",
		// 		status: "passed",
		// 		service: service.serviceNo,
		// 	},
		// 	{
		// 		from: route[currentStopIndex],
		// 		to: route[route.length - 1],
		// 		type: "bus",
		// 		status: "upcoming",
		// 		service: service.serviceNo,
		// 	},
		// ]);

		// cycle through each leg and populate focusedStops and focusedSegments
		itinerary.legs.forEach((leg) => {
			if (leg.mode === "WALK" && leg.distance < 170) return;
			if (leg.mode === "WALK") return; //for now
			focusedStops.push(
				{ name: leg.from?.name || "", status: "upcoming" },
				{ name: leg.to?.name || "", status: "upcoming" },
			);
			// for bus stops, use leg.from/to.stopCode
			if (leg.mode === "BUS") {
				focusedSegments.push({
					from: leg.from?.stopCode || "",
					to: leg.to?.stopCode || "",
					type: "bus",
					status: "upcoming",
					service: leg.routeId || "",
				});
			}

			if (leg.mode === "SUBWAY") {
				// we have to push each individual consecutive station along the whole route. we can utilize the intermediateStops array
				const orderOfStops = [
					leg.from?.stopCode || "",
					...(leg.intermediateStops?.map((stop) => stop.stopCode) || []),
					leg.to?.stopCode || "",
				].filter((s) => typeof s === "string");
				const stopNames = orderOfStops.map((stopCode) => {
					const stop = mrtStations.find((s) => s.code.includes(stopCode));
					return stop?.name.en || "";
				});
				for (let i = 0; i < stopNames.length - 1; i++) {
					focusedSegments.push({
						from: stopNames[i],
						to: stopNames[i + 1],
						type: "mrt",
						status: "upcoming",
						service: leg.routeId || "",
					});
				}
			}
		});

		setFocusedStops(focusedStops);
		setFocusedSegments(focusedSegments);
	}, [setFocusedSegments, setFocusedStops, selectedItinerary, itinerary.id]);
	const isSelected = selectedItinerary?.id === itinerary.id;
	return (
		<article className={styles.itinerary}>
			<Reset>
				<button
					type="button"
					onClick={() => setSelectedItinerary(isSelected ? null : itinerary)}
				>
					<div>
						<Flex justify="between" align="start" gap="3">
							<div>
								<Heading as="h2" size="4">
									{formatTime(itinerary.startTime)} -{" "}
									{formatTime(itinerary.endTime)}
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
						<Flex wrap="wrap">
							{/* brief overview of the itinerary */}
							{/* skip any walks less than 170m */}
							{itinerary.legs
								.filter((leg) => leg.mode !== "WALK" || leg.distance >= 170)
								.map((leg, index) => (
									<div key={leg.startTime}>
										<Text size="2">
											{index > 0 && " > "}
											{leg.mode === "WALK" ? (
												<IconWalk width="1em" height="1em" />
											) : (
												legLabel(leg)
											)}
										</Text>
									</div>
								))}
						</Flex>
					</div>
				</button>
			</Reset>

			{isSelected && (
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
			)}
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
	const [selectedItinerary, setSelectedItinerary] =
		useState<RoutingItinerary | null>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
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
					{route.plan.itineraries.map((itinerary) => (
						<Itinerary
							key={`${itinerary.startTime}-${itinerary.id}`}
							itinerary={itinerary}
							selectedItinerary={selectedItinerary}
							setSelectedItinerary={setSelectedItinerary}
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
