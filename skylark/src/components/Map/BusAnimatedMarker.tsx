/** biome-ignore-all lint/a11y/useAltText: <explanation> */
/** biome-ignore-all lint/performance/noImgElement: <explanation> */
import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { Marker } from "react-map-gl/maplibre";
import {
	getPublicBusServicesForStop,
	getPublicBusStop,
	PUBLIC_BUS_SERVICE_COLOR,
} from "@/data/publicBus";
import sortBus from "@/utils/sortBus";
import styles from "./BusAnimatedMarker.module.css";

export default function BusAnimatedMarker() {
	const { name } = useParams<{ name?: string }>();
	const stop = useMemo(
		() => (name ? getPublicBusStop(name) : undefined),
		[name],
	);
	const services = useMemo(
		() => (stop ? getPublicBusServicesForStop(stop.code) : []),
		[stop],
	);

	if (!stop) return null;

	return (
		<Marker latitude={stop.latitude} longitude={stop.longitude} anchor="center">
			<div className={styles.busStopReactMarker}>
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
						className={styles.busStopServices}
					>
						{services
							.sort((a, b) => sortBus(a.serviceNo, b.serviceNo))
							.map((service) => (
								<motion.div
									key={service.serviceNo}
									className={clsx(
										styles.busStopService,
										service.name.length > 2 && styles.smallText,
									)}
									style={{
										backgroundColor: PUBLIC_BUS_SERVICE_COLOR,
									}}
								>
									{service.serviceNo}
								</motion.div>
							))}
					</motion.div>
				</AnimatePresence>
				<motion.div animate={{ scale: 1 }} initial={{ scale: 0 }}>
					<div className={styles.busStopMarker}>
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
					className={styles.busStopName}
				>
					{stop.description}
				</motion.div>
			</div>
			{/* <div className={styles.busStopReactMarker}>
				<AnimatePresence>
					<motion.div
						transition={{ type: "spring", bounce: 0.5 }}
						initial={{
							scale: 0.7,
							x: "-50%",
							y: "-20%",
							rotate: -6,
							opacity: 0,
						}}
						animate={{ scale: 1, x: "-50%", y: "-100%", rotate: 0, opacity: 1 }}
						exit={{ scale: 0.9, x: "-50%", y: "-100%", rotate: 0, opacity: 0 }}
						className={styles.busStopServices}
					>
						{services.map((service) => (
							<div
								key={service.serviceNo}
								className={clsx(
									styles.busStopService,
									service.serviceNo.length > 2 && styles.smallText,
								)}
								style={{ backgroundColor: PUBLIC_BUS_SERVICE_COLOR }}
							>
								{service.serviceNo}
							</div>
						))}
					</motion.div>
				</AnimatePresence>
				<motion.div animate={{ scale: 1 }} initial={{ scale: 0 }}>
					<div className={styles.busStopMarker}>
						<img src="/map-bus.png" width={48} height={48} />
					</div>
				</motion.div>
				<motion.div
					transition={{ type: "spring", bounce: 0.5 }}
					initial={{ scale: 0.7, x: "-50%", y: "-100%", rotate: 6, opacity: 0 }}
					animate={{ scale: 1, x: "-50%", y: "-10%", rotate: 0, opacity: 1 }}
					className={styles.busStopName}
				>
					{stop.description}
				</motion.div>
			</div> */}
		</Marker>
	);
}
