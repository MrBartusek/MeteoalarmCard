import { LitElement, html } from 'lit-element';
import { hasConfigOrEntityChanged, fireEvent } from 'custom-card-helpers';
import localize from './localize';
import styles from './styles';
import { events, levels } from './data';

class MeteoalarmCard extends LitElement
{
	static get properties()
	{
		return {
			hass: Object,
			config: Object,
			requestInProgress: Boolean,
		};
	}

	static get styles()
	{
		return styles;
	}

	static getStubConfig(hass, entities)
	{
		console.log(entities)
		const [entity] = entities.filter(
			(eid) => eid.includes('meteoalarm')
		);

		return {
			entity: entity || '',
		};
	}

	get entity()
	{
		return this.hass.states[this.config.entity];
	}

	setConfig(config)
	{
		if (!config.entity)
		{
			throw new Error(localize('error.missing_entity'));
		}
		this.config = config;
	}

	getCardSize()
	{
		return 2;
	}

	shouldUpdate(changedProps)
	{
		return hasConfigOrEntityChanged(this, changedProps);
	}

	updated(changedProps)
	{
		if (
			changedProps.get('hass') &&
			changedProps.get('hass').states[this.config.entity].state !==
				this.hass.states[this.config.entity].state
		)
		{
			this.requestInProgress = false;
		}
	}

	handleMore()
	{
		fireEvent(
			this,
			'hass-more-info',
			{
				entityId: this.entity.entity_id,
			},
			{
				bubbles: true,
				composed: true,
			}
		);
	}

	getAttributes(entity)
	{
		const {
			status,
			state,
			friendly_name,
			event,
			awareness_level,
			awareness_type
		} = entity.attributes;

		let result = {
			warning_active: (status || state || entity.state) != 'off',
			friendly_name,
		};

		if(result.warning_active)
		{
			result = {...result, ...{
				event,
				awareness_level: Number(awareness_level.split(';')[0]) - 2,
				awareness_type: Number(awareness_type.split(';')[0]) -1
			}}
		}

		// If event name is not issued, generate default name in format
		// Translated Awareness Level - Translated Color
		// eg. Orange - Thunderstorms
		if(result.event == undefined)
		{
			if(result.warning_active)
			{
				result.event = localize(levels[result.awareness_level][1]) + ' - ' + localize(events[result.awareness_type][1])
			}
		}

		return result
	}

	renderIcon()
	{
		const { awareness_type } = this.getAttributes(this.entity);
		return html`
			<ha-icon class="main-icon" icon="mdi:${events[awareness_type][0]}"></ha-icon>
		`
	}

	renderStatus()
	{
		let { event } = this.getAttributes(this.entity);
		return html`
			<div class="status"> 
				${event}
			</div> 
		`
	}

	render()
	{
		if(!this.entity)
		{
			return html`
			  <ha-card>
				<div class="container">
					<div class="status"> 
						${localize('common.not_available')}
					</div> 
				</div>
			  </ha-card>
			`;
		}
		const { warning_active, awareness_level } = this.getAttributes(this.entity);
		if(!warning_active)
		{
			return html`
			<ha-card>
			  <div class="container">
				  <div class="status"> 
				  	<ha-icon class="main-icon" icon="mdi:shield-outline"></ha-icon> ${localize('events.no_warnings')}
				  </div> 
			  </div>
			</ha-card>
		  `;
		}

		return html`
			<ha-card>
				<div class="container" style="background-color: ${levels[awareness_level][0]};" @click="${() => this.handleMore()}" ?more-info="true">
					${this.renderIcon()} ${this.renderStatus()}
				</div>
			</ha-card>
		`;
	}
}

customElements.define('meteoalarm-card', MeteoalarmCard);

window.customCards = window.customCards || [];
window.customCards.push({
	preview: true,
	type: 'meteoalarm-card',
	name: localize('common.name'),
	description: localize('common.description'),
});
