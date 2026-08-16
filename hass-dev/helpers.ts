import { createHash } from 'node:crypto';
import type { ConfigEntry } from './types.ts';

/**
 * Mirrors how Home Assistant builds entity ids from names, so `München` becomes
 * `munchen`. A card pointing at an entity that does not exist renders empty
 * instead of failing, so check the dashboard after adding a location.
 */
export function slug(name: string): string {
	return name
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '_')
		.replace(/^_|_$/g, '');
}

/**
 * Home Assistant generates a random entry id. Deriving it instead keeps the
 * seed stable, so the same table always produces the same files.
 */
export function generateEntryId(entry: ConfigEntry): string {
	return createHash('sha256')
		.update(`${entry.domain}:${entry.uniqueId ?? entry.title}`)
		.digest('hex')
		.slice(0, 32);
}
