"use client";
import "maplibre-gl/dist/maplibre-gl.css";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import {
	CSSProperties,
	Dispatch,
	SetStateAction,
	useCallback,
	useMemo,
} from "react";
import ReactMapGL, {
	ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import { useWindowSize } from "usehooks-ts";

import MapMarkerYou from "./MapMarkerYou";

import BusLayer from "./BusLayer";

import { SINGAPORE_BOUNDS } from "@/data/bounds";
import isbStopsGeojson from "@/data/isbStopsGeojson";
import { useMapState } from "@/utils/mapState";

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
					setMapLoaded(true);
				} catch (error) {
					console.error("Failed to load image circle", error);
				}

				// map.on("styleimagemissing", () => {
				// 	console.warn("A styleimagemissing event occurred.");

				// 	map.loadImage("/circle2.png", (error, image) => {
				// 		if (error || !image) {
				// 			console.error("Failed to load image circle", error);
				// 			throw error;
				// 		}
				// 		// add image to the active style and make it SDF-enabled
				// 		map.addImage("circle", image, { sdf: true });
				// 	});
				// });
			}}
			interactiveLayerIds={[
				...isbStopsGeojson.features.map(
					(feature) => "isb-stops-layer" + feature.properties?.name,
				),
				...isbStopsGeojson.features.map(
					(feature) => "isb-stops-layer" + feature.properties?.name + "subtle",
				),
			]}
			onClick={(e) => {
				// console.log("Clicked features ", e.features, e);
				const feature = e.features?.[0];
				if (typeof feature === "undefined") {
					router.push("/");
					resetFocusedState();
					return;
				}
				console.info("Clicked feature:", feature);
				if (feature.source?.startsWith("isb-stops")) {
					const stopName = feature.properties?.name;
					const stop = isbStopsGeojson.features.find(
						(feature) => feature.properties?.name === stopName,
					);
					const service = feature.layer?.metadata
						? (feature.layer?.metadata as any)?.["mapbox:subtleService"]
						: undefined;
					if (typeof service === "string") {
						router.push(`/stops/${stopName}/${service}`);
					} else if (typeof stopName === "string") {
						router.push(`/stops/${stopName}`);
					}
				} else {
					router.push("/");
					resetFocusedState();
				}
			}}
		>
			{mapLoaded && (
				<>
					<MapMarkerYou />
					<BusLayer />
				</>
			)}
		</ReactMapGL>
	);
}

function BaseMap() {
	return null;
	/*
		The selected MapLibre style provides its own base map and labels. The old
		Mapbox Streets source cannot be referenced from a MapLibre style.
	*/
	/* return (
		<>
			<Layer
				{...{
					id: "poi-label",
					type: "symbol",
					source: "composite",
					"source-layer": "poi_label",
					minzoom: 6,
					filter: [
						"all",
						[
							"<=",
							["get", "filterrank"],
							[
								"+",
								["step", ["zoom"], 0, 16, 1, 17, 2],
								[
									"match",
									["get", "class"],
									"arts_and_entertainment",
									0,
									"commercial_services",
									0,
									"education",
									3,
									"food_and_drink",
									0,
									"food_and_drink_stores",
									0,
									"historic",
									0,
									"industrial",
									0,
									"landmark",
									0,
									"lodging",
									0,
									"medical",
									0,
									"motorist",
									0,
									"park_like",
									0,
									"place_like",
									0,
									"public_facilities",
									0,
									"religion",
									0,
									"sport_and_leisure",
									0,
									"store_like",
									0,
									"visitor_amenities",
									3,
									4,
								],
							],
						],
						[
							"step",
							["pitch"],
							true,
							50,
							["<", ["distance-from-center"], 2],
							60,
							["<", ["distance-from-center"], 2.5],
							70,
							["<", ["distance-from-center"], 3],
						],
					],
					layout: {
						"text-size": [
							"step",
							["zoom"],
							["step", ["get", "sizerank"], 18, 5, 12],
							17,
							["step", ["get", "sizerank"], 18, 13, 12],
						],
						"icon-image": "",
										"text-font": ["Noto Sans Regular"],
						"text-offset": [0, 0],
						"text-anchor": [
							"step",
							["zoom"],
							["step", ["get", "sizerank"], "center", 5, "top"],
							17,
							["step", ["get", "sizerank"], "center", 13, "top"],
						],
						"text-field": ["coalesce", ["get", "name_en"], ["get", "name"]],
					},
					paint: {
						"text-halo-color":
							theme === "dark" ? "hsl(0, 0%, 20%)" : "hsl(0, 0%, 100%)",
						"text-halo-width": 0.5,
						"text-halo-blur": 0.5,
						"text-color": "hsl(0, 0%, 60%)",
					},
				}}
			/>
		</>
	);
*/
}
