import { HassEntity } from 'home-assistant-js-websocket';
import {
	MeteoalarmAlert,
	MeteoalarmEventType,
	MeteoalarmIntegration,
	MeteoalarmIntegrationEntityType,
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
			returnHeadline: true,
			type: MeteoalarmIntegrationEntityType.SingleEntity,
			entitiesCount: 1
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
			'Flash Flood Warning': MeteoalarmEventType.RainFlood,
			'Flood Warning': MeteoalarmEventType.Flooding,
			'Excessive Heat Warning': MeteoalarmEventType.HighTemperature,
			'Severe Thunderstorm Watch': MeteoalarmEventType.Thunderstorms,
			'Gale Warning': MeteoalarmEventType.Wind,
			'Heat Advisory': MeteoalarmEventType.HighTemperature,
			'Flood Advisory': MeteoalarmEventType.Flooding,
			'Coastal Flood Advisory': MeteoalarmEventType.Flooding,
			'Dense Fog Advisory': MeteoalarmEventType.Fog,
			'Small Craft Advisory': MeteoalarmEventType.Wind,
			'Rip Current Statement': MeteoalarmEventType.CoastalEvent,
			'Beach Hazards Statement': MeteoalarmEventType.CoastalEvent,
			'Flood Watch': MeteoalarmEventType.Flooding,
			'Excessive Heat Watch': MeteoalarmEventType.HighTemperature,
			'Special Weather Statement': MeteoalarmEventType.Unknown,
			'Marine Weather Statement': MeteoalarmEventType.SeaEvent,
			'Air Quality Alert': MeteoalarmEventType.AirQuality,
			'Hydrologic Outlook': MeteoalarmEventType.Unknown
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
		if(['Moderate', 'Unknown'].includes(severity)) {
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
