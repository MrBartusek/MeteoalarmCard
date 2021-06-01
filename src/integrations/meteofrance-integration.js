import { EVENTS, LEVELS } from '../data';

const STATE_GREEN  = 'Vert';
const STATE_YELLOW = 'Jaune';
const STATE_ORANGE = 'Orange';
const STATE_RED    = 'Rouge';

const EVENT_WIND          = 'Vent violent';
const EVENT_SNOW_ICE      = 'Neige-verglas';
const EVENT_THUNDERSTORMS = 'Orages';
const EVENT_FLOOD         = 'Inondation';
const EVENT_RAIN_FLOOD    = 'Pluie-inondation';

export class MeteoFranceIntegration
{
	static get name()
	{
		return 'meteofrance'
	}

	static getStatesLevels()
	{
		return {
			[STATE_YELLOW]: LEVELS[0],
			[STATE_ORANGE]: LEVELS[1],
			[STATE_RED]:    LEVELS[2],
		}
	}

	static getEventsTypes()
	{
		return {
			[EVENT_WIND]:          EVENTS[0],
			[EVENT_SNOW_ICE]:      EVENTS[1],
			[EVENT_THUNDERSTORMS]: EVENTS[2],
			[EVENT_FLOOD]:         EVENTS[10],
			[EVENT_RAIN_FLOOD]:    EVENTS[11],
		}
	}

	static supports(entity)
	{
		return entity.attributes.attribution == 'Data provided by Météo-France' && entity.attributes[EVENT_WIND] != undefined;
	}

	static isWarningActive(entity)
	{
		return entity.state !== STATE_GREEN;
	}

	static getResult(entity)
	{
		const statesLevels = this.getStatesLevels();
		const eventsTypes = this.getEventsTypes();

		let eventsState = {
			[EVENT_WIND]:          entity.attributes[EVENT_WIND],
			[EVENT_SNOW_ICE]:      entity.attributes[EVENT_SNOW_ICE],
			[EVENT_THUNDERSTORMS]: entity.attributes[EVENT_THUNDERSTORMS],
			[EVENT_FLOOD]:         entity.attributes[EVENT_FLOOD],
			[EVENT_RAIN_FLOOD]:    entity.attributes[EVENT_RAIN_FLOOD],
		};

		let currentEvent = '';

		Object.keys(eventsState).forEach(key =>
		{
			if(eventsState[key] !== STATE_GREEN)
			{
				currentEvent = key;
			}
		})

		return {
			awarenessLevel: statesLevels[entity.state],
			awarenessType: eventsTypes[currentEvent]
		}
	}
}
