import fs from 'node:fs';
import path from 'node:path';

/**
 * The envelope Home Assistant wraps every `.storage` file in. Fields are declared
 * in the order it writes them, so a seeded file matches the one it writes back.
 */
export class HassStore<T = unknown> {
	version = 1;
	minor_version: number;
	key: string;
	data: T;

	constructor(key: string, data: T, minorVersion = 1) {
		this.key = key;
		this.data = data;
		this.minor_version = minorVersion;
	}

	write(directory: string): void {
		fs.writeFileSync(path.join(directory, this.key), `${JSON.stringify(this, null, 2)}\n`);
	}
}
