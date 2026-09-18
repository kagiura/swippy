"use client";

import { Box, Button, Flex, Heading, Text } from "@radix-ui/themes";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

import styles from "./page.module.css";

import {
	getPublicBusService,
	getPublicBusStop,
	PUBLIC_BUS_SERVICE_COLOR,
} from "@/data/publicBus";
import usePublicBusArrivals from "@/utils/usePublicBusArrivals";

function formatArrival(estimatedArrival: string | null) {
	if (!estimatedArrival) return "";

	const minutes = Math.max(
		0,
		Math.round((new Date(estimatedArrival).getTime() - Date.now()) / 60_000),
	);
	return minutes === 0 ? "Arriving" : `${minutes} min`;
}

export default function ServiceDetails() {
	const { name, service: serviceParam } = useParams();
	const busStopCode = typeof name === "string" ? name : undefined;
	const serviceNo = typeof serviceParam === "string" ? serviceParam : undefined;
	const stop = busStopCode ? getPublicBusStop(busStopCode) : undefined;
	const service = serviceNo ? getPublicBusService(serviceNo) : undefined;
	const [selectedDirection, setSelectedDirection] = useState(0);
	const { services, error, isLoading } = usePublicBusArrivals(
		busStopCode,
		serviceNo,
	);
	const routes = useMemo(
		() => service?.routes.filter((routeStops) => routeStops.includes(busStopCode || "")) || [],
		[service, busStopCode],
	);
	const route = routes[selectedDirection] || routes[0];
	const arrivals = (services[0]?.arrivals || []).filter(
		(arrival) => arrival.estimatedArrival,
	);
	const serviceColor = PUBLIC_BUS_SERVICE_COLOR;

	if (!stop || !service || !busStopCode || !serviceNo) {
		return <Text>Invalid public bus stop or service.</Text>;
	}

	return (
		<Box mb="2" mt="-1">
			<Flex align="center" gap="2" mb="1">
				<Box
					className={styles.serviceBadge}
					style={{ backgroundColor: serviceColor, color: "#000" }}
				>
					{serviceNo}
				</Box>
				<Heading as="h2" size="5">
					{service.name}
				</Heading>
			</Flex>
			<Text color="gray" as="p" mb="3">
				{stop.description} · operated by {services[0]?.operator || "public bus"}
			</Text>

			{(isLoading || error || arrivals.length > 0) && (
				<Flex className={styles.arrivals} gap="2" mb="4">
					{isLoading && <Text color="gray">Loading arrivals...</Text>}
					{error && <Text color="gray">Arrivals unavailable.</Text>}
					{arrivals.slice(0, 3).map((arrival, index) => (
						<Text key={`${arrival.estimatedArrival}-${index}`} className={styles.arrival} weight="bold">
							{formatArrival(arrival.estimatedArrival)}
							{index === 0 && <Text size="1" color="gray"> next</Text>}
						</Text>
					))}
				</Flex>
			)}

			{route ? (
				<Box>
					{routes.length > 1 && (
						<Flex gap="2" mb="3" className={styles.directionTabs}>
							{routes.map((direction, index) => (
								<Button
									key={`${direction[0]}-${direction[direction.length - 1]}`}
									variant={selectedDirection === index ? "solid" : "soft"}
									size="1"
									onClick={() => setSelectedDirection(index)}
								>
									{getPublicBusStop(direction[direction.length - 1])?.description || `Direction ${index + 1}`}
								</Button>
							))}
						</Flex>
					)}
					<Text weight="bold" as="p" mb="2">
						Route stops <Text color="gray" size="1">({route.length} stops)</Text>
					</Text>
					{route.map((routeStopCode, index) => {
						const routeStop = getPublicBusStop(routeStopCode);
						if (!routeStop) return null;

						return (
							<Flex
								key={routeStopCode}
								justify="between"
								className={styles.stopDetails}
								style={{ color: routeStopCode === busStopCode ? serviceColor : undefined }}
								py="1"
							>
								<Box className={styles.stopMarker} style={{ color: serviceColor }}>
									<Box className={styles.stopDot} />
									{index < route.length - 1 && <Box className={styles.stopLine} />}
								</Box>
								<Link className={styles.stopLink} href={`/stops/${routeStopCode}/${serviceNo}`}>
									<Text weight={routeStopCode === busStopCode ? "bold" : "regular"}>
										{index + 1}. {routeStop.description}
									</Text>
								</Link>
								<Text size="1" color="gray">
									{routeStop.code}
								</Text>
							</Flex>
						);
					})}
				</Box>
			) : (
				<Text color="gray">Route details unavailable.</Text>
			)}
		</Box>
	);
}
