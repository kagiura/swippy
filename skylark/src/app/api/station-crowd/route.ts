export function GET() {
	return Response.json(
		{ error: "Station crowd data is not available" },
		{ status: 501 },
	);
}
