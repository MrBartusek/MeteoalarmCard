import { HassEntity } from 'home-assistant-js-websocket';
import {
	MeteoalarmAlert,
	MeteoalarmAlertKind,
	MeteoalarmEventType,
	MeteoalarmIntegration,
	MeteoalarmIntegrationEntityType,
	MeteoalarmIntegrationMetadata,
	MeteoalarmLevelType,
} from '../types';
import { Utils } from '../utils';

type DWDEntity = HassEntity & {
	attributes: {
		attribution: string;
		warning_count: number;
	};
};

export default class DWD implements MeteoalarmIntegration {
	public get metadata(): MeteoalarmIntegrationMetadata {
		return {
			key: 'dwd',
			name: 'Deutscher Wetterdienst (DWD)',
			type: MeteoalarmIntegrationEntityType.CurrentExpected,
			returnHeadline: true,
			returnMultipleAlerts: true,
			entitiesCount: 2,
			monitoredConditions: Utils.convertEventTypesForMetadata(this.eventTypes),
		};
	}

	public supports(entity: DWDEntity): boolean {
		return (
			entity.attributes.attribution == 'Data provided by DWD' &&
			this.getEntityKind(entity) !== undefined
		);
	}

	public alertActive(entity: DWDEntity): boolean {
		return entity.attributes.warning_count > 0;
	}

	private get eventTypes(): { [key: number]: MeteoalarmEventType } {
		// https://www.dwd.de/DE/leistungen/opendata/help/warnungen/cap_dwd_profile_en_pdf_2_1_14.pdf?__blob=publicationFile&v=2
		// Event codes are listed in appendix 3.1
		return {
			22: MeteoalarmEventType.SnowIce,
			31: MeteoalarmEventType.Thunderstorms,
			33: MeteoalarmEventType.Thunderstorms,
			34: MeteoalarmEventType.Thunderstorms,
			36: MeteoalarmEventType.Thunderstorms,
			38: MeteoalarmEventType.Thunderstorms,
			40: MeteoalarmEventType.Thunderstorms,
			41: MeteoalarmEventType.Thunderstorms,
			42: MeteoalarmEventType.Thunderstorms,
			44: MeteoalarmEventType.Thunderstorms,
			45: MeteoalarmEventType.Thunderstorms,
			46: MeteoalarmEventType.Thunderstorms,
			48: MeteoalarmEventType.Thunderstorms,
			49: MeteoalarmEventType.Thunderstorms,
			51: MeteoalarmEventType.Wind,
			52: MeteoalarmEventType.Wind,
			53: MeteoalarmEventType.Wind,
			54: MeteoalarmEventType.Wind,
			55: MeteoalarmEventType.Wind,
			56: MeteoalarmEventType.Wind,
			57: MeteoalarmEventType.Wind,
			58: MeteoalarmEventType.Wind,
			59: MeteoalarmEventType.Fog,
			61: MeteoalarmEventType.Rain,
			62: MeteoalarmEventType.Rain,
			63: MeteoalarmEventType.Rain,
			64: MeteoalarmEventType.Rain,
			65: MeteoalarmEventType.Rain,
			66: MeteoalarmEventType.Rain,
			70: MeteoalarmEventType.SnowIce,
			71: MeteoalarmEventType.SnowIce,
			72: MeteoalarmEventType.SnowIce,
			73: MeteoalarmEventType.SnowIce,
			74: MeteoalarmEventType.SnowIce,
			75: MeteoalarmEventType.SnowIce,
			76: MeteoalarmEventType.SnowIce,
			79: MeteoalarmEventType.SnowIce,
			82: MeteoalarmEventType.SnowIce,
			84: MeteoalarmEventType.SnowIce,
			85: MeteoalarmEventType.SnowIce,
			86: MeteoalarmEventType.SnowIce,
			87: MeteoalarmEventType.SnowIce,
			88: MeteoalarmEventType.SnowIce,
			89: MeteoalarmEventType.SnowIce,
			90: MeteoalarmEventType.Thunderstorms,
			91: MeteoalarmEventType.Thunderstorms,
			92: MeteoalarmEventType.Thunderstorms,
			93: MeteoalarmEventType.Thunderstorms,
			95: MeteoalarmEventType.Thunderstorms,
			96: MeteoalarmEventType.Thunderstorms,
			246: MeteoalarmEventType.HighTemperature,
			247: MeteoalarmEventType.HighTemperature,
			248: MeteoalarmEventType.HighTemperature,
			11: MeteoalarmEventType.CoastalEvent,
			12: MeteoalarmEventType.CoastalEvent,
			13: MeteoalarmEventType.CoastalEvent,
			14: MeteoalarmEventType.CoastalEvent,
			15: MeteoalarmEventType.CoastalEvent,
			16: MeteoalarmEventType.CoastalEvent,
		};
	}

	public getAlerts(entity: HassEntity): MeteoalarmAlert[] {
		const { warning_count: warningCount } = entity.attributes;

		const result: MeteoalarmAlert[] = [];
		const kind = this.getEntityKind(entity)!;

		for (let i = 1; i < warningCount + 1; i++) {
			const level = entity.attributes[`warning_${i}_level`];
			const id = entity.attributes[`warning_${i}_type`];
			const headline = entity.attributes[`warning_${i}_headline`];
			if (level == entity.state) {
				if (id in this.eventTypes) {
					result.push({
						headline: headline,
						level: this.convertAwarenessLevel(level) as MeteoalarmLevelType,
						event: this.eventTypes[id],
						kind: kind,
					});
				} else if (id == 98 || id == 99) {
					throw new Error('An test warning was issued! ID: ' + id);
				} else {
					throw new Error('Unknown event ID: ' + id);
				}
			}
		}

		return result;
	}

	// Convert DWD scale 1-4 to meteoalarm scale 1-3
	private convertAwarenessLevel(level: number) {
		return level == 4 ? 3 : level;
	}

	private getEntityKind(entity: HassEntity): MeteoalarmAlertKind | undefined {
		/**
		 * Detecting only by English and German entity_id translations here is hardly
		 * a good solution but, it covers 99% of use cases, should be improved in the
		 * future
		 */
		const CURRENT_IDENTIFIERS = ['current', 'aktuelle'];
		const EXPECTED_IDENTIFIERS = ['advance', 'vorwarnstufe'];

		const friendlyName = entity.attributes.friendly_name || '';
		const entityIdParts = entity.entity_id.split('_').map((p) => p.toLocaleLowerCase());
		const friendlyNameParts = friendlyName?.split(' ').map((p) => p.toLocaleLowerCase());

		if (
			CURRENT_IDENTIFIERS.some(
				(ident) => entityIdParts.includes(ident) || friendlyNameParts.includes(ident),
			)
		) {
			return MeteoalarmAlertKind.Current;
		} else if (
			EXPECTED_IDENTIFIERS.some(
				(ident) => entityIdParts.includes(ident) || friendlyNameParts.includes(ident),
			)
		) {
			return MeteoalarmAlertKind.Expected;
		}
		return undefined;
	}
}
