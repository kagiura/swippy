import { useParams } from "next/navigation";
import { Marker } from "react-map-gl/maplibre";
import { CSSProperties } from "react";
import useSWR from "swr";

import styles from "./BusLiveMarker.module.css";

import NUSIsbHeading from "@/assets/NUSIsbHeading";
import isbServices from "@/data/isbServices";
import { getISBPositionsAll } from "@/utils/api";

export default function BusLiveMarker() {
	const { data, isLoading } = useSWR("all", getISBPositionsAll, {
		refreshInterval: 1000 * 15,
	});
	const { service: serviceParam } = useParams();

	if (isLoading || !data) return null;

	return data.flatMap((service) =>
		service.activebus.map((bus) => {
			const serviceDetails = isbServices.find(
				(item) => item.name === service.service,
			);
			if (!serviceDetails) return null;
			if (
				typeof serviceParam === "string" &&
				serviceDetails.name !== serviceParam
			)
				return null;

			return (
				<Marker
					key={`marker-${bus.vehplate}`}
					longitude={bus.lng}
					latitude={bus.lat}
					anchor="center"
					rotation={bus.direction}
					rotationAlignment="map"
					onClick={(event) => event.originalEvent.stopPropagation()}
				>
					<div
						className={styles.busMarker}
						style={{
							"--color-primary": serviceDetails.color,
							"--color-secondary": "white",
							"--color-occupancy": `var(--${
								bus.loadInfo.crowdLevel === "low"
									? "green-10"
									: bus.loadInfo.crowdLevel === "medium"
										? "orange-10"
										: "red-10"
							})`,
						} as CSSProperties}
					>
						<NUSIsbHeading width={16} height={16} />
					</div>
				</Marker>
			);
		}),
	);
}
