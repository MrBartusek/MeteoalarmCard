/* eslint-disable @typescript-eslint/no-explicit-any */
import { LitElement, html, TemplateResult, css, CSSResultGroup, PropertyValueMap } from 'lit';
import { HomeAssistant, fireEvent, LovelaceCardEditor, EntityConfig } from 'custom-card-helpers';

import { ScopedRegistryHost } from '@lit-labs/scoped-registry-mixin';
import { MeteoalarmCardConfig, MeteoalarmIntegrationEntityType } from './types';
import { customElement, property, state } from 'lit/decorators';
import { formfieldDefinition } from '../elements/formfield';
import { selectDefinition } from '../elements/select';
import { switchDefinition } from '../elements/switch';
import { textfieldDefinition } from '../elements/textfield';
import { MeteoalarmCard } from './meteoalarm-card';
import { localize } from './localize/localize';
import { processEditorEntities } from './process-editor-entities';

@customElement('meteoalarm-card-editor')
export class BoilerplateCardEditor extends ScopedRegistryHost(LitElement) implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private _config?: MeteoalarmCardConfig;
  @state() private _helpers?: any;
  private _initialized = false;
  @state() private _configEntities?: EntityConfig[];

  static elementDefinitions = {
  	...textfieldDefinition,
  	...selectDefinition,
  	...switchDefinition,
  	...formfieldDefinition
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

  protected render(): TemplateResult | void {
  	if (!this.hass) {
  		return html``;
  	}

  	const integration = MeteoalarmCard.integrations.find(i => i.metadata.key === this._integration);
  	return html`
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
		  return html`<mwc-list-item .value=${integration.metadata.key}>${integration.metadata.name}</mwc-list-item>`;
		})}
	  </mwc-select>

	  <!-- Entity selector -->
	  ${integration?.metadata.type == MeteoalarmIntegrationEntityType.SingleEntity ? html`
	  	<ha-entity-picker
		  label=${`${localize('editor.entity')} (${localize('editor.required')})`}
	  	  allow-custom-entity
		  hideClearIcon
  		  .hass=${this.hass}
		  .configValue=${'entities'}
		  .value=${(this._configEntities?.length || 0) > 0 ? this._configEntities![0].entity : ''} 
		  @value-changed=${this._valueChanged}
	    ></ha-entity-picker>
	  ` : html`
	    <hui-entity-editor
		  .label=${`${localize('editor.entity')} (${localize('editor.required')})`}
          .hass=${this.hass}
          .entities=${this._configEntities}
		  @entities-changed=${this._entitiesChanged}
        ></hui-entity-editor>
	  `}
	  <div class="side-by-side">
		<!-- Override headline -->
		${integration?.metadata.returnHeadline ? html`
		  <mwc-formfield .label=${localize('editor.override_headline')}>
		  <mwc-switch
			  .checked=${this._override_headline !== false}
			  .configValue=${'override_headline'}
			  @change=${this._valueChanged}
		  ></mwc-switch>
		  </mwc-formfield>
		`: ''}

		<!-- Hide when no warning -->
		<mwc-formfield .label=${localize('editor.hide_when_no_warning')}>
		<mwc-switch
			.checked=${this._hide_when_no_warning !== false}
			.configValue=${'hide_when_no_warning'}
			@change=${this._valueChanged}
		></mwc-switch>
		</mwc-formfield>
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
  		}
  		else {
  			// Set value to config
  			this._config = {
  				...this._config,
  				[target.configValue]: target.checked !== undefined ? target.checked : target.value
  			};

  			// Convert entity format
  			this._config = {
  				...this._config,
  				entities: processEditorEntities(this._config.entities)
  			};

  			const integration = MeteoalarmCard.integrations.find(i => i.metadata.key === this._integration);
  			if(integration?.metadata.type == MeteoalarmIntegrationEntityType.SingleEntity) {
  				const entities = this._config.entities as  EntityConfig[];
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
	hui-entity-editor {
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
	.side-by-side {
		display: flex;
		align-items: flex-end;
	}
	.side-by-side > * {
		flex: 1 1 0%;
		padding-right: 8px;
	}
  `;
}
