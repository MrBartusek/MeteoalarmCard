import { HomeAssistant } from 'custom-card-helpers';
import { HassEntity } from 'home-assistant-js-websocket';
import { processConfigEntities } from '../helpers/process-config-entities';
import {
	MeteoalarmAlert,
	MeteoalarmAlertKind,
	MeteoalarmCardConfig,
	MeteoalarmEventType,
	MeteoalarmIntegration,
	MeteoalarmIntegrationEntityType,
	MeteoalarmIntegrationMetadata,
	MeteoalarmLevelType,
} from '../types';

type GeoSphereWarning = {
	warning_id: number;
	change_id: number;
	course_id: number;
	type: string;
	level: string;
	start: string;
	end: string;
	text?: string;
	impacts?: string;
	recommendations?: string;
	meteo_text?: string;
	update_reason?: string;
};

type GeoSphereWarningsResponse = {
	active_warnings: GeoSphereWarning[];
	advance_warnings: GeoSphereWarning[];
};

type GeoSphereServiceCallResult = {
	context: unknown;
	response: GeoSphereWarningsResponse;
};

type GeoSphereVirtualEntity = HassEntity & {
	attributes: {
		integration: 'geosphere_austria_warnings';
		warning_kind: 'active' | 'advance';
		warnings: GeoSphereWarning[];
	};
};

/**
 * GeoSphere Austria Warnings adapter.
 *
 * All GeoSphere-specific action handling and payload conversion remains here.
 * meteoalarm-card.ts only knows that this adapter can asynchronously supply
 * virtual entities.
 */
export default class GeoSphereAustria implements MeteoalarmIntegration {
	public get metadata(): MeteoalarmIntegrationMetadata {
		return {
			key: 'geosphere_at',
			name: 'GeoSphere Austria Warnings',
			type: MeteoalarmIntegrationEntityType.CurrentExpected,
			returnHeadline: true,
			returnMultipleAlerts: true,
			// GeoSphere creates current/advance virtual entities internally.
			// The user-selected entities are refresh triggers, not warning entities.
			entitiesCount: 0,
			monitoredConditions: [
				MeteoalarmEventType.Wind,
				MeteoalarmEventType.Rain,
				MeteoalarmEventType.SnowIce,
				MeteoalarmEventType.Thunderstorms,
				MeteoalarmEventType.HighTemperature,
				MeteoalarmEventType.LowTemperature,
			],
		};
	}

	public supports(entity: GeoSphereVirtualEntity): boolean {
		return entity.attributes.integration === 'geosphere_austria_warnings';
	}

	public alertActive(entity: GeoSphereVirtualEntity): boolean {
		return entity.attributes.warnings.length > 0;
	}

	public getAlerts(entity: GeoSphereVirtualEntity): MeteoalarmAlert[] {
		const kind =
			entity.attributes.warning_kind === 'active'
				? MeteoalarmAlertKind.Current
				: MeteoalarmAlertKind.Expected;

		return entity.attributes.warnings.map((warning) => ({
			event: this.mapWarningType(warning.type),
			level: this.mapWarningLevel(warning.level),
			headline: warning.text || this.getFallbackHeadline(warning.type),
			kind,
		}));
	}

	/**
	 * Called by the generic card infrastructure when the configured trigger
	 * entities update.
	 */
	public getActionEntitiesRefreshKey(
		hass: HomeAssistant,
		config: MeteoalarmCardConfig,
	): string {
		const configEntry = this.getConfigEntry(config);

		const triggerEntities = processConfigEntities(config.entities!);

		const triggerState = triggerEntities
			.map((entityConfig) => {
				const entity = hass.states[entityConfig.entity];

				if (entity === undefined) {
					return `${entityConfig.entity}:missing`;
				}

				return [
					entity.entity_id,
					entity.state,
					entity.last_changed,
					entity.last_updated,
				].join(':');
			})
			.join('|');

		return `${configEntry}|${triggerState}`;
	}

	/**
	 * Calls the GeoSphere action and turns both warning lists into virtual
	 * entities compatible with the existing current/expected parser.
	 */
	public async getActionEntities(
		hass: HomeAssistant,
		config: MeteoalarmCardConfig,
	): Promise<HassEntity[]> {
		const configEntry = this.getConfigEntry(config);

		const result = await hass.callWS<GeoSphereServiceCallResult>({
			type: 'call_service',
			domain: 'geosphere_austria_warnings',
			service: 'get_warnings',
			service_data: {
				config_entry: configEntry,
			},
			return_response: true,
		});

		return [
			this.createVirtualEntity(
				'active',
				result.response.active_warnings,
			),
			this.createVirtualEntity(
				'advance',
				result.response.advance_warnings,
			),
		];
	}

	/**
	 * Used while the initial action request is pending, or after an error.
	 */
	public getInitialActionEntities(): HassEntity[] {
		return [
			this.createUnavailableVirtualEntity('active'),
			this.createUnavailableVirtualEntity('advance'),
		];
	}

	private getConfigEntry(config: MeteoalarmCardConfig): string {
		if (!config.config_entry) {
			throw new Error(
				'MeteoalarmCard: config_entry is required for integration geosphere_at.',
			);
		}

		if (!config.entities) {
			throw new Error(
				'MeteoalarmCard: entities must contain at least one GeoSphere refresh trigger.',
			);
		}

		return config.config_entry;
	}

	private createVirtualEntity(
		kind: 'active' | 'advance',
		warnings: GeoSphereWarning[],
	): HassEntity {
		const now = new Date().toISOString();

		return {
			entity_id: `sensor.meteoalarm_card_geosphere_${kind}`,
			state: String(warnings.length),
			attributes: {
				integration: 'geosphere_austria_warnings',
				warning_kind: kind,
				warnings,
				friendly_name:
					kind === 'active'
						? 'GeoSphere Austria active warnings'
						: 'GeoSphere Austria advance warnings',
			},
			last_changed: now,
			last_updated: now,
			context: {
				id: '',
				parent_id: null,
				user_id: null,
			},
		} as HassEntity;
	}

	private createUnavailableVirtualEntity(
		kind: 'active' | 'advance',
	): HassEntity {
		const now = new Date().toISOString();

		return {
			entity_id: `sensor.meteoalarm_card_geosphere_${kind}`,
			state: 'unavailable',
			attributes: {
				integration: 'geosphere_austria_warnings',
				warning_kind: kind,
				warnings: [],
				friendly_name:
					kind === 'active'
						? 'GeoSphere Austria active warnings'
						: 'GeoSphere Austria advance warnings',
			},
			last_changed: now,
			last_updated: now,
			context: {
				id: '',
				parent_id: null,
				user_id: null,
			},
		} as HassEntity;
	}

	private mapWarningType(type: string): MeteoalarmEventType {
		const warningTypes: Record<string, MeteoalarmEventType> = {
			storm: MeteoalarmEventType.Wind,
			rain: MeteoalarmEventType.Rain,
			snow: MeteoalarmEventType.SnowIce,
			black_ice: MeteoalarmEventType.SnowIce,
			thunderstorm: MeteoalarmEventType.Thunderstorms,
			heat: MeteoalarmEventType.HighTemperature,
			cold: MeteoalarmEventType.LowTemperature,
		};

		return warningTypes[type] ?? MeteoalarmEventType.Unknown;
	}

	private mapWarningLevel(level: string): MeteoalarmLevelType {
		const warningLevels: Record<string, MeteoalarmLevelType> = {
			yellow: MeteoalarmLevelType.Yellow,
			orange: MeteoalarmLevelType.Orange,
			red: MeteoalarmLevelType.Red,
		};

		const result = warningLevels[level];

		if (result === undefined) {
			throw new Error(
				`Unknown GeoSphere Austria warning level: ${level}`,
			);
		}

		return result;
	}

	private getFallbackHeadline(type: string): string {
		const headlines: Record<string, string> = {
			storm: 'Storm warning',
			rain: 'Rain warning',
			snow: 'Snow warning',
			black_ice: 'Black ice warning',
			thunderstorm: 'Thunderstorm warning',
			heat: 'Heat warning',
			cold: 'Cold warning',
		};

		return headlines[type] || 'Weather warning';
	}
}