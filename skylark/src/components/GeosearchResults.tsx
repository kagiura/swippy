import { Reset, Separator, Text } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { getDefaultDate, getDefaultTime } from "@/utils/dateFormat";
import type { GeocoderResult } from "@/utils/geocoderApi";

function GeosearchResults({ places }: { places: GeocoderResult[] }) {
	const router = useRouter();

	function goToPlace(place: GeocoderResult) {
		const params = new URLSearchParams({
			startName: "Current Location",
			end: `${place.latitude},${place.longitude}`,
			endName: place.name,
			date: getDefaultDate(),
			time: getDefaultTime(),
			routeType: "pt",
		});
		router.push(`/navigate?${params}`);
	}

	return (
		<div style={{ width: "100%" }}>
			{places.map((place) => (
				<Reset key={`${place.latitude}-${place.longitude}-${place.name}`}>
					<button
						type="button"
						onMouseDown={(event) => event.preventDefault()}
						onClick={() => goToPlace(place)}
					>
						<Text size="2" as="p" weight="bold">
							{place.name}
						</Text>
						<Text size="1" color="gray" as="p">
							{place.address}
						</Text>
						<Separator size="4" mt="4" mb="3" />
					</button>
				</Reset>
			))}
		</div>
	);
}
export default GeosearchResults;
