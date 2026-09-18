"use client";
import getDistance from "geolib/es/getPreciseDistance";
import "maplibre-gl/dist/maplibre-gl.css";
import { useTheme } from "next-themes";
import { useMemo } from "react";
import { Layer, Source } from "react-map-gl/maplibre";

import isbStopsGeojson from "@/data/isbStopsGeojson";
import { useMapState } from "@/utils/mapState";

function BusStops() {
	return (
		<>
			{isbStopsGeojson.features.map((feature) => (
				<ISBStop key={feature.properties?.name} feature={feature} />
			))}
		</>
	);
}
export default BusStops;

const DISALLOWED_PROXIMITY = 40;

function ISBStop({
	feature,
}: {
	feature: (typeof isbStopsGeojson.features)[0];
}) {
	const { resolvedTheme: theme } = useTheme();
	const { focusedStop, focusedStops } = useMapState();
	const id = feature.properties?.name;
	const newGeoJson = { ...isbStopsGeojson, features: [feature] };

	const status = useMemo(() => {
		if (!focusedStop) return "visible";
		if (focusedStop.name === id) return "hidden";
		const coordinates = (feature.geometry as any).coordinates;
		const distance = getDistance(
			{ longitude: coordinates[0], latitude: coordinates[1] },
			focusedStop,
		);
		return distance > DISALLOWED_PROXIMITY ? "visible" : "faded";
	}, [focusedStop, feature.geometry, id]);

	const subtleStop = focusedStops.find((stop) => stop.name === id);

	return (
		<Source id={`isb-stops${id}`} type="geojson" data={newGeoJson}>
			<Layer
				id={`isb-stops-layer${id}`}
				type="symbol"
				layout={{
					"symbol-sort-key": feature.properties?.priority || 1,
					visibility:
						status !== "hidden" && focusedStops.length === 0
							? "visible"
							: "none",
					"icon-image": "circle",
					"icon-size": 0.16,
					"text-field": ["get", "ShortName"],
					"text-variable-anchor": ["left", "right", "top", "bottom"],
					"text-radial-offset": 0.75,
					"text-justify": "auto",
					"text-font": ["Noto Sans Regular"],
					"text-size": 14,
				}}
				paint={{
					"text-color": theme === "dark" ? "#ffffff" : "#111111",
					"text-halo-color": theme === "dark" ? "#111111" : "#ffffff",
					"text-halo-width": 2,
					"icon-opacity": status === "faded" ? 0.25 : 1,
					"text-opacity": status === "faded" ? 0.25 : 1,
				}}
			/>
			<Layer
				id={`isb-stops-layer${id}-subtle`}
				type="symbol"
				layout={{
					visibility: subtleStop ? "visible" : "none",
					"icon-image": "circle",
					"icon-size": 0.5,
					"icon-allow-overlap": true,
					"text-allow-overlap": false,
					"text-field": ["get", "ShortName"],
					"text-variable-anchor": ["left", "right", "top", "bottom"],
					"text-radial-offset": 0.5,
					"text-justify": "auto",
					"text-font": ["Noto Sans Regular"],
					"text-size": 14,
				}}
				paint={{
					"icon-color": "#fff",
					"icon-halo-color": subtleStop?.color || "#000",
					"icon-halo-width": 1.25,
					"text-color": theme === "dark" ? "#ffffff" : "#111111",
					"text-halo-color": theme === "dark" ? "#111111" : "#ffffff",
					"text-halo-width": 2,
				}}
				metadata={{
					"skylark:subtleStop": !!subtleStop,
					"skylark:subtleService": subtleStop?.service,
				}}
			/>
		</Source>
	);
}
