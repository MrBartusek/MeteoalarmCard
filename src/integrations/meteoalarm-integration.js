import Data from '../data';

export class MeteoAlarmIntegration
{
	static get name()
	{
		return 'meteoalarm'
	}

	static supports(entity)
	{
		return entity.attributes.attribution == 'Information provided by MeteoAlarm'
	}

	static isWarningActive(entity)
	{
		return (entity.attributes.status || entity.attributes.state || entity.state) != 'off';
	}

	static get eventTypes()
	{
		// This list is ordered by id in meteoalarm
		return [
			Data.getEventByName('Wind'),
			Data.getEventByName('Snow/Ice'),
			Data.getEventByName('Thunderstorms'),
			Data.getEventByName('Fog'),
			Data.getEventByName('Extreme high temperature'),
			Data.getEventByName('Extreme low temperature'),
			Data.getEventByName('Coastal Event'),
			Data.getEventByName('Forestfire'),
			Data.getEventByName('Avalanches'),
			Data.getEventByName('Rain'),
			Data.getEventByName('Flood'),
			Data.getEventByName('Rain-Flood')
		]
	}

	static getResult(entity)
	{
		const {
			event,
			headline,
			awareness_type: awarenessType,
			awareness_level: awarenessLevel,
		} = entity.attributes;

		if(awarenessType == undefined || awarenessType == undefined) return;

		return {
			headline: event || headline,
			awarenessLevel: Data.levels[Number(awarenessLevel.split(';')[0]) - 2],
			awarenessType: this.eventTypes[Number(awarenessType.split(';')[0]) - 1]
		}
	}
}
