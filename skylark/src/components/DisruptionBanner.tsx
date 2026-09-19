"use client";
import { Box, Button, Flex, Text } from "@radix-ui/themes";
import {
	IconAlertCircleFilled,
	IconAlertTriangle,
	IconChevronDown,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { getLiveDisruptions, getTransitRoute } from "@/utils/api";
import { getDefaultDate, getDefaultTime } from "@/utils/dateFormat";
import { useSavedPlaces } from "@/utils/useSavedPlaces";

const REFRESH_INTERVAL_MS = 30_000;
// Routing hits OneMap via 9 upstream combos per call - poll it less often than plain disruptions.
const COMMUTE_REFRESH_INTERVAL_MS = 90_000;
const PANEL_ID = "disruption-details";

function CommuteAlert() {
	const { home, work } = useSavedPlaces();
	// Morning commute (home -> work) is checked instead of the evening trip home,
	// since evening travel is generally more flexible for most commuters.
	const date = getDefaultDate();
	const time = getDefaultTime();

	const { data: commuteLegs } = useSWR(
		home && work ? ["commute-route", home, work] : null,
		() =>
			getTransitRoute({
				start: `${home?.latitude},${home?.longitude}`,
				end: `${work?.latitude},${work?.longitude}`,
				date,
				time,
				profile: "balanced",
			}).then((route) => {
				const best = route.plan.itineraries[0];
				return (best?.legs ?? []).filter((leg) => leg.disruption);
			}),
		{
			refreshInterval: COMMUTE_REFRESH_INTERVAL_MS,
			revalidateOnFocus: true,
			revalidateOnReconnect: true,
			keepPreviousData: true,
		},
	);

	if (!commuteLegs || commuteLegs.length === 0 || !home || !work) return null;

	const alternativesParams = new URLSearchParams({
		start: `${home.latitude},${home.longitude}`,
		end: `${work.latitude},${work.longitude}`,
		date,
		time,
		startName: home.label,
		endName: work.label,
		routeType: "pt",
	});

	return (
		<Box
			mb="3"
			p="3"
			role="status"
			style={{
				background: "var(--red-3)",
				border: "1px solid var(--red-6)",
				borderRadius: "var(--radius-3)",
			}}
		>
			<Flex align="center" gap="2" mb="1">
				<Text as="span" color="red" style={{ display: "flex" }}>
					<IconAlertCircleFilled width={16} height={16} />
				</Text>
				<Text as="span" size="2" weight="medium">
					Your commute may be disrupted
				</Text>
			</Flex>
			{commuteLegs.map((leg, index) => (
				<Text
					// biome-ignore lint/suspicious/noArrayIndexKey: legs have no stable id
					key={index}
					as="div"
					size="2"
					color="gray"
				>
					{leg.disruption?.description}
				</Text>
			))}
			<Button asChild size="2" variant="classic" color="red" mt="2">
				<Link href={`/navigate?${alternativesParams}`}>See alternatives</Link>
			</Button>
		</Box>
	);
}

export default function DisruptionBanner() {
	const [expanded, setExpanded] = useState(false);

	const { data: disruptions } = useSWR(
		"live-disruptions",
		() => getLiveDisruptions(),
		{
			refreshInterval: REFRESH_INTERVAL_MS,
			revalidateOnFocus: true,
			revalidateOnReconnect: true,
			keepPreviousData: true,
		},
	);

	// SWR keeps the last good data if a request fails.
	// The banner stays visible until a new response is empty.
	if (!disruptions || disruptions.length === 0) return <CommuteAlert />;

	const summary =
		disruptions.length === 1
			? disruptions[0].description
			: `${disruptions.length} active disruptions`;

	const severityOrder = [
		"no-service",
		"bridging-bus",
		"delay",
		"reduced-service",
	];
	// order: "no-service" > "bridging-bus" > "delay" > "reduced-service"
	// array will already have been sorted so can just check [0]
	// anything above delay will be marked in red
	const highestSeverity = severityOrder.indexOf(disruptions[0].effect);

	const isSevere = highestSeverity < severityOrder.indexOf("delay");

	return (
		<>
			<CommuteAlert />
			<Box
				mb="4"
				role="status"
				aria-live="polite"
				style={
					isSevere
						? {
								background: "var(--red-3)",
								border: "1px solid var(--red-6)",
								borderRadius: "var(--radius-3)",
								overflow: "hidden",
							}
						: {
								background: "var(--amber-3)",
								border: "1px solid var(--amber-6)",
								borderRadius: "var(--radius-3)",
								overflow: "hidden",
							}
				}
			>
				<Flex asChild align="center" gap="3" p="3" width="100%">
					<button
						type="button"
						aria-expanded={expanded}
						aria-controls={PANEL_ID}
						onClick={() => setExpanded((prev) => !prev)}
						style={{
							background: "none",
							border: 0,
							font: "inherit",
							color: "inherit",
							textAlign: "left",
							cursor: "pointer",
						}}
					>
						<Text
							as="span"
							color={isSevere ? "red" : "amber"}
							style={{ display: "flex" }}
						>
							{isSevere ? (
								<IconAlertCircleFilled width={16} height={16} />
							) : (
								<IconAlertTriangle width={16} height={16} />
							)}
						</Text>
						<Text as="span" size="2" weight="medium" style={{ flex: 1 }}>
							{summary}
						</Text>
						<motion.span
							animate={{ rotate: expanded ? 180 : 0 }}
							style={{ display: "flex" }}
						>
							<IconChevronDown width={16} height={16} />
						</motion.span>
					</button>
				</Flex>

				<AnimatePresence initial={false}>
					{expanded && (
						<motion.div
							id={PANEL_ID}
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.2 }}
						>
							<Flex direction="column" gap="3" px="3" pb="3">
								{disruptions.map((item) => (
									<Box key={item.id}>
										<Text as="div" size="2" color="gray">
											{item.description}
										</Text>
									</Box>
								))}
							</Flex>
						</motion.div>
					)}
				</AnimatePresence>
			</Box>
		</>
	);
}
