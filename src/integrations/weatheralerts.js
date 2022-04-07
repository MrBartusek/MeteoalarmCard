import Data from '../data';

export class WeatherAlertsIntegration
{
	static get name()
	{
		return 'weatheralerts';
	}

	static supports(entity)
	{
		return entity.attributes.integration == 'weatheralerts';
	}

	static isWarningActive(entity)
	{
		return entity.state > 0;
	}

	static get eventTypes()
	{
		return {
			'Severe Thunderstorm Warning': Data.getEventByName('Thunderstorms'),
			'Severe Weather Statement': Data.getEventByName('Thunderstorms'),
			'High Wind Warning': Data.getEventByName('Wind'),
			'Flood Warning': Data.getEventByName('Flooding'),
			'Severe Thunderstorm Watch': Data.getEventByName('Thunderstorms'),
			'Gale Warning': Data.getEventByName('Wind'),
			'Freeze Warning': Data.getEventByName('Snow/Ice'),
			'Red Flag Warning': Data.getEventByName('Forest fire'),
			'Flood Advisory': Data.getEventByName('Flooding'),
			'Heavy Freezing Spray Warning': Data.getEventByName('Snow/Ice'),
			'Small Craft Advisory': Data.getEventByName('Wind'),
			'Lake Wind Advisory': Data.getEventByName('Wind'),
			'Wind Advisory': Data.getEventByName('Wind'),
			'Frost Advisory': Data.getEventByName('Snow/Ice'),
			'Low Water Advisory': Data.getEventByName('Coastal Event'),
			'Gale Watch': Data.getEventByName('Wind'),
			'Freeze Watch': Data.getEventByName('Snow/Ice'),
			'Special Weather Statement': Data.getEventByName('Unknown Event'),
			'Marine Weather Statement': Data.getEventByName('Unknown Event'),
			'Rip Current Statement': Data.getEventByName('Coastal Event'),
			'Fire Weather Watch': Data.getEventByName('Forest fire'),
		};
	}

	static getResult(entity)
	{
		const { alerts } = entity.attributes;

		let result = [];

		for(const alert of alerts)
		{
			const { event, severity, title } = alert;
			if(event in this.eventTypes)
			{
				result.push({
					headline: title,
					level: this.severityToLevel(severity),
					event: this.eventTypes[event]
				});
			}
			else
			{
				throw new Error('Unknown warning: ' + event);
			}

		}
		return result;
	}

	static severityToLevel(severity)
	{
		if(['Minor'].includes(severity))
		{
			return Data.getLevelByID(1);
		}
		else if(['Moderate', 'Severe'].includes(severity))
		{
			return Data.getLevelByID(2);
		}
		else if(['Extreme'].includes(severity))
		{
			return Data.getLevelByID(3);
		}
	}
}
