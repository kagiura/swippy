import { NextResponse } from "next/server";

const ROUTING_API_URL = "https://onestoptransport.sg/api/routing";

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
// https://onestoptransport.sg/api/routing?routeType=pt&start=1.3081592,103.8551479&end=1.2739864,103.8012642&date=09-18-2026&time=11:19:47
	const upstreamUrl = new URL(ROUTING_API_URL);
	// start and end
	upstreamUrl.searchParams.set("start", start);
	upstreamUrl.searchParams.set("end", end);
	// everything else
	upstreamUrl.searchParams.set("routeType", "pt");
	upstreamUrl.searchParams.set("date", date);
	upstreamUrl.searchParams.set("time", formatTime(time));

	try {
		const response = await fetch(upstreamUrl);
		const data = await response.json();
		return NextResponse.json(data, { status: response.status });
	} catch {
		return NextResponse.json(
			{ error: "Routing service is unavailable" },
			{ status: 502 },
		);
	}
}
