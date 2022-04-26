import { HassEntity } from 'home-assistant-js-websocket';
import {
	MeteoalarmAlert,
	MeteoalarmEventType,
	MeteoalarmIntegration,
	MeteoalarmIntegrationEntityType,
	MeteoalarmIntegrationMetadata,
	MeteoalarmLevelType
} from '../types';

const STATE_GREEN  = 'Vert';
const STATE_YELLOW = 'Jaune';
const STATE_ORANGE = 'Orange';
const STATE_RED    = 'Rouge';

// The list of event alert is located here
// https://github.com/hacf-fr/meteofrance-api/blob/master/src/meteofrance_api/const.py

const EVENT_WIND             = 'Vent violent';
const EVENT_RAIN_FLOOD       = 'Pluie-inondation';
const EVENT_THUNDERSTORMS    = 'Orages';
const EVENT_FLOOD            = 'Inondation';
const EVENT_SNOW_ICE         = 'Neige-verglas';
const EVENT_HIGH_TEMPERATURE = 'Canicule';
const EVENT_LOW_TEMPERATURE  = 'Grand-froid';
const EVENT_AVALANCHES       = 'Avalanches';
const EVENT_COASTAL          = 'Vagues-submersion';

const EVENT_TYPES = {
	[EVENT_WIND]:             MeteoalarmEventType.Wind,
	[EVENT_RAIN_FLOOD]:       MeteoalarmEventType.RainFlood,
	[EVENT_THUNDERSTORMS]:    MeteoalarmEventType.Thunderstorms,
	[EVENT_FLOOD]:            MeteoalarmEventType.Flooding,
	[EVENT_SNOW_ICE]:         MeteoalarmEventType.SnowIce,
	[EVENT_HIGH_TEMPERATURE]: MeteoalarmEventType.HighTemperature,
	[EVENT_LOW_TEMPERATURE]:  MeteoalarmEventType.LowTemperature,
	[EVENT_AVALANCHES]:       MeteoalarmEventType.Avalanches,
	[EVENT_COASTAL]:          MeteoalarmEventType.CoastalEvent
};

const LEVEL_TYPES = {
	[STATE_YELLOW]: MeteoalarmLevelType.Yellow,
	[STATE_ORANGE]: MeteoalarmLevelType.Orange,
	[STATE_RED]:    MeteoalarmLevelType.Red
};

export default class MeteoFrance implements MeteoalarmIntegration {
	public get metadata(): MeteoalarmIntegrationMetadata {
		return {
			key: 'meteofrance',
			name: 'Météo-France',
			returnHeadline: false,
			type: MeteoalarmIntegrationEntityType.SingleEntity,
			entitiesCount: 1
		};
	}

	public supports(entity: HassEntity): boolean {
		return entity.attributes.attribution == 'Data provided by Météo-France' && entity.attributes[EVENT_WIND] != undefined;
	}

	public alertActive(entity: HassEntity): boolean {
		return entity.state !== STATE_GREEN;
	}

	public getAlerts(entity: HassEntity): MeteoalarmAlert[] {
		const result: MeteoalarmAlert[] = [];

		for(const [eventName, event] of Object.entries(EVENT_TYPES)) {
			const eventLevel = entity.attributes[eventName];
			if(!eventLevel) continue;
			if(eventLevel === STATE_GREEN) continue;
			result.push({
				level: LEVEL_TYPES[eventLevel],
				event: event
			});
		}
		return result;
	}
}
