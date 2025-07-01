import { HassEntity } from 'home-assistant-js-websocket';
import {
	MeteoalarmAlert,
	MeteoalarmEventType,
	MeteoalarmIntegration,
	MeteoalarmIntegrationEntityType,
	MeteoalarmIntegrationMetadata,
	MeteoalarmLevelType,
} from '../types';
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import { Utils } from '../utils';

type MeteoalarmEntity = HassEntity & {
	attributes: {
		// For some reason NONE of the attributes are guaranteed; see these cases:
		// Only awareness_level and awareness_type: https://github.com/MrBartusek/MeteoalarmCard/issues/49
		// awareness_level and awareness_type not present: https://github.com/MrBartusek/MeteoalarmCard/issues/48
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
		return entity.attributes.attribution === 'Information provided by MeteoAlarm';
	}

	public alertActive(entity: MeteoalarmEntity): boolean {
		return (entity.attributes.status || entity.attributes.state || entity.state) !== 'off';
	}

	private get eventTypes(): MeteoalarmEventType[] {
		// Alert list at: https://edrop.zamg.ac.at/owncloud/index.php/s/GxPbmaRFpzrDmjn#pdfviewer
		return [
			MeteoalarmEventType.Wind,           // 1; Wind
			MeteoalarmEventType.SnowIce,        // 2; snow-ice
			MeteoalarmEventType.Thunderstorms,  // 3; Thunderstorm
			MeteoalarmEventType.Fog,            // 4; Fog
			MeteoalarmEventType.HighTemperature,// 5; high-temperature
			MeteoalarmEventType.LowTemperature, // 6; low-temperature
			MeteoalarmEventType.CoastalEvent,   // 7; coastalevent
			MeteoalarmEventType.ForestFire,     // 8; forest-fire
			MeteoalarmEventType.Avalanches,     // 9; avalanches
			MeteoalarmEventType.Rain,           // 10; Rain
			MeteoalarmEventType.Unknown,        // Reserved: there is no alert id 11
			MeteoalarmEventType.Flooding,       // 12; flooding
			MeteoalarmEventType.Flooding,       // 13; rain-flood
		];
	}

	public getAlerts(entity: MeteoalarmEntity): MeteoalarmAlert[] {
		/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
		const { event: eventHeadline, headline, severity, awareness_type: awarenessType, awareness_level: awarenessLevel, description } = entity.attributes;

		// Collect parsed events and levels
		const events: MeteoalarmEventType[] = [];
		const levels: MeteoalarmLevelType[] = [];

		if (awarenessType) {
			for (const id of awarenessType.split(';')) {
				const idx = Number(id) - 1;
				if (idx >= 0 && idx < this.eventTypes.length) {
					events.push(this.eventTypes[idx]);
				}
			}
		}

		if (awarenessLevel) {
			for (const id of awarenessLevel.split(';')) {
				let levelId = Number(id);
				// Fallback for case where id==1 should map to 2
				if (levelId === 1) levelId = 2;
				// MeteoalarmLevelType is zero-based
				levels.push((levelId - 1) as MeteoalarmLevelType);
			}
		}

		// Build alert objects: one per event/level pair
		return events.map((evt, i) => ({
			event: evt,
			level: levels[i]!,
			headline: headline ?? eventHeadline ?? '',
			description: description ?? '',
		}));
	}
}
