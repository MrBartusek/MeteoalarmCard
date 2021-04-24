// All event types that meteoalarm issues
// [icon name, translation key]

export const events =  [
	undefined,
	['windsock', 'events.wind'],
	['snowflake', 'events.snow_ice'],
	['weather-lightning', 'events.thunderstorms'],
	['waves', 'events.fog'],
	['thermometer-chevron-up', 'events."hight_temperature'],
	['thermometer-chevron-down', 'events.low_temperature'],
	['waves', 'events.coastal_event'],
	['pine-tree-fire', 'events.forestfire'],
	['image-filter-hdr', 'events.avalanches'],
	['weather-pouring', 'events.rain'],
	['waves', 'events.flood'],
	['weather-pouring', 'events.rain_flood']
]

// All event severities that meteoalarm issues
// [color, translation key]

export const levels =  [
	undefined,
	['#f1c40f', 'levels.yellow'],
	['var(--warning-color)', 'levels.orange'],
	['var(--error-color)', 'levels.red']
]
