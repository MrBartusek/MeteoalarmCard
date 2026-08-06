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

type GeosphereATEntity = HassEntity & {
	attributes: {
		attribution: string;
		warning_count: number;
	};
};

export default class GeosphereAT implements MeteoalarmIntegration {
	public get metadata(): MeteoalarmIntegrationMetadata {
		return {
			key: 'geosphere_at',
			name: 'GeoSphere Austria',
			type: MeteoalarmIntegrationEntityType.CurrentExpected,
			returnHeadline: true,
			returnMultipleAlerts: true,
			entitiesCount: 2,
			monitoredConditions: Utils.convertEventTypesForMetadata(this.eventTypes),
		};
	}

	public supports(entity: GeosphereATEntity): boolean {
		return (
			entity.attributes.attribution == 'Data provided by GeoSphere Austria' &&
			this.getEntityKind(entity) !== undefined
		);
	}

	public alertActive(entity: GeosphereATEntity): boolean {
		return entity.attributes.warning_count > 0;
	}

	private get eventTypes(): { [key: number]: MeteoalarmEventType } {
		// https://openapi.hub.geosphere.at/warnapi/v1/#/warnings/
		// API documentation
		return {
			1: MeteoalarmEventType.Wind,
			2: MeteoalarmEventType.Rain,
			3: MeteoalarmEventType.SnowIce,
			4: MeteoalarmEventType.SnowIce,
			5: MeteoalarmEventType.Thunderstorms,
			6: MeteoalarmEventType.HighTemperature,
			7: MeteoalarmEventType.LowTemperature,
			99: MeteoalarmEventType.Unknown, // Test warning
		};
	}

	public getAlerts(entity: GeosphereATEntity): MeteoalarmAlert[] {
		const { warning_count: warningCount } = entity.attributes;

		const result: MeteoalarmAlert[] = [];
		const kind = this.getEntityKind(entity)!;

		for (let i = 1; i < warningCount + 1; i++) {
			const level = entity.attributes[`warning_${i}_level`];
			const id = entity.attributes[`warning_${i}_type`];
			const headline = entity.attributes[`warning_${i}_name`];

			if (id in this.eventTypes) {
				result.push({
					headline: headline,
					level: level as MeteoalarmLevelType,
					event: this.eventTypes[id],
					kind: kind,
				});
			} else {
				throw new Error('Unknown event ID: ' + id);
			}
		}

		return result;
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
