import {
	array,
	boolean,
	date,
	InferOutput,
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

export const RoutingRequestParametersSchema = object({
	mode: string(),
	date: string(),
	arriveBy: string(),
	showIntermediateStops: string(),
	fromPlace: string(),
	transferPenalty: string(),
	toPlace: string(),
	time: string(),
	maxTransfers: string(),
	numItineraries: string(),
});

export const RoutingPlaceSchema = object({
	name: string(),
	lon: number(),
	lat: number(),
	vertexType: string(),
	arrival: optional(number()),
	departure: optional(number()),
	stopId: optional(string()),
	stopCode: optional(string()),
	stopIndex: optional(number()),
	stopSequence: optional(number()),
});

export const RoutingStepSchema = object({
	distance: number(),
	relativeDirection: string(),
	streetName: string(),
	absoluteDirection: string(),
	stayOn: boolean(),
	area: boolean(),
	bogusName: boolean(),
	lon: number(),
	lat: number(),
	elevation: string(),
	walkingBike: boolean(),
});

export const RoutingLegGeometrySchema = object({
	points: string(),
	length: number(),
});

export const RoutingLegSchema = object({
	startTime: number(),
	endTime: number(),
	departureDelay: number(),
	arrivalDelay: number(),
	realTime: boolean(),
	distance: number(),
	generalizedCost: number(),
	pathway: boolean(),
	mode: string(),
	transitLeg: boolean(),
	route: string(),
	agencyTimeZoneOffset: number(),
	interlineWithPreviousLeg: boolean(),
	from: RoutingPlaceSchema,
	to: RoutingPlaceSchema,
	legGeometry: RoutingLegGeometrySchema,
	steps: array(RoutingStepSchema),
	intermediateStops: optional(array(RoutingPlaceSchema)),
	agencyName: optional(string()),
	agencyUrl: optional(string()),
	routeType: optional(number()),
	routeId: optional(string()),
	tripId: optional(string()),
	serviceDate: optional(string()),
	routeShortName: optional(string()),
	routeLongName: optional(string()),
	rentedBike: optional(boolean()),
	walkingBike: optional(boolean()),
	duration: number(),
});

export const RoutingOptionsSchema = object({
	mode: string(),
	maxWalkDistance: string(),
});

export const RoutingItinerarySchema = object({
	duration: number(),
	startTime: number(),
	endTime: number(),
	walkTime: number(),
	transitTime: number(),
	waitingTime: number(),
	walkDistance: number(),
	walkLimitExceeded: boolean(),
	generalizedCost: number(),
	elevationLost: number(),
	elevationGained: number(),
	transfers: number(),
	fare: string(),
	legs: array(RoutingLegSchema),
	tooSloped: boolean(),
	arrivedAtDestinationWithRentedBicycle: boolean(),
	routingOptions: RoutingOptionsSchema,
});

export const RoutingPlanSchema = object({
	date: number(),
	from: RoutingPlaceSchema,
	to: RoutingPlaceSchema,
	itineraries: array(RoutingItinerarySchema),
});

export const RoutingMetadataSchema = object({
	searchWindowUsed: number(),
	nextDateTime: number(),
	prevDateTime: number(),
});

export const RoutingDebugOutputSchema = object({
	precalculationTime: number(),
	directStreetRouterTime: number(),
	transitRouterTime: number(),
	filteringTime: number(),
	renderingTime: number(),
	totalTime: number(),
	transitRouterTimes: object({
		tripPatternFilterTime: number(),
		accessEgressTime: number(),
		raptorSearchTime: number(),
		itineraryCreationTime: number(),
	}),
});

export const RoutingElevationMetadataSchema = object({
	ellipsoidToGeoidDifference: number(),
	geoidElevation: boolean(),
});

export const RoutingSummarySchema = object({
	requestedCombinations: number(),
	successfulCombinations: number(),
	failedCombinations: number(),
	candidateCount: number(),
	deduplicatedCount: number(),
	warnings: array(string()),
});

export const RoutingResponseSchema = object({
	requestParameters: RoutingRequestParametersSchema,
	plan: RoutingPlanSchema,
	metadata: RoutingMetadataSchema,
	previousPageCursor: string(),
	nextPageCursor: string(),
	debugOutput: RoutingDebugOutputSchema,
	elevationMetadata: RoutingElevationMetadataSchema,
	routing: RoutingSummarySchema,
});

export type RoutingResponse = InferOutput<typeof RoutingResponseSchema>;
export type RoutingItinerary = InferOutput<typeof RoutingItinerarySchema>;
export type RoutingLeg = InferOutput<typeof RoutingLegSchema>;
