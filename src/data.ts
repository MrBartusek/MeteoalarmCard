import { MeteoalarmEventType, MeteoalarmLevelType } from './types';

export class MeteoalarmEventInfo {
	constructor(
        public type: MeteoalarmEventType,
        public fullName: string,
        public icon: string
	) {}

	get translationKey(): string {
		return 'events.' + this.fullName.toLocaleLowerCase()
			.replace(' ', '_')
			.replace('/', '_')
			.replace('-', '_');
	}
}

export class MeteoalarmLevelInfo {
	constructor(
        public type: MeteoalarmLevelType,
        public fullName: string,
        public color: string
	) {}

	get translationKey(): string {
		return 'messages.' + this.fullName.toLocaleLowerCase()
			.replace(' ', '_')
			.replace('/', '_')
			.replace('-', '_');
	}
}

export class MeteoalarmData {
	static get events(): MeteoalarmEventInfo[] {
		// Use tsunami icon only in 2022.06 and up
		let supportsTsunami = false;
		try {
			const rawVersion = (window as any).frontendVersion as string;
			if(!rawVersion) {
				supportsTsunami = false;
				/* eslint-disable-next-line no-console */
				console.error('MeteoalarmCard: Failed to check HA version! Please report this issue to https://bit.ly/3hK1hL4.');
			}
			else {
				const year = rawVersion.substring(0,4);
				const version = rawVersion.substring(4,6);
				supportsTsunami = Number(year) >= 2022 && Number(version) >= 6;
				/* eslint-disable-next-line no-console */
				console.log(`MeteoalarmCard: Detected HA version: ${year}.${version} Using tsunami icon: ${supportsTsunami}`);
			}
		}
		catch {
			/* eslint-disable-next-line no-console */
			console.error('MeteoalarmCard: Failed to check HA version! Please report this issue to https://bit.ly/3hK1hL4.');
		}
		const tsunami = supportsTsunami ? 'tsunami' : 'waves';

		return [
			new MeteoalarmEventInfo(MeteoalarmEventType.Unknown,         'Unknown Event',    'alert-circle-outline'),
			new MeteoalarmEventInfo(MeteoalarmEventType.Nuclear,         'Nuclear Event',    'radioactive'),
			new MeteoalarmEventInfo(MeteoalarmEventType.Hurricane,       'Hurricane',        'weather-hurricane'),
			new MeteoalarmEventInfo(MeteoalarmEventType.Tornado,         'Tornado',          'weather-tornado'),
			new MeteoalarmEventInfo(MeteoalarmEventType.CoastalEvent,    'Coastal Event',     tsunami),
			new MeteoalarmEventInfo(MeteoalarmEventType.Tsunami,         'Tsunami',           tsunami),
			new MeteoalarmEventInfo(MeteoalarmEventType.ForestFire,      'Forest Fire',      'pine-tree-fire'),
			new MeteoalarmEventInfo(MeteoalarmEventType.Avalanches,      'Avalanches',       'image-filter-hdr'),
			new MeteoalarmEventInfo(MeteoalarmEventType.Earthquake,      'Earthquake',       'image-broken-variant'),
			new MeteoalarmEventInfo(MeteoalarmEventType.Volcano,         'Volcanic Activity','volcano-outline'),
			new MeteoalarmEventInfo(MeteoalarmEventType.Flooding,        'Flooding',         'home-flood'),
			new MeteoalarmEventInfo(MeteoalarmEventType.SeaEvent,        'Sea Event',        'ferry'),
			new MeteoalarmEventInfo(MeteoalarmEventType.Thunderstorms,   'Thunderstorms',    'weather-lightning'),
			new MeteoalarmEventInfo(MeteoalarmEventType.Rain,            'Rain',             'weather-pouring'),
			new MeteoalarmEventInfo(MeteoalarmEventType.SnowIce,         'Snow/Ice',         'weather-snowy-heavy'),
			new MeteoalarmEventInfo(MeteoalarmEventType.HighTemperature, 'High Temperature', 'thermometer'),
			new MeteoalarmEventInfo(MeteoalarmEventType.LowTemperature,  'Low Temperature',  'snowflake'),
			new MeteoalarmEventInfo(MeteoalarmEventType.Dust,            'Dust',             'weather-windy'), // https://github.com/Templarian/MaterialDesign/issues/6658
			new MeteoalarmEventInfo(MeteoalarmEventType.Wind,            'Wind',             'weather-windy'),
			new MeteoalarmEventInfo(MeteoalarmEventType.Fog,             'Fog',              'weather-fog'),
			new MeteoalarmEventInfo(MeteoalarmEventType.AirQuality,      'Air Quality',      'air-filter')
		];
	}

	static get levels(): MeteoalarmLevelInfo[] {
		return [
			new MeteoalarmLevelInfo(MeteoalarmLevelType.Red,    'Red',    '#db4437'),
			new MeteoalarmLevelInfo(MeteoalarmLevelType.Orange, 'Orange', '#EE5A24'),
			new MeteoalarmLevelInfo(MeteoalarmLevelType.Yellow, 'Yellow', '#ff9800'),
			new MeteoalarmLevelInfo(MeteoalarmLevelType.None,   'None',   'inherit')
		];
	}

	static getEvent(type: MeteoalarmEventType): MeteoalarmEventInfo {
		return this.events.find((e) => e.type === type)!;
	}

	static getLevel(type: MeteoalarmLevelType): MeteoalarmLevelInfo {
		return this.levels.find((e) => e.type === type)!;
	}
}
