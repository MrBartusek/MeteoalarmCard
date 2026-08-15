import { ActionConfig, EntityConfig, LovelaceCardConfig } from 'custom-card-helpers';
import { HassEntity } from 'home-assistant-js-websocket';

export interface MeteoalarmCardConfig extends LovelaceCardConfig {
	type: string;
	entities?: string | string[] | EntityConfig[];
	integration?: string;
	override_headline?: boolean;
	hide_when_no_warning?: boolean;
	hide_caption?: boolean;
	disable_swiper?: boolean;
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

export enum MeteoalarmIntegrationEntityType {
	/** Alerts in this integrations all all in attributes of single entity */
	SingleEntity = 'single_entity',
	/**
	 * Alerts in this integration are split across two entities
	 * one contains current warnings and another future warnings
	 */
	CurrentExpected = 'current_expected',
	/**
	 * Alerts in this integration are split across multiple (probably unlimited amount) of entities
	 * each one contains one warning
	 */
	Slots = 'slots',
	/** Alerts in this integration are split across exactly 4 entities: warnings, watches, statements, advisories */
	WarningWatchStatementAdvisory = 'warning_watch_statement_advisory',
	/**
	 * Alerts in this integration are split across multiple entities, count is strictly specified
	 * Each warning is dedicated for one entity kind
	 */
	SeparateEvents = 'separate_events',
}
/**
 * Is the alert currently active or will be active in the future
 * This is mostly used with type MeteoalarmIntegrationEntityType.CurrentExpected
 */
export enum MeteoalarmAlertKind {
	Current = 'current',
	Expected = 'expected',
}

export enum MeteoalarmScalingMode {
	Disabled = 'disabled',
	Headline = 'headline',
	Scale = 'scale',
	HeadlineAndScale = 'headline_and_scale',
}

export const DEFAULT_SCALING_MODE = MeteoalarmScalingMode.HeadlineAndScale;

// Event returned by the integration
export interface MeteoalarmAlert {
	event: MeteoalarmEventType;
	level: MeteoalarmLevelType;
	headline?: string;
	kind?: MeteoalarmAlertKind;
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
	captionIcon?: string;
	caption?: string;
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
