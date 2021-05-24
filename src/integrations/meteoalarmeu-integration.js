import { EVENTS, LEVELS } from '../data';

export class MeteoAlarmeuIntegration
{
	static get name()
	{
		return 'meteoalarmeu'
	}

	static supports(entity)
	{
		return entity.attributes.attribution == 'Information provided by meteoalarm.eu'
	}

	static isWarningActive(entity)
	{
		return (entity.attributes.status || entity.attributes.state || entity.state) != 'off';
	}

	static getResult(entity)
	{
		const {
			awareness_type: awarenessType,
			awareness_level: awarenessLevel
		} = entity.attributes;

		return {
			awarenessLevel: LEVELS.find(e => e.name == awarenessLevel),
			awarenessType: EVENTS.find(e => e.name == awarenessType)
		}
	}
}
