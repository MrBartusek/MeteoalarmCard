import { HassEntity } from 'home-assistant-js-websocket';
import {
	MeteoalarmAlert,
	MeteoalarmEventType,
	MeteoalarmIntegration,
	MeteoalarmIntegrationEntityType,
	MeteoalarmIntegrationMetadata
} from '../types';
import { HomeAssistant } from 'custom-card-helpers';
import { Utils } from '../utils';

type BurzeDzisNetEntity = HassEntity & {
	attributes: {
		attribution: string,
		description?: string,
		level?: number
	}
}

export default class BurzeDzisNet implements MeteoalarmIntegration {
	public get metadata(): MeteoalarmIntegrationMetadata {
		return {
			key: 'burze_dzis_net',
			name: 'Burze.dzis.net',
			type: MeteoalarmIntegrationEntityType.SeparateEvents,
			returnHeadline: true,
			returnMultipleAlerts: true,
			entitiesCount: 6,
			monitoredConditions: [
				MeteoalarmEventType.LowTemperature,
				MeteoalarmEventType.HighTemperature,
				MeteoalarmEventType.Rain,
				MeteoalarmEventType.Thunderstorms,
				MeteoalarmEventType.Tornado,
				MeteoalarmEventType.Wind
			]
		};
	}

	public async supports(hass: HomeAssistant, entity: BurzeDzisNetEntity): Promise<boolean> {
		return (
			entity.attributes.attribution == 'Information provided by Burze.dzis.net.' &&
			await this.getEventType(hass, entity) !== undefined);
	}

	public alertActive(entity: BurzeDzisNetEntity): boolean {
		return entity.state === 'on';
	}

	public async getAlerts(hass: HomeAssistant, entity: BurzeDzisNetEntity): Promise<MeteoalarmAlert> {
		const event = (await this.getEventType(hass, entity))!;
		return {
			event: event,
			level: entity.attributes.level!,
			headline: entity.attributes.description
		};
	}

	private async getEventType(hass: HomeAssistant, entity: HassEntity): Promise<MeteoalarmEventType | undefined> {
		const entityInfo = await Utils.getEntityInfo(hass, entity);

		if(entityInfo.unique_id.endsWith('binary_sensor_warning_present_frost_warning')) {
			return MeteoalarmEventType.LowTemperature;
		}
		else if(entityInfo.unique_id.endsWith('binary_sensor_warning_present_heat_warning')) {
			return MeteoalarmEventType.HighTemperature;
		}
		else if(entityInfo.unique_id.endsWith('binary_sensor_warning_present_precipitation_warning')) {
			return MeteoalarmEventType.Rain;
		}
		else if(entityInfo.unique_id.endsWith('binary_sensor_warning_present_storm_warning')) {
			return MeteoalarmEventType.Thunderstorms;
		}
		else if(entityInfo.unique_id.endsWith('binary_sensor_warning_present_tornado_warning')) {
			return MeteoalarmEventType.Tornado;
		}
		else if(entityInfo.unique_id.endsWith('binary_sensor_warning_present_wind_warning')) {
			return MeteoalarmEventType.Wind;
		}
		return undefined;
	}
}
