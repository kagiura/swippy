/** biome-ignore-all lint/a11y/useAltText: placeholder marker icon */
/** biome-ignore-all lint/performance/noImgElement: static marker icon */
import { AnimatePresence, motion } from "motion/react";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { Marker } from "react-map-gl/maplibre";
import { mrtLines } from "@/data/mrt/mrtLines";
import {
	getMrtStation,
	getMrtStationCoordinates,
} from "@/data/mrt/mrtStations";
import styles from "./MRTAnimatedMarker.module.css";

export default function MRTAnimatedMarker() {
	const { name } = useParams<{ name?: string }>();
	const station = useMemo(
		() => (name ? getMrtStation(decodeURIComponent(name)) : undefined),
		[name],
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

	if (!station || !coordinates) return null;

	return (
		<Marker
			latitude={coordinates.latitude}
			longitude={coordinates.longitude}
			anchor="center"
		>
			<div className={styles.mrtStationReactMarker}>
				<AnimatePresence>
					<motion.div
						transition={{
							type: "spring",
							bounce: 0.5,
						}}
						initial={{
							scale: 0.7,
							x: "-50%",
							y: "-20%",
							rotate: -6,
							opacity: 0,
						}}
						animate={{
							scale: 1,
							x: "-50%",
							y: "-110%",
							rotate: 0,
							opacity: 1,
						}}
						exit={{
							scale: 0.9,
							x: "-50%",
							y: "-110%",
							rotate: 0,
							opacity: 0,
						}}
						className={styles.mrtStationLines}
					>
						{lines.map((line) => (
							<motion.div
								key={line.code}
								className={styles.mrtStationLine}
								style={{
									backgroundColor: line.color,
								}}
							>
								{line.displayCode}
							</motion.div>
						))}
					</motion.div>
				</AnimatePresence>
				<motion.div animate={{ scale: 1 }} initial={{ scale: 0 }}>
					<div className={styles.mrtStationMarker}>
						<img src="/map-bus.png" width={48} height={48} />
					</div>
				</motion.div>
				<motion.div
					transition={{
						type: "spring",
						bounce: 0.5,
					}}
					initial={{
						scale: 0.7,
						x: "-50%",
						y: "-110%",
						rotate: 6,
						opacity: 0,
					}}
					animate={{
						scale: 1,
						x: "-50%",
						y: "-10%",
						rotate: 0,
						opacity: 1,
					}}
					className={styles.mrtStationName}
				>
					{station.name.en}
				</motion.div>
			</div>
		</Marker>
	);
}
