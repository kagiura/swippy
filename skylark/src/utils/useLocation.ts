// react hook to get user's current location
import { ISB_BOUNDS, NUS_CAMPUS_BOUNDS, SINGAPORE_BOUNDS } from "@/data/bounds";
import { booleanPointInPolygon } from "@turf/boolean-point-in-polygon";
import { useGeolocation } from "@uidotdev/usehooks";
import { useMemo, useRef } from "react";

const IT_LAT = 1.29731;
const IT_LNG = 103.77281;

const DEFUALT_LOCATION = {
	// lat: IT_LAT,
	// lng: IT_LNG,
	// latitude: IT_LAT,
	// longitude: IT_LNG,
};

type LocationDetails = {
	withinSingaporeBounds: boolean;
	withinNusBounds: boolean;
	withinIsbBounds: boolean;
};

type Location = (
	| {
			isLocationActive: false;
			timestamp: null;
			error: null;
			loading: true;
						isLocationStale: boolean;
			lat: undefined;
			lng: undefined;
			latitude: undefined;
			longitude: undefined;
	  }
	| {
			isLocationActive: true;
			timestamp: number;
			error: false;
			loading: false;
						isLocationStale: boolean;
			lat: number;
			lng: number;
			latitude: number;
			longitude: number;
	  }
	| {
			isLocationActive: false;
			timestamp: null;
			error: GeolocationPositionError;
			loading: false;
						isLocationStale: boolean;
			lat: undefined;
			lng: undefined;
			latitude: undefined;
			longitude: undefined;
	  }
) &
	LocationDetails;

// wrapper for useGeoLocation
export default function useLocation() {
	const {
		latitude, longitude,
		error,
		timestamp,
		loading,
	} = useGeolocation({
		enableHighAccuracy: true,
		maximumAge: 1000 * 20, // 20 secs
	});

	const lastKnownLocation = useRef<{
		latitude: number;
		longitude: number;
		timestamp: number;
	} | null>(null);

	if (latitude !== null && latitude !== undefined && longitude !== null && longitude !== undefined && timestamp) {
		lastKnownLocation.current = { latitude, longitude, timestamp };
	}

	const useCachedLocation = error?.code === 2 && lastKnownLocation.current !== null;
	const locationLatitude = useCachedLocation
		? lastKnownLocation.current?.latitude
		: latitude;
	const locationLongitude = useCachedLocation
		? lastKnownLocation.current?.longitude
		: longitude;

	// const [latitude, longitude] = [1.2951672158718233, 103.77116009853599];
	// const latitude = IT_LAT;
	// const longitude = IT_LNG;

	const withinSingaporeBounds = useMemo(() => {
				if (locationLatitude == null || locationLongitude == null) return false;
		return booleanPointInPolygon([locationLongitude, locationLatitude], SINGAPORE_BOUNDS);
	}, [locationLatitude, locationLongitude]);

	const withinNusBounds = useMemo(() => {
				if (locationLatitude == null || locationLongitude == null) return false;
		return (
			NUS_CAMPUS_BOUNDS.features.findIndex((f) => {
				return booleanPointInPolygon([locationLongitude, locationLatitude], f);
			}) !== -1
		);
	}, [locationLatitude, locationLongitude]);

	const withinIsbBounds = useMemo(() => {
				if (locationLatitude == null || locationLongitude == null) return false;
		return (
			ISB_BOUNDS.features.findIndex((f) => {
				return booleanPointInPolygon([locationLongitude, locationLatitude], f);
			}) !== -1
		);
	}, [locationLatitude, locationLongitude]);

	if (loading) {
		return {
			isLocationActive: false,
			error: null,
			loading,
						isLocationStale: false,
			timestamp: null,
			withinSingaporeBounds,
			withinNusBounds,
			withinIsbBounds,
			...DEFUALT_LOCATION,
		} as Location;
	}
	if (useCachedLocation && lastKnownLocation.current) {
		return {
			isLocationActive: true,
			error: false,
			loading: false,
			isLocationStale: true,
			timestamp: lastKnownLocation.current.timestamp,
			withinSingaporeBounds,
			withinNusBounds,
			withinIsbBounds,
			lat: lastKnownLocation.current.latitude,
			lng: lastKnownLocation.current.longitude,
			latitude: lastKnownLocation.current.latitude,
			longitude: lastKnownLocation.current.longitude,
		} as Location;
	}

	if (error || latitude == null || longitude == null || !timestamp) {
		console.error(error, {
			latitude,
			longitude,
			timestamp,
		});
		return {
			isLocationActive: false,
			error,
			loading,
						isLocationStale: false,
			timestamp,
			withinSingaporeBounds,
			withinNusBounds,
			withinIsbBounds,
			...DEFUALT_LOCATION,
		} as Location;
	}

	return {
		isLocationActive: true,
		error: false,
		loading,
				isLocationStale: false,
		timestamp,
		withinSingaporeBounds,
		withinNusBounds,
		withinIsbBounds,
		lat: latitude,
		lng: longitude,
		latitude,
		longitude,
	} as Location;
}
