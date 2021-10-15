import { LitElement, html, css } from 'lit-element';
import { fireEvent } from 'custom-card-helpers';
import localize from './localize';

export class MeteoalarmCardEditor extends LitElement
{
	static get properties()
	{
		return {
			hass: Object,
			_config: Object,
			_toggle: Boolean,
		};
	}

	get _integrations()
	{
		return {
			automatic: `${localize('editor.automatic')} (${localize('editor.recommended')})`,
			meteoalarm: 'Meteoalarm',
			meteofrance: 'Météo-France',
			dwd: 'Deutscher Wetterdienst (DWD)',
			weatheralerts: 'Weather Alerts (weather.gov)'
		};
	}

	setConfig(config)
	{
		this._config = config;
	}

	get _entity()
	{
		if (this._config)
		{
			return this._config.entity || '';
		}

		return '';
	}

	get _integration()
	{
		if (this._config)
		{
			return this._config.integration || 'automatic';
		}

		return '';
	}

	// eslint-disable-next-line
	get _override_headline()
	{
		if (this._config)
		{
			return this._config.override_headline || false;
		}

		return '';
	}

	render()
	{
		if (!this.hass) return html``;

		return html`
      		<div class="card-config">
			  	<!-- Enity Selector -->
				<ha-entity-picker
					label=${`${localize('editor.entity')} (${localize('editor.required')})`}
					.hass=${this.hass}
					.value=${this._entity}
					.configValue=${'entity'}
					@value-changed=${this._valueChanged}
					allow-custom-entity
				></ha-entity-picker>

				<!-- Integration Selector -->
				<paper-dropdown-menu
					label=${`${localize('editor.integration')} (${localize('editor.required')})`}
					@value-changed=${this._valueChanged}
					.configValue=${'integration'}
        		>
          			<paper-listbox
            			slot="dropdown-content"
            			.selected=${Object.keys(this._integrations).findIndex((x) => x === this._integration)}
          			>
            			${Object.values(this._integrations).map((e) =>
						{
							return html`<paper-item>${e}</paper-item>`;
						})}
          			</paper-listbox>
        		</paper-dropdown-menu>

				<!-- Override headline -->
				${this._integration == 'automatic' || this._integration == 'meteoalarm' ? html`
					<p class="option">
						<ha-switch
							.checked=${this._override_headline !== false}
							.configValue=${'override_headline'}
							@change=${this._valueChanged}
						>
						</ha-switch>
						${localize('editor.override_headline')}
					</p>
				`: ''}
      		</div>
    	`;
	}

	_valueChanged(ev)
	{
		if (!this._config || !this.hass) return;
		const target = ev.target;

		let value = target.value;
		if(target.configValue == 'integration')
		{
			value = Object.keys(this._integrations).find(key => this._integrations[key] === value) || value;
		}

		if (this[`_${target.configValue}`] === value) return;
		if (!target.configValue) return;
		if (target.value === '') return;

		this._config = {
			...this._config,
			[target.configValue]:
			target.checked !== undefined ? target.checked : value,
		};

		fireEvent(this, 'config-changed', { config: this._config });
	}

	static get styles()
	{
		return css`
			.card-config paper-dropdown-menu {
				width: 100%;
			}

			.option {
				display: flex;
				align-items: center;
			}

			.option ha-switch {
				margin-right: 10px;
			}
		`;
	}
}

customElements.define('meteoalarm-card-editor', MeteoalarmCardEditor);
