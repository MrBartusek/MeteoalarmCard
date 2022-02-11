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
			Data.getEventByName('High temperature'),
			Data.getEventByName('Low temperature'),
			Data.getEventByName('Coastal Event'),
			Data.getEventByName('Forest fire'),
			Data.getEventByName('Avalanches'),
			Data.getEventByName('Rain'),
			Data.getEventByName('Flooding'),
			Data.getEventByName('Rain-Flood')
		];
	}

	static getLevelBySeverity(severity)
	{
		// Generate level from severity when it's not provided
		// https://github.com/MrBartusek/MeteoalarmCard/issues/48
		if(['Moderate'].includes(severity))
		{
			return Data.getLevelByID(1);
		}
		else if(['Severe'].includes(severity))
		{
			return Data.getLevelByID(2);
		}
		else if(['High', 'Extreme'].includes(severity))
		{
			return Data.getLevelByID(3);
		}
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
			let levelNumber = Number(awarenessLevel.split(';')[0]);
			// Fallback for https://github.com/MrBartusek/MeteoalarmCard/issues/49
			if(levelNumber == 1) levelNumber = 2;
			level = Data.levels[levelNumber - 2];
		}

		return {
			headline: event || headline,
			level: level || this.getLevelBySeverity(severity),
			event: type || Data.getEventByName('Unknown Event')
		};
	}
}
