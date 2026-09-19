import { useTheme } from "next-themes";
import { Layer, Source } from "react-map-gl/maplibre";
import { mrtHighFi, mrtLines, mrtLowFi } from "@/data/mrt/mrtLines";
import mrtStations from "@/data/mrt/mrtStations";
import { railStations } from "@/data/railStations";
import { useMapState } from "@/utils/mapState";

const LOW_HI_ZOOM = 14;

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

function MRTLayer() {
	const { resolvedTheme: theme } = useTheme();
	const { focusedSegments } = useMapState();

	const backgroundColor = theme === "dark" ? "#000000" : "#ffffff";
	// console.log("STATION", mrtLowFi, mrtHighFi);
	const stationGeos = {
		lowFi: mrtLowFi.stations,
		highFi: mrtHighFi.stations,
	};
	return (
		<>
			<Source id="mrt-lines" type="geojson" data={railStations}>
				{/* polygons showing station box outline */}
				<Layer
					id="mrt-lines-fill"
					type="fill"
					paint={{
						"fill-color": "#4e4e4e",
						// hide the fill at low zoom levels to reduce clutter
						"fill-opacity": [
							"interpolate",
							["linear"],
							["zoom"],
							12,
							0,
							13,
							0.2,
						],
					}}
				/>
				{/* lines showing station box outline */}
				<Layer
					id="mrt-lines-outline"
					type="line"
					paint={{
						"line-color": "#4e4e4e",
						"line-width": 2,
						// hide the outline at low zoom levels to reduce clutter
						"line-opacity": [
							"interpolate",
							["linear"],
							["zoom"],
							12,
							0,
							13,
							0.5,
						],
					}}
				/>
			</Source>
			{mrtLines.map((line) => (
				<>
					<Source
						key={line.code}
						id={`mrt-line-${line.code}`}
						type="geojson"
						data={{
							type: "FeatureCollection",
							features: mrtLowFi.segments.features.filter(
								(f) => f.properties.line === line.code,
							),
						}}
					>
						<Layer
							id={`mrt-line-${line.code}-line`}
							type="line"
							paint={{
								"line-color": line.color,
								"line-width": 3,
							}}
							maxzoom={LOW_HI_ZOOM}
						/>
					</Source>
					<Source
						key={`mrt-line-${line.code}-highfi`}
						id={`mrt-line-${line.code}-highfi`}
						type="geojson"
						data={{
							type: "FeatureCollection",
							features: mrtHighFi.segments.features.filter(
								(f) => f.properties.line === line.code,
							),
						}}
					>
						<Layer
							id={`mrt-line-${line.code}-line-highfi`}
							type="line"
							paint={{
								"line-color": line.color,
								"line-width": 3,
							}}
							minzoom={LOW_HI_ZOOM}
						/>
					</Source>
				</>
			))}
			{mrtStations.map((station) => {
				const stationName = station.name.en;
				const stationGeo = {
					lowFi: stationGeos.lowFi.features.filter(
						(f) => f.properties.name === stationName,
					),
					highFi: stationGeos.highFi.features.filter(
						(f) => f.properties.name === stationName,
					),
				};
				if (!stationGeo.lowFi.length || !stationGeo.highFi.length) {
					return null;
				}

				return (
					<>
						{stationGeo.lowFi.map((geo) => {
							const line =
								geo.properties.lines.length === 1
									? mrtLines.find((l) => l.code === geo.properties.lines[0])
									: null;
							const interchange = geo.properties.lines.length > 1;
							return (
								<Source
									key={`mrt-station-${stationName}-lowfi-${geo.properties.lines}`}
									id={`mrt-station-${stationName}-lowfi-${geo.properties.lines}`}
									type="geojson"
									data={{
										type: "FeatureCollection",
										features: [geo],
									}}
								>
									<Layer
										id={`mrt-station-${stationName}-circle-lowfi-${geo.properties.lines}`}
										type="circle"
										paint={{
											"circle-color": interchange ? "#ffffff" : backgroundColor,
											"circle-radius": interchange
												? 4
												: ["interpolate", ["linear"], ["zoom"], 10, 0, 12, 3],
											"circle-stroke-color": !line ? "#000" : line.color,
											"circle-stroke-width": 2,
										}}
										maxzoom={LOW_HI_ZOOM}
									/>
								</Source>
							);
						})}
						{stationGeo.highFi.map((geo) => {
							const line =
								geo.properties.lines.length === 1
									? mrtLines.find((l) => l.code === geo.properties.lines[0])
									: null;
							const interchange = geo.properties.interchange;
							return (
								<Source
									key={`mrt-station-${stationName}-highfi-${geo.properties.lines}`}
									id={`mrt-station-${stationName}-highfi-${geo.properties.lines}`}
									type="geojson"
									data={{
										type: "FeatureCollection",
										features: [geo],
									}}
								>
									<Layer
										id={`mrt-station-${stationName}-circle-highfi-${geo.properties.lines}`}
										type="circle"
										paint={{
											"circle-color": interchange ? "#ffffff" : backgroundColor,
											"circle-radius": interchange
												? 4
												: ["interpolate", ["linear"], ["zoom"], 10, 0, 12, 3],
											"circle-stroke-color": !line ? "#000" : line.color,
											"circle-stroke-width": 2,
										}}
										minzoom={LOW_HI_ZOOM}
									/>
								</Source>
							);
						})}
					</>
				);
			})}
			<Source id="mrt-stations" type="geojson" data={mrtStationsGeojson}>
				<Layer
					id="mrt-stations-layer"
					type="symbol"
					layout={{
						"icon-image": "map-bus",
						"icon-size": 0.2,
						"icon-allow-overlap": true,
						"text-allow-overlap": true,
					}}
					paint={{
						"icon-opacity": 0,
					}}
				/>
			</Source>

			{/* station labels are a bit more complicated. for low fidelity zoom levels, just show it next to the low fidelity stations
					for high fidelity, there are multiple markers for interchanges, so we only pick one interchange to use with the label */}

			<Source
				id="mrt-stations-labels-low"
				type="geojson"
				data={stationGeos.lowFi}
			>
				<Layer
					id="mrt-stations-labels-low"
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
		</>
	);
}
export default MRTLayer;
