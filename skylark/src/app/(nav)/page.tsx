"use client";
import {
	Flex,
	IconButton,
	Inset,
	Spinner,
	Text,
	TextField,
} from "@radix-ui/themes";
import {
	IconCross,
	IconSearch,
	IconUserCircle,
	IconX,
} from "@tabler/icons-react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import ClosestStops from "@/components/ClosestStops";
import DisruptionBanner from "@/components/DisruptionBanner";
import GeosearchResults from "@/components/GeosearchResults";
import { getLiveDisruptions } from "@/utils/api";
import { usePlaceSearch } from "@/utils/usePlaceSearch";

export default function Page() {
	const [isSearching, setIsSearching] = useState(false);

	const { query, setQuery, results, loading } = usePlaceSearch();

	return (
		<>
			<Flex gap="2" mb="5" align="center">
				<TextField.Root
					placeholder="Search"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					onFocus={() => setIsSearching(true)}
					onBlur={() => {
						// searching false if query is empty
						if (query.trim() === "") {
							setIsSearching(false);
						}
					}}
					color="gray"
					variant="soft"
					radius="large"
					style={{ flex: 1 }}
				>
					<TextField.Slot side="left">
						<Text color="gray">
							<IconSearch width={12} height={12} />
						</Text>
					</TextField.Slot>
					<TextField.Slot side="right">
						{!!query && (
							<IconButton
								color="gray"
								variant="ghost"
								size="1"
								onClick={() => {
									setQuery("");
									setIsSearching(false);
								}}
							>
								<IconX width={12} height={12} />
							</IconButton>
						)}
					</TextField.Slot>
				</TextField.Root>
				<IconButton asChild color="gray" variant="soft" radius="large">
					<Link href="/profile" aria-label="Profile">
						<IconUserCircle width={18} height={18} />
					</Link>
				</IconButton>
			</Flex>

			<AnimatePresence>
				{isSearching ? (
					<motion.div
						key="search-results"
						initial={{ opacity: 0, x: 10 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: 10, position: "absolute" }}
						transition={{ damping: 120 }}
					>
						{loading ? (
							<Flex justify="center" align="center">
								<Spinner />
							</Flex>
						) : (
							<GeosearchResults places={results} />
						)}
					</motion.div>
				) : (
					<motion.div
						key="closest-info"
						initial={{ opacity: 0, x: -10 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -10, position: "absolute" }}
						transition={{ damping: 120 }}
					>
						<DisruptionBanner />
						<Flex direction="column" gap="0" mt="4">
							<LayoutGroup>
								<ClosestStops />
							</LayoutGroup>
						</Flex>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
