import { MeteoalarmLevelType } from './types';

export class Utils {
	/**
	 * Check if current frontend is installed on specified version on higher
	 * This can be used to display some features only on newer version of HA
	 */
	public static minHAversion(minYear: number, minMonth: number): boolean {
		const rawVersion = (window as any).frontendVersion as string;
		if(!rawVersion) return false;
		const year = rawVersion.substring(0,4);
		const version = rawVersion.substring(4,6);
		return Number(year) >= minYear || (Number(year) >= minYear && Number(version) >= minMonth) ;
	}

	/**
	 * Handfuls of integrations use words to describe event severity like
	 * "Moderate" or "Severe". This is an fallback function that can be used
	 * to get the event severity from this string in case it's not provided
	 * in regular way
	 *
	 * These are mostly rare cases like this one:
	 * https://github.com/MrBartusek/MeteoalarmCard/issues/48
	 */
	public static getLevelBySeverity(severity: string): MeteoalarmLevelType {
		switch(severity) {
			case 'Unknown':
			case 'Minor':
				return MeteoalarmLevelType.Yellow;
			case 'Moderate':
			case 'Severe':
				return MeteoalarmLevelType.Orange;
			case 'High':
			case 'Extreme':
				return MeteoalarmLevelType.Red;
			default:
				throw new Error(`[Utils.getLevelBySeverity] unknown event severity: "${severity}"`);
		}
	}
}
