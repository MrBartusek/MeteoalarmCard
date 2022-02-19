import Data from '../data';

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

export class MeteoFranceIntegration
{
	static get name()
	{
		return 'meteofrance';
	}

	static getStatesLevels()
	{
		return {
			[STATE_YELLOW]: Data.getLevelByID(1),
			[STATE_ORANGE]: Data.getLevelByID(2),
			[STATE_RED]:    Data.getLevelByID(3),
		};
	}

	static getEventsTypes()
	{
		return {
			[EVENT_WIND]:             Data.getEventByName('Wind'),
			[EVENT_RAIN_FLOOD]:       Data.getEventByName('Rain-Flood'),
			[EVENT_THUNDERSTORMS]:    Data.getEventByName('Thunderstorms'),
			[EVENT_FLOOD]:            Data.getEventByName('Flooding'),
			[EVENT_SNOW_ICE]:         Data.getEventByName('Snow/Ice'),
			[EVENT_HIGH_TEMPERATURE]: Data.getEventByName('High temperature'),
			[EVENT_LOW_TEMPERATURE]:  Data.getEventByName('Low temperature'),
			[EVENT_AVALANCHES]:       Data.getEventByName('Avalanches'),
			[EVENT_COASTAL]:          Data.getEventByName('Coastal Event'),
		};
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
		let result = [];

		for(const [eventName, event] of Object.entries(this.getEventsTypes()))
		{
			const eventLevel = entity.attributes[eventName];
			if(!eventLevel)
			{
				console.warn(`Meteo-France event not found: ${eventName} (${event.name})`);
				continue;
			}
			if(eventLevel == STATE_GREEN) continue;
			result.push({
				level: this.getStatesLevels()[eventLevel],
				event: event
			});
		}
		console.log(result);

		return result;
	}
}
