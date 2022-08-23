import { HassEntity } from 'home-assistant-js-websocket';
import {
	MeteoalarmAlert,
	MeteoalarmEventType,
	MeteoalarmIntegration,
	MeteoalarmIntegrationEntityType,
	MeteoalarmIntegrationMetadata,
	MeteoalarmLevelType
} from '../types';

type MeteoalarmEntity = HassEntity & {
	attributes: {
		// For some reason NONE of the attributes are guarantee see these cases:
		// Only awareness_level and awareness_type: https://github.com/MrBartusek/MeteoalarmCard/issues/49
		// awareness_level and awareness_type not present: https://github.com/MrBartusek/MeteoalarmCard/issues/48
		// code should except that everything or nothing will be there
		awareness_level?: string,
		awareness_type?: string,
		event?: string,
		severity?: string,
		headline?: string,
		description?: string,
		icon: string,
		attribution: string
	}
}

export default class Meteoalarm implements MeteoalarmIntegration {
	public get metadata(): MeteoalarmIntegrationMetadata {
		return {
			key: 'meteoalarm',
			name: 'Meteoalarm',
			type: MeteoalarmIntegrationEntityType.SingleEntity,
			returnHeadline: true,
			returnMultipleAlerts: false,
			entitiesCount: 1
		};
	}

	public supports(entity: MeteoalarmEntity): boolean {
		return entity.attributes.attribution == 'Information provided by MeteoAlarm';
	}

	public alertActive(entity: MeteoalarmEntity): boolean {
		return true;
		return (entity.attributes.status || entity.attributes.state || entity.state) != 'off';
	}

	private get eventTypes(): MeteoalarmEventType[] {
		// This list is ordered by id in meteoalarm
		return [
			MeteoalarmEventType.Wind,
			MeteoalarmEventType.SnowIce,
			MeteoalarmEventType.Thunderstorms,
			MeteoalarmEventType.Fog,
			MeteoalarmEventType.HighTemperature,
			MeteoalarmEventType.LowTemperature,
			MeteoalarmEventType.CoastalEvent,
			MeteoalarmEventType.ForestFire,
			MeteoalarmEventType.Avalanches,
			MeteoalarmEventType.Rain,
			MeteoalarmEventType.Flooding,
			MeteoalarmEventType.Flooding
		];
	}

	// Generate level from severity when it's not provided
	// https://github.com/MrBartusek/MeteoalarmCard/issues/48
	private getLevelBySeverity(severity: string): MeteoalarmLevelType {
		if(['Moderate'].includes(severity)) {
			return MeteoalarmLevelType.Yellow;
		}
		else if(['Severe'].includes(severity)) {
			return MeteoalarmLevelType.Orange;
		}
		else if(['High', 'Extreme'].includes(severity)) {
			return MeteoalarmLevelType.Red;
		}
		else {
			throw new Error(`Unknown event severity: ${severity}`);
		}
	}

	public getAlerts(entity: MeteoalarmEntity): MeteoalarmAlert[] {
		entity;
		return [{
			level: MeteoalarmLevelType.Orange,
			event: MeteoalarmEventType.AirQuality
		}
		];
	}
}
