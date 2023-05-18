import { ActionConfig, EntityConfig, LovelaceCard, LovelaceCardConfig, LovelaceCardEditor } from 'custom-card-helpers';
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
  override_headline?: boolean;
  hide_when_no_warning?: boolean;
  hide_caption?: boolean;
  disable_swiper?: boolean;
  scaling_mode?: string;

  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

export interface MeteoalarmIntegration {
  metadata: MeteoalarmIntegrationMetadata,
  supports(entity: HassEntity): boolean,
  alertActive(entity: HassEntity): boolean,
  getAlerts(entity: HassEntity): MeteoalarmAlert[] | MeteoalarmAlert,
}

export interface MeteoalarmIntegrationMetadata {
  key: string,
  name: string,
  type: MeteoalarmIntegrationEntityType,
  entitiesCount:  number
  returnHeadline: boolean,
  returnMultipleAlerts: boolean,
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
  // Alerts in this integration are split across exactly 3 entities
  // Warnings entity contains red warnings
  // Watch entity contains orange warnings
  // Statement entity contains yellow warnings
  WarningWatchStatement = 3,
  // Alerts in this integration are split across multiple entities, count is strictly specified
  // Each warning is dedicated for one entity kind
  SeparateEvents = 4
}
/**
 * Is the alert currently active or will be active in the future
 * This is mostly used with type MeteoalarmIntegrationEntityType.CurrentExpected
 */
export enum MeteoalarmAlertKind {

  Current = 0,
  Expected = 1
}

export enum MeteoalarmScalingMode {
  Disabled = 'disabled',
  Headline = 'headline',
  Scale = 'scale',
  HeadlineAndScale = 'headline_and_scale'
}

// Event returned by the integration
export interface MeteoalarmAlert {
  event: MeteoalarmEventType,
  level: MeteoalarmLevelType,
  headline?: string,
  kind?: MeteoalarmAlertKind,
  _entity?: HassEntity
}

/**
 * Event transformed from MeteoalarmEvent used for rendering card
 */
export interface MeteoalarmAlertParsed {
  /**
   * Should this alert be shown when hide_when_no_warnings is enabled
   */
  isActive: boolean,
  icon: string,
  color: string,
  headlines: string[],
  captionIcon?: string,
  caption?: string,
  entity?: HassEntity,
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
  Tsunami
}

export enum MeteoalarmLevelType {
  Red = 3,
  Orange = 2,
  Yellow = 1,
  None = 0
}
