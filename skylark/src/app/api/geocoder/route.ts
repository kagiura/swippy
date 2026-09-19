import { NextResponse } from "next/server";

type OneMapResult = {
	SEARCHVAL?: string;
	ADDRESS?: string;
	LATITUDE?: string;
	LONGITUDE?: string;
	[ key: string ]: unknown;
};

type OneMapSearchResponse = {
	results?: OneMapResult[];
};

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const query = searchParams.get("q")?.trim();
	const apiUrl = process.env.GEOCODER_API_URL;
	const token = process.env.ONEMAP_API_TOKEN;

	if (!query || query.length < 2) {
		return NextResponse.json({ results: [] });
	}

	if (!apiUrl || !token) {
		return NextResponse.json(
			{ error: "GEOCODER_API_URL and ONEMAP_API_TOKEN are not configured" },
			{ status: 500 },
		);
	}

	const upstreamUrl = new URL(apiUrl);
	upstreamUrl.searchParams.set("searchVal", query);
	upstreamUrl.searchParams.set("returnGeom", "Y");
	upstreamUrl.searchParams.set("getAddrDetails", "Y");
	upstreamUrl.searchParams.set("pageNum", "1");

	try {
		const response = await fetch(upstreamUrl, {
			headers: {
				Authorization: token,
				accept: "application/json",
			},
			next: { revalidate: 60 },
		});

		if (!response.ok) {
			return NextResponse.json(
				{ error: "Geocoder service unavailable" },
				{ status: response.status },
			);
		}

		const data = (await response.json()) as OneMapSearchResponse;
		const results = (data.results || [])
			.map((result) => {
				const latitude = Number(result.LATITUDE);
				const longitude = Number(result.LONGITUDE);
				if (!result.SEARCHVAL || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
					return null;
				}

				return {
					name: result.SEARCHVAL,
					address: result.ADDRESS || result.SEARCHVAL,
					latitude,
					longitude,
				};
			})
			.filter((result): result is NonNullable<typeof result> => result !== null);

		return NextResponse.json({ results });
	} catch {
		return NextResponse.json(
			{ error: "Geocoder service unavailable" },
			{ status: 502 },
		);
	}
}