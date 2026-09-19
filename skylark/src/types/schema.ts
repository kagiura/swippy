import {
	array,
	boolean,
	date,
	type InferOutput,
	nullable,
	number,
	object,
	optional,
	picklist,
	string,
} from "valibot";

export const ShuttleSchema = object({
	/** Name of service */
	name: string(),
	/** Route ID of the shuttle */
	routeid: number(),
	/** Bus stop code */
	busstopcode: string(),
	_etas: optional(
		array(
			object({
				/** License plate of the shuttle */
				plate: string(),
				/** @deprecated */
				px: string(),
				/** Time started */
				ts: string(),
				/** Job ID */
				jobid: number(),
				/** Estimated time of arrival in minutes */
				eta: number(),
				/** Estimated time of arrival in seconds */
				eta_s: number(),
			}),
		),
	),
	/** @deprecated */
	passengers: string(),
	/** @deprecated */
	arrivalTime: string(),
	/** @deprecated */
	arrivalTime_veh_plate: string(),
	/** @deprecated */
	nextPassengers: string(),
	/** @deprecated */
	nextArrivalTime: string(),
	/** @deprecated */
	nextArrivalTime_veh_plate: string(),
});
export const ShuttleWithDateSchema = object({
	/** Name of service */
	name: string(),
	/** Route ID of the shuttle */
	routeid: number(),
	/** Bus stop code */
	busstopcode: string(),
	_etas: optional(
		array(
			object({
				/** License plate of the shuttle */
				plate: string(),
				/** @deprecated */
				px: string(),
				/** Time started */
				ts: string(),
				/** Job ID */
				jobid: number(),
				/** Estimated time of arrival in minutes */
				eta: number(),
				/** Estimated time of arrival in seconds */
				eta_s: number(),
				/** Timestamp of ETA */
				eta_time: date(),
			}),
		),
	),
	/** @deprecated */
	passengers: string(),
	/** @deprecated */
	arrivalTime: string(),
	/** @deprecated */
	arrivalTime_veh_plate: string(),
	/** @deprecated */
	nextPassengers: string(),
	/** @deprecated */
	nextArrivalTime: string(),
	/** @deprecated */
	nextArrivalTime_veh_plate: string(),
});

export type Shuttle = InferOutput<typeof ShuttleSchema>;

export const ShuttleServiceResultSchema = object({
	/** Bus stop ID name */
	name: string(),
	/** Timestamp of call */
	TimeStamp: string(),
	/** @deprecated */
	hints: array(string()),
	shuttles: array(ShuttleSchema),
	/** Bus stop full name */
	caption: string(),
});

export const ShuttleServiceResultWithDateSchema = object({
	/** Bus stop ID name */
	name: string(),
	/** Timestamp of call */
	TimeStamp: string(),
	/** @deprecated */
	hints: array(string()),
	shuttles: array(ShuttleWithDateSchema),
	/** Bus stop full name */
	caption: string(),
});

export type ShuttleServiceResult = InferOutput<
	typeof ShuttleServiceResultSchema
>;

export const ActiveBusResultSchema = object({
	/** Timestamp of call */
	TimeStamp: string(),
	/** Number of active buses */
	ActiveBusCount: string(),
	/** Active buses */
	activebus: array(
		object({
			/** Plate number */
			vehplate: string(),
			/** Latitude */
			lat: number(),
			/** Longitude */
			lng: number(),
			/** Speed
			 * @deprecated
			 */
			speed: number(),
			/** Direction, bearing angle */
			direction: number(),
			loadInfo: object({
				/** Occupancy ratio between 0-1
				 * @deprecated
				 */
				occupancy: number(),
				/** Crowd level */
				crowdLevel: picklist(["low", "medium", "high"]),
				/** Capacity (headcount)
				 * @deprecated
				 */
				capacity: number(),
				/** Ridership (headcount)
				 * @deprecated
				 */
				ridership: number(),
			}),
		}),
	),
});

export type ActiveBusResult = InferOutput<typeof ActiveBusResultSchema>;

export type ISBStopShuttle = {
	name: string;
	routeid?: number | string;
};

export type ISBStop = {
	caption: string;
	name: string;
	LongName: string;
	ShortName: string;
	latitude: number;
	longitude: number;
	shuttles: ISBStopShuttle[];
	opposite: string | null;
	leftLabel?: boolean;
	collapse?: number;
	collapseBehavior?: string;
	collapsePair?: string;
	collapseLabel?: number;
	/** lower number = higher priority */
	priority?: number;
};

export type ScheduleInterval = {
	from: string;
	to: string;
	interval: number[];
};

export type Schedule = {
	term: ScheduleInterval[][];
	vacation: ScheduleInterval[][];
};

export type ISBService = {
	id: string;
	name: string;
	matchingService?: string;
	color: string;
	color2: string;
	color2dark: string;
	colorIsLight?: boolean;
	stops: string[];
	notableStops: string[];
	notableStops_extended: string[];
	schedule: Schedule;
};

export const RoutingPlaceSchema = object({
	name: string(),
	stopCode: string(),
	lon: number(),
	lat: number(),
	arrival: number(),
	departure: number(),
});

export const RoutingDisruptionSchema = object({
	effect: picklist(["no-service", "reduced-service", "delay", "bridging-bus"]),
	description: string(),
	bridgingBusStops: optional(array(string())),
});

export const RoutingLegSchema = object({
	startTime: number(),
	distance: number(),
	mode: string(),
	route: string(),
	routeId: string(),
	from: RoutingPlaceSchema,
	to: RoutingPlaceSchema,
	agencyName: optional(nullable(string())),
	routeShortName: optional(nullable(string())),
	routeLongName: optional(nullable(string())),
	duration: number(),
	disruption: optional(RoutingDisruptionSchema),
	legGeometry: optional(string()),
});

export const RoutingItinerarySchema = object({
	duration: number(),
	startTime: number(),
	endTime: number(),
	walkTime: number(),
	walkDistance: number(),
	transfers: number(),
	fare: string(),
	legs: array(RoutingLegSchema),
	id: string(),
});

export const RoutingPlanSchema = object({
	date: number(),
	itineraries: array(RoutingItinerarySchema),
});

export const RoutingProfileSchema = picklist([
	"balanced",
	"fastest",
	"fewer-transfers",
]);

export const RoutingResponseSchema = object({
	plan: RoutingPlanSchema,
	rerankApplied: optional(boolean()),
	profile: optional(RoutingProfileSchema),
});

export type RoutingResponse = InferOutput<typeof RoutingResponseSchema>;
export type RoutingItinerary = InferOutput<typeof RoutingItinerarySchema>;
export type RoutingLeg = InferOutput<typeof RoutingLegSchema>;
export type RoutingProfile = InferOutput<typeof RoutingProfileSchema>;
