"use client";

import { Box, Reset, Text } from "@radix-ui/themes";
import Link from "next/link";
import { getPublicBusStop, PUBLIC_BUS_SERVICE_COLOR } from "@/data/publicBus";
import usePublicBusArrivals from "@/utils/usePublicBusArrivals";
import styles from "./StopTimings.module.css";

function formatArrival(estimatedArrival: string | null) {
	if (!estimatedArrival) return "";

	const arrival = new Date(estimatedArrival);
	const minutes = Math.max(
		0,
		Math.round((arrival.getTime() - Date.now()) / 60_000),
	);
	return minutes === 0 ? "Arr" : `${minutes} m`;
}

function StopNameListing({ stopCodes }: { stopCodes: string[] }) {
	const stops = stopCodes
		.map((stopCode) => getPublicBusStop(stopCode))
		.filter((stop) => stop !== undefined);

	return (
		<Text weight="medium" style={{ whiteSpace: "nowrap" }}>
			{stops.map((stop) => stop.description).join(" · ") ||
				"Route details unavailable"}
		</Text>
	);
}

export default function StopTimings({
	busStopCode,
	serviceToAppend,
	children,
}: {
	busStopCode: string;
	serviceToAppend?: string;
	children?: React.ReactNode;
}) {
	const { services, error, isLoading, isValidating } =
		usePublicBusArrivals(busStopCode);

	if (isLoading) {
		return (
			<Text color="gray" as="p" mt="4" align="center">
				Loading...
			</Text>
		);
	}

	if (error) {
		return (
			<Text color="gray" as="p" mt="4" align="center">
				Unable to load public bus arrivals.
			</Text>
		);
	}

	if (services.length === 0) {
		return null;
	}

	const servicesWithArrivals = services.filter((service) =>
		service.arrivals.some((arrival) => arrival.estimatedArrival),
	);

	if (servicesWithArrivals.length === 0) return null;

	return (
		<Box className={styles.timingsWrapper}>
			{servicesWithArrivals.map((service) => (
				<Box className={styles.serviceWrapper} mb="1" key={service.serviceNo}>
					<Reset>
						<Link href={`/stops/${busStopCode}/${service.serviceNo}`}>
							<Box className={styles.serviceHeader}>
								<Box
									className={styles.serviceName}
									style={{
										backgroundColor: PUBLIC_BUS_SERVICE_COLOR,
										color: "#000",
									}}
								>
									{service.serviceNo}
								</Box>
								<Box className={styles.serviceDetailsWrapper}>
									<Box className={styles.serviceDetails}>
										<StopNameListing
											stopCodes={
												service.arrivals[0]?.destinationCode
													? [service.arrivals[0].destinationCode]
													: []
											}
										/>
									</Box>
									<Box className={styles.serviceSubDetails}>
										<Text color="gray" size="1">
											{service.operator}
										</Text>
									</Box>
								</Box>
								<Box className={styles.serviceETA}>
									{service.arrivals.slice(0, 3).map((arrival, index) => (
										<Text key={`${arrival.estimatedArrival}`} as="span">
											{index > 0 ? "  " : ""}
											{formatArrival(arrival.estimatedArrival)}
										</Text>
									))}
									{isValidating && (
										<Text className={styles.refreshIcon} as="span">
											↻
										</Text>
									)}
								</Box>
							</Box>
						</Link>
					</Reset>
					{serviceToAppend && service.serviceNo === serviceToAppend && (
						<Box className={styles.serviceContent}>{children}</Box>
					)}
				</Box>
			))}
		</Box>
	);
}
