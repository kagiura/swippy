"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { memo, useMemo } from "react";
import { Layer, Source } from "react-map-gl/maplibre";

import isbStopPairs from "@/data/isbStopPairs";
import isbStopPairGeojson from "@/data/isbStopPairsGeojson";
import { FocusedSegment, useMapState } from "@/utils/mapState";

function BusSegments() {
	const { focusedSegments } = useMapState();
	const stopPairSource = useMemo(() => {
		return isbStopPairs.map((pair) => (
			<Source
				key={pair.fromName + "__" + pair.toName}
				id={pair.fromName + "__" + pair.toName}
				type="geojson"
				data={isbStopPairGeojson(pair.fromName, pair.toName)}
			/>
		));
	}, []);

	return (
		<>
			{stopPairSource}
			{isbStopPairs.map((pair) => {
				const focus = focusedSegments.find(
					(segment) =>
						segment.from === pair.fromName && segment.to === pair.toName,
				);

				return (
					<MemoizedBusSegment
						key={pair.fromName + "__" + pair.toName}
						pair={pair}
						focusedSegment={focus}
					/>
				);
			})}
		</>
	);
}

export default BusSegments;

const MemoizedBusSegment = memo(function BusSegment({
	pair,
	focusedSegment,
}: {
	pair: (typeof isbStopPairs)[0];
	focusedSegment?: FocusedSegment;
}) {
	const paint = focusedSegment
		? {
				"line-color": focusedSegment.color,
				"line-width": 4.5,
				"line-opacity": 1,
			}
		: {
				"line-color": "#ffffff",
				"line-width": 0,
				"line-opacity": 0,
			};

	return (
		<Layer
			id={pair.fromName + "__" + pair.toName}
			type="line"
			source={pair.fromName + "__" + pair.toName}
			layout={{ "line-join": "round", "line-cap": "round" }}
			paint={paint}
		/>
	);
});
