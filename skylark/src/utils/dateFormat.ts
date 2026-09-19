export function getDefaultDate() {
	const now = new Date();
	return `${String(now.getMonth() + 1).padStart(2, "0")}-${String(
		now.getDate(),
	).padStart(2, "0")}-${now.getFullYear()}`;
}

export function getDefaultTime() {
	const now = new Date();
	return `${String(now.getHours()).padStart(2, "0")}:${String(
		now.getMinutes(),
	).padStart(2, "0")}:00`;
}
