import { HassEntity } from 'home-assistant-js-websocket';
import {
	MeteoalarmAlert,
	MeteoalarmEventType,
	MeteoalarmIntegration,
	MeteoalarmIntegrationEntityType,
	MeteoalarmIntegrationMetadata,
	MeteoalarmLevelType,
} from '../types';

type EnvCanadaEntity = HassEntity & {
	attributes: {
		attribution: string;
	};
};

export enum EnvCanadaEntityType {
	Warning,
	Watch,
	Statement,
	Advisory,
}

const ATTRIBUTION_EN = 'Data provided by Environment Canada';
const ATTRIBUTION_FR = 'Données fournies par Environnement Canada';

export default class EnvironmentCanada implements MeteoalarmIntegration {
	public get metadata(): MeteoalarmIntegrationMetadata {
		return {
			key: 'env_canada',
			name: 'Environment Canada',
			type: MeteoalarmIntegrationEntityType.WarningWatchStatementAdvisory,
			returnHeadline: false,
			returnMultipleAlerts: true,
			entitiesCount: 4,
			monitoredConditions: [...new Set(this.eventTypes.map((e) => e.type))],
		};
	}

	public supports(entity: EnvCanadaEntity): boolean {
		const isStateNumber = !Number.isNaN(Number(entity.state));
		return (
			[ATTRIBUTION_EN, ATTRIBUTION_FR].includes(entity.attributes.attribution) &&
			this.getEntityType(entity) !== undefined &&
			isStateNumber
		);
	}

	public alertActive(entity: EnvCanadaEntity): boolean {
		return Number(entity.state) > 0;
	}

	private get eventTypes(): { en: string; fr: string; type: MeteoalarmEventType }[] {
		// English from: https://www.canada.ca/en/environment-climate-change/services/types-weather-forecasts-use/public/criteria-alerts.html
		// French from : https://www.canada.ca/fr/environnement-changement-climatique/services/types-previsions-meteorologiques-utilisation/publiques/criteres-alertes-meteo.html
		return [
			{
				en: 'Arctic Outflow',
				fr: 'Poussée d’air Arctique',
				type: MeteoalarmEventType.SnowIce,
			},
			{
				en: 'Blizzard',
				fr: 'Blizzard',
				type: MeteoalarmEventType.SnowIce,
			},
			{
				en: 'Blowing Snow',
				fr: 'Poudrerie',
				type: MeteoalarmEventType.SnowIce,
			},
			{
				en: 'Dust Storm',
				fr: 'Tempête de Poussière',
				type: MeteoalarmEventType.Dust,
			},
			{
				en: 'Extreme Cold',
				fr: 'Froid Extrême',
				type: MeteoalarmEventType.LowTemperature,
			},
			{
				en: 'Flash Freeze',
				fr: 'Refroidissement Soudain',
				type: MeteoalarmEventType.SnowIce,
			},
			{
				en: 'Fog',
				fr: 'Brouillard',
				type: MeteoalarmEventType.Fog,
			},
			{
				en: 'Freezing Drizzle',
				fr: 'Bruine Verglaçante',
				type: MeteoalarmEventType.SnowIce,
			},
			{
				en: 'Freezing Rain',
				fr: 'Pluie Verglaçante',
				type: MeteoalarmEventType.SnowIce,
			},
			{
				en: 'Frost',
				fr: 'Gel',
				type: MeteoalarmEventType.SnowIce,
			},
			{
				en: 'Heat',
				fr: 'Chaleur',
				type: MeteoalarmEventType.HighTemperature,
			},
			{
				en: 'Hurricane',
				fr: 'Ouragan',
				type: MeteoalarmEventType.Hurricane,
			},
			{
				en: 'Rainfall',
				fr: 'Pluie',
				type: MeteoalarmEventType.Rain,
			},
			{
				en: 'Severe Thunderstorm',
				fr: 'Orages Violents',
				type: MeteoalarmEventType.Thunderstorms,
			},
			{
				en: 'Smog',
				fr: 'Smog',
				type: MeteoalarmEventType.AirQuality,
			},
			{
				en: 'Snowfall',
				fr: 'Neige',
				type: MeteoalarmEventType.SnowIce,
			},
			{
				en: 'Snow Squall',
				fr: 'Bourrasques de Neige',
				type: MeteoalarmEventType.SnowIce,
			},
			{
				en: 'Storm Surge',
				fr: 'Onde de Tempête',
				type: MeteoalarmEventType.Thunderstorms,
			},
			{
				en: 'Tornado',
				fr: 'Tornade',
				type: MeteoalarmEventType.Tornado,
			},
			{
				en: 'Tropical Storm',
				fr: 'Tempête Tropicale',
				type: MeteoalarmEventType.Hurricane,
			},
			{
				en: 'Tsunami',
				fr: 'Tsunami',
				type: MeteoalarmEventType.Tsunami,
			},
			{
				en: 'Weather',
				fr: 'Météorologique',
				type: MeteoalarmEventType.Unknown,
			},
			{
				en: 'Wind',
				fr: 'Vents',
				type: MeteoalarmEventType.Wind,
			},
			{
				en: 'Winter Storm',
				fr: 'Tempête Hivernale',
				type: MeteoalarmEventType.SnowIce,
			},
			{
				en: 'Special Weather',
				fr: 'Météorologique Spécial',
				type: MeteoalarmEventType.Unknown,
			},
			{
				en: 'Special Air Quality',
				fr: "Spécial Sur La Qualité De L'Air",
				type: MeteoalarmEventType.AirQuality,
			},
		];
	}

	private getEventType(alertName: string, isFrench: boolean) {
		return this.eventTypes.find((e) => {
			return (isFrench && e.fr == alertName) || (!isFrench && e.en == alertName);
		});
	}

	public getAlerts(entity: EnvCanadaEntity): MeteoalarmAlert[] {
		const warningCount = Number(entity.state);
		const result: MeteoalarmAlert[] = [];

		for (let i = 1; i < warningCount + 1; i++) {
			const alert = entity.attributes[`alert_${i}`] as string;
			const alertName = alert.substring(alert.indexOf('-') + 2);
			const alertCriterion = alert.substring(0, alert.indexOf('-') - 1);
			const isFrench = entity.attributes.attribution == 'Données fournies par Environnement Canada';
			const level = this.getLevelType(alertCriterion);
			const event = this.getEventType(alertName, isFrench);

			if (level == MeteoalarmLevelType.None) {
				throw new Error(
					`Unknown Environnement Canada alert criterion encountered! Alert: ${alert} (isFrench=${isFrench})`,
				);
			} else if (!event) {
				throw new Error(
					`Unknown Environnement Canada alert type encountered! Alert: ${alert} (isFrench=${isFrench})`,
				);
			}

			result.push({
				level: level,
				event: event.type,
			});
		}

		return result;
	}

	private getEntityType(entity: HassEntity): EnvCanadaEntityType | undefined {
		// It's actually a sketchy solution to this, entity type can be detected by
		// entity_id or friendly_name so it loops thought both of them
		for (const attribute of [
			entity.entity_id,
			entity.attributes.friendly_name?.toLocaleLowerCase(),
		]) {
			if (!attribute) continue;
			if (attribute.endsWith('warnings')) {
				return EnvCanadaEntityType.Warning;
			} else if (attribute.endsWith('watches')) {
				return EnvCanadaEntityType.Watch;
			} else if (attribute.endsWith('statements')) {
				return EnvCanadaEntityType.Statement;
			} else if (attribute.endsWith('advisories')) {
				return EnvCanadaEntityType.Advisory;
			}
		}
		return undefined;
	}

	private getLevelType(level: string): MeteoalarmLevelType {
		// English from: https://www.canada.ca/en/services/environment/weather/severeweather/weather-alerts/colour-coded-alerts.html
		// French from: https://www.canada.ca/fr/services/environnement/meteo/conditionsdangereuses/alertes-meteo/alertes-code-couleur.html

		switch (level) {
			case 'Red Warning':
			case 'Avertissement rouge':
				return MeteoalarmLevelType.Red;
			case 'Orange Warning':
			case 'Avertissement orange':
				return MeteoalarmLevelType.Orange;
			case 'Yellow Warning':
			case 'Avertissement jaune':
				return MeteoalarmLevelType.Yellow;
			default:
				return MeteoalarmLevelType.None;
		}
	}
}
