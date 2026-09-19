"use client";

import { useCallback, useEffect, useState } from "react";

export type SavedPlace = {
	label: string;
	latitude: number;
	longitude: number;
};

type SavedPlaces = {
	home?: SavedPlace;
	work?: SavedPlace;
};

const STORAGE_KEY = "swippy:savedPlaces";
const CHANGE_EVENT = "swippy:saved-places-changed";

function readSavedPlaces(): SavedPlaces {
	if (typeof window === "undefined") return {};
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as SavedPlaces) : {};
	} catch {
		return {};
	}
}

function writeSavedPlaces(places: SavedPlaces) {
	window.localStorage.setItem(STORAGE_KEY, JSON.stringify(places));
	// storage event doesn't fire in the tab that made the change, so broadcast one ourselves.
	window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

export function useSavedPlaces() {
	const [places, setPlaces] = useState<SavedPlaces>({});

	useEffect(() => {
		setPlaces(readSavedPlaces());

		function handleChange() {
			setPlaces(readSavedPlaces());
		}

		window.addEventListener("storage", handleChange);
		window.addEventListener(CHANGE_EVENT, handleChange);
		return () => {
			window.removeEventListener("storage", handleChange);
			window.removeEventListener(CHANGE_EVENT, handleChange);
		};
	}, []);

	const setHome = useCallback((place: SavedPlace | null) => {
		const next = { ...readSavedPlaces(), home: place ?? undefined };
		writeSavedPlaces(next);
		setPlaces(next);
	}, []);

	const setWork = useCallback((place: SavedPlace | null) => {
		const next = { ...readSavedPlaces(), work: place ?? undefined };
		writeSavedPlaces(next);
		setPlaces(next);
	}, []);

	return {
		home: places.home ?? null,
		work: places.work ?? null,
		setHome,
		setWork,
	};
}
