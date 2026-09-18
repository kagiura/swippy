import { NextResponse } from "next/server";

function formatTime(time: string) {
	const [hours, minutes, seconds] = time.split(":").map(Number);
	if (
		Number.isNaN(hours) ||
		Number.isNaN(minutes) ||
		Number.isNaN(seconds) ||
		hours < 0 ||
		hours > 23 ||
		minutes < 0 ||
		minutes > 59 ||
		seconds < 0 ||
		seconds > 59
	) {
		throw new Error(`Invalid time format: ${time}`);
	}

	return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
		2,
		"0",
	)}:${String(seconds).padStart(2, "0")}`;
}

export async function GET(request: Request) {
	const apiUrl = process.env.ROUTING_API_URL;
	const token = process.env.ONEMAP_API_TOKEN;
	if (!apiUrl || !token) {
		return NextResponse.json(
			{ error: "ROUTING_API_URL and ONEMAP_API_TOKEN are not configured" },
			{ status: 500 },
		);
	}

	const url = new URL(request.url);
	const routeType = url.searchParams.get("routeType") || "pt";
	const start = url.searchParams.get("start");
	const end = url.searchParams.get("end");
	const date = url.searchParams.get("date");
	const time = url.searchParams.get("time");

	if (!start || !end || !date || !time) {
		return NextResponse.json(
			{ error: "start, end, date, and time are required" },
			{ status: 400 },
		);
	}

	if (routeType !== "pt") {
		return NextResponse.json(
			{ error: "Only routeType=pt is supported" },
			{ status: 400 },
		);
	}
	const upstreamUrl = new URL(apiUrl);
	// start and end
	upstreamUrl.searchParams.set("start", start);
	upstreamUrl.searchParams.set("end", end);
	// everything else
	upstreamUrl.searchParams.set("routeType", routeType);
	upstreamUrl.searchParams.set("date", date);
	upstreamUrl.searchParams.set("time", formatTime(time));

	try {
		const response = await fetch(upstreamUrl, {
			headers: {
				Authorization: token,
				accept: "application/json",
			},
		});
		const body = await response.text();
		return new Response(body, {
			status: response.status,
			headers: {
				"Content-Type":
					response.headers.get("Content-Type") || "application/json",
			},
		});
	} catch {
		return NextResponse.json(
			{ error: "Routing service is unavailable" },
			{ status: 502 },
		);
	}
}
