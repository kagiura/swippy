import { cleanCoords } from "@turf/clean-coords";
import { union } from "@turf/union";
import type { FeatureCollection, Polygon } from "geojson";
import rawRailStation from "./AmendmenttoMP2014RailStation.json";

const railStationsGeojson = rawRailStation as FeatureCollection<Polygon>;

export const railStations = cleanCoords(union(railStationsGeojson)?.geometry);
