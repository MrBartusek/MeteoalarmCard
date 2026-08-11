import {
	ActionConfig,
	EntityConfig,
	HomeAssistant,
	LovelaceCard,
	LovelaceCardConfig,
	LovelaceCardEditor,
} from 'custom-card-helpers';
import { HassEntity } from 'home-assistant-js-websocket';

declare global {
	interface HTMLElementTagNameMap {
		'meteoalarm-card-editor': LovelaceCardEditor;
		'hui-error-card': LovelaceCard;
	}
}

export interface MeteoalarmCardConfig extends LovelaceCardConfig {
	type: string;
	entities?: string | string[] | EntityConfig[];
	integration?: string;
	/**
	 * Optional integration-specific configuration-entry ID.
	 * Currently used by the GeoSphere Austria action-backed adapter.
	 */
	config_entry?: string;
	override_headline?: boolean;
	hide_when_no_warning?: boolean;
	hide_caption?: boolean;
	disable_swiper?: boolean;
	show_warning_times?: boolean;
	scaling_mode?: string;
	ignored_events?: string[];
	ignored_levels?: string[];

	tap_action?: ActionConfig;
	hold_action?: ActionConfig;
	double_tap_action?: ActionConfig;
}

export interface MeteoalarmIntegration {
	metadata: MeteoalarmIntegrationMetadata;
	supports(entity: HassEntity): boolean;
	alertActive(entity: HassEntity): boolean;
	getAlerts(entity: HassEntity): MeteoalarmAlert[] | MeteoalarmAlert;

	/**
	 * Optional action-backed source.
	 *
	 * Most adapters use ordinary Home Assistant entity states. An adapter may
	 * implement these methods when it needs to retrieve its warning lists via a
	 * Home Assistant action that returns response data.
	 */
	getActionEntities?(
		hass: HomeAssistant,
		config: MeteoalarmCardConfig,
	): Promise<HassEntity[]>;

	/**
	 * A value that changes whenever the action should be called again.
	 *
	 * For example, an adapter may derive this from selected entity states and
	 * their last_updated timestamps.
	 */
	getActionEntitiesRefreshKey?(
		hass: HomeAssistant,
		config: MeteoalarmCardConfig,
	): string;

	/**
	 * Entities to use until the first action result is received, or after an
	 * action failure. Usually these should be unavailable virtual entities.
	 */
	getInitialActionEntities?(): HassEntity[];
}

export interface MeteoalarmIntegrationMetadata {
	key: string;
	name: string;
	type: MeteoalarmIntegrationEntityType;
	entitiesCount: number;
	returnHeadline: boolean;
	returnMultipleAlerts: boolean;
	monitoredConditions: MeteoalarmEventType[];
}

export interface MeteoalarmAlertTiming {
    start?: string;
    end?: string;
}

export enum MeteoalarmIntegrationEntityType {
	// Alerts in this integrations all all in attributes of single entity
	SingleEntity = 0,
	// Alerts in this integration are split across two entities
	// one contains current warnings and another future warnings
	CurrentExpected = 1,
	// Alerts in this integration are split across multiple (probably unlimited amount) of entities
	// each one contains one warning
	Slots = 2,
	// Alerts in this integration are split across exactly 4 entities: warnings, watches, statements, advisories
	WarningWatchStatementAdvisory = 3,
	// Alerts in this integration are split across multiple entities, count is strictly specified
	// Each warning is dedicated for one entity kind
	SeparateEvents = 4,
}
/**
 * Is the alert currently active or will be active in the future
 * This is mostly used with type MeteoalarmIntegrationEntityType.CurrentExpected
 */
export enum MeteoalarmAlertKind {
	Current = 0,
	Expected = 1,
}

export enum MeteoalarmScalingMode {
	Disabled = 'disabled',
	Headline = 'headline',
	Scale = 'scale',
	HeadlineAndScale = 'headline_and_scale',
}

// Event returned by the integration
export interface MeteoalarmAlert {
	event: MeteoalarmEventType;
	level: MeteoalarmLevelType;
	headline?: string;
	kind?: MeteoalarmAlertKind;
	timing?: MeteoalarmAlertTiming;
	_entity?: HassEntity;
}

/**
 * Event transformed from MeteoalarmEvent used for rendering card
 */
export interface MeteoalarmAlertParsed {
	/**
	 * Should this alert be shown when hide_when_no_warnings is enabled
	 */
	isActive: boolean;
	icon: string;
	cssClass: string;
	headlines: string[];
	caption?: string;
	captionPrefixText?: string;
	captionPrefixIcon?: string;
	captionSuffixIcon?: string;
	entity?: HassEntity;
}

export enum MeteoalarmEventType {
	Unknown,
	Nuclear,
	Hurricane,
	Tornado,
	CoastalEvent,
	ForestFire,
	Avalanches,
	Earthquake,
	Volcano,
	Flooding,
	SeaEvent,
	Thunderstorms,
	Rain,
	SnowIce,
	HighTemperature,
	LowTemperature,
	Wind,
	Fog,
	AirQuality,
	Dust,
	Tsunami,
}

export enum MeteoalarmLevelType {
	Red = 3,
	Orange = 2,
	Yellow = 1,
	None = 0,
}
