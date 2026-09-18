"use client";

import { useTheme } from "next-themes";
import { Layer, Source } from "react-map-gl/maplibre";

import busStops from "@/data/busrouter/v1/raw/bus-stops.datamall.json";

const busStopsGeojson = {
	type: "FeatureCollection" as const,
	features: busStops.map((stop) => ({
		type: "Feature" as const,
		properties: {
			busStopCode: stop.BusStopCode,
			roadName: stop.RoadName,
			description: stop.Description,
		},
		geometry: {
			type: "Point" as const,
			coordinates: [stop.Longitude, stop.Latitude],
		},
	})),
};

export default function BusStops() {
	const { resolvedTheme: theme } = useTheme();

	return (
		<Source id="datamall-bus-stops" type="geojson" data={busStopsGeojson}>
			<Layer
				id="datamall-bus-stops-layer"
				type="circle"
				paint={{
					"circle-color": theme === "dark" ? "#f8fafc" : "#2563eb",
					"circle-radius": ["interpolate", ["linear"], ["zoom"], 11, 2, 16, 4],
					"circle-stroke-color": theme === "dark" ? "#1e293b" : "#ffffff",
					"circle-stroke-width": 1,
				}}
			/>
			<Layer
				id="datamall-bus-stops-labels"
				type="symbol"
				minzoom={15}
				layout={{
					"text-field": ["get", "busStopCode"],
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
