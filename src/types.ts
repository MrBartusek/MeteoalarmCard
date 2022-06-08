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

  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

export interface MeteoalarmIntegration {
  metadata: MeteoalarmIntegrationMetadata,
  supports(entity: HassEntity): boolean,
  alertActive(entity: HassEntity): boolean,
  getAlerts(entity: HassEntity): MeteoalarmAlert[],
}

export interface MeteoalarmIntegrationMetadata {
  key: string,
  name: string,
  type: MeteoalarmIntegrationEntityType,
  entitiesCount:  number
  returnHeadline: boolean,
}

export enum MeteoalarmIntegrationEntityType {
  // Alerts in this integrations all all in attributes of single entity
  SingleEntity = 0,
  // Alerts in this integration are split across two entities
  // one contains current warnings and another future warnings
  CurrentExpected = 1
}

export enum MeteoalarmAlertKind {
  // Is the alert currently active or will be active in the future
  // This is mostly used with type MeteoalarmIntegrationEntityType.CurrentExpected
  Current = 0,
  Expected = 1
}

// Event returned by the integration
export interface MeteoalarmAlert {
  event: MeteoalarmEventType,
  level: MeteoalarmLevelType,
  headline?: string,
  kind?: MeteoalarmAlertKind
}

// Event transformed from MeteoalarmEvent used for rendering card
export interface MeteoalarmAlertParsed {
  icon: string,
  color: string,
  headlines: string[],
  captionIcon?: string
  caption?: string
}

export enum MeteoalarmEventType {
  Unknown = 0,
  ForestFire = 1,
  Avalanches = 2,
  Tornado = 3,
  Flooding = 4,
  RainFlood = 5,
  CoastalEvent = 6,
  SeaEvent = 7,
  Thunderstorms = 8,
  Rain = 9,
  SnowIce = 10,
  HighTemperature = 11,
  LowTemperature = 12,
  Wind = 13,
  Fog = 14,
  AirQuality = 15,
}

export enum MeteoalarmLevelType {
  Red = 3,
  Orange = 2,
  Yellow = 1,
  None = 0
}
