import { useTheme } from "next-themes";
import { Layer, Source } from "react-map-gl/maplibre";
import { mrtHighFi, mrtLines, mrtLowFi } from "@/data/mrt/mrtLines";
import mrtStations from "@/data/mrt/mrtStations";
import { railStations } from "@/data/railStations";

const LOW_HI_ZOOM = 12;

function MRTLayer() {
	const { resolvedTheme: theme } = useTheme();

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
		</>
	);
}
export default MRTLayer;
