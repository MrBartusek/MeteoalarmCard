import { EVENTS, LEVELS } from '../../data';

export class MeteoAlarmeuStrategy
{
	static supports(sourceType)
	{
		return sourceType === 'meteoalarmeu';
	}

	static isAvailable(entity)
	{
		return (entity.attributes.status || entity.attributes.state || entity.state) != 'unavailable'
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
