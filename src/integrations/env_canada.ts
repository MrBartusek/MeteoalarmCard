import { HassEntity } from 'home-assistant-js-websocket';
import {
	MeteoalarmAlert,
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
	Warning,
	Watch,
	Statement
}

const ATTRIBUTION_EN = 'Data provided by Environment Canada';
const ATTRIBUTION_FR = 'Données fournies par Environnement Canada';

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
			[ATTRIBUTION_EN, ATTRIBUTION_FR].includes(entity.attributes.attribution) &&
			this.getEntityType(entity) !== undefined &&
			isStateNumber);
	}

	public alertActive(entity: EnvCanadaEntity): boolean {
		return Number(entity.state) > 0;
	}

	private get eventTypes(): {en: string, fr: string, type: MeteoalarmEventType }[] {
		// English from: https://www.canada.ca/en/environment-climate-change/services/types-weather-forecasts-use/public/criteria-alerts.html
		// French from : https://www.canada.ca/fr/environnement-changement-climatique/services/types-previsions-meteorologiques-utilisation/publiques/criteres-alertes-meteo.html
		return [
			{
				en: 'Arctic Outflow',
				fr: 'Poussée d’air Arctique',
				type: MeteoalarmEventType.SnowIce
			},
			{
				en: 'Blizzard',
				fr: 'Blizzard',
				type: MeteoalarmEventType.SnowIce
			},
			{
				en: 'Blowing Snow',
				fr: 'Poudrerie',
				type: MeteoalarmEventType.SnowIce
			},
			{
				en: 'Dust Storm',
				fr: 'Tempête de Poussière',
				type: MeteoalarmEventType.Dust
			},
			{
				en: 'Extreme Cold',
				fr: 'Froid Extrême',
				type: MeteoalarmEventType.LowTemperature
			},
			{
				en: 'Flash Freeze',
				fr: 'Refroidissement Soudain',
				type: MeteoalarmEventType.SnowIce
			},
			{
				en: 'Fog',
				fr: 'Brouillard',
				type: MeteoalarmEventType.Fog
			},
			{
				en: 'Freezing Drizzle',
				fr: 'Bruine Verglaçante',
				type: MeteoalarmEventType.SnowIce
			},
			{
				en: 'Freezing Rain',
				fr: 'Pluie Verglaçante',
				type: MeteoalarmEventType.SnowIce
			},
			{
				en: 'Frost',
				fr: 'Gel',
				type: MeteoalarmEventType.SnowIce
			},
			{
				en: 'Heat',
				fr: 'Chaleur',
				type: MeteoalarmEventType.HighTemperature
			},
			{
				en: 'Hurricane',
				fr: 'Ouragan',
				type: MeteoalarmEventType.Hurricane
			},
			{
				en: 'Rainfall',
				fr: 'Pluie',
				type: MeteoalarmEventType.Rain
			},
			{
				en: 'Severe Thunderstorm',
				fr: 'Orage Violent',
				type: MeteoalarmEventType.Thunderstorms
			},
			{
				en: 'Snowfall',
				fr: 'Neige',
				type: MeteoalarmEventType.SnowIce
			},
			{
				en: 'Snow Squall',
				fr: 'Bourrasques de Neige',
				type: MeteoalarmEventType.SnowIce
			},
			{
				en: 'Storm Surge',
				fr: 'Onde de Tempête',
				type: MeteoalarmEventType.Thunderstorms
			},
			{
				en: 'Tornado',
				fr: 'Tornade',
				type: MeteoalarmEventType.Tornado
			},
			{
				en: 'Tropical Storm',
				fr: 'Tempête Tropicale',
				type: MeteoalarmEventType.Hurricane
			},
			{
				en: 'Tsunami',
				fr: 'Tsunami',
				type: MeteoalarmEventType.Tsunami
			},
			{
				en: 'Weather',
				fr: 'Météorologique',
				type: MeteoalarmEventType.Unknown
			},
			{
				en: 'Wind',
				fr: 'Vents',
				type: MeteoalarmEventType.Wind
			},
			{
				en: 'Winter Storm',
				fr: 'Tempête Hivernale',
				type: MeteoalarmEventType.SnowIce
			},
			{
				en: 'Special Weather',
				fr: 'Météorologique Spécial',
				type: MeteoalarmEventType.Unknown
			},
			{
				en: 'Special Air Quality',
				fr: 'Qualité de l\'air',
				type: MeteoalarmEventType.AirQuality
			}
		];
	}

	private get entityTypeTranslation(): {en: string, fr: string, type: EnvCanadaEntityType }[] {
		// English from: https://www.canada.ca/en/environment-climate-change/services/types-weather-forecasts-use/public/criteria-alerts.html
		// French from : https://www.canada.ca/fr/environnement-changement-climatique/services/types-previsions-meteorologiques-utilisation/publiques/criteres-alertes-meteo.html
		return [
			{
				type: EnvCanadaEntityType.Warning,
				en: 'Warning',
				fr: 'Avertissement De'
			},
			{
				type: EnvCanadaEntityType.Watch,
				en: 'Watch',
				fr: 'Veille De'
			},
			{
				type: EnvCanadaEntityType.Statement,
				en: 'Statement',
				fr: 'Bulletin'
			}
		];
	}

	/**
	 * Alert name in the integration are combined event type
	 * and sensor from which it was sent like:
	 * Wind + Warning = Wind Warning
	 * This transforms this back to event type
	 */
	private praseAlertName(alertName: string, type: EnvCanadaEntityType, isFrench: boolean) {
		const prefixTranslation = this.entityTypeTranslation.find(t => t.type == type)!;
		const prefix = isFrench ? prefixTranslation.fr : prefixTranslation.en;
		if(!alertName.includes(prefix)) throw new Error(`Translated event prefix was not found in alert name '${prefix}' (isFrench=${isFrench})`);
		alertName = alertName.replace(prefix, '') .trim();

		return this.eventTypes.find(e => {
			return (
				(isFrench && e.fr == alertName) ||
				(!isFrench && e.en == alertName)
			);
		});
	}

	public getAlerts(entity: EnvCanadaEntity): MeteoalarmAlert[] {
		const warningCount = Number(entity.state);

		const result: MeteoalarmAlert[] = [];
		const type = this.getEntityType(entity)!;

		for (let i = 1; i < warningCount + 1; i++) {
			const alertName = entity.attributes[`alert_${i}`] as string;
			const isFrench = entity.attributes.attribution == 'Données fournies par Environnement Canada';
			const alert = this.praseAlertName(alertName, type, isFrench);

			if(alert) {
				result.push({
					level: this.getLevelFromType(type),
					event: alert.type
				});
			}
			else {
				throw new Error(`Unknown Env canada alert type: ${alertName} (isFrench=${isFrench})`);
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
