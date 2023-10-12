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
import { HomeAssistant } from 'custom-card-helpers';

type NinaEntity = HassEntity & {
	attributes: {
		headline: string,
		severity: string,
	}
}

export default class NINA implements MeteoalarmIntegration {
	public get metadata(): MeteoalarmIntegrationMetadata {
		return {
			key: 'nina',
			name: 'NINA',
			type: MeteoalarmIntegrationEntityType.Slots,
			returnHeadline: true,
			returnMultipleAlerts: true,
			entitiesCount: 0,
			monitoredConditions: [
				MeteoalarmEventType.Unknown
			]
		};
	}

	public async supports(_hass: HomeAssistant, entity: NinaEntity): Promise<boolean> {
		// Nina doesn't really provide a good way of verification
		return ['on', 'off'].includes(entity.state);
	}

	public alertActive(entity: NinaEntity): boolean {
		return entity.state == 'on';
	}

	public async getAlerts(_hass: HomeAssistant, entity: NinaEntity): Promise<MeteoalarmAlert[]> {
		const { severity, headline } = entity.attributes;

		return [{
			event: MeteoalarmEventType.Unknown,
			headline: headline,
			level: Utils.getLevelBySeverity(
				severity, {
					'Moderate': MeteoalarmLevelType.Orange
				})
		}];
	}
}
