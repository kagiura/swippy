import { useDebounce } from "@uidotdev/usehooks";
import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import { type LngLatLike, useMap } from "react-map-gl/maplibre";
import { useWindowSize } from "usehooks-ts";
import { DEFAULT_LAT, DEFAULT_LNG } from "@/data/geographicDefaults";
import isbStops from "@/data/isbStops";
import type { ISBStop } from "@/types/schema";
import { useDodgeUI } from "./useDodgeUI";

export type FocusedSegment = {
	from: string;
	to: string;
	// Hex WITH the #
	// color: string;
	service: string;
	type: "bus" | "mrt" | "other";
	status: "upcoming" | "passed";
};

export type FocusedStop = {
	name: string;
	// color: string;
	interchange?: boolean;
	service?: string;
	status: "upcoming" | "passed";
};

export const MapStateContext = createContext<{
	loaded: boolean;
	flyTo: (_: LngLatLike, _z?: number) => void;
	pushAwayCard: () => void;
	pullBackCard: () => void;
	levelOrdinal: number;
	setLevelOrdinal: React.Dispatch<React.SetStateAction<number>>;
	focusedStops: FocusedStop[];
	focusedSegments: FocusedSegment[];
	focusedStopName: string | null;
	focusedStop: ISBStop | null;
	setFocusedStops: React.Dispatch<React.SetStateAction<FocusedStop[]>>;
	setFocusedSegments: React.Dispatch<React.SetStateAction<FocusedSegment[]>>;
	setFocusedStopName: React.Dispatch<React.SetStateAction<string | null>>;
	resetFocusedState: () => void;
	lng: number;
	lat: number;
	zoom: number;
	debouncedLng: number;
	debouncedLat: number;
	debouncedZoom: number;
}>({
	loaded: false,
	flyTo: (_: LngLatLike) => {},
	levelOrdinal: 0,
	setLevelOrdinal: () => {},
	pushAwayCard: () => {},
	pullBackCard: () => {},
	setFocusedStops: () => {},
	setFocusedSegments: () => {},
	focusedStops: [],
	focusedSegments: [],
	focusedStopName: null,
	focusedStop: null,
	setFocusedStopName: () => {},
	resetFocusedState: () => {},
	lng: DEFAULT_LNG,
	lat: DEFAULT_LAT,
	zoom: 16,
	debouncedLng: DEFAULT_LNG,
	debouncedLat: DEFAULT_LAT,
	debouncedZoom: 16,
});

export function useMapState() {
	return useContext(MapStateContext);
}

export function MapStateProvider({
	children,
	loaded,
	pushAwayCard = () => {},
	pullBackCard = () => {},
	lng,
	lat,
	zoom,
}: {
	children: React.ReactNode;
	loaded: boolean;
	pushAwayCard: () => void;
	pullBackCard: () => void;
	lng: number;
	lat: number;
	zoom: number;
}) {
	const { map } = useMap();

	const [levelOrdinal, setLevelOrdinal] = useState<number>(0);
	const [focusedStops, setFocusedStops] = useState<FocusedStop[]>([]);
	const [focusedSegments, setFocusedSegments] = useState<FocusedSegment[]>([]);
	const [focusedStopName, setFocusedStopName] = useState<string | null>(null);

	const { dodge } = useDodgeUI();
	const focusedStop = useMemo(
		() => isbStops.find((stop) => stop.name === focusedStopName) || null,
		[focusedStopName],
	);
	const flyTo = useCallback(
		(position: LngLatLike, minZoom?: number) => {
			if (typeof map === "undefined") {
				// run it again when the map is ready
				setTimeout(() => flyTo(position, minZoom), 500);
				return;
			}

			const zoom = map.getZoom();
			const targetZoom = Math.max(minZoom || 16, zoom);
			// set the map's center to the spotlight point
			const adjustedPosition = dodge(position, targetZoom) || position;
			map.flyTo({
				center: adjustedPosition,
				zoom: targetZoom,
				speed: 1,
			});
		},
		[map, dodge],
	);

	const resetFocusedState = useCallback(() => {
		setFocusedStopName(null);
		setFocusedStops([]);
		setFocusedSegments([]);
	}, []);

	const debouncedLng = useDebounce(lng, 300);
	const debouncedLat = useDebounce(lat, 300);
	const debouncedZoom = useDebounce(zoom, 300);

	return (
		<MapStateContext.Provider
			value={{
				loaded,
				flyTo,
				levelOrdinal,
				setLevelOrdinal,
				pushAwayCard,
				pullBackCard,
				focusedStops,
				focusedSegments,
				focusedStopName,
				focusedStop,
				setFocusedStopName,
				setFocusedStops,
				setFocusedSegments,
				resetFocusedState,
				lng,
				lat,
				zoom,
				debouncedLng,
				debouncedLat,
				debouncedZoom,
			}}
		>
			{children}
		</MapStateContext.Provider>
	);
}
