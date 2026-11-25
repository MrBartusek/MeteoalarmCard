const KEY_PREFIX = 'meteoalarm-card:dismissed';

function storageKey(userId: string | undefined, entityIds: string[]): string {
	return [KEY_PREFIX, userId ?? 'anonymous', [...entityIds].sort().join(',')].join(':');
}

export function loadDismissedAlerts(userId: string | undefined, entityIds: string[]): string[] {
	try {
		const parsed = JSON.parse(localStorage.getItem(storageKey(userId, entityIds)) ?? '[]');
		return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
	} catch {
		return [];
	}
}

export function saveDismissedAlerts(
	userId: string | undefined,
	entityIds: string[],
	ids: string[],
): void {
	try {
		const key = storageKey(userId, entityIds);
		if (ids.length == 0) {
			localStorage.removeItem(key);
		} else {
			localStorage.setItem(key, JSON.stringify(ids));
		}
	} catch {
		// Storage can be unavailable (private mode, quota); dismissal then lasts until reload
	}
}
