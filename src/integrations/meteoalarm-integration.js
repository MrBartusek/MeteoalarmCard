import { EVENTS, LEVELS } from '../data';

export class MeteoAlarmIntegration
{
	static supports(sourceType, entity)
	{
		if(sourceType)
		{
			return sourceType === 'meteoalarm';
		}

		if(!('awarenessLevel' in entity.attributes))
		{
			return false;
		}

		return entity.attributes.awarenessLevel.includes(';');
	}

	static isWarningActive(entity)
	{
		return (entity.attributes.status || entity.attributes.state || entity.state) != 'off';
	}

	static getResult(entity)
	{
		return {
			headline: entity.attributes.event || entity.attributes.headline,
			awarenessLevel: LEVELS[Number(entity.attributes.awarenessLevel.split(';')[0]) - 2],
			awarenessType: EVENTS[Number(entity.attributes.awarenessType.split(';')[0]) - 2]
		}
	}
}
