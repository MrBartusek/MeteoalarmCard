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
			'Tornado Warning': MeteoalarmEventType.Tornado,
			'Tsunami Warning': MeteoalarmEventType.CoastalEvent,
			'Extreme Wind Warning': MeteoalarmEventType.Wind,
			'Severe Thunderstorm Warning': MeteoalarmEventType.Thunderstorms,
			'Flash Flood Warning': MeteoalarmEventType.Flooding,
			'Flash Flood Statement': MeteoalarmEventType.Flooding,
			'Severe Weather Statement': MeteoalarmEventType.Unknown,
			'Shelter In Place Warning': MeteoalarmEventType.Unknown,
			'Evacuation Immediate': MeteoalarmEventType.Unknown,
			'Civil Danger Warning': MeteoalarmEventType.Unknown,
			'Nuclear Power Plant Warning': MeteoalarmEventType.Nuclear,
			'Radiological Hazard Warning': MeteoalarmEventType.Nuclear,
			'Hazardous Materials Warning': MeteoalarmEventType.Nuclear,
			'Fire Warning': MeteoalarmEventType.ForestFire,
			'Civil Emergency Message': MeteoalarmEventType.Unknown,
			'Law Enforcement Warning': MeteoalarmEventType.Unknown,
			'Storm Surge Warning': MeteoalarmEventType.CoastalEvent,
			'Hurricane Force Wind Warning': MeteoalarmEventType.Wind,
			'Hurricane Warning': MeteoalarmEventType.Hurricane,
			'Typhoon Warning': MeteoalarmEventType.Hurricane,
			'Special Marine Warning': MeteoalarmEventType.SeaEvent,
			'Blizzard Warning': MeteoalarmEventType.SnowIce,
			'Snow Squall Warning': MeteoalarmEventType.SnowIce,
			'Ice Storm Warning': MeteoalarmEventType.SnowIce,
			'Winter Storm Warning': MeteoalarmEventType.SnowIce,
			'High Wind Warning': MeteoalarmEventType.Wind,
			'Tropical Storm Warning': MeteoalarmEventType.Thunderstorms,
			'Storm Warning': MeteoalarmEventType.Thunderstorms,
			'Tsunami Advisory': MeteoalarmEventType.CoastalEvent,
			'Tsunami Watch': MeteoalarmEventType.CoastalEvent,
			'Avalanche Warning': MeteoalarmEventType.Avalanches,
			'Earthquake Warning': MeteoalarmEventType.Earthquake,
			'Volcano Warning': MeteoalarmEventType.Volcano,
			'Ashfall Warning': MeteoalarmEventType.Rain,
			'Coastal Flood Warning': MeteoalarmEventType.Flooding,
			'Lakeshore Flood Warning': MeteoalarmEventType.Flooding,
			'Flood Warning': MeteoalarmEventType.Flooding,
			'High Surf Warning': MeteoalarmEventType.CoastalEvent,
			'Dust Storm Warning': MeteoalarmEventType.Unknown,
			'Blowing Dust Warning': MeteoalarmEventType.Unknown,
			'Lake Effect Snow Warning': MeteoalarmEventType.SnowIce,
			'Excessive Heat Warning': MeteoalarmEventType.HighTemperature,
			'Tornado Watch': MeteoalarmEventType.Tornado,
			'Severe Thunderstorm Watch': MeteoalarmEventType.Thunderstorms,
			'Flash Flood Watch': MeteoalarmEventType.Flooding,
			'Gale Warning': MeteoalarmEventType.Wind,
			'Flood Statement': MeteoalarmEventType.Flooding,
			'Wind Chill Warning': MeteoalarmEventType.LowTemperature,
			'Extreme Cold Warning': MeteoalarmEventType.LowTemperature,
			'Hard Freeze Warning': MeteoalarmEventType.LowTemperature,
			'Freeze Warning': MeteoalarmEventType.LowTemperature,
			'Red Flag Warning': MeteoalarmEventType.CoastalEvent,
			'Storm Surge Watch': MeteoalarmEventType.CoastalEvent,
			'Hurricane Watch': MeteoalarmEventType.Hurricane,
			'Hurricane Force Wind Watch': MeteoalarmEventType.Wind,
			'Typhoon Watch': MeteoalarmEventType.Hurricane,
			'Tropical Storm Watch': MeteoalarmEventType.Wind,
			'Storm Watch': MeteoalarmEventType.Thunderstorms,
			'Hurricane Local Statement': MeteoalarmEventType.Wind,
			'Typhoon Local Statement': MeteoalarmEventType.Hurricane,
			'Tropical Storm Local Statement': MeteoalarmEventType.Wind,
			'Tropical Depression Local Statement': MeteoalarmEventType.Hurricane,
			'Avalanche Advisory': MeteoalarmEventType.Avalanches,
			'Winter Weather Advisory': MeteoalarmEventType.SnowIce,
			'Wind Chill Advisory': MeteoalarmEventType.LowTemperature,
			'Heat Advisory': MeteoalarmEventType.HighTemperature,
			'Urban and Small Stream Flood Advisory': MeteoalarmEventType.Flooding,
			'Small Stream Flood Advisory': MeteoalarmEventType.Flooding,
			'Arroyo and Small Stream Flood Advisory': MeteoalarmEventType.Flooding,
			'Flood Advisory': MeteoalarmEventType.Flooding,
			'Hydrologic Advisory': MeteoalarmEventType.Flooding,
			'Lakeshore Flood Advisory': MeteoalarmEventType.Flooding,
			'Coastal Flood Advisory': MeteoalarmEventType.Flooding,
			'High Surf Advisory': MeteoalarmEventType.CoastalEvent,
			'Heavy Freezing Spray Warning': MeteoalarmEventType.SnowIce,
			'Dense Fog Advisory': MeteoalarmEventType.Fog,
			'Dense Smoke Advisory': MeteoalarmEventType.Fog,
			'Small Craft Advisory For Hazardous Seas': MeteoalarmEventType.Unknown,
			'Small Craft Advisory for Rough Bar': MeteoalarmEventType.Unknown,
			'Small Craft Advisory for Winds': MeteoalarmEventType.Unknown,
			'Small Craft Advisory': MeteoalarmEventType.Unknown,
			'Brisk Wind Advisory': MeteoalarmEventType.Wind,
			'Hazardous Seas Warning': MeteoalarmEventType.SeaEvent,
			'Dust Advisory': MeteoalarmEventType.Unknown,
			'Blowing Dust Advisory': MeteoalarmEventType.Unknown,
			'Lake Wind Advisory': MeteoalarmEventType.Wind,
			'Wind Advisory': MeteoalarmEventType.Wind,
			'Frost Advisory': MeteoalarmEventType.SnowIce,
			'Ashfall Advisory': MeteoalarmEventType.SnowIce,
			'Freezing Fog Advisory': MeteoalarmEventType.SnowIce,
			'Freezing Spray Advisory': MeteoalarmEventType.SnowIce,
			'Low Water Advisory': MeteoalarmEventType.SeaEvent,
			'Local Area Emergency': MeteoalarmEventType.Unknown,
			'Avalanche Watch': MeteoalarmEventType.Avalanches,
			'Blizzard Watch': MeteoalarmEventType.Thunderstorms,
			'Rip Current Statement': MeteoalarmEventType.CoastalEvent,
			'Beach Hazards Statement': MeteoalarmEventType.CoastalEvent,
			'Gale Watch': MeteoalarmEventType.SeaEvent,
			'Winter Storm Watch': MeteoalarmEventType.SnowIce,
			'Hazardous Seas Watch': MeteoalarmEventType.SeaEvent,
			'Heavy Freezing Spray Watch': MeteoalarmEventType.SnowIce,
			'Coastal Flood Watch': MeteoalarmEventType.Flooding,
			'Lakeshore Flood Watch': MeteoalarmEventType.Flooding,
			'Flood Watch': MeteoalarmEventType.Flooding,
			'High Wind Watch': MeteoalarmEventType.Wind,
			'Excessive Heat Watch': MeteoalarmEventType.HighTemperature,
			'Extreme Cold Watch': MeteoalarmEventType.LowTemperature,
			'Wind Chill Watch': MeteoalarmEventType.LowTemperature,
			'Lake Effect Snow Watch': MeteoalarmEventType.SnowIce,
			'Hard Freeze Watch': MeteoalarmEventType.SnowIce,
			'Freeze ': MeteoalarmEventType.SnowIce,
			'Fire Weather Watch': MeteoalarmEventType.ForestFire,
			'Extreme Fire Danger': MeteoalarmEventType.ForestFire,
			'911 Telephone Outage': MeteoalarmEventType.Unknown,
			'Coastal Flood Statement': MeteoalarmEventType.Flooding,
			'Lakeshore Flood Statement': MeteoalarmEventType.Flooding,
			'Special Weather Statement': MeteoalarmEventType.Unknown,
			'Marine Weather Statement': MeteoalarmEventType.Unknown,
			'Air Quality Alert': MeteoalarmEventType.AirQuality,
			'Air Stagnation Advisory': MeteoalarmEventType.AirQuality,
			'Hazardous Weather Outlook': MeteoalarmEventType.Unknown,
			'Hydrologic Outlook': MeteoalarmEventType.CoastalEvent,
			'Short Term Forecast': MeteoalarmEventType.Unknown,
			'Administrative Message': MeteoalarmEventType.Unknown,
			'Test': MeteoalarmEventType.Unknown,
			'Child Abduction Emergency': MeteoalarmEventType.Unknown,
			'Blue Alert': MeteoalarmEventType.Unknown
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
