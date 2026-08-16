import { slug } from './helpers.ts';
import type { Integration } from './types.ts';

export const METEOALARM = [
	{ country: 'netherlands', province: 'Noord-Holland', name: 'Amsterdam' },
	{ country: 'france', province: 'Paris', name: 'Paris' },
	{ country: 'italy', province: 'Lazio', name: 'Rome' },
	{ country: 'austria', province: 'Wien', name: 'Vienna' },
	{ country: 'spain', province: 'Madrid', name: 'Madrid' },
	{ country: 'portugal', province: 'Lisboa', name: 'Lisbon' },
	{ country: 'poland', province: 'Warszawa', name: 'Warsaw' },
	{ country: 'germany', province: 'Berlin', name: 'Berlin' },
];

const DWD = [
	{ region: 'Berlin', warncell: '111000000' },
	{ region: 'Kreis und Stadt München', warncell: '909184999' },
	{ region: 'Hansestadt Hamburg', warncell: '102000000' },
	{ region: 'Hansestadt Bremen', warncell: '104011000' },
	{ region: 'Stadt Leipzig', warncell: '114713000' },
	{ region: 'Stadt Köln', warncell: '105315000' },
	{ region: 'Stadt Frankfurt am Main', warncell: '106412000' },
	{ region: 'Stadt Stuttgart', warncell: '108111000' },
];

const ENV_CANADA = [
	{ city: 'Toronto', station: 'ON/s0000458', latitude: 43.65, longitude: -79.38 },
	{ city: 'Vancouver', station: 'BC/s0000141', latitude: 49.24, longitude: -123.12 },
	{ city: 'Regina', station: 'SK/s0000788', latitude: 50.45, longitude: -104.62 },
	{ city: "St. John's", station: 'NL/s0000280', latitude: 47.56, longitude: -52.72 },
	{ city: 'Winnipeg', station: 'MB/s0000193', latitude: 49.89, longitude: -97.13 },
	{ city: 'Edmonton', station: 'AB/s0000045', latitude: 53.54, longitude: -113.49 },
	{ city: 'Montréal', station: 'QC/s0000635', latitude: 45.51, longitude: -73.55 },
	{ city: 'Yellowknife', station: 'NT/s0000366', latitude: 62.45, longitude: -114.37 },
];

const METEO_FRANCE = [
	{ city: 'Paris', department: '75', latitude: 48.8566, longitude: 2.3522 },
	{ city: 'Marseille', department: '13', latitude: 43.2965, longitude: 5.3698 },
	{ city: 'Lyon', department: '69', latitude: 45.764, longitude: 4.8357 },
	{ city: 'Toulouse', department: '31', latitude: 43.6045, longitude: 1.4442 },
	{ city: 'Lille', department: '59', latitude: 50.6292, longitude: 3.0573 },
	{ city: 'Bordeaux', department: '33', latitude: 44.8378, longitude: -0.5792 },
	{ city: 'Strasbourg', department: '67', latitude: 48.5734, longitude: 7.7521 },
	{ city: 'Nantes', department: '44', latitude: 47.2184, longitude: -1.5536 },
];

const NINA_SLOTS = 3;
const NINA = [
	{ name: 'Berlin', ars: '110000000000' },
	{ name: 'Hamburg', ars: '020000000000' },
	{ name: 'Muenchen', ars: '091620000000' },
	{ name: 'Koeln', ars: '053150000000' },
	{ name: 'Bremen', ars: '040110000000' },
	{ name: 'Stuttgart', ars: '081110000000' },
	{ name: 'Frankfurt', ars: '064120000000' },
	{ name: 'Dresden', ars: '146120000000' },
];

export const INTEGRATIONS: Integration[] = [
	{
		title: 'Meteoalarm',
		path: 'meteoalarm',
		cards: METEOALARM.map((location) => ({
			integration: 'meteoalarm',
			entities: [`binary_sensor.meteoalarm_${slug(location.name)}`],
		})),
		entries: [],
	},
	{
		title: 'DWD',
		path: 'dwd',
		cards: DWD.map((region) => ({
			integration: 'dwd',
			entities: [
				`sensor.${slug(region.region)}_current_warning_level`,
				`sensor.${slug(region.region)}_advance_warning_level`,
			],
		})),
		entries: DWD.map((region) => ({
			domain: 'dwd_weather_warnings',
			title: region.region,
			uniqueId: region.warncell,
			data: { region_identifier: region.warncell },
		})),
	},
	{
		title: 'Environment Canada',
		path: 'env-canada',
		cards: ENV_CANADA.map((location) => ({
			integration: 'env_canada',
			entities: ['warnings', 'watches', 'statements'].map(
				(alert) => `sensor.${slug(location.city)}_${alert}`,
			),
		})),
		entries: ENV_CANADA.map((location) => ({
			domain: 'environment_canada',
			title: location.city,
			uniqueId: `${location.station}-english`,
			data: {
				station: location.station,
				latitude: location.latitude,
				longitude: location.longitude,
				language: 'English',
			},
		})),
	},
	{
		title: 'Météo-France',
		path: 'meteo-france',
		cards: METEO_FRANCE.map(({ department }) => ({
			integration: 'meteofrance',
			entities: [
				`sensor.meteo_france_alert_for_department_${department}_${department}_weather_alert`,
			],
		})),
		entries: METEO_FRANCE.map((location) => ({
			domain: 'meteo_france',
			title: location.city,
			uniqueId: `${location.latitude}, ${location.longitude}`,
			data: { latitude: location.latitude, longitude: location.longitude },
		})),
	},
	{
		title: 'NINA',
		path: 'nina',
		cards: NINA.map((region) => ({
			integration: 'nina',
			entities: Array.from(
				{ length: NINA_SLOTS },
				(_, slot) => `binary_sensor.${slug(region.name)}_warning_${slot + 1}`,
			),
		})),
		entries: [
			{
				domain: 'nina',
				title: 'NINA',
				uniqueId: null,
				minorVersion: 3,
				data: {
					regions: Object.fromEntries(NINA.map((region) => [region.ars, region.name])),
					slots: NINA_SLOTS,
					filters: { headline_filter: '/(?!)/', area_filter: '.*' },
				},
			},
		],
	},
];
