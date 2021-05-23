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
			meteoalarm: 'Core Meteoalarm',
			meteofrance: 'Core Météo-France',
			meteoalarmeu: 'Custom MeteoalarmEU'
		}
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
			return this._config.integration || '';
		}

		return '';
	}


	render()
	{
		if (!this.hass) return html``;

		return html`
      		<div class="card-config">
				<ha-entity-picker
					label=${`${localize('editor.entity')} (${localize('editor.required')})`}
					.hass=${this.hass}
					.value=${this._entity}
					.configValue=${'entity'}
					@value-changed=${this._valueChanged}
					allow-custom-entity
				></ha-entity-picker>

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
							return html`<paper-item>${e}</paper-item>`
						})}
          			</paper-listbox>
        		</paper-dropdown-menu>
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
		if (target.configValue)
		{
			this._config = {
				...this._config,
				[target.configValue]:
            target.checked !== undefined ? target.checked : value,
			};

		}
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
