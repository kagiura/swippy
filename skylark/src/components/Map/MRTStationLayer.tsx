import MRTAnimatedMarker from "./MRTAnimatedMarker";
import MRTSegments from "./MRTSegments";
import MRTStations from "./MRTStations";

function MRTStationLayer() {
	return (
		<>
			<MRTStations />
			<MRTAnimatedMarker />
			<MRTSegments />
		</>
	);
}
export default MRTStationLayer;
