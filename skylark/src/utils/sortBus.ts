/**
 * sort singapore bus services logically
 * 1, 1A, 1B, 1e, 2, 2A, 2B, 3, 3A, 3B, 4, 4A, 4B, 5, 5A, 5B and so on
 */
export default function sortBus(serviceA: string, serviceB: string): number {
	const regex = /^(\d+)([A-Za-z]*)$/;
	const matchA = serviceA.match(regex);
	const matchB = serviceB.match(regex);

	if (!matchA || !matchB) {
		return serviceA.localeCompare(serviceB);
	}

	const numA = parseInt(matchA[1], 10);
	const numB = parseInt(matchB[1], 10);

	if (numA !== numB) {
		return numA - numB;
	}

	const suffixA = matchA[2];
	const suffixB = matchB[2];

	return suffixA.localeCompare(suffixB);
}
