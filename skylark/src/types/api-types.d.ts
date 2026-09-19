import * as hono from 'hono';
import * as hono_hono_base from 'hono/hono-base';
import * as hono_types from 'hono/types';
import * as hono_utils_types from 'hono/utils/types';
import * as hono_utils_http_status from 'hono/utils/http-status';

type LineCode = "NSL" | "EWL" | "CGL" | "NEL" | "CCL" | "DTL" | "TEL" | "BPLRT" | "SKLRT" | "PGLRT";
type DisruptionEffect = "no-service" | "reduced-service" | "delay" | "bridging-bus";
interface DisruptionAlert {
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

declare const app: hono_hono_base.HonoBase<{}, {
    "/health": {
        $get: {
            input: {};
            output: {
                ok: boolean;
                feeds: {
                    trainAlerts: {
                        lastSuccessAt: number | null;
                        lastError: string | null;
                        stale: boolean;
                    };
                };
            };
            outputFormat: "json";
            status: hono_utils_http_status.ContentfulStatusCode;
        };
    };
} | hono_types.MergeSchemaPath<{
    "/": {
        $get: {
            input: {};
            output: {
                error: string;
            };
            outputFormat: "json";
            status: 500;
        } | {
            input: {};
            output: {
                error: string;
            };
            outputFormat: "json";
            status: 400;
        } | {
            input: {};
            output: {
                error: string;
            };
            outputFormat: "json";
            status: 502;
        } | {
            input: {};
            output: {
                plan: {
                    itineraries: {
                        id: `${string}-${string}-${string}-${string}-${string}`;
                        legs?: {
                            [x: string]: hono_utils_types.JSONValue;
                            disruption?: {
                                effect: DisruptionAlert["effect"];
                                description: string;
                                bridgingBusStops?: string[] | undefined;
                            } | undefined;
                        }[] | undefined;
                    }[];
                };
                rerankApplied: boolean;
                profile: "balanced" | "fastest" | "fewer-transfers";
                combosRequested: number;
                combosSucceeded: number;
            };
            outputFormat: "json";
            status: hono_utils_http_status.ContentfulStatusCode;
        };
    };
}, "/routing"> | hono_types.MergeSchemaPath<hono_types.BlankSchema, "/bus-arrival"> | hono_types.MergeSchemaPath<{
    "/": {
        $get: {
            input: {};
            output: {
                alerts: {
                    id: string;
                    lineCode: LineCode;
                    effect: DisruptionEffect;
                    affectedStations: string[];
                    bridgingBusStops?: string[] | undefined;
                    description: string;
                    source: "live" | "simulated";
                    createdAt: number;
                }[];
            };
            outputFormat: "json";
            status: hono_utils_http_status.ContentfulStatusCode;
        };
    };
}, "/disruptions"> | hono_types.MergeSchemaPath<hono_types.BlankSchema, "/simulate">, "/", "/health">;
type AppType = typeof app;
declare const _default: {
    port: number;
    fetch: (request: Request, env?: unknown, executionCtx?: hono.ExecutionContext) => Response | Promise<Response>;
};

export { type AppType, _default as default };
