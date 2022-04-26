import { HassEntity } from 'home-assistant-js-websocket';
import {
	MeteoalarmAlert,
	MeteoalarmEventType,
	MeteoalarmIntegration,
	MeteoalarmIntegrationMetadata,
	MeteoalarmLevelType
} from '../types';

type WeatheralertsAlert = {
	event: string,
	severity: string,
	title: string
}

type WeatheralertsEntity = HassEntity & {
	attributes: {
		integration: string,
		alerts: WeatheralertsAlert[]
	}
}

export default class Weatheralerts implements MeteoalarmIntegration {
	public get metadata(): MeteoalarmIntegrationMetadata {
		return {
			key: 'weatheralerts',
			name: 'Weatheralerts',
			multipleAlerts: true,
			returnHeadline: true
		};
	}

	public supports(entity: WeatheralertsEntity): boolean {
		return entity.attributes.integration == 'weatheralerts';
	}

	public alertActive(entity: WeatheralertsEntity): boolean {
		return Number(entity.state) > 0;
	}

	private get eventTypes(): { [key: string]: MeteoalarmEventType } {
		return {
			'Severe Thunderstorm Warning': MeteoalarmEventType.Thunderstorms,
			'Severe Weather Statement': MeteoalarmEventType.Thunderstorms,
			'High Wind Warning': MeteoalarmEventType.Wind,
			'Flood Warning': MeteoalarmEventType.Flooding,
			'Severe Thunderstorm Watch': MeteoalarmEventType.Thunderstorms,
			'Gale Warning': MeteoalarmEventType.Wind,
			'Freeze Warning': MeteoalarmEventType.SnowIce,
			'Red Flag Warning': MeteoalarmEventType.ForestFire,
			'Flood Advisory': MeteoalarmEventType.Flooding,
			'Heavy Freezing Spray Warning': MeteoalarmEventType.SnowIce,
			'Small Craft Advisory': MeteoalarmEventType.Wind,
			'Lake Wind Advisory': MeteoalarmEventType.Wind,
			'Wind Advisory': MeteoalarmEventType.Wind,
			'Frost Advisory': MeteoalarmEventType.SnowIce,
			'Low Water Advisory': MeteoalarmEventType.CoastalEvent,
			'Gale Watch': MeteoalarmEventType.Wind,
			'Freeze Watch': MeteoalarmEventType.SnowIce,
			'Special Weather Statement': MeteoalarmEventType.Unknown,
			'Marine Weather Statement': MeteoalarmEventType.Unknown,
			'Rip Current Statement': MeteoalarmEventType.CoastalEvent,
			'Fire Weather Watch': MeteoalarmEventType.ForestFire,
			'Winter Weather Advisory': MeteoalarmEventType.SnowIce,
			'Winter Storm Warning': MeteoalarmEventType.SnowIce
		};
	}

	public getAlerts(entity: HassEntity): MeteoalarmAlert[] {
		const { alerts } = entity.attributes;

		const result: MeteoalarmAlert[] = [];

		for(const alert of alerts) {
			const { event, severity, title } = alert;
			if(event in this.eventTypes) {
				result.push({
					headline: title,
					level: this.getLevelBySeverity(severity),
					event: this.eventTypes[event]
				});
			}
			else {
				throw new Error('Unknown warning: ' + event);
			}
		}
		return result;
	}

	// Generate level from severity when it's not provided
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
}
