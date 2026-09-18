"use client";

import { useTheme } from "next-themes";
import { Layer, Source } from "react-map-gl/maplibre";

import { mrtHighFi, mrtLowFi } from "@/data/mrt/mrtLines";

const mrtStationsGeojson = {
	type: "FeatureCollection" as const,
	features: [...mrtLowFi.stations.features, ...mrtHighFi.stations.features].map(
		(feature) => ({
			type: "Feature" as const,
			properties: {
				stationName: feature.properties.name,
			},
			geometry: feature.geometry,
		}),
	),
};

export default function MRTStations() {
	const { resolvedTheme: theme } = useTheme();

	return (
		<Source id="mrt-stations" type="geojson" data={mrtStationsGeojson}>
			<Layer
				id="mrt-stations-layer"
				type="symbol"
				minzoom={13}
				layout={{
					"icon-image": "map-bus",
					"icon-size": ["interpolate", ["linear"], ["zoom"], 13, 0, 16, 0.1],
				}}
				// paint={{
				// 	"icon-opacity": 0
				// }}
			/>
			<Layer
				id="mrt-stations-labels"
				type="symbol"
				minzoom={15}
				layout={{
					"text-field": ["get", "stationName"],
					"text-size": 11,
					"text-offset": [0, 1.1],
					"text-anchor": "top",
					"text-allow-overlap": false,
				}}
				paint={{
					"text-color": theme === "dark" ? "#f8fafc" : "#172554",
					"text-halo-color": theme === "dark" ? "#0f172a" : "#ffffff",
					"text-halo-width": 1.5,
				}}
			/>
		</Source>
	);
}
