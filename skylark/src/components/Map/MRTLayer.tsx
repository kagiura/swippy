import { Layer, Source } from "react-map-gl/maplibre";
import { mrtHighFi, mrtLowFi } from "@/data/mrt/mrtLines";
import { railStations } from "@/data/railStations";

function MRTLayer() {
	// console.log("STATION", mrtLowFi, mrtHighFi);
	return (
		<Source id="mrt-lines" type="geojson" data={railStations}>
			{/* polygons showing station box outline */}
			<Layer
				id="mrt-lines-fill"
				type="fill"
				paint={{
					"fill-color": "#4e4e4e",
					// hide the fill at low zoom levels to reduce clutter
					"fill-opacity": ["interpolate", ["linear"], ["zoom"], 12, 0, 13, 0.2],
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
					"line-opacity": ["interpolate", ["linear"], ["zoom"], 12, 0, 13, 0.5],
				}}
			/>
		</Source>
	);
}
export default MRTLayer;
