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

	public supports(entity: NinaEntity): boolean {
		// Nina doesn't really provide a good way of verification
		return ['on', 'off'].includes(entity.state);
	}

	public alertActive(entity: NinaEntity): boolean {
		return entity.state == 'on';
	}

	public getAlerts(entity: NinaEntity): MeteoalarmAlert[] {
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
