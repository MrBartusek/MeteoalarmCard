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

type NWSAlertsAlert = {
	Event: string;
	Severity: string;
};

type NWSAlertsEntity = HassEntity & {
	attributes: {
		attribution: string;
		Alerts: NWSAlertsAlert[];
	};
};

export default class NWSAlerts implements MeteoalarmIntegration {
	public get metadata(): MeteoalarmIntegrationMetadata {
		return {
			key: 'nwsalerts',
			name: 'NWSAlerts',
			type: MeteoalarmIntegrationEntityType.SingleEntity,
			returnHeadline: true,
			returnMultipleAlerts: true,
			entitiesCount: 1,
			monitoredConditions: Utils.convertEventTypesForMetadata(this.eventTypes),
		};
	}

	public supports(entity: NWSAlertsEntity): boolean {
		return entity.attributes.attribution == 'Data provided by Weather.gov';
	}

	public alertActive(entity: NWSAlertsEntity): boolean {
		return Number(entity.state) > 0;
	}

	private get eventTypes(): { [key: string]: MeteoalarmEventType } {
		// https://vlab.noaa.gov/web/nws-common-alerting-protocol/cap-documentation#_eventcode_inclusion-16
		return {
			'911 Telephone': MeteoalarmEventType.Unknown,
			Administrative: MeteoalarmEventType.Unknown,
			'Air Quality': MeteoalarmEventType.AirQuality,
			'Air Stagnation': MeteoalarmEventType.AirQuality,
			Ashfall: MeteoalarmEventType.Volcano,
			Avalanche: MeteoalarmEventType.Avalanches,
			'Beach Hazards': MeteoalarmEventType.CoastalEvent,
			Blizzard: MeteoalarmEventType.SnowIce,
			'Blowing Dust': MeteoalarmEventType.Dust,
			Blue: MeteoalarmEventType.Unknown,
			'Brisk Wind': MeteoalarmEventType.Wind,
			'Child Abduction': MeteoalarmEventType.Unknown,
			'Civil Danger': MeteoalarmEventType.Unknown,
			'Civil Emergency': MeteoalarmEventType.Unknown,
			'Coastal Flood': MeteoalarmEventType.Flooding,
			'Cold Weather': MeteoalarmEventType.LowTemperature,
			'Dense Fog': MeteoalarmEventType.Fog,
			'Dense Smoke': MeteoalarmEventType.Fog,
			'Dust Advisory': MeteoalarmEventType.Dust,
			'Dust Storm': MeteoalarmEventType.Dust,
			Earthquake: MeteoalarmEventType.Earthquake,
			Evacuation: MeteoalarmEventType.Unknown,
			'Excessive Heat': MeteoalarmEventType.HighTemperature,
			'Extreme Cold': MeteoalarmEventType.LowTemperature,
			'Extreme Fire': MeteoalarmEventType.ForestFire,
			'Extreme Heat': MeteoalarmEventType.HighTemperature,
			'Extreme Wind': MeteoalarmEventType.Wind,
			'Fire Warning': MeteoalarmEventType.ForestFire,
			'Fire Weather': MeteoalarmEventType.ForestFire,
			'Flash Flood': MeteoalarmEventType.Flooding,
			Flood: MeteoalarmEventType.Flooding,
			Freeze: MeteoalarmEventType.LowTemperature,
			'Freezing Fog': MeteoalarmEventType.SnowIce,
			'Freezing Spray': MeteoalarmEventType.SeaEvent,
			Frost: MeteoalarmEventType.LowTemperature,
			Gale: MeteoalarmEventType.SeaEvent,
			'Hard Freeze': MeteoalarmEventType.LowTemperature,
			'Hazardous Materials': MeteoalarmEventType.Unknown,
			'Hazardous Seas': MeteoalarmEventType.SeaEvent,
			Heat: MeteoalarmEventType.HighTemperature,
			'Heavy Freezing Spray': MeteoalarmEventType.SeaEvent,
			'High Surf': MeteoalarmEventType.CoastalEvent,
			'High Wind': MeteoalarmEventType.Wind,
			'Hurricane Force Wind': MeteoalarmEventType.Hurricane,
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
			'Severe Thunderstorm': MeteoalarmEventType.Thunderstorms,
			'Shelter In Place': MeteoalarmEventType.Unknown,
			'Small Craft': MeteoalarmEventType.SeaEvent,
			'Snow Squall': MeteoalarmEventType.SnowIce,
			'Special Marine': MeteoalarmEventType.SeaEvent,
			'Special Weather': MeteoalarmEventType.Unknown,
			'Storm Surge': MeteoalarmEventType.CoastalEvent,
			Storm: MeteoalarmEventType.Thunderstorms,
			Tornado: MeteoalarmEventType.Tornado,
			'Tropical Cyclone': MeteoalarmEventType.Hurricane,
			'Tropical Storm': MeteoalarmEventType.Hurricane,
			Tsunami: MeteoalarmEventType.Tsunami,
			Typhoon: MeteoalarmEventType.Hurricane,
			Volcano: MeteoalarmEventType.Volcano,
			Wind: MeteoalarmEventType.Wind,
			'Winter Storm': MeteoalarmEventType.SnowIce,
			'Winter Weather': MeteoalarmEventType.SnowIce,
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

			Immediate: MeteoalarmLevelType.Red, // Evacuation
			Emergency: MeteoalarmLevelType.Red, // Local Area Emergency
			Danger: MeteoalarmLevelType.Red, // Extreme Fire Danger
			Message: MeteoalarmLevelType.Orange, //Civil Emergency Message
			Outage: MeteoalarmLevelType.Orange, // 911 Telephone Outage.
			Outlook: MeteoalarmLevelType.Yellow, // Hydrologic Outlook
		};
	}

	public getAlerts(entity: NWSAlertsEntity): MeteoalarmAlert[] {
		const { Alerts } = entity.attributes;

		const result: MeteoalarmAlert[] = [];

		for (const alert of Alerts) {
			const fullAlertName = alert.Event;
			let alertLevel: MeteoalarmLevelType | undefined = undefined;
			let alertType: MeteoalarmEventType | undefined = undefined;

			for (const [levelName, level] of Object.entries(this.eventLevels)) {
				if (!fullAlertName.includes(levelName)) continue;
				alertLevel = level;
				const alertName = fullAlertName.replace(levelName, '').trim();
				alertType = this.eventTypes[alertName];
				if (alertType == undefined) {
					throw Error(`Unknown nwsalerts alert type: ${alertName}`);
				}
			}

			if (alertLevel == undefined) {
				throw Error(`Unknown nwsalerts alert level: ${fullAlertName}`);
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
