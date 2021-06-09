import Data from '../data';

export class DWDIntegration
{
	static get name()
	{
		return 'dwd'
	}

	static supports(entity)
	{
		return entity.attributes.attribution == 'Data provided by DWD'
	}

	static isWarningActive(entity)
	{
		return entity.attributes.warning_count > 0;
	}

	static get eventTypes()
	{
		// https://www.dwd.de/DE/leistungen/opendata/help/warnungen/gesamtueberblickII.pdf?__blob=publicationFile&v=3
		// Google translate can actually translate PDFs, quite usefull
		return {
			22: Data.getEventByName('Snow/Ice'),
			24: Data.getEventByName('Snow/Ice'),
			31: Data.getEventByName('Thunderstorms'),
			33: Data.getEventByName('Thunderstorms'),
			34: Data.getEventByName('Thunderstorms'),
			36: Data.getEventByName('Thunderstorms'),
			38: Data.getEventByName('Thunderstorms'),
			40: Data.getEventByName('Thunderstorms'),
			41: Data.getEventByName('Thunderstorms'),
			42: Data.getEventByName('Thunderstorms'),
			44: Data.getEventByName('Thunderstorms'),
			45: Data.getEventByName('Thunderstorms'),
			46: Data.getEventByName('Thunderstorms'),
			48: Data.getEventByName('Thunderstorms'),
			49: Data.getEventByName('Thunderstorms'),
			51: Data.getEventByName('Wind'),
			52: Data.getEventByName('Rain'),
			53: Data.getEventByName('Rain'),
			54: Data.getEventByName('Wind'),
			55: Data.getEventByName('Wind'),
			56: Data.getEventByName('Wind'),
			59: Data.getEventByName('Fog'),
			61: Data.getEventByName('Rain'),
			62: Data.getEventByName('Rain'),
			63: Data.getEventByName('Rain'),
			64: Data.getEventByName('Rain'),
			65: Data.getEventByName('Rain'),
			66: Data.getEventByName('Rain'),
			70: Data.getEventByName('Snow/Ice'),
			71: Data.getEventByName('Snow/Ice'),
			72: Data.getEventByName('Snow/Ice'),
			73: Data.getEventByName('Snow/Ice'),
			74: Data.getEventByName('Snow/Ice'),
			75: Data.getEventByName('Snow/Ice'),
			76: Data.getEventByName('Snow/Ice'),
			77: Data.getEventByName('Snow/Ice'),
			78: Data.getEventByName('Snow/Ice'),
			79: Data.getEventByName('Snow/Ice'),
			82: Data.getEventByName('Snow/Ice'),
			84: Data.getEventByName('Snow/Ice'),
			85: Data.getEventByName('Snow/Ice'),
			87: Data.getEventByName('Snow/Ice'),
			88: Data.getEventByName('Snow/Ice'),
			89: Data.getEventByName('Snow/Ice'),
			90: Data.getEventByName('Thunderstorms'),
			91: Data.getEventByName('Thunderstorms'),
			92: Data.getEventByName('Thunderstorms'),
			93: Data.getEventByName('Thunderstorms'),
			95: Data.getEventByName('Thunderstorms'),
			96: Data.getEventByName('Thunderstorms'),
			246: Data.getEventByName('Extreme high temperature'),
			247: Data.getEventByName('Extreme high temperature'),
			11: Data.getEventByName('Coastal Event'),
			12: Data.getEventByName('Coastal Event'),
			13: Data.getEventByName('Coastal Event'),
			14: Data.getEventByName('Coastal Event'),
			15: Data.getEventByName('Coastal Event'),
			16: Data.getEventByName('Coastal Event'),
			57: Data.getEventByName('Coastal Event'),
			58: Data.getEventByName('Coastal Event')
		}
	}

	static getResult(entity)
	{
		const { warning_count: warningCount } = entity.attributes;

		let events = [], headlines = [];

		for (let i = 1; i < warningCount + 1; i++)
		{
			const level = entity.attributes[`warning_${i}_level`];
			const id = entity.attributes[`warning_${i}_type`];
			const headline = entity.attributes[`warning_${i}_headline`];
			if(level == entity.state)
			{
				if(id in this.eventTypes)
				{
					events.push(this.eventTypes[id])
					headlines.push(headline)
				}
				else if(id == 98 || id == 99)
				{
					throw new Error('An test warning was issued! ID: ' + id)
				}
				else
				{
					throw new Error('Unknown event ID: ' + id)
				}
			}
		}

		const index = Data.filterEvents(events)[1];
		return {
			headline: headlines[index],
			awarenessLevel: Data.getLevelByID(this.convertAwarenessLevel(entity.state)),
			awarenessType: events[index]
		}
	}

	// Convert DWD scale 1-4 to meteoalarm scale 1-3
	static convertAwarenessLevel(level)
	{
		return level == 3 ? 2 : level;
	}
}
