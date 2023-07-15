import { HassEntity } from 'home-assistant-js-websocket';
import {
	MeteoalarmAlert,
	MeteoalarmEventType,
	MeteoalarmIntegration,
	MeteoalarmIntegrationEntityType,
	MeteoalarmIntegrationMetadata
} from '../types';

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

	public supports(entity: BurzeDzisNetEntity): boolean {
		return (
			entity.attributes.attribution == 'Information provided by Burze.dzis.net.' &&
			this.getEventType(entity) !== undefined);
	}

	public alertActive(entity: BurzeDzisNetEntity): boolean {
		return entity.state === 'on';
	}

	public getAlerts(entity: BurzeDzisNetEntity): MeteoalarmAlert {
		const event = this.getEventType(entity)!;
		return {
			event: event,
			level: entity.attributes.level!,
			headline: entity.attributes.description
		};
	}

	private getEventType(entity: HassEntity): MeteoalarmEventType | undefined {
		if(entity.entity_id.endsWith('mroz') && entity.attributes.friendly_name?.endsWith('Ostrzeżenie - Mróz')) {
			return MeteoalarmEventType.LowTemperature;
		}
		else if(entity.entity_id.endsWith('upal') && entity.attributes.friendly_name?.endsWith('Ostrzeżenie - Upał')) {
			return MeteoalarmEventType.HighTemperature;
		}
		else if(entity.entity_id.endsWith('opad') && entity.attributes.friendly_name?.endsWith('Ostrzeżenie - Opad')) {
			return MeteoalarmEventType.Rain;
		}
		else if(entity.entity_id.endsWith('burza') && entity.attributes.friendly_name?.endsWith('Ostrzeżenie - Burza')) {
			return MeteoalarmEventType.Thunderstorms;
		}
		else if(entity.entity_id.endsWith('traba') && entity.attributes.friendly_name?.endsWith('Ostrzeżenie - Trąba')) {
			return MeteoalarmEventType.Tornado;
		}
		else if(entity.entity_id.endsWith('wiatr') && entity.attributes.friendly_name?.endsWith(' Ostrzeżenie - Wiatr')) {
			return MeteoalarmEventType.Wind;
		}
		return undefined;
	}
}
