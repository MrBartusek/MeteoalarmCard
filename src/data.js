// All event types that meteoalarm issues
// [icon name, translation key]

export const events =  [
	['windsock', 'events.wind'],
	['snowflake', 'events.snow_ice'],
	['weather-lightning', 'events.thunderstorms'],
	['waves', 'events.fog'],
	['thermometer-chevron-up', 'events."hight_temperature'],
	['snowflake', 'events.low_temperature'],
	['waves', 'events.coastal_event'],
	['pine-tree-fire', 'events.forest_fire'],
	['image-filter-hdr', 'events.avalanches'],
	['weather-pouring', 'events.rain'],
	['waves', 'events.flood'],
	['weather-pouring', 'events.rain_flood']
]

// All event severities that meteoalarm issues
// [color, translation key]

export const levels =  [
	['#ff9800', 'messages.yellow'],
	['#EE5A24', 'messages.orange'],
	['#db4437', 'messages.red']
]
