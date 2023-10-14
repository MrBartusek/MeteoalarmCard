import { EntityConfig } from 'custom-card-helpers';
import { html, TemplateResult } from 'lit';
import { localize } from './localize/localize';
import { MeteoalarmIntegration, MeteoalarmIntegrationEntityType } from './types';

export function generateEditorWarnings(
	integration: MeteoalarmIntegration | undefined,
	entities: EntityConfig[] | undefined,
): TemplateResult {
	// If entities are undefined, default to empty array
	if (!Array.isArray(entities)) entities = [];
	if (!integration) return html``;

	return html`
		${duplicateWarning(entities)} ${missingExpectedEntityWarning(integration, entities)}
		${tooManyEntitiesWarning(integration, entities)}
	`;
}

/**
 * Generate warning for CurrentExpected integrations when second entity is not provided
 */
function missingExpectedEntityWarning(
	integration: MeteoalarmIntegration,
	entities: EntityConfig[],
): TemplateResult {
	const validEntity = integration?.metadata.type == MeteoalarmIntegrationEntityType.CurrentExpected;
	if (validEntity && entities.length == 1) {
		return html`
			<ha-alert
				alert-type="warning"
				title=${localize('common.warning')}
			>
				${localize('editor.error.expected_entity')}
			</ha-alert>
		`;
	}
	return html``;
}

/**
 * Generate warning when user provides two identical entities in editor
 */
function duplicateWarning(entities: EntityConfig[]): TemplateResult {
	const uniqueEntities = Array.from(new Set(entities.map((x) => x.entity)));
	const hasDuplicateEntities = uniqueEntities.length != entities.length;
	if (hasDuplicateEntities) {
		return html`
			<ha-alert
				alert-type="warning"
				title=${localize('common.warning')}
			>
				${localize('editor.error.duplicate')}
			</ha-alert>
		`;
	}
	return html``;
}

/**
 * Generate warning when there are too much entities provided
 */
function tooManyEntitiesWarning(
	integration: MeteoalarmIntegration,
	entities: EntityConfig[],
): TemplateResult {
	const shouldConsider = integration.metadata.entitiesCount > 0;
	if (shouldConsider && entities.length > integration.metadata.entitiesCount) {
		return html`
			<ha-alert
				alert-type="warning"
				title=${localize('common.warning')}
			>
				${localize('editor.error.too_many_entities')
					.replace('{expected}', String(integration.metadata.entitiesCount))
					.replace('{got}', String(entities.length))}
			</ha-alert>
		`;
	}
	return html``;
}
