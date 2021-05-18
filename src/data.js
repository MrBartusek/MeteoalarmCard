export const EVENTS =  [
	new Event('Wind', 'windsock', 'events.wind'),
	new Event('Snow/Ice', 'snowflake', 'events.snow_ice'),
	new Event('Thunderstorms', 'weather-lightning', 'events.thunderstorms'),
	new Event('Fog', 'waves', 'events.fog'),
	new Event('Extreme high temperature', 'thermometer-chevron-up', 'events."hight_temperature'),
	new Event('Extreme high temperature', 'snowflake', 'events.low_temperature'),
	new Event('Coastal Event', 'waves', 'events.coastal_event'),
	new Event('Forestfire', 'pine-tree-fire', 'events.forest_fire'),
	new Event('Avalanches', 'image-filter-hdr', 'events.avalanches'),
	new Event('Rain', 'weather-pouring', 'events.rain'),
	new Event('Flood', 'waves', 'events.flood'),
	new Event('Rain-Flood', 'weather-pouring', 'events.rain_flood')
]

export const LEVELS =  [
	new Level('Yellow', '#ff9800', 'messages.yellow'),
	new Level('Orange', '#EE5A24', 'messages.orange'),
	new Level('Red', '#db4437', 'messages.red')
]

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
