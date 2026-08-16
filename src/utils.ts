import { MeteoalarmEventType, MeteoalarmLevelType } from './types';

export class Utils {
	/**
	 * Check if current frontend is installed on specified version on higher
	 * This can be used to display some features only on newer version of HA
	 */
	public static minHAversion(minYear: number, minMonth: number): boolean {
		const rawVersion = (window as any).frontendVersion as string;
		if (!rawVersion) return false;
		const year = Number(rawVersion.substring(0, 4));
		const month = Number(rawVersion.substring(4, 6));
		return year > minYear || (year == minYear && month >= minMonth);
	}

	/**
	 * Handfuls of integrations use words to describe event severity like
	 * "Moderate" or "Severe". This is an fallback function that can be used
	 * to get the event severity from this string in case it's not provided
	 * in regular way
	 *
	 * These are mostly rare cases like this one:
	 * https://github.com/MrBartusek/MeteoalarmCard/issues/48
	 *
	 * @param severity severity as string (Minor, Moderate, Severe)
	 * @param overrides optionally provide an list of overrides as object.
	 * For example `{ "Moderate": MeteoalarmLevelType.Orange }`
	 * @returns
	 */
	public static getLevelBySeverity(
		severity: string,
		overrides?: { [key: string]: MeteoalarmLevelType },
	): MeteoalarmLevelType {
		if (overrides && overrides[severity]) {
			return overrides[severity];
		}
		switch (severity) {
			case 'Unknown':
			case 'Minor':
			case 'Moderate':
				return MeteoalarmLevelType.Yellow;
			case 'Severe':
				return MeteoalarmLevelType.Orange;
			case 'High':
			case 'Extreme':
				return MeteoalarmLevelType.Red;
			default:
				throw new Error(`[Utils.getLevelBySeverity] unknown event severity: "${severity}"`);
		}
	}

	/**
	 * Some integrations report severity on the numeric meteoalarm scale,
	 * where 1 is yellow and 3 is red
	 * @param level level as number (0-3)
	 */
	public static getLevelByNumber(level: number): MeteoalarmLevelType {
		switch (level) {
			case 0:
				return MeteoalarmLevelType.None;
			case 1:
				return MeteoalarmLevelType.Yellow;
			case 2:
				return MeteoalarmLevelType.Orange;
			case 3:
				return MeteoalarmLevelType.Red;
			default:
				throw new Error(`[Utils.getLevelByNumber] unknown event level: "${level}"`);
		}
	}

	/**
	 * Some integrations store their event mapping in key-value dict, this
	 * function convert this list for metadata.monitoredConditions
	 * @param eventTypes eventTypes dict
	 */
	public static convertEventTypesForMetadata(eventTypes: {
		[key: number | string]: MeteoalarmEventType;
	}): MeteoalarmEventType[] {
		return [...new Set(Object.values(eventTypes))];
	}
}
