import { EVENTS, LEVELS } from '../data';

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

	static getResult(entity)
	{
		const {
			event,
			headline,
			awareness_type: awarenessType,
			awareness_level: awarenessLevel,
		} = entity.attributes;

		return {
			headline: event || headline,
			awarenessLevel: LEVELS[Number(awarenessLevel.split(';')[0]) - 2],
			awarenessType: EVENTS[Number(awarenessType.split(';')[0]) - 1]
		}
	}
}
