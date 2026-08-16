import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { HassStore } from './hass-store.ts';
import { generateEntryId } from './helpers.ts';
import { INTEGRATIONS, METEOALARM } from './integrations.ts';

const HA_DEV = path.dirname(fileURLToPath(import.meta.url));
const SEED = path.join(HA_DEV, 'seed');
const SEED_STORAGE = path.join(SEED, '.storage');
const CONFIG = path.join(HA_DEV, 'config');
const STORAGE = path.join(CONFIG, '.storage');

const CONFIG_ENTRIES_MINOR_VERSION = 5; // Format of .storage/core.config_entries in the pinned image.
const DASHBOARD_TITLE = 'MeteoalarmCard';
const DASHBOARD_URL_PATH = 'meteoalarm-card';
const SEEDED_AT = '2026-08-16T00:00:00.000000+00:00';

function buildConfigEntries() {
	const entries = INTEGRATIONS.flatMap((integration) => integration.entries).map((entry) => ({
		created_at: SEEDED_AT,
		data: entry.data,
		discovery_keys: {},
		disabled_by: null,
		domain: entry.domain,
		entry_id: generateEntryId(entry),
		minor_version: entry.minorVersion ?? 1,
		modified_at: SEEDED_AT,
		options: {},
		pref_disable_new_entities: false,
		pref_disable_polling: false,
		source: 'user',
		subentries: [],
		title: entry.title,
		unique_id: entry.uniqueId,
		version: 1,
	}));
	return new HassStore('core.config_entries', { entries }, CONFIG_ENTRIES_MINOR_VERSION);
}

function buildDashboardConfig() {
	const views = INTEGRATIONS.map((integration) => ({
		title: integration.title,
		path: integration.path,
		cards: integration.cards.map((card) => ({
			type: 'custom:meteoalarm-card',
			integration: card.integration,
			override_headline: false,
			entities: card.entities.length === 1 ? card.entities[0] : card.entities,
		})),
	}));
	return new HassStore(`lovelace.${DASHBOARD_URL_PATH}`, {
		config: { title: DASHBOARD_TITLE, views },
	});
}

function buildDashboardRegistry() {
	return new HassStore('lovelace_dashboards', {
		items: [
			{
				id: DASHBOARD_URL_PATH,
				icon: 'mdi:weather-lightning',
				title: DASHBOARD_TITLE,
				url_path: DASHBOARD_URL_PATH,
				show_in_sidebar: true,
				require_admin: false,
				mode: 'storage',
			},
		],
	});
}

function buildMeteoalarmYaml(): string {
	const platforms = METEOALARM.map((location) =>
		[
			'- platform: meteoalarm',
			`  country: ${JSON.stringify(location.country)}`,
			`  province: ${JSON.stringify(location.province)}`,
			`  name: ${JSON.stringify(`Meteoalarm ${location.name}`)}`,
		].join('\n'),
	);
	return `${platforms.join('\n')}\n`;
}

fs.mkdirSync(CONFIG, { recursive: true });
fs.copyFileSync(path.join(SEED, 'configuration.yaml'), path.join(CONFIG, 'configuration.yaml'));
fs.writeFileSync(path.join(CONFIG, 'meteoalarm.yaml'), buildMeteoalarmYaml());

fs.cpSync(SEED_STORAGE, STORAGE, { recursive: true });
buildConfigEntries().write(STORAGE);
buildDashboardConfig().write(STORAGE);
buildDashboardRegistry().write(STORAGE);

console.log(`
[hass-dev] Home Assistant is starting (the first run downloads ~2 GB of images).

  Home Assistant:  http://localhost:8123  (logs in automatically, ready in about a minute)
  Card server:     http://localhost:5000  (run \`pnpm start\` in another terminal)
  MCP endpoint:    http://localhost:9584/meteoalarmcard-dev (for AI agents, see .mcp.json)

  \`pnpm run dev:down\` stops it, \`pnpm run dev:clean\` also wipes it.
`);
