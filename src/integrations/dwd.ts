import { HassEntity } from 'home-assistant-js-websocket';
import {
	MeteoalarmAlert,
	MeteoalarmAlertKind,
	MeteoalarmEventType,
	MeteoalarmIntegration,
	MeteoalarmIntegrationEntityType,
	MeteoalarmIntegrationMetadata,
	MeteoalarmLevelType
} from '../types';

type DWDEntity = HassEntity & {
	attributes: {
		attribution: string,
		warning_count: number
	}
}

export default class DWD implements MeteoalarmIntegration {
	public get metadata(): MeteoalarmIntegrationMetadata {
		return {
			key: 'dwd',
			name: 'Deutscher Wetterdienst (DWD)',
			type: MeteoalarmIntegrationEntityType.CurrentExpected,
			returnHeadline: true,
			returnMultipleAlerts: true,
			entitiesCount: 2
		};
	}

	public supports(entity: DWDEntity): boolean {
		return entity.attributes.attribution == 'Data provided by DWD';
	}

	public alertActive(entity: DWDEntity): boolean {
		return entity.attributes.warning_count > 0;
	}

	private get eventTypes(): { [key: number]: MeteoalarmEventType } {
		// https://www.dwd.de/DE/leistungen/opendata/help/warnungen/gesamtueberblickII.pdf?__blob=publicationFile&v=3
		// Google translate can actually translate PDFs, quite usefull
		return {
			22: MeteoalarmEventType.SnowIce,
			24: MeteoalarmEventType.SnowIce,
			31: MeteoalarmEventType.Thunderstorms,
			33: MeteoalarmEventType.Thunderstorms,
			34: MeteoalarmEventType.Thunderstorms,
			36: MeteoalarmEventType.Thunderstorms,
			38: MeteoalarmEventType.Thunderstorms,
			40: MeteoalarmEventType.Thunderstorms,
			41: MeteoalarmEventType.Thunderstorms,
			42: MeteoalarmEventType.Thunderstorms,
			44: MeteoalarmEventType.Thunderstorms,
			45: MeteoalarmEventType.Thunderstorms,
			46: MeteoalarmEventType.Thunderstorms,
			48: MeteoalarmEventType.Thunderstorms,
			49: MeteoalarmEventType.Thunderstorms,
			51: MeteoalarmEventType.Wind,
			52: MeteoalarmEventType.Wind,
			53: MeteoalarmEventType.Wind,
			54: MeteoalarmEventType.Wind,
			55: MeteoalarmEventType.Wind,
			56: MeteoalarmEventType.Wind,
			59: MeteoalarmEventType.Fog,
			61: MeteoalarmEventType.Rain,
			62: MeteoalarmEventType.Rain,
			63: MeteoalarmEventType.Rain,
			64: MeteoalarmEventType.Rain,
			65: MeteoalarmEventType.Rain,
			66: MeteoalarmEventType.Rain,
			70: MeteoalarmEventType.SnowIce,
			71: MeteoalarmEventType.SnowIce,
			72: MeteoalarmEventType.SnowIce,
			73: MeteoalarmEventType.SnowIce,
			74: MeteoalarmEventType.SnowIce,
			75: MeteoalarmEventType.SnowIce,
			76: MeteoalarmEventType.SnowIce,
			77: MeteoalarmEventType.SnowIce,
			78: MeteoalarmEventType.SnowIce,
			79: MeteoalarmEventType.SnowIce,
			82: MeteoalarmEventType.SnowIce,
			84: MeteoalarmEventType.SnowIce,
			85: MeteoalarmEventType.SnowIce,
			87: MeteoalarmEventType.SnowIce,
			88: MeteoalarmEventType.SnowIce,
			89: MeteoalarmEventType.SnowIce,
			90: MeteoalarmEventType.Thunderstorms,
			91: MeteoalarmEventType.Thunderstorms,
			92: MeteoalarmEventType.Thunderstorms,
			93: MeteoalarmEventType.Thunderstorms,
			95: MeteoalarmEventType.Thunderstorms,
			96: MeteoalarmEventType.Thunderstorms,
			246: MeteoalarmEventType.HighTemperature,
			247: MeteoalarmEventType.HighTemperature,
			11: MeteoalarmEventType.CoastalEvent,
			12: MeteoalarmEventType.CoastalEvent,
			13: MeteoalarmEventType.CoastalEvent,
			14: MeteoalarmEventType.CoastalEvent,
			15: MeteoalarmEventType.CoastalEvent,
			16: MeteoalarmEventType.CoastalEvent,
			57: MeteoalarmEventType.CoastalEvent,
			58: MeteoalarmEventType.CoastalEvent
		};
	}

	public getAlerts(entity: HassEntity): MeteoalarmAlert[] {
		const { warning_count: warningCount } = entity.attributes;

		const result: MeteoalarmAlert[] = [];

		let kind: MeteoalarmAlertKind | null = null;
		if(entity.entity_id.split('_').includes('current')) {
			kind = MeteoalarmAlertKind.Current;
		}
		else if(entity.entity_id.split('_').includes('advance')) {
			kind = MeteoalarmAlertKind.Expected;
		}
		else if(entity.attributes.friendly_name?.split(' ').includes('Current')) {
			kind = MeteoalarmAlertKind.Current;
		}
		else if(entity.attributes.friendly_name?.split(' ').includes('Advance')) {
			kind = MeteoalarmAlertKind.Expected;
		}
		else {
			throw Error('Failed to determine DWD alert kid');
		}

		for (let i = 1; i < warningCount + 1; i++) {
			const level = entity.attributes[`warning_${i}_level`];
			const id = entity.attributes[`warning_${i}_type`];
			const headline = entity.attributes[`warning_${i}_headline`];
			if(level == entity.state) {
				if(id in this.eventTypes) {
					result.push({
						headline:  headline,
						level: this.convertAwarenessLevel(level) as MeteoalarmLevelType,
						event: this.eventTypes[id],
						kind: kind
					});
				}
				else if(id == 98 || id == 99) {
					throw new Error('An test warning was issued! ID: ' + id);
				}
				else {
					throw new Error('Unknown event ID: ' + id);
				}
			}
		}

		return result;
	}

	// Convert DWD scale 1-4 to meteoalarm scale 1-3
	private convertAwarenessLevel(level: number) {
		return level == 3 ? 2 : level;
	}
}
