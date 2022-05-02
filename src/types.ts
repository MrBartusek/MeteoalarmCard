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
  entitiesCount: { min: number, max: number} | number
  returnHeadline: boolean,
}

export enum MeteoalarmIntegrationEntityType {
  // Alerts in this integrations all all in attributes of single entity
  SingleEntity = 0,
  // Alerts in this integration are split across multiple entities
  // and all are needed for it to function properly
  MultipleAllRequired = 1,
  // Alerts in this integration are split across multiple entities
  // and all are NOT needed for it to function properly
  MultipleNotRequired = 2,
}

// Event returned by the integration
export interface MeteoalarmAlert {
  event: MeteoalarmEventType,
  level: MeteoalarmLevelType,
  headline?: string,
}

// Event transformed from MeteoalarmEvent used for rendering card
export interface MeteoalarmAlertParsed {
  icon: string,
  color: string,
  headlines: string[],
}

// This list is ordered how dangerous events are
export enum MeteoalarmEventType {
  Unknown = 0,
  ForestFire = 1,
  Avalanches = 2,
  Flooding = 3,
  RainFlood = 4,
  CoastalEvent = 5,
  Thunderstorms = 6,
  Rain = 7,
  SnowIce = 8,
  HighTemperature = 9,
  LowTemperature = 10,
  Wind = 11,
  Fog = 12
}

export enum MeteoalarmLevelType {
  Red = 3,
  Orange = 2,
  Yellow = 1,
  None = 0
}
