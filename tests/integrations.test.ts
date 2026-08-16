import { describe, expect, it } from 'vitest';
import { TestUtils } from './test-utils';

const fixtures = TestUtils.loadFixtures();

it('discovers the fixture files', () => {
	expect(fixtures.length).toBeGreaterThan(0);
});

const cases = fixtures.map(
	({ integrationKey, name, fixture }) => [integrationKey, name, fixture] as const,
);

describe.each(cases)('%s (%s)', (integrationKey, _name, fixture) => {
	const integration = TestUtils.getIntegration(integrationKey);

	it('supports every entity', () => {
		for (const entity of fixture.entities) {
			expect(integration.supports(entity), entity.entity_id).toBe(true);
		}
	});

	it('detects the active entities', () => {
		for (const entity of fixture.entities) {
			expect(integration.alertActive(entity), entity.entity_id).toBe(entity.active);
		}
	});

	it('parses the expected alerts', () => {
		const alerts = TestUtils.collectAlerts(integration, fixture.entities);
		expect(alerts).toEqual(fixture.expected);
	});
});
