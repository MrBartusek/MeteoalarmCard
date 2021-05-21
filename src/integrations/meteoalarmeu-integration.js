import { EVENTS, LEVELS } from '../data';

export class MeteoAlarmeuIntegration
{
	static supports(sourceType, entity)
	{
		if(sourceType)
		{
			return sourceType === 'meteoalarmeu';
		}

		if(!('awarenessLevel' in entity.attributes))
		{
			return false;
		}

		return !entity.attributes.awarenessLevel.includes(';');
	}

	static isWarningActive(entity)
	{
		return (entity.attributes.status || entity.attributes.state || entity.state) != 'off';
	}

	static getResult(entity)
	{
		return {
			awarenessLevel: LEVELS.find(e => e.name == entity.attributes.awarenessLevel),
			awarenessType: EVENTS.find(l => l.name == entity.attributes.awarenessType)
		}
	}
}
