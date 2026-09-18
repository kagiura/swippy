"use client";

import { memo } from "react";
import { Layer, Source } from "react-map-gl/maplibre";
import { PUBLIC_BUS_SERVICE_COLOR } from "@/data/publicBus";
import { getSegmentPolyline } from "@/utils/generateSegment";
import { type FocusedSegment, useMapState } from "@/utils/mapState";

function BusSegments() {
	const { focusedSegments } = useMapState();

	return (
		<>
			{focusedSegments.map((segment) => (
				<MemoizedBusSegment
					key={`${segment.from}__${segment.to}`}
					focusedSegment={segment}
				/>
			))}
		</>
	);
}

export default BusSegments;

const MemoizedBusSegment = memo(function BusSegment({
	focusedSegment,
}: {
	focusedSegment: FocusedSegment;
}) {
	const paint =
		focusedSegment.status === "upcoming"
			? {
					"line-color": PUBLIC_BUS_SERVICE_COLOR,
					"line-width": 4.5,
					"line-opacity": 1,
				}
			: {
					"line-color": "#4d4d4d",
					"line-width": 2,
					"line-opacity": 1,
				};

	const polyline = getSegmentPolyline(focusedSegment);
	if (!polyline) return null;

	return (
		<Source
			id={`${focusedSegment.from}__${focusedSegment.to}`}
			type="geojson"
			data={polyline}
		>
			<Layer
				id={`${focusedSegment.from}__${focusedSegment.to}`}
				type="line"
				layout={{ "line-join": "round", "line-cap": "round" }}
				paint={paint}
			/>
		</Source>
	);
});
