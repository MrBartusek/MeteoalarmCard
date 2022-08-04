export class Util {
	public static minHAversion(minYear: number, minMonth: number): boolean {
		// Check if using specified version of HA or higher
		const rawVersion = (window as any).frontendVersion as string;
		if(!rawVersion) return false;
		const year = rawVersion.substring(0,4);
		const version = rawVersion.substring(4,6);
		return Number(year) >= minYear && Number(version) >= minMonth;
	}
}
