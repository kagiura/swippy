"use client";

import { Flex, Heading, Text } from "@radix-ui/themes";
import { useParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { mrtLines } from "@/data/mrt/mrtLines";
import {
	getMrtStation,
	getMrtStationCoordinates,
} from "@/data/mrt/mrtStations";
import { useMapState } from "@/utils/mapState";
import styles from "./layout.module.css";

export default function Story({ children }: { children: React.ReactNode }) {
	const { name } = useParams<{ name?: string }>();
	const { flyTo, pullBackCard, resetFocusedState } = useMapState();
	const stationName = name ? decodeURIComponent(name) : undefined;
	const station = useMemo(
		() => (stationName ? getMrtStation(stationName) : undefined),
		[stationName],
	);
	const coordinates = useMemo(
		() => (station ? getMrtStationCoordinates(station.name.en) : undefined),
		[station],
	);
	const lines = useMemo(
		() =>
			(station?.line || [])
				.map((code) => mrtLines.find((l) => l.code === code))
				.filter((line): line is (typeof mrtLines)[number] => !!line),
		[station],
	);

	useEffect(() => {
		if (!station || !coordinates) {
			console.error("station not found", stationName);
			return;
		}
		flyTo([coordinates.longitude, coordinates.latitude]);
		resetFocusedState();
		pullBackCard();
	}, [
		stationName,
		station,
		coordinates,
		flyTo,
		pullBackCard,
		resetFocusedState,
	]);

	if (!station || !coordinates) {
		return <div>Invalid MRT station</div>;
	}

	return (
		<>
			<Heading
				as="h1"
				size={{ initial: "7", sm: "8" }}
				mb="3"
				mt={{ initial: "2", sm: "4" }}
			>
				{station.name.en}
			</Heading>
			<Flex gap="2" mb="3" align="center">
				{lines.map((line) => (
					<Text
						key={line.code}
						size="2"
						weight="bold"
						className={styles.shortName}
						style={{ color: line.color }}
					>
						{line.displayCode}
					</Text>
				))}
				<Text size="2" color="gray">
					{station.code.join(" · ")}
				</Text>
			</Flex>

			{station.connections && (
				<Text color="gray" as="p" mb="3">
					{station.connections}
				</Text>
			)}

			{children}
		</>
	);
}
