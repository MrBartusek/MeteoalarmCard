import Data from '../data';

export class MeteoAlarmIntegration
{
	static get name()
	{
		return 'meteoalarm';
	}

	static supports(entity)
	{
		return entity.attributes.attribution == 'Information provided by MeteoAlarm';
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
		];
	}

	static getResult(entity)
	{
		const {
			event,
			headline,
			severity,
			awareness_type: awarenessType,
			awareness_level: awarenessLevel,
		} = entity.attributes;

		let type = null;
		let level = null;

		if(awarenessType != undefined)
		{
			type = this.eventTypes[Number(awarenessType.split(';')[0]) - 1];
		}

		if(awarenessLevel != undefined)
		{
			level = Data.levels[Number(awarenessLevel.split(';')[0]) - 2];
		}

		return {
			headline: event || headline,
			awarenessLevel: level || Data.getLevelBySeverity(severity),
			awarenessType: type || Data.getEventByName('Unknown Event')
		};
	}
}
