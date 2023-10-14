/* eslint-disable @typescript-eslint/no-explicit-any */
import { ScopedRegistryHost } from '@lit-labs/scoped-registry-mixin';
import { EntityConfig, fireEvent, HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';
import { css, CSSResultGroup, html, LitElement, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators';
import { formfieldDefinition } from '../elements/formfield';
import { selectDefinition } from '../elements/select';
import { switchDefinition } from '../elements/switch';
import { textfieldDefinition } from '../elements/textfield';
import { generateEditorWarnings } from './editor-warnings';
import { processEditorEntities } from './helpers/process-editor-entities';
import { localize } from './localize/localize';
import { MeteoalarmCard } from './meteoalarm-card';
import {
	MeteoalarmCardConfig,
	MeteoalarmIntegrationEntityType,
	MeteoalarmScalingMode,
} from './types';

@customElement('meteoalarm-card-editor')
export class MeteoalarmCardCardEditor
	extends ScopedRegistryHost(LitElement)
	implements LovelaceCardEditor
{
	@property({ attribute: false }) public hass?: HomeAssistant;
	@state() private _config?: MeteoalarmCardConfig;
	@state() private _helpers?: any;
	private _initialized = false;
	@state() private _configEntities?: EntityConfig[];

	static elementDefinitions = {
		...textfieldDefinition,
		...selectDefinition,
		...switchDefinition,
		...formfieldDefinition,
	};

	public setConfig(config: MeteoalarmCardConfig): void {
		this._config = config;
		this._configEntities = processEditorEntities(config.entities!);
	}

	protected firstUpdated(): void {
		this.loadLovelaceElements();
	}

	protected shouldUpdate(): boolean {
		if (!this._initialized) {
			this._initialize();
		}
		return true;
	}

	get _integration(): string {
		return this._config?.integration || '';
	}

	get _override_headline(): boolean {
		return this._config?.override_headline || false;
	}

	get _hide_when_no_warning(): boolean {
		return this._config?.hide_when_no_warning || false;
	}

	get _hide_caption(): boolean {
		return this._config?.hide_caption || false;
	}

	get _disable_swiper(): boolean {
		return this._config?.disable_swiper || false;
	}

	get _scaling_mode(): string {
		return this._config?.scaling_mode || 'headline_and_scale';
	}

	protected render(): TemplateResult | void {
		if (!this.hass) {
			return html``;
		}

		const integration = MeteoalarmCard.integrations.find(
			(i) => i.metadata.key === this._integration,
		);

		return html`
			<!-- Warnings-->
			${generateEditorWarnings(integration, this._configEntities)}

			<!-- Integration select -->
			<mwc-select
				naturalMenuWidth
				fixedMenuPosition
				label=${`${localize('editor.integration')} (${localize('editor.required')})`}
				.configValue=${'integration'}
				.value=${this._integration}
				@selected=${this._valueChanged}
				@closed=${(ev) => ev.stopPropagation()}
			>
				${MeteoalarmCard.integrations.map((integration) => {
					return html`<mwc-list-item .value=${integration.metadata.key}
						>${integration.metadata.name}</mwc-list-item
					>`;
				})}
			</mwc-select>

			<!-- Entity selector -->
			${integration?.metadata.type == MeteoalarmIntegrationEntityType.SingleEntity
				? html`
						<ha-entity-picker
							label=${`${localize('editor.entity')} (${localize('editor.required')})`}
							allow-custom-entity
							hideClearIcon
							.hass=${this.hass}
							.configValue=${'entities'}
							.value=${(this._configEntities?.length || 0) > 0
								? this._configEntities![0].entity
								: ''}
							@value-changed=${this._valueChanged}
						></ha-entity-picker>
				  `
				: html`
						<h3>${localize('editor.entity')} (${localize('editor.required')})</h3>
						<p>
							${localize('editor.description.start')} ${' '}
							${integration?.metadata.type == MeteoalarmIntegrationEntityType.CurrentExpected
								? html`
					${localize('editor.description.current_expected')}</p>
				`
								: ''}
							${integration?.metadata.type == MeteoalarmIntegrationEntityType.Slots
								? html`
					${localize('editor.description.slots')}</p>
				`
								: ''}
							${integration?.metadata.type ==
							MeteoalarmIntegrationEntityType.WarningWatchStatementAdvisory
								? html`
					${localize('editor.description.warning_watch_statement_advisory')}</p>
				`
								: ''}
							${integration?.metadata.type == MeteoalarmIntegrationEntityType.SeparateEvents
								? html`
					${localize('editor.description.separate_events')}</p>
				`
								: ''}
							${' '} ${localize('editor.description.end')}
						</p>

						<hui-entity-editor
							.label=${' '}
							.hass=${this.hass}
							.entities=${this._configEntities}
							@entities-changed=${this._entitiesChanged}
						></hui-entity-editor>
				  `}

			<!-- Switches section -->
			<div class="options">
				<!-- Disable slider -->
				${integration?.metadata.returnMultipleAlerts
					? html`
							<mwc-formfield .label=${localize('editor.disable_swiper')}>
								<mwc-switch
									.checked=${this._disable_swiper !== false}
									.configValue=${'disable_swiper'}
									@change=${this._valueChanged}
								></mwc-switch>
							</mwc-formfield>
					  `
					: ''}

				<!-- Override headline -->
				${integration?.metadata.returnHeadline
					? html`
							<mwc-formfield .label=${localize('editor.override_headline')}>
								<mwc-switch
									.checked=${this._override_headline !== false}
									.configValue=${'override_headline'}
									@change=${this._valueChanged}
								></mwc-switch>
							</mwc-formfield>
					  `
					: ''}

				<!-- Hide caption -->
				${integration?.metadata.type == MeteoalarmIntegrationEntityType.CurrentExpected
					? html`
							<mwc-formfield .label=${localize('editor.hide_caption')}>
								<mwc-switch
									.checked=${this._hide_caption !== false}
									.configValue=${'hide_caption'}
									@change=${this._valueChanged}
								></mwc-switch>
							</mwc-formfield>
					  `
					: ''}

				<!-- Hide when no warning -->
				<mwc-formfield .label=${localize('editor.hide_when_no_warning')}>
					<mwc-switch
						.checked=${this._hide_when_no_warning !== false}
						.configValue=${'hide_when_no_warning'}
						@change=${this._valueChanged}
					></mwc-switch>
				</mwc-formfield>
			</div>

			<!-- Card scaling mode select -->
			<div class="options">
				<div>
					<mwc-select
						naturalMenuWidth
						fixedMenuPosition
						label=${`${localize('editor.scaling_mode')}`}
						.configValue=${'scaling_mode'}
						.value=${this._scaling_mode}
						@selected=${this._valueChanged}
						@closed=${(ev) => ev.stopPropagation()}
					>
						${Object.values(MeteoalarmScalingMode).map((mode) => {
							return html` <mwc-list-item .value=${mode}>
								${localize(`editor.scaling_mode_options.${mode}`)}
							</mwc-list-item>`;
						})}
					</mwc-select>
					<a
						href="https://github.com/MrBartusek/MeteoalarmCard/blob/master/dosc/scaling-mode.md"
						target="_blank"
					>
						Scaling mode documentation
					</a>
				</div>
			</div>
		`;
	}

	private _initialize(): void {
		if (this.hass === undefined) return;
		if (this._config === undefined) return;
		if (this._helpers === undefined) return;
		this._initialized = true;
	}

	private async loadLovelaceElements(): Promise<void> {
		// This function load card helpers and pre-loads all pre-made
		// custom elements from Lovelace like ha-entity-picker
		// Read more on why and code explanation:
		// Pre-loading elements:
		// https://github.com/thomasloven/hass-config/wiki/PreLoading-Lovelace-Elements
		// Pre-loading elements in ScopedRegistryHost:
		// https://gist.github.com/thomasloven/5f965bd26e5f69876890886c09dd9ba8

		const registry = (this.shadowRoot as any)?.customElements;
		if (!registry) return;
		if (registry.get('ha-entity-picker')) return;

		this._helpers = await (window as any).loadCardHelpers();
		const entitiesCard = await this._helpers.createCardElement({ type: 'entities', entities: [] });
		await entitiesCard.constructor.getConfigElement();
		const glanceCard = await this._helpers.createCardElement({ type: 'glance', entities: [] });
		await glanceCard.constructor.getConfigElement();

		registry.define('ha-entity-picker', window.customElements.get('ha-entity-picker'));
		registry.define('hui-entity-editor', window.customElements.get('hui-entity-editor'));
		registry.define('ha-alert', window.customElements.get('ha-alert'));
	}

	private _valueChanged(ev): void {
		if (!this._config || !this.hass) {
			return;
		}
		const target = ev.target;
		if (this[`_${target.configValue}`] === target.value) {
			return;
		}
		if (target.configValue) {
			if (target.value === '') {
				const tmpConfig = { ...this._config };
				delete tmpConfig[target.configValue];
				this._config = tmpConfig;
			} else {
				// Set value to config
				this._config = {
					...this._config,
					[target.configValue]: target.checked !== undefined ? target.checked : target.value,
				};

				// Convert entity format
				this._config = {
					...this._config,
					entities: processEditorEntities(this._config.entities),
				};

				const integration = MeteoalarmCard.integrations.find(
					(i) => i.metadata.key === this._integration,
				);
				if (integration?.metadata.type == MeteoalarmIntegrationEntityType.SingleEntity) {
					const entities = this._config.entities as EntityConfig[];
					this._config.entities = [entities[0]];
				}
			}
		}
		fireEvent(this, 'config-changed', { config: this._config });
	}

	private _entitiesChanged(ev: CustomEvent): void {
		// Change in entities from multiple entities selector
		let config = this._config!;
		config = { ...config, entities: ev.detail.entities! };

		this._configEntities = processEditorEntities(this._config!.entities!);
		fireEvent(this, 'config-changed', { config });
	}

	static styles: CSSResultGroup = css`
		mwc-select,
		mwc-textfield,
		ha-entity-picker,
		hui-entity-editor,
		ha-alert {
			margin-bottom: 16px;
			display: block;
		}
		mwc-formfield {
			padding-bottom: 8px;
		}
		mwc-switch {
			--mdc-theme-secondary: var(--switch-checked-color);
			--mdc-theme-surface: #999999;
		}
		.options {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: 18px;
			margin: 24px 0;
		}
		p {
			max-width: 600px;
		}
	`;
}
