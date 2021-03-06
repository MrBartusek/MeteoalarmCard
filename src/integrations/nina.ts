import { HassEntity } from 'home-assistant-js-websocket';
import {
	MeteoalarmAlert,
	MeteoalarmEventType,
	MeteoalarmIntegration,
	MeteoalarmIntegrationEntityType,
	MeteoalarmIntegrationMetadata,
	MeteoalarmLevelType
} from '../types';

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
			entitiesCount: 0
		};
	}

	public supports(entity: NinaEntity): boolean {
		// Nina doesn't regally provide a good way of verification
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
			level: this.getLevelBySeverity(severity)
		}];
	}

	private getLevelBySeverity(severity: string): MeteoalarmLevelType {
		if(['Minor', 'Unknown'].includes(severity)) {
			return MeteoalarmLevelType.Yellow;
		}
		else if(['Moderate','Severe'].includes(severity)) {
			return MeteoalarmLevelType.Orange;
		}
		else if(['Extreme'].includes(severity)) {
			return MeteoalarmLevelType.Red;
		}
		else {
			throw new Error(`Unknown event severity: ${severity}`);
		}
	}
}
