import { EntityConfig, fireEvent, HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';
import { css, CSSResultGroup, html, LitElement, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators';
import { generateEditorWarnings } from './editor-warnings';
import { processEditorEntities } from './helpers/process-editor-entities';
import { localize } from './localize/localize';
import { MeteoalarmCard } from './meteoalarm-card';
import {
	MeteoalarmCardConfig,
	MeteoalarmIntegration,
	MeteoalarmIntegrationEntityType,
	MeteoalarmScalingMode,
} from './types';

// Schema for the built-in ha-form component - Home Assistant doesn't ship
// types for it, see https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/#using-the-built-in-form-editor
interface HaFormSchema {
	name: string;
	required?: boolean;
	type?: string;
	selector?: Record<string, unknown>;
	schema?: HaFormSchema[];
}

@customElement('meteoalarm-card-editor')
export class MeteoalarmCardCardEditor extends LitElement implements LovelaceCardEditor {
	@property({ attribute: false }) public hass?: HomeAssistant;
	@state() private _config?: MeteoalarmCardConfig;
	@state() private _configEntities: EntityConfig[] = [];

	public setConfig(config: MeteoalarmCardConfig): void {
		this._config = config;
		this._configEntities = processEditorEntities(config.entities);
	}

	protected firstUpdated(): void {
		this.loadHaComponents();
	}

	private get integration(): MeteoalarmIntegration | undefined {
		return MeteoalarmCard.integrations.find((i) => i.metadata.key === this._config?.integration);
	}

	protected render(): TemplateResult {
		if (!this.hass || !this._config) {
			return html``;
		}

		const integration = this.integration;

		return html`
			${generateEditorWarnings(integration, this._configEntities)}
			<ha-form
				.hass=${this.hass}
				.data=${this.computeFormData(integration)}
				.schema=${this.computeSchema(integration)}
				.computeLabel=${this.computeLabel}
				.computeHelper=${this.computeHelper}
				@value-changed=${this._valueChanged}
			></ha-form>
			${integration
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
				: ''}
		`;
	}

	private async loadHaComponents(): Promise<void> {
		// ha-form and ha-alert are lazy-loaded by Home Assistant. In practice they
		// are already defined when the card editor dialog opens, this is a fallback
		// that force-loads them through another card's config editor.
		// https://github.com/thomasloven/hass-config/wiki/PreLoading-Lovelace-Elements
		if (customElements.get('ha-form') && customElements.get('ha-alert')) return;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const helpers = await (window as any).loadCardHelpers?.();
		if (!helpers) return;
		const entitiesCard = await helpers.createCardElement({ type: 'entities', entities: [] });
		await entitiesCard.constructor.getConfigElement();
		this.requestUpdate();
	}

	private computeSchema(integration: MeteoalarmIntegration | undefined): HaFormSchema[] {
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

		const isSingleEntity =
			integration.metadata.type === MeteoalarmIntegrationEntityType.SingleEntity;
		schema.push({
			name: 'entities',
			required: true,
			selector: { entity: isSingleEntity ? {} : { multiple: true } },
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

	private computeFormData(integration: MeteoalarmIntegration | undefined): Record<string, unknown> {
		const isSingleEntity =
			integration?.metadata.type === MeteoalarmIntegrationEntityType.SingleEntity;
		const entityIds = this._configEntities.map((e) => e.entity);
		return {
			integration: this._config?.integration ?? '',
			entities: isSingleEntity ? entityIds[0] ?? '' : entityIds,
			disable_swiper: this._config?.disable_swiper ?? false,
			override_headline: this._config?.override_headline ?? false,
			hide_caption: this._config?.hide_caption ?? false,
			hide_when_no_warning: this._config?.hide_when_no_warning ?? false,
			scaling_mode: this._config?.scaling_mode ?? MeteoalarmScalingMode.HeadlineAndScale,
		};
	}

	private computeLabel = (schema: HaFormSchema): string => {
		if (!schema.name) return '';
		switch (schema.name) {
			case 'integration':
				return `${localize('editor.integration')} (${localize('editor.required')})`;
			case 'entities':
				return `${localize('editor.entity')} (${localize('editor.required')})`;
			default:
				return localize(`editor.${schema.name}`);
		}
	};

	private computeHelper = (schema: HaFormSchema): string | undefined => {
		if (schema.name !== 'entities') return undefined;
		const descriptionKeys: { [key in MeteoalarmIntegrationEntityType]?: string } = {
			[MeteoalarmIntegrationEntityType.CurrentExpected]: 'current_expected',
			[MeteoalarmIntegrationEntityType.Slots]: 'slots',
			[MeteoalarmIntegrationEntityType.WarningWatchStatementAdvisory]:
				'warning_watch_statement_advisory',
			[MeteoalarmIntegrationEntityType.SeparateEvents]: 'separate_events',
		};
		const type = this.integration?.metadata.type;
		const descriptionKey = type !== undefined ? descriptionKeys[type] : undefined;
		if (!descriptionKey) return undefined;
		return [
			localize('editor.description.start'),
			localize(`editor.description.${descriptionKey}`),
			localize('editor.description.end'),
		].join(' ');
	};

	private _valueChanged(ev: CustomEvent): void {
		ev.stopPropagation();
		if (!this._config || !this.hass) return;
		const value = { ...ev.detail.value };

		if ('entities' in value) {
			// Normalize entities to a list of entity id strings
			let entities: string[] =
				typeof value.entities === 'string' ? [value.entities] : [...(value.entities ?? [])];
			entities = entities.filter((entity) => entity);

			// When switching to a single entity integration, keep only the first entity
			const integration = MeteoalarmCard.integrations.find(
				(i) => i.metadata.key === value.integration,
			);
			if (
				integration?.metadata.type === MeteoalarmIntegrationEntityType.SingleEntity &&
				entities.length > 1
			) {
				entities = [entities[0]];
			}
			value.entities = entities;
		}

		Object.keys(value).forEach((key) => value[key] === undefined && delete value[key]);

		// Spread over the existing config so keys not managed by this
		// editor (type, ignored_events, ignored_levels, actions) survive
		const config: MeteoalarmCardConfig = { ...this._config, ...value };
		fireEvent(this, 'config-changed', { config });
	}

	static styles: CSSResultGroup = css`
		ha-alert {
			display: block;
			margin-bottom: 16px;
		}
		.docs-link {
			display: inline-block;
			margin-top: 8px;
			color: var(--primary-color);
		}
	`;
}
