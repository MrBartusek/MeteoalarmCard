import { HassEntity } from 'home-assistant-js-websocket';
import {
	MeteoalarmAlert,
	MeteoalarmEventType,
	MeteoalarmIntegration,
	MeteoalarmIntegrationEntityType,
	MeteoalarmIntegrationMetadata,
	MeteoalarmLevelType,
} from '../types';
import { Utils } from '../utils';

type WeatheralertsAlert = {
	event: string;
	severity: string;
	title: string;
};

type WeatheralertsEntity = HassEntity & {
	attributes: {
		integration: string;
		alerts: WeatheralertsAlert[];
	};
};

export default class Weatheralerts implements MeteoalarmIntegration {
	public get metadata(): MeteoalarmIntegrationMetadata {
		return {
			key: 'weatheralerts',
			name: 'Weatheralerts',
			type: MeteoalarmIntegrationEntityType.SingleEntity,
			returnHeadline: true,
			returnMultipleAlerts: true,
			entitiesCount: 1,
			monitoredConditions: Utils.convertEventTypesForMetadata(this.eventTypes),
		};
	}

	public supports(entity: WeatheralertsEntity): boolean {
		return entity.attributes.integration == 'weatheralerts';
	}

	public alertActive(entity: WeatheralertsEntity): boolean {
		return Number(entity.state) > 0;
	}

	private get eventTypes(): { [key: string]: MeteoalarmEventType } {
		// https://vlab.noaa.gov/web/nws-common-alerting-protocol/cap-documentation#_eventcode_inclusion-16
		return {
			'911 Telephone Outage': MeteoalarmEventType.Unknown,
			Administrative: MeteoalarmEventType.Unknown,
			'Air Quality': MeteoalarmEventType.AirQuality,
			'Air Stagnation': MeteoalarmEventType.AirQuality,
			'Arroyo And Small Stream Flood': MeteoalarmEventType.Flooding,
			Ashfall: MeteoalarmEventType.Volcano,
			Avalanche: MeteoalarmEventType.Avalanches,
			'Beach Hazards': MeteoalarmEventType.CoastalEvent,
			Blizzard: MeteoalarmEventType.SnowIce,
			'Blowing Dust': MeteoalarmEventType.Dust,
			'Brisk Wind': MeteoalarmEventType.Wind,
			'Child Abduction': MeteoalarmEventType.Unknown,
			'Civil Danger': MeteoalarmEventType.Unknown,
			'Civil Emergency': MeteoalarmEventType.Unknown,
			'Coastal Flood': MeteoalarmEventType.Flooding,
			'Dense Fog': MeteoalarmEventType.Fog,
			'Dense Smoke': MeteoalarmEventType.Fog,
			Dust: MeteoalarmEventType.Dust,
			'Dust Storm': MeteoalarmEventType.Dust,
			Earthquake: MeteoalarmEventType.Earthquake,
			'Excessive Heat': MeteoalarmEventType.HighTemperature,
			'Extreme Cold': MeteoalarmEventType.LowTemperature,
			'Extreme Fire': MeteoalarmEventType.ForestFire,
			'Extreme Wind': MeteoalarmEventType.Wind,
			Fire: MeteoalarmEventType.ForestFire,
			'Fire Weather': MeteoalarmEventType.ForestFire,
			'Flash Flood': MeteoalarmEventType.Flooding,
			Flood: MeteoalarmEventType.Flooding,
			Freeze: MeteoalarmEventType.LowTemperature,
			'Freezing Fog': MeteoalarmEventType.SnowIce,
			'Freezing Rain': MeteoalarmEventType.SnowIce,
			'Freezing Spray': MeteoalarmEventType.SeaEvent,
			Frost: MeteoalarmEventType.LowTemperature,
			Gale: MeteoalarmEventType.SeaEvent,
			'Hard Freeze': MeteoalarmEventType.LowTemperature,
			'Hazardous Materials': MeteoalarmEventType.Unknown,
			'Hazardous Seas': MeteoalarmEventType.SeaEvent,
			'Hazardous Weather': MeteoalarmEventType.Unknown,
			Heat: MeteoalarmEventType.HighTemperature,
			'Heavy Freezing Spray': MeteoalarmEventType.SeaEvent,
			'High Surf': MeteoalarmEventType.CoastalEvent,
			'High Wind': MeteoalarmEventType.Wind,
			'Hurricane Force Wind': MeteoalarmEventType.Hurricane,
			'Hurricane Local': MeteoalarmEventType.Hurricane,
			Hurricane: MeteoalarmEventType.Hurricane,
			Hydrologic: MeteoalarmEventType.CoastalEvent,
			'Ice Storm': MeteoalarmEventType.SnowIce,
			'Lake Effect Snow': MeteoalarmEventType.SnowIce,
			'Lake Wind': MeteoalarmEventType.Wind,
			'Lakeshore Flood': MeteoalarmEventType.Flooding,
			'Law Enforcement': MeteoalarmEventType.Unknown,
			'Local Area': MeteoalarmEventType.Unknown,
			'Low Water': MeteoalarmEventType.SeaEvent,
			'Marine Weather': MeteoalarmEventType.SeaEvent,
			'Nuclear Power Plant': MeteoalarmEventType.Nuclear,
			'Radiological Hazard': MeteoalarmEventType.Nuclear,
			'Red Flag': MeteoalarmEventType.ForestFire,
			'Rip Current': MeteoalarmEventType.CoastalEvent,
			'River Flood': MeteoalarmEventType.Flooding,
			'Severe Thunderstorm': MeteoalarmEventType.Thunderstorms,
			'Severe Weather': MeteoalarmEventType.Unknown,
			'Shelter In Place': MeteoalarmEventType.Unknown,
			'Short Term': MeteoalarmEventType.Unknown,
			'Small Craft': MeteoalarmEventType.SeaEvent,
			'Small Stream Flood': MeteoalarmEventType.Flooding,
			'Snow Squall': MeteoalarmEventType.SnowIce,
			'Special Marine': MeteoalarmEventType.SeaEvent,
			'Special Weather': MeteoalarmEventType.Unknown,
			'Storm Surge': MeteoalarmEventType.CoastalEvent,
			Storm: MeteoalarmEventType.Thunderstorms,
			Tornado: MeteoalarmEventType.Tornado,
			'Tropical Depression Local': MeteoalarmEventType.Hurricane,
			'Tropical Storm Local': MeteoalarmEventType.Hurricane,
			'Tropical Storm': MeteoalarmEventType.Hurricane,
			'Tropical Cyclone': MeteoalarmEventType.Hurricane,
			Tsunami: MeteoalarmEventType.Tsunami,
			'Typhoon Local': MeteoalarmEventType.Hurricane,
			Typhoon: MeteoalarmEventType.Hurricane,
			'Urban And Small Stream Flood': MeteoalarmEventType.Flooding,
			Volcano: MeteoalarmEventType.Volcano,
			Wind: MeteoalarmEventType.Wind,
			'Wind Chill': MeteoalarmEventType.LowTemperature,
			'Winter Storm': MeteoalarmEventType.SnowIce,
			'Winter Weather': MeteoalarmEventType.SnowIce,
			Blue: MeteoalarmEventType.Unknown,
		};
	}

	private get eventLevels(): { [key: string]: MeteoalarmLevelType } {
		// https://vlab.noaa.gov/web/nws-common-alerting-protocol/cap-documentation#_eventcode_inclusion-16
		return {
			Warning: MeteoalarmLevelType.Red,
			Statement: MeteoalarmLevelType.Orange,
			Watch: MeteoalarmLevelType.Orange,
			Advisory: MeteoalarmLevelType.Yellow,
			Alert: MeteoalarmLevelType.Yellow,
		};
	}

	public getAlerts(entity: WeatheralertsEntity): MeteoalarmAlert[] {
		const { alerts } = entity.attributes;

		const result: MeteoalarmAlert[] = [];

		for (const alert of alerts) {
			const fullAlertName = alert.event;
			let alertLevel: MeteoalarmLevelType | undefined = undefined;
			let alertType: MeteoalarmEventType | undefined = undefined;

			for (const [levelName, level] of Object.entries(this.eventLevels)) {
				if (!fullAlertName.includes(levelName)) continue;
				alertLevel = level;
				const alertName = fullAlertName.replace(levelName, '').trim();
				alertType = this.eventTypes[alertName];
				if (alertType == undefined) {
					throw Error(`Unknown weatheralerts alert type: ${alertName}`);
				}
			}

			if (alertLevel == undefined) {
				throw Error(`Unknown weatheralerts alert level: ${fullAlertName}`);
			}

			result.push({
				headline: fullAlertName,
				level: alertLevel,
				event: alertType!,
			});
		}
		return result;
	}
}
