import { LitElement, html } from 'lit-element';
import { hasConfigOrEntityChanged, fireEvent } from 'custom-card-helpers';
import localize from './localize';
import styles from './styles';

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

		return {
			status: status || state || entity.state,
			friendly_name,
			event,
			awareness_level: Number(awareness_level.split(';')[0]),
			awareness_type: Number(awareness_type.split(';')[0])
		};
	}

	getAwarenessColor()
	{
		const { awareness_level } = this.getAttributes(this.entity);
		switch(awareness_level)
		{
			case 1:
				return 'var(--success-color)'
			case 2:
				return 'var(--warning-color)'
			case 3:
				return 'var(--error-color)'
			default:
				return 'var(--card-background-color)'
		}
	}

	renderIcon()
	{
		const { awareness_type } = this.getAttributes(this.entity);
		let icon;
		switch(awareness_type)
		{
			case 1:
				icon = 'windsock'
				break;
			case 2:
				icon = 'snowflake'
				break;
			case 3:
				icon = 'weather-lightning'
				break;
			case 4:
				icon = 'waves'
				break;
			case 5:
				icon = 'thermometer-chevron-up'
				break;
			case 6:
				icon = 'thermometer-chevron-down'
				break;
			case 7:
				icon = 'waves'
				break;
			case 8:
				icon = 'pine-tree-fire'
				break;
			case 9:
				icon = 'image-filter-hdr'
				break;
			case 10:
				icon = 'weather-pouring'
				break;
			case 11:
				icon = 'waves'
				break;
			case 12:
				icon = 'weather-pouring'
				break;
			default:
				icon = 'alert-circle-outline'
				break;
		}
		return html`
			<ha-icon class="main-icon" icon="mdi:${icon}"></ha-icon>
		`
	}

	renderStatus()
	{
		const { event } = this.getAttributes(this.entity);
		return html`
			<div class="status"> 
				${event}
			</div> 
		`
	}

	render()
	{
		if (!this.entity)
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

		return html`
			<ha-card>
				<div class="container" style="background-color: ${this.getAwarenessColor()};" @click="${() => this.handleMore()}" ?more-info="true">
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
