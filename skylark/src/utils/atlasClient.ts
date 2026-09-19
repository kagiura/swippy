import { hc } from "hono/client";
// Type-only import - erased at compile time, no runtime dependency on atlas.
import type { AppType } from "../../../atlas/src/index";

export const atlasClient = hc<AppType>(
	process.env.NEXT_PUBLIC_ATLAS_URL ?? "http://localhost:8787",
);
