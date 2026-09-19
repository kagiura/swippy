import type { ImgHTMLAttributes } from "react";

const BASE_URL = "https://jooferj.github.io/media/caplets/lines";

// Short code or full code -> file name on the Joofer site.
const LINE_SLUGS: Record<string, string> = {
	ns: "nsl",
	nsl: "nsl",
	ew: "ewl",
	ewl: "ewl",
	ne: "nel",
	nel: "nel",
	cc: "ccl",
	ccl: "ccl",
	dt: "dtl",
	dtl: "dtl",
	te: "tel",
	tel: "tel",
	bp: "bplrt",
	bplrt: "bplrt",
	sk: "sklrt",
	sklrt: "sklrt",
	pg: "pglrt",
	pglrt: "pglrt",
};

/** Returns the Joofer file name for a line code, or null if the code is not known. */
export function getLineSlug(code: string): string | null {
	return LINE_SLUGS[code.trim().toLowerCase()] ?? null;
}

type MrtLineSvgProps = {
	/** Line code, case insensitive. Examples: "ns", "NSL", "bp", "BPLRT". */
	code: string;
} & Omit<ImgHTMLAttributes<HTMLImageElement>, "src">;

export default function MRTCaplet({ code, alt, ...imgProps }: MrtLineSvgProps) {
	const slug = getLineSlug(code);
	if (!slug) return null;

	return (
		<img
			src={`${BASE_URL}/${slug}.svg`}
			alt={alt ?? `${slug.toUpperCase()} line`}
			style={{ objectFit: "contain", ...imgProps.style }}
			{...imgProps}
		/>
	);
}
