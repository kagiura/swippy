export type LineCode =
	| "NSL"
	| "EWL"
	| "CGL"
	| "NEL"
	| "CCL"
	| "DTL"
	| "TEL"
	| "BPLRT"
	| "SKLRT"
	| "PGLRT";

// MRT only for now - LRT lines will be added once skylark supports them too.
export const LINE_CODES: LineCode[] = [
	"NSL",
	"EWL",
	"CGL",
	"NEL",
	"CCL",
	"DTL",
	"TEL",
	"BPLRT",
	"SKLRT",
	"PGLRT",
];

export type DisruptionEffect =
	| "no-service"
	| "reduced-service"
	| "delay"
	| "bridging-bus";

export interface DisruptionAlert {
	id: string;
	lineCode: LineCode;
	effect: DisruptionEffect;
	/** Station names as published by the source feed (pre-mapping). */
	affectedStations: string[];
	/** Bus stop codes serving as bridging bus stops, if effect is "bridging-bus". */
	bridgingBusStops?: string[];
	/** Human-readable text from the source, kept for debugging/display. */
	description: string;
	source: "live" | "simulated";
	createdAt: number;
}
