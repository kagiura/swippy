"use client";

import { Button, Flex, Heading, Text } from "@radix-ui/themes";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo } from "react";

import StopTimings from "@/components/StopTimings";
import { getPublicBusStop } from "@/data/publicBus";
import { useMapState } from "@/utils/mapState";
import styles from "./layout.module.css";

export default function Story({ children }: { children: React.ReactNode }) {
	const { name, service } = useParams();
	const { flyTo, pullBackCard, resetFocusedState } = useMapState();
	const busStopCode = typeof name === "string" ? name : undefined;
	const serviceName = typeof service === "string" ? service : undefined;
	const backHref = serviceName && busStopCode ? `/stops/${busStopCode}` : "/";
	const stop = useMemo(
		() => (busStopCode ? getPublicBusStop(busStopCode) : undefined),
		[busStopCode],
	);
	useEffect(() => {
		if (!stop) {
			console.error("stop not found", name);
			return;
		}
		flyTo([stop.longitude, stop.latitude]);
		resetFocusedState();
		pullBackCard();
	}, [name, stop, flyTo, pullBackCard, resetFocusedState]);

	if (!stop || !busStopCode) {
		return <div>Invalid bus stop code</div>;
	}

	return (
		<>
			<Button asChild variant="ghost" size="2" mb="2">
				<Link href={backHref}>
					<IconArrowLeft size={16} />
					Back
				</Link>
			</Button>
			<Heading
				as="h1"
				size={{ initial: "7", sm: "8" }}
				mb="3"
				mt={{ initial: "2", sm: "4" }}
			>
				{stop.description}
			</Heading>
			<Flex gap="2" mb="3">
				<Heading
					as="h2"
					size="4"
					color="gray"
					mt="0"
					weight="medium"
					className={styles.shortName}
				>
					{stop.roadName}
				</Heading>
				<Text size="2" color="gray">
					Stop {stop.code}
				</Text>
			</Flex>

			<StopTimings busStopCode={stop.code} serviceToAppend={service as string}>
				{children}
			</StopTimings>
		</>
	);
}
