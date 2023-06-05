import { HassEntity } from 'home-assistant-js-websocket';
import {
	MeteoalarmAlert,
	MeteoalarmEventType,
	MeteoalarmIntegration,
	MeteoalarmIntegrationEntityType,
	MeteoalarmIntegrationMetadata,
	MeteoalarmLevelType
} from '../types';
import { Utils } from '../utils';

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
			type: MeteoalarmIntegrationEntityType.SingleEntity,
			returnHeadline: true,
			returnMultipleAlerts: true,
			entitiesCount: 1,
			monitoredConditions: Utils.convertEventTypesForMetadata(this.eventTypes)
		};
	}

	public supports(entity: WeatheralertsEntity): boolean {
		return entity.attributes.integration == 'weatheralerts';
	}

	public alertActive(entity: WeatheralertsEntity): boolean {
		return Number(entity.state) > 0;
	}

	private get eventTypes(): { [key: string]: MeteoalarmEventType } {
		// Event types from: https://www.weather.gov/lwx/WarningsDefined
		return {
			'Winter Storm': MeteoalarmEventType.SnowIce,
			'Blizzard': MeteoalarmEventType.SnowIce,
			'Ice Storm': MeteoalarmEventType.SnowIce,
			'Winter Weather': MeteoalarmEventType.SnowIce,
			'Freeze': MeteoalarmEventType.LowTemperature,
			'Frost': MeteoalarmEventType.LowTemperature,
			'Wind Chill': MeteoalarmEventType.LowTemperature,
			'Fire Weather': MeteoalarmEventType.ForestFire,
			'Red Flag': MeteoalarmEventType.ForestFire,
			'Dense Fog': MeteoalarmEventType.Fog,
			'High Wind': MeteoalarmEventType.Wind,
			'Wind': MeteoalarmEventType.Wind,
			'Severe Thunderstorm': MeteoalarmEventType.Thunderstorms,
			'Tornado': MeteoalarmEventType.Tornado,
			'Extreme Wind': MeteoalarmEventType.Wind,
			'Small Craft': MeteoalarmEventType.Wind,
			'Gale': MeteoalarmEventType.SeaEvent,
			'Storm': MeteoalarmEventType.Thunderstorms,
			'Hurricane Force Wind': MeteoalarmEventType.Hurricane,
			'Special Marine': MeteoalarmEventType.Unknown,
			'Coastal Flood': MeteoalarmEventType.Flooding,
			'Flash Flood': MeteoalarmEventType.Flooding,
			'Flood': MeteoalarmEventType.Flooding,
			'River Flood': MeteoalarmEventType.Flooding,
			'Excessive Heat': MeteoalarmEventType.HighTemperature,
			'Heat': MeteoalarmEventType.HighTemperature,
			'Tropical Storm': MeteoalarmEventType.Hurricane,
			'Hurricane': MeteoalarmEventType.Hurricane,
			'Air Quality': MeteoalarmEventType.AirQuality,
			'Rip Current': MeteoalarmEventType.CoastalEvent // https://github.com/MrBartusek/MeteoalarmCard/issues/183
		};
	}

	private get eventLevels(): { [key: string]: MeteoalarmLevelType } {
		// Event types from: https://www.weather.gov/lwx/WarningsDefined
		return {
			'Warning': MeteoalarmLevelType.Red,
			'Statement': MeteoalarmLevelType.Orange,
			'Watch': MeteoalarmLevelType.Orange,
			'Advisory': MeteoalarmLevelType.Yellow,
			'Alert': MeteoalarmLevelType.Yellow
		};
	}

	public getAlerts(entity: WeatheralertsEntity): MeteoalarmAlert[] {
		const { alerts } = entity.attributes;

		const result: MeteoalarmAlert[] = [];

		for(const alert of alerts) {
			const fullAlertName = alert.event;
			let alertLevel: MeteoalarmLevelType | undefined = undefined;
			let alertType: MeteoalarmEventType | undefined = undefined;

			for(const [levelName, level] of Object.entries(this.eventLevels)) {
				if(!fullAlertName.includes(levelName)) continue;
				alertLevel = level;
				const alertName = fullAlertName.replace(levelName, '').trim();
				alertType = this.eventTypes[alertName];
				if(!alertType) {
					throw Error(`Unknown weatheralerts alert type: ${alertName}`);
				}
			}

			if(!alertLevel) {
				throw Error(`Unknown weatheralerts alert level: ${fullAlertName}`);
			}

			result.push({
				headline: fullAlertName,
				level: alertLevel,
				event: alertType!
			});
		}
		return result;
	}
}
