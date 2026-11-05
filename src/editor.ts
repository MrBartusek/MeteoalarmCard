import { EntityConfig, fireEvent, HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';
import { css, CSSResultGroup, html, LitElement, PropertyValues, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { isSingleEntity, schemaNames } from './helpers/editor';
import { processEditorEntities } from './helpers/process-editor-entities';
import { localize } from './localize/localize';
import { MeteoalarmCard } from './meteoalarm-card';
import {
	DEFAULT_SCALING_MODE,
	HaFormSchema,
	MeteoalarmCardConfig,
	MeteoalarmIntegration,
	MeteoalarmIntegrationEntityType,
	MeteoalarmScalingMode,
	WarningRule,
} from './types';

@customElement('meteoalarm-card-editor')
export class MeteoalarmCardCardEditor extends LitElement implements LovelaceCardEditor {
	@property({ attribute: false }) public hass?: HomeAssistant;
	@state() private config?: MeteoalarmCardConfig;

	private integration?: MeteoalarmIntegration;
	private configEntities: EntityConfig[] = [];
	private schema: HaFormSchema[] = [];
	private formData: Record<string, unknown> = {};
	private warning?: Record<string, string>;

	public setConfig(config: MeteoalarmCardConfig): void {
		this.config = config;
	}

	protected willUpdate(changedProperties: PropertyValues): void {
		if (changedProperties.has('config')) {
			this.integration = this.findIntegration(this.config?.integration);
			this.configEntities = processEditorEntities(this.config?.entities);
			this.schema = this.computeSchema(this.integration);
			this.formData = this.computeFormData(this.integration);
			this.warning = this.computeWarnings(this.integration);
		}
	}

	protected render(): TemplateResult {
		if (!this.hass || !this.config) {
			return html``;
		}

		return html`
			<ha-form
				.hass=${this.hass}
				.data=${this.formData}
				.schema=${this.schema}
				.warning=${this.warning}
				.computeLabel=${this.computeLabel}
				.computeHelper=${this.computeHelper}
				.computeWarning=${this.computeWarning}
				@value-changed=${this.valueChanged}
			></ha-form>
			${
				this.integration
					? html`
							<a
								class="docs-link"
								href="https://github.com/MrBartusek/MeteoalarmCard/blob/master/docs/scaling-mode.md"
								target="_blank"
								rel="noreferrer"
							>
								Scaling mode documentation
							</a>
						`
					: ''
			}
		`;
	}

	private findIntegration(key?: string): MeteoalarmIntegration | undefined {
		return MeteoalarmCard.integrations.find((i) => i.metadata.key === key);
	}

	private computeSchema(integration?: MeteoalarmIntegration): HaFormSchema[] {
		const schema: HaFormSchema[] = [
			{
				name: 'integration',
				required: true,
				selector: {
					select: {
						mode: 'dropdown',
						options: MeteoalarmCard.integrations.map((i) => ({
							value: i.metadata.key,
							label: i.metadata.name,
						})),
					},
				},
			},
		];
		if (!integration) return schema;

		schema.push({
			name: 'entities',
			required: true,
			selector: { entity: isSingleEntity(integration) ? {} : { multiple: true } },
		});

		const switches: HaFormSchema[] = [];
		if (integration.metadata.returnMultipleAlerts) {
			switches.push({ name: 'disable_swiper', selector: { boolean: {} } });
		}
		if (integration.metadata.returnHeadline) {
			switches.push({ name: 'override_headline', selector: { boolean: {} } });
		}
		if (integration.metadata.type === MeteoalarmIntegrationEntityType.CurrentExpected) {
			switches.push({ name: 'hide_caption', selector: { boolean: {} } });
		}
		switches.push({ name: 'hide_when_no_warning', selector: { boolean: {} } });
		switches.push({ name: 'show_warning_times', selector: { boolean: {} } });
		schema.push({ name: '', type: 'grid', schema: switches });

		schema.push({
			name: 'scaling_mode',
			selector: {
				select: {
					mode: 'dropdown',
					options: Object.values(MeteoalarmScalingMode).map((mode) => ({
						value: mode,
						label: localize(`editor.scaling_mode_options.${mode}`),
					})),
				},
			},
		});
		return schema;
	}

	private computeFormData(integration?: MeteoalarmIntegration): Record<string, unknown> {
		const entityIds = this.configEntities.map((e) => e.entity);
		return {
			scaling_mode: DEFAULT_SCALING_MODE,
			...this.config,
			entities: isSingleEntity(integration) ? (entityIds[0] ?? '') : entityIds,
		};
	}

	private computeWarnings(integration?: MeteoalarmIntegration): Record<string, string> | undefined {
		if (!integration) return undefined;

		const entities = this.configEntities.map((e) => e.entity);
		const { type, entitiesCount } = integration.metadata;

		const RULES: WarningRule[] = [
			{
				field: 'entities',
				warning: 'duplicate',
				condition: new Set(entities).size != entities.length,
			},
			{
				field: 'entities',
				warning: 'too_many_entities',
				condition: entitiesCount > 0 && entities.length > entitiesCount,
			},
			{
				field: 'entities',
				warning: 'expected_entity',
				condition: type == MeteoalarmIntegrationEntityType.CurrentExpected && entities.length == 1,
			},
		];

		// ha-form renders one warning per field, so the first matching rule wins
		const warnings: Record<string, string> = {};
		for (const rule of RULES) {
			if (rule.condition && !(rule.field in warnings)) {
				warnings[rule.field] = rule.warning;
			}
		}

		return Object.keys(warnings).length > 0 ? warnings : undefined;
	}

	private computeLabel = (schema: HaFormSchema): string => {
		if (!schema.name) return '';

		let label = localize(`editor.${schema.name}`);

		if (schema.name === 'entities') {
			label = localize(`editor.${isSingleEntity(this.integration) ? 'entity' : 'entities'}`);
		}

		if (schema.required) {
			label = `${label} (${localize('editor.required')})`;
		}

		return label;
	};

	private computeHelper = (schema: HaFormSchema): string | undefined => {
		if (schema.name !== 'entities') return undefined;
		const type = this.integration?.metadata.type;
		if (type === undefined || type === MeteoalarmIntegrationEntityType.SingleEntity)
			return undefined;
		return [
			localize('editor.description.start'),
			localize(`editor.description.${type}`),
			localize('editor.description.end'),
		].join(' ');
	};

	private computeWarning = (warning: string): string => {
		return localize(`editor.error.${warning}`)
			.replace('{expected_entities_count}', String(this.integration?.metadata.entitiesCount))
			.replace('{selected_entities_count}', String(this.configEntities.length));
	};

	private valueChanged(ev: CustomEvent): void {
		ev.stopPropagation();
		if (!this.config || !this.hass) return;
		const value = { ...ev.detail.value };

		if ('entities' in value) {
			// Normalize entities to a list of entity id strings
			let entities = processEditorEntities(value.entities)
				.map((e) => e.entity)
				.filter(Boolean);

			// When switching to a single entity integration, keep only the first entity
			if (isSingleEntity(this.findIntegration(value.integration)) && entities.length > 1) {
				entities = [entities[0]];
			}
			value.entities = entities;
		}

		Object.keys(value).forEach((key) => value[key] === undefined && delete value[key]);

		const config: MeteoalarmCardConfig = { ...this.config, ...value };

		// Fields dropped from the schema by the new integration would otherwise keep
		// their old values and still affect the card, with no way to unset them
		if (config.integration !== this.config.integration) {
			const nextNames = schemaNames(this.computeSchema(this.findIntegration(config.integration)));
			for (const name of schemaNames(this.schema)) {
				if (!nextNames.includes(name)) delete config[name];
			}
		}

		fireEvent(this, 'config-changed', { config });
	}

	static styles: CSSResultGroup = css`
		.docs-link {
			display: inline-block;
			margin-top: 8px;
			color: var(--primary-color);
		}
	`;
}
