export type GeocoderResult = {
	name: string;
	address: string;
	latitude: number;
	longitude: number;
};

export async function searchPlaces(query: string): Promise<GeocoderResult[]> {
	const response = await fetch(`/api/geocoder?q=${encodeURIComponent(query)}`);
	if (!response.ok) throw new Error("Unable to search locations");

	const data = (await response.json()) as { results?: GeocoderResult[] };
	return data.results || [];
}