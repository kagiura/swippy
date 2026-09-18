// Runs a fetcher on a fixed interval and always exposes the last-good value,
// so a slow or failing upstream never blocks requests on fresh data.

export interface PollerState<T> {
	data: T | null;
	lastSuccessAt: number | null;
	lastError: string | null;
}

export class Poller<T> {
	private state: PollerState<T> = {
		data: null,
		lastSuccessAt: null,
		lastError: null,
	};
	private timer: ReturnType<typeof setInterval> | null = null;

	constructor(
		private readonly name: string,
		private readonly intervalMs: number,
		private readonly fetcher: () => Promise<T>,
	) {}

	start() {
		if (this.timer) return;
		void this.tick();
		this.timer = setInterval(() => void this.tick(), this.intervalMs);
	}

	stop() {
		if (this.timer) clearInterval(this.timer);
		this.timer = null;
	}

	getState(): PollerState<T> {
		return this.state;
	}

	// Staleness is relative to the poll interval, not a fixed constant.
	isStale(now = Date.now()) {
		if (this.state.lastSuccessAt === null) return true;
		return now - this.state.lastSuccessAt > this.intervalMs * 3;
	}

	private async tick() {
		try {
			const data = await this.fetcher();
			this.state = { data, lastSuccessAt: Date.now(), lastError: null };
		} catch (error) {
			console.error(`[poller:${this.name}] fetch failed`, error);
			this.state = {
				...this.state,
				lastError: error instanceof Error ? error.message : String(error),
			};
		}
	}
}
