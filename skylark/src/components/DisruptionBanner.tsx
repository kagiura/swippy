"use client";
import { Box, Flex, Text } from "@radix-ui/themes";
import {
	IconAlertCircleFilled,
	IconAlertTriangle,
	IconChevronDown,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import useSWR from "swr";
import { getLiveDisruptions } from "@/utils/api";

const REFRESH_INTERVAL_MS = 30_000;
const PANEL_ID = "disruption-details";

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
	if (!disruptions || disruptions.length === 0) return null;

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
	);
}
