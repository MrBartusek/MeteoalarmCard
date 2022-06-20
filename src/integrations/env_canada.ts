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

type EnvCanadaEntity = HassEntity & {
	attributes: {
		attribution: string
	}
}

export enum EnvCanadaEntityType {
	Warning = 'Warning',
	Watch = 'Watch',
	Statement = 'Statement'
  }

export default class EnvironmentCanada implements MeteoalarmIntegration {
	public get metadata(): MeteoalarmIntegrationMetadata {
		return {
			key: 'env_canada',
			name: 'Environment Canada',
			type: MeteoalarmIntegrationEntityType.WarningWatchStatement,
			returnHeadline: false,
			returnMultipleAlerts: true,
			entitiesCount: 3
		};
	}

	public supports(entity: EnvCanadaEntity): boolean {
		const isStateNumber = !Number.isNaN(Number(entity.state));
		return (
			entity.attributes.attribution == 'Data provided by Environment Canada' &&
			this.getEntityType(entity) !== undefined &&
			isStateNumber);
	}

	public alertActive(entity: EnvCanadaEntity): boolean {
		return Number(entity.state) > 0;
	}

	private get eventTypes(): { [key: string]: MeteoalarmEventType } {
		// From: https://www.canada.ca/en/environment-climate-change/services/types-weather-forecasts-use/public/criteria-alerts.html
		return {
			'Arctic outflow': MeteoalarmEventType.SnowIce,
			'Blizzard': MeteoalarmEventType.SnowIce,
			'Blowing snow': MeteoalarmEventType.SnowIce,
			'Dust storm': MeteoalarmEventType.Dust,
			'Extreme cold': MeteoalarmEventType.LowTemperature,
			'Flash freeze': MeteoalarmEventType.SnowIce,
			'Fog': MeteoalarmEventType.Fog,
			'Freezing drizzle': MeteoalarmEventType.SnowIce,
			'Freezing rain': MeteoalarmEventType.SnowIce,
			'Frost': MeteoalarmEventType.SnowIce,
			'Heat': MeteoalarmEventType.HighTemperature,
			'Hurricane': MeteoalarmEventType.Hurricane,
			'Rainfall': MeteoalarmEventType.Rain,
			'Severe thunderstorm': MeteoalarmEventType.Thunderstorms,
			'Snowfall': MeteoalarmEventType.SnowIce,
			'Snow squall': MeteoalarmEventType.SnowIce,
			'Storm surge': MeteoalarmEventType.Thunderstorms,
			'Tornado': MeteoalarmEventType.Tornado,
			'Tropical storm': MeteoalarmEventType.Hurricane,
			'Tsunami': MeteoalarmEventType.Tsunami,
			'Weather': MeteoalarmEventType.Unknown,
			'Wind': MeteoalarmEventType.Wind,
			'Winter storm': MeteoalarmEventType.SnowIce,
			'Special Weather': MeteoalarmEventType.Unknown
		};
	}

	public getAlerts(entity: HassEntity): MeteoalarmAlert[] {
		const warningCount = Number(entity.state);

		const result: MeteoalarmAlert[] = [];
		const type = this.getEntityType(entity)!;

		for (let i = 1; i < warningCount + 1; i++) {
			// Alert name in the integration are combined event type
			// and sensor from which it was sent like:
			// Wind + Warning = Wind Warning
			// This transforms this back to event type
			let alertName = entity.attributes[`alert_${i}`] as string;
			for(const type in EnvCanadaEntityType) {
				alertName = alertName.replace(type, '');
			}
			alertName = alertName.trim();

			if(alertName in this.eventTypes) {
				const alertType = this.eventTypes[alertName];
				result.push({
					level: this.getLevelFromType(type),
					event: alertType
				});
			}
			else {
				throw new Error('Unknown Env canada alert type: ' + alertName);
			}
		}

		return result;
	}

	private getEntityType(entity: HassEntity): EnvCanadaEntityType | undefined {
		if(entity.entity_id.endsWith('warnings') && entity.attributes.friendly_name?.endsWith('Warnings')) {
			return EnvCanadaEntityType.Warning;
		}
		else if(entity.entity_id.endsWith('watches') && entity.attributes.friendly_name?.endsWith('Watches')) {
			return EnvCanadaEntityType.Watch;
		}
		else if(entity.entity_id.endsWith('statements') && entity.attributes.friendly_name?.endsWith('Statements')) {
			return EnvCanadaEntityType.Statement;
		}
		return undefined;
	}

	private getLevelFromType(type: EnvCanadaEntityType): MeteoalarmLevelType {
		if(type == EnvCanadaEntityType.Warning) {
			return MeteoalarmLevelType.Red;
		}
		else if(type == EnvCanadaEntityType.Watch) {
			return MeteoalarmLevelType.Orange;
		}
		else if(type == EnvCanadaEntityType.Statement) {
			return MeteoalarmLevelType.Yellow;
		}
		else {
			// This should never happen but is required in order for TS to stop complaining
			return MeteoalarmLevelType.Red;
		}
	}
}
