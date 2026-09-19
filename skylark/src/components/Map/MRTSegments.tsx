"use client";

import { memo } from "react";
import { Layer, Source } from "react-map-gl/maplibre";
import { mrtLines } from "@/data/mrt/mrtLines";
import { getMrtSegmentFeature } from "@/utils/generateSegment";
import { type FocusedSegment, useMapState } from "@/utils/mapState";

function MRTSegments() {
	const { focusedSegments } = useMapState();

	return (
		<>
			{focusedSegments
				.filter((segment) => segment.type === "mrt")
				.map((segment) => (
					<MemoizedMrtSegment
						key={`${segment.service}__${segment.from}__${segment.to}`}
						focusedSegment={segment}
					/>
				))}
		</>
	);
}

export default MRTSegments;

const MemoizedMrtSegment = memo(function MrtSegment({
	focusedSegment,
}: {
	focusedSegment: FocusedSegment;
}) {
	const line = mrtLines.find((l) => l.code.startsWith(focusedSegment.service));

	const paint =
		focusedSegment.status === "upcoming"
			? {
					"line-color": line?.color ?? "#000000",
					"line-width": 4.5,
					"line-opacity": 1,
				}
			: {
					"line-color": "#4d4d4d",
					"line-width": 2,
					"line-opacity": 1,
				};

	const feature = getMrtSegmentFeature(focusedSegment);
	if (!feature) return null;

	const id = `mrt-segment-${focusedSegment.service}__${focusedSegment.from}__${focusedSegment.to}`;

	return (
		<Source id={id} type="geojson" data={feature}>
			<Layer
				id={id}
				type="line"
				layout={{ "line-join": "round", "line-cap": "round" }}
				paint={paint}
			/>
		</Source>
	);
});
