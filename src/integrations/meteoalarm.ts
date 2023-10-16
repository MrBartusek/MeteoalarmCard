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

type MeteoalarmEntity = HassEntity & {
	attributes: {
		// For some reason NONE of the attributes are guarantee see these cases:
		// Only awareness_level and awareness_type: https://github.com/MrBartusek/MeteoalarmCard/issues/49
		// awareness_level and awareness_type not present: https://github.com/MrBartusek/MeteoalarmCard/issues/48
		// code should except that everything or nothing will be there
		awareness_level?: string;
		awareness_type?: string;
		event?: string;
		severity?: string;
		headline?: string;
		description?: string;
		attribution: string;
	};
};

export default class Meteoalarm implements MeteoalarmIntegration {
	public get metadata(): MeteoalarmIntegrationMetadata {
		return {
			key: 'meteoalarm',
			name: 'Meteoalarm',
			type: MeteoalarmIntegrationEntityType.SingleEntity,
			returnHeadline: true,
			returnMultipleAlerts: false,
			entitiesCount: 1,
			monitoredConditions: this.eventTypes,
		};
	}

	public supports(entity: MeteoalarmEntity): boolean {
		return entity.attributes.attribution == 'Information provided by MeteoAlarm';
	}

	public alertActive(entity: MeteoalarmEntity): boolean {
		return (entity.attributes.status || entity.attributes.state || entity.state) != 'off';
	}

	private get eventTypes(): MeteoalarmEventType[] {
		// Alert list at: https://edrop.zamg.ac.at/owncloud/index.php/s/GxPbmaRFpzrDmjn#pdfviewer
		return [
			MeteoalarmEventType.Wind, // 1; Wind
			MeteoalarmEventType.SnowIce, // 2; snow-ice
			MeteoalarmEventType.Thunderstorms, // 3; Thunderstorm
			MeteoalarmEventType.Fog, // 4; Fog
			MeteoalarmEventType.HighTemperature, // 5; high-temperature
			MeteoalarmEventType.LowTemperature, // 6; low-temperature
			MeteoalarmEventType.CoastalEvent, // 7; coastalevent
			MeteoalarmEventType.ForestFire, // 8; forest-fire
			MeteoalarmEventType.Avalanches, // 9; avalanches
			MeteoalarmEventType.Rain, // 10; Rain
			MeteoalarmEventType.Unknown, // Reserved: there is no alert id 11
			MeteoalarmEventType.Flooding, // 12; flooding
			MeteoalarmEventType.Flooding, // 13; rain-flood
		];
	}

	public getAlerts(entity: MeteoalarmEntity): MeteoalarmAlert[] {
		const {
			event: eventHeadline,
			headline,
			severity,
			awareness_type: awarenessType,
			awareness_level: awarenessLevel,
		} = entity.attributes;

		let event: MeteoalarmEventType | undefined;
		let level: MeteoalarmLevelType | undefined;

		if (awarenessType != undefined) {
			event = this.eventTypes[Number(awarenessType.split(';')[0]) - 1];
		}

		if (awarenessLevel != undefined) {
			let levelID = Number(awarenessLevel.split(';')[0]);
			if (levelID == 1) {
				// Fallback for https://github.com/MrBartusek/MeteoalarmCard/issues/49
				levelID = 2;
			}
			level = (levelID - 1) as MeteoalarmLevelType;
		}

		if (level === undefined && severity !== undefined) {
			level = Utils.getLevelBySeverity(severity);
		}
		if (level === undefined) {
			throw new Error('Failed to determine alert level. awareness_level nor severity are provided');
		}

		return [
			{
				headline: eventHeadline || headline,
				level: level,
				event: event || MeteoalarmEventType.Unknown,
			},
		];
	}
}
