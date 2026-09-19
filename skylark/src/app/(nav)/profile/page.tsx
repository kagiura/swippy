"use client";

import { Button, Heading, Text } from "@radix-ui/themes";
import PlaceAutocomplete from "@/components/PlaceAutocomplete";
import type { GeocoderResult } from "@/utils/geocoderApi";
import { useSavedPlaces } from "@/utils/useSavedPlaces";
import styles from "./page.module.css";

const UNSET_LABEL = "Not set";

export default function ProfilePage() {
	const { home, work, setHome, setWork } = useSavedPlaces();

	function selectHome(result: GeocoderResult) {
		setHome({
			label: result.name,
			latitude: result.latitude,
			longitude: result.longitude,
		});
	}

	function selectWork(result: GeocoderResult) {
		setWork({
			label: result.name,
			latitude: result.latitude,
			longitude: result.longitude,
		});
	}

	return (
		<div className={styles.page}>
			<Heading as="h1" size="7" mb="1">
				Profile
			</Heading>
			<Text color="gray" size="2">
				Save your home and work addresses to get alerted when a disruption
				affects your commute.
			</Text>

			<div className={styles.form}>
				<div className={styles.field}>
					<PlaceAutocomplete
						label="Home"
						value={home ? `${home.latitude},${home.longitude}` : ""}
						selectedLabel={home?.label ?? UNSET_LABEL}
						onSelect={selectHome}
					/>
					{home && (
						<Button
							type="button"
							variant="soft"
							color="gray"
							size="1"
							onClick={() => setHome(null)}
						>
							Clear home
						</Button>
					)}
				</div>

				<div className={styles.field}>
					<PlaceAutocomplete
						label="Work"
						value={work ? `${work.latitude},${work.longitude}` : ""}
						selectedLabel={work?.label ?? UNSET_LABEL}
						onSelect={selectWork}
					/>
					{work && (
						<Button
							type="button"
							variant="soft"
							color="gray"
							size="1"
							onClick={() => setWork(null)}
						>
							Clear work
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
