// Cache-aside store with single-flight de-dup, keyed by an arbitrary string
// (e.g. bus stop code). Guarantees at most one in-flight upstream call per key
// per TTL window, regardless of how many concurrent requests ask for it.

interface Entry<T> {
	data: T;
	fetchedAt: number;
	inflight: Promise<T> | null;
}

export class KeyedCache<T> {
	private readonly entries = new Map<string, Entry<T>>();

	constructor(private readonly ttlMs: number) {}

	async get(key: string, fetcher: () => Promise<T>): Promise<T> {
		const entry = this.entries.get(key);
		const now = Date.now();

		if (entry && now - entry.fetchedAt < this.ttlMs) {
			return entry.data;
		}

		if (entry?.inflight) {
			return entry.inflight;
		}

		const inflight = fetcher()
			.then((data) => {
				this.entries.set(key, { data, fetchedAt: Date.now(), inflight: null });
				return data;
			})
			.catch((error) => {
				// Keep serving stale data on failure instead of dropping the entry.
				const current = this.entries.get(key);
				if (current) current.inflight = null;
				throw error;
			});

		this.entries.set(key, {
			data: entry?.data as T,
			fetchedAt: entry?.fetchedAt ?? 0,
			inflight,
		});

		return inflight;
	}
}
