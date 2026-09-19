/** biome-ignore-all lint/a11y/noLabelWithoutControl: <explanation> */
/** biome-ignore-all lint/a11y/useAltText: <explanation> */
/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
"use client";

import {
	Button,
	Flex,
	Heading,
	Reset,
	SegmentedControl,
	Select,
	Text,
	TextField,
} from "@radix-ui/themes";
import { IconArrowRight, IconWalk } from "@tabler/icons-react";
import clsx from "clsx";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
	Fragment,
	Suspense,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import MRTCaplet from "@/components/MRTCaplet";
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

// const DEFAULT_START = "1.3081592,103.8551479";
// const DEFAULT_END = "1.2739864,103.8012642";
const DEFAULT_START_LABEL = "";
const DEFAULT_END_LABEL = "";

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
									{itinerary.legs.some((leg) => leg.disruption) && "⚠️ "}
									{formatTime(itinerary.startTime)} -{" "}
									{formatTime(itinerary.endTime)}
								</Heading>
								<Text color="gray" size="2">
									{formatDuration(itinerary.duration)} · {itinerary.transfers}{" "}
									transfers · ${itinerary.fare}
								</Text>
							</div>
							{/* <Text color="gray" size="2">
								{Math.round(itinerary.walkDistance)}m walk
							</Text> */}
						</Flex>
						<Flex wrap="wrap" mt="1">
							{/* brief overview of the itinerary */}
							{/* skip any walks less than 170m */}
							{itinerary.legs
								.filter((leg) => leg.mode !== "WALK" || leg.distance >= 170)
								.map((leg, index) => (
									<Fragment key={leg.startTime}>
										{/* <Text size="2">
											{index > 0 && " > "}
											{leg.mode === "WALK" ? (
												<IconWalk width="1em" height="1em" />
											) : (
												legLabel(leg)
											)}
										</Text> */}
										{index > 0 &&
											(leg.mode !== "WALK" || leg.distance >= 170) && (
												<IconArrowRight width="1em" height="1em" />
											)}
										{leg.mode === "WALK" && (
											<IconWalk width="1em" height="1em" />
										)}
										{leg.mode === "BUS" && (
											<span className={styles.busTagSmall}>
												{leg.routeId ?? "Bus"}
											</span>
										)}
										{leg.mode === "SUBWAY" && (
											<MRTCaplet
												code={leg.routeId ?? ""}
												width="30px"
												height="16px"
											/>
										)}
									</Fragment>
								))}
						</Flex>
					</div>
				</button>
			</Reset>

			{isSelected && (
				<div className={styles.legs}>
					{itinerary.legs
						.filter(
							(leg, i) => leg.mode !== "WALK" || leg.distance >= 170 || i === 0,
						)
						.map((leg, index) => (
							<Flex
								className={clsx(
									styles.leg,
									leg.disruption && styles.disruption,
								)}
								key={`${leg.startTime}-${index}`}
							>
								<div>
									{leg.mode === "WALK" ? (
										<img
											src="https://jooferj.github.io/media/icons/walk.svg"
											width="36px"
											height="28px"
											style={{
												objectFit: "contain",
											}}
										/>
									) : leg.mode === "SUBWAY" ? (
										<MRTCaplet
											code={leg.routeId ?? ""}
											width="36px"
											height="28px"
										/>
									) : leg.mode === "BUS" ? (
										<div className={styles.busTag}>{leg.routeId ?? ""}</div>
									) : null}
								</div>
								<div
									style={{
										flex: "1 0 0",
										display: "flex",
										flexDirection: "column",
									}}
								>
									<Text size="2">
										{leg.from.name} to {leg.to.name}
									</Text>
									<Text color="gray" size="1">
										{formatDuration(leg.duration)}
										{
											// stop count if its bus or rail
											(leg.mode === "BUS" || leg.mode === "RAIL") &&
											leg?.intermediateStops
												? ` · ${leg?.intermediateStops.length + 1} stops`
												: ""
										}
									</Text>
								</div>
							</Flex>
						))}
				</div>
			)}
		</article>
	);
}

function NavigateContent() {
	const searchParams = useSearchParams();
	const queryString = searchParams.toString();

	const [route, setRoute] = useState<Awaited<
		ReturnType<typeof getTransitRoute>
	> | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [selectedItinerary, setSelectedItinerary] =
		useState<RoutingItinerary | null>(null);

	// The URL is the only source of truth. No copy in state.
	const form = useMemo<RoutingQuery>(() => {
		const params = new URLSearchParams(queryString);
		return {
			start: params.get("start") ?? "",
			end: params.get("end") ?? "",
			date: params.get("date") || getDefaultDate(),
			time: params.get("time") || getDefaultTime(),
			profile: (params.get("profile") as RoutingProfile | null) || "balanced",
		};
	}, [queryString]);

	const placeLabels = useMemo(() => {
		const params = new URLSearchParams(queryString);
		const hasStart = parseCoordinates(params.get("start") ?? "") !== null;
		const hasEnd = parseCoordinates(params.get("end") ?? "") !== null;
		return {
			start: hasStart ? (params.get("startName") ?? "") : "",
			end: hasEnd ? (params.get("endName") ?? "") : "",
		};
	}, [queryString]);

	// One writer. It changes only the keys you pass and keeps all other keys.
	// It reads window.location, so it never uses old values.
	const updateParams = useCallback((changes: Record<string, string>) => {
		const params = new URLSearchParams(window.location.search);
		for (const [key, value] of Object.entries(changes)) {
			params.set(key, value);
		}
		params.set("routeType", "pt");
		window.history.replaceState(
			null,
			"",
			`${window.location.pathname}?${params}`,
		);
	}, []);

	const [locationFailed, setLocationFailed] = useState(false);

	useEffect(() => {
		// Do not ask for GPS if the URL already has a start point.
		if (new URLSearchParams(window.location.search).get("start")) return;

		if (!("geolocation" in navigator)) {
			setLocationFailed(true);
			return;
		}

		navigator.geolocation.getCurrentPosition(
			(pos) => {
				// Do not overwrite a start point that the user selected in the meantime.
				if (new URLSearchParams(window.location.search).get("start")) return;
				updateParams({
					start: `${pos.coords.latitude},${pos.coords.longitude}`,
				});
			},
			() => setLocationFailed(true),
			{ timeout: 10000 },
		);
	}, [updateParams]);

	useEffect(() => {
		const hasStart = () =>
			parseCoordinates(
				new URLSearchParams(window.location.search).get("start") ?? "",
			) !== null;

		// The previous page already sent a valid start point.
		if (hasStart()) return;

		const fail = () => {
			setLocationFailed(true);
			// Remove a stale "Current Location" label from the URL.
			if (!hasStart()) updateParams({ startName: "" });
		};

		if (!("geolocation" in navigator)) {
			fail();
			return;
		}

		navigator.geolocation.getCurrentPosition(
			(pos) => {
				// Do not overwrite a place that the user selected in the meantime.
				if (hasStart()) return;
				updateParams({
					start: `${pos.coords.latitude},${pos.coords.longitude}`,
					startName: "Current Location",
				});
			},
			fail,
			{ timeout: 10000 },
		);
	}, [updateParams]);

	const hasCoordinates =
		parseCoordinates(form.start) !== null &&
		parseCoordinates(form.end) !== null;

	// null = no error. Do not use "" for "no error".
	const validationError = useMemo(() => {
		if (!/^\d{2}-\d{2}-\d{4}$/.test(form.date)) {
			return "Date must use MM-DD-YYYY format.";
		}
		if (!/^\d{2}:\d{2}(:\d{2})?$/.test(form.time)) {
			return "Time must use HH:mm or HH:mm:ss format.";
		}
		return null;
	}, [form.date, form.time]);

	useEffect(() => {
		if (!hasCoordinates || validationError) return;
		let cancelled = false;
		setLoading(true);
		setError(null);
		getTransitRoute(form)
			.then((result) => {
				if (!cancelled) setRoute(result);
				// automatically set itinerary to the first route if available
				if (result.plan.itineraries.length > 0 && !cancelled)
					setSelectedItinerary(result.plan.itineraries[0]);
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
	}, [form, hasCoordinates, validationError]);

	function selectPlace(field: "start" | "end", result: GeocoderResult) {
		updateParams({
			[field]: `${result.latitude},${result.longitude}`,
			[`${field}Name`]: result.name,
		});
	}

	function updateField(field: "date" | "time", value: string) {
		updateParams({ [field]: value });
	}

	function updateProfile(profile: RoutingProfile) {
		updateParams({ profile });
	}

	// function reset() {
	// 	updateParams({
	// 		start: locationStart,
	// 		end: "",
	// 		startName: "",
	// 		endName: "",
	// 		date: getDefaultDate(),
	// 		time: getDefaultTime(),
	// 		profile: "balanced",
	// 	});
	// 	setRoute(null);
	// }

	return (
		<div className={styles.page}>
			{/* bback button */}
			<Link href="/" passHref>
				<Button variant="ghost">Back</Button>
			</Link>

			<Heading as="h1" size="7" mb="0">
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
				{locationFailed && !form.start && (
					<Text color="gray" size="2" role="alert">
						We couldn't get your current location, so we need you to fill it in
						here.
					</Text>
				)}
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
				{/* <label>
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
				</label> */}
				<SegmentedControl.Root
					mt="1"
					value={form.profile || "balanced"}
					onValueChange={(value) => updateProfile(value as RoutingProfile)}
				>
					<SegmentedControl.Item value="balanced">
						Balanced
					</SegmentedControl.Item>
					<SegmentedControl.Item value="fastest">Fastest</SegmentedControl.Item>
					<SegmentedControl.Item value="fewer-transfers">
						Easiest
					</SegmentedControl.Item>
				</SegmentedControl.Root>
				<Flex gap="2">
					{/* <Button type="button" onClick={reset} variant="soft">
						Reset
					</Button> */}
					{validationError && (
						<Text color="red" size="2" mt="1">
							{validationError}
						</Text>
					)}
				</Flex>
			</form>

			{loading && <Text color="gray">Finding routes...</Text>}
			{error && <Text color="red">{error}</Text>}
			{route && !loading && (
				<section className={styles.results}>
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
