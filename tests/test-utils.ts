import INTEGRATIONS from '../src/integrations/integrations';
import { MeteoalarmAlert, MeteoalarmIntegration } from '../src/types';
import { Fixture, FixtureEntity, LoadedFixture } from './types';

export class TestUtils {
	public static loadFixtures(): LoadedFixture[] {
		const modules = import.meta.glob<Fixture>('./fixtures/*/*.json', {
			eager: true,
			import: 'default',
		});

		return Object.entries(modules).map(([path, fixture]) => {
			const [integrationKey, file] = path.split('/').slice(-2);
			return { integrationKey, name: file.replace('.json', ''), fixture };
		});
	}

	public static getIntegration(key: string): MeteoalarmIntegration {
		const integration = INTEGRATIONS.map((i) => new i()).find((i) => i.metadata.key == key);
		if (integration == undefined) {
			throw new Error(
				`Unknown integration "${key}", the fixture directory has to match a metadata key`,
			);
		}
		return integration;
	}

	public static collectAlerts(
		integration: MeteoalarmIntegration,
		entities: FixtureEntity[],
	): MeteoalarmAlert[] {
		return entities
			.filter((entity) => integration.alertActive(entity))
			.flatMap((entity) => integration.getAlerts(entity));
	}
}
