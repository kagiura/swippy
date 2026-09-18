"use client";
import "maplibre-gl/dist/maplibre-gl.css";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
	type CSSProperties,
	type Dispatch,
	type SetStateAction,
	useCallback,
	useMemo,
} from "react";
import ReactMapGL, { type ViewStateChangeEvent } from "react-map-gl/maplibre";
import { useWindowSize } from "usehooks-ts";
import { SINGAPORE_BOUNDS } from "@/data/bounds";
import { useMapState } from "@/utils/mapState";
import BusLayer from "./BusLayer";
import MapMarkerYou from "./MapMarkerYou";
import MRTLayer from "./MRTLayer";

const mapStyles: CSSProperties = {
	width: "100vw",
	height: "100vh",
	position: "fixed",
	top: 0,
	marginBottom: "-100vh",
};

export default function Map({
	pushAwayCard,
	pullBackCard,
	mapLoaded,
	setMapLoaded,
	lat,
	setLat,
	lng,
	setLng,
	zoom,
	setZoom,
}: {
	pushAwayCard: () => void;
	pullBackCard: () => void;
	mapLoaded: boolean;
	setMapLoaded: (loaded: boolean) => void;
	lat: number;
	setLat: Dispatch<SetStateAction<number>>;
	lng: number;
	setLng: Dispatch<SetStateAction<number>>;
	zoom: number;
	setZoom: Dispatch<SetStateAction<number>>;
}) {
	const router = useRouter();
	const { width: pageWidth, height } = useWindowSize();

	// const mapContainer = useRef<HTMLDivElement>(null);

	const { resetFocusedState } = useMapState();
	const { resolvedTheme: theme } = useTheme();

	const desktop = useMemo(() => pageWidth > 768, [pageWidth]);

	const onMapMove = useCallback(
		(e: ViewStateChangeEvent) => {
			setLng(e.viewState.longitude);
			setLat(e.viewState.latitude);
			setZoom(e.viewState.zoom);

			const originalEvent = (e as any).originalEvent;
			if (!originalEvent) return;

			let lowestX = pageWidth;
			let lowestY = 0;
			if (
				originalEvent.type === "mousemove" &&
				typeof (originalEvent as MouseEvent).clientX === "number" &&
				typeof (originalEvent as MouseEvent).clientY === "number"
			) {
				lowestX = (originalEvent as MouseEvent).clientX;
				lowestY = (originalEvent as MouseEvent).clientY;
			}
			if (
				originalEvent.type === "touchmove" &&
				(originalEvent as TouchEvent).touches.length > 0
			)
				[...(originalEvent as TouchEvent).touches].forEach((touch) => {
					lowestX = Math.min(lowestX, touch.clientX);
					lowestY = Math.max(lowestY, touch.clientY);
				});

			if (desktop && lowestX < 350 + 16 * 1.5 * 2) {
				pushAwayCard();
			} else if (!desktop && lowestY > height * 0.45) {
				pushAwayCard();
			}
		},
		[desktop, height, pageWidth, pushAwayCard, setLat, setLng, setZoom],
	);

	return (
		<ReactMapGL
			reuseMaps
			id="map"
			latitude={lat}
			longitude={lng}
			zoom={zoom}
			maxPitch={60}
			minZoom={11}
			maxBounds={[
				SINGAPORE_BOUNDS.geometry.coordinates[0][1] as [number, number],
				SINGAPORE_BOUNDS.geometry.coordinates[0][3] as [number, number],
			]}
			style={mapStyles}
			onMove={onMapMove}
			mapStyle={
				theme === "dark"
					? "https://tiles.openfreemap.org/styles/dark"
					: "https://tiles.openfreemap.org/styles/positron"
			}
			// ISB-flat\
			onLoad={async (e) => {
				const map = e.target;
				try {
					const { data: image } = await map.loadImage("/circle2.png");
					if (!map.hasImage("circle")) {
						map.addImage("circle", image, { sdf: true });
					}
				} catch (error) {
					console.error("Failed to load image circle", error);
				}
				try {
					const { data: image } = await map.loadImage("/map-bus.png");
					if (!map.hasImage("map-bus")) {
						map.addImage("map-bus", image);
					}
				} catch (error) {
					console.error("Failed to load image", error);
				}

				setMapLoaded(true);
			}}
			interactiveLayerIds={[
				"datamall-bus-stops-layer",
				"datamall-bus-stops-labels",
			]}
			onClick={(e) => {
				// console.log("Clicked features ", e.features, e);
				const feature = e.features?.[0];
				if (typeof feature === "undefined") {
					const r = 16; // pixels
					const bbox = [
						[e.point.x - r, e.point.y - r],
						[e.point.x + r, e.point.y + r],
					] as [[number, number], [number, number]];

					const nearFeatures = e.target.queryRenderedFeatures(bbox, {
						layers: ["datamall-bus-stops-layer", "datamall-bus-stops-labels"],
					});
					if (nearFeatures.length) {
						// find nearest feature
						const clickedLngLat = e.lngLat;
						const nearestFeature = nearFeatures.reduce(
							(nearest, feature) => {
								const featureLngLat =
									feature.geometry.type === "Point"
										? {
												lng: feature.geometry.coordinates[0],
												lat: feature.geometry.coordinates[1],
											}
										: null;
								if (!featureLngLat) return nearest;

								const distance = Math.sqrt(
									(clickedLngLat.lng - featureLngLat.lng) ** 2 +
										(clickedLngLat.lat - featureLngLat.lat) ** 2,
								);
								if (distance < nearest.distance) {
									return { feature, distance };
								}
								return nearest;
							},
							{ feature: null as any, distance: Infinity },
						);

						const zoomLevel = e.target.getZoom();

						if (nearestFeature.feature) {
							const busStopCode =
								nearestFeature.feature.properties?.busStopCode;
							if (typeof busStopCode === "string" && zoomLevel >= 14.5) {
								router.push(`/stops/${busStopCode}`);
								return;
							}
						}
					}

					router.push("/");
					resetFocusedState();
					return;
				}
				if (feature.layer?.id.startsWith("datamall-bus-stops")) {
					const busStopCode = feature.properties?.busStopCode;
					const zoomLevel = e.target.getZoom();
					if (typeof busStopCode === "string" && zoomLevel >= 14.5) {
						router.push(`/stops/${busStopCode}`);
					}
					return;
				}

				router.push("/");
				resetFocusedState();
			}}
		>
			{mapLoaded && (
				<>
					<MapMarkerYou />
					<MRTLayer />
					<BusLayer />
				</>
			)}
		</ReactMapGL>
	);
}
