import BusAnimatedMarker from "./BusAnimatedMarker";
import BusSegments from "./BusSegments";
import BusStops from "./BusStops";

function BusLayer() {
	return (
		<>
			<BusStops />
			<BusAnimatedMarker />
			<BusSegments />
		</>
	);
}
export default BusLayer;
