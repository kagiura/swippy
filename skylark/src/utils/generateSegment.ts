import { decode, encode } from "@googlemaps/polyline-codec";
import { lineString, point } from "@turf/helpers";
import lineSlice from "@turf/line-slice";
import busRoutesRaw from "@/data/busrouter/v1/routes.min.json";
import busServicesRaw from "@/data/busrouter/v1/services.min.json";
import busStopsRaw from "@/data/busrouter/v1/stops.min.json";
import type { FocusedSegment } from "./mapState";

const busRoutes = busServicesRaw;
const busPolylineEncoded = busRoutesRaw;
const busStops = busStopsRaw;

export function getSegmentPolyline(segment: FocusedSegment) {
	const { from, to, service } = segment;
	const serviceRoute = busRoutes[service as keyof typeof busRoutes];
	if (!serviceRoute) return null;
	const fromStop = busStops[from as keyof typeof busStops];
	const toStop = busStops[to as keyof typeof busStops];
	if (!fromStop || !toStop) return null;

	// figure out which segment of the polyline corresponds to the from and to stops
	const segmentIndex = serviceRoute.routes.findIndex(
		(route) => route.includes(from) && route.includes(to),
	);
	if (segmentIndex === -1) return null;

	const polylineEncoded =
		busPolylineEncoded[service as keyof typeof busPolylineEncoded][
			segmentIndex
		];
	if (!polylineEncoded) return null;

	// decode() returns [lat, lng]. Turf needs [lng, lat].
	const coords = decode(polylineEncoded).map(([lat, lng]) => [lng, lat]);
	const line = lineString(coords);

	// Stop data is [lng, lat]. Confirm this for your data file.
	const start = point([fromStop[0], fromStop[1]] as number[]);
	const end = point([toStop[0], toStop[1]] as number[]);

	const sliced = lineSlice(start, end, line); // Feature<LineString>
	console.log("SLICED", sliced);
	return sliced;
}
