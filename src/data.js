class Event
{
	constructor(name, icon, translationKey)
	{
		this.name = name;
		this.icon = icon;
		this.translationKey = translationKey;
	}
}

class Level
{
	constructor(name, color, translationKey)
	{
		this.name = name;
		this.color = color;
		this.translationKey = translationKey;
	}
}

export default class Data
{
	static get events()
	{
		// This list is ordered how dangerous events are
		// If for example there is warning for wind AND rain
		// Rain has higher priority (you can expect wind while raining)
		return [
			new Event('Forest fire', 'pine-tree-fire', 'events.forest_fire'),
			new Event('Avalanches', 'image-filter-hdr', 'events.avalanches'),
			new Event('Flooding', 'home-flood', 'events.flooding'),
			new Event('Rain-Flood', 'home-flood', 'events.rain_flood'),
			new Event('Coastal Event', 'waves', 'events.coastal_event'),
			new Event('Thunderstorms', 'weather-lightning', 'events.thunderstorms'),
			new Event('Rain', 'weather-pouring', 'events.rain'),
			new Event('Snow/Ice', 'weather-snowy-heavy', 'events.snow_ice'),
			new Event('High temperature', 'thermometer', 'events.hight_temperature'),
			new Event('Low temperature', 'snowflake', 'events.low_temperature'),
			new Event('Wind', 'windsock', 'events.wind'),
			new Event('Fog', 'weather-fog', 'events.fog'),

			new Event('Unknown Event', 'alert-circle-outline', null),
		];
	}

	static get levels()
	{
		return [
			new Level('Yellow', '#ff9800', 'messages.yellow'),
			new Level('Orange', '#EE5A24', 'messages.orange'),
			new Level('Red', '#db4437', 'messages.red')
		];
	}

	static getEventByName(name)
	{
		return this.events.find((e) => e.name === name);
	}

	static getLevelByID(id)
	{
		return this.levels[id - 1];
	}
}
