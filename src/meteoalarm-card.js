import { LitElement, html } from 'lit-element';
import { hasConfigOrEntityChanged, fireEvent } from 'custom-card-helpers';
import localize from './localize';
import styles from './styles';
import { EVENTS, LEVELS } from './data';

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
			event,
			headline,
			awareness_level,
			awareness_type
		} = entity.attributes;

		let result = {
			warning_active: (status || state || entity.state) != 'off'
		};

		if(result.warning_active)
		{
			if(awareness_level.includes(';'))
			{
				// meteoalarm core
				result = {...result, ...{
					headline: event || headline,
					awareness_level: LEVELS[Number(awareness_level.split(';')[0]) - 2],
					awareness_type: EVENTS[Number(awareness_type.split(';')[0]) - 2]
				}}
			}
			else
			{
				// custom_component xlcnd/meteoalarmeu
				result = {...result, ...{
					awareness_level: LEVELS.find(e => e.name == awareness_level),
					awareness_type: EVENTS.find(l => l.name == awareness_type)
				}}
			}
		}

		if(result.headline == undefined && result.warning_active)
		{
			result.headline = this.generateHeadline(result.awareness_type, result.awareness_level)
		}

		return result
	}

	generateHeadline(awarenessType, awarenessLevel)
	{
		// If headline is not issued, generate default one
		return localize(awarenessLevel.translationKey).replace('{0}', localize(awarenessType.translationKey))
	}

	getBackgroundColor()
	{
		const { warning_active, awareness_level } = this.getAttributes(this.entity);
		return warning_active ? awareness_level.color : 'inherit'
	}

	getFontColor()
	{
		const { warning_active } = this.getAttributes(this.entity);
		return warning_active ? '#fff' : '--primary-text-color'
	}

	renderIcon()
	{
		let iconName = ''
		if(!this.entity)
		{
			iconName = 'cloud-question'
		}
		else
		{
			const { warning_active, awareness_type } = this.getAttributes(this.entity);
			iconName = warning_active ? awareness_type.icon : 'shield-outline'
		}
		return html`
			<ha-icon class="main-icon" icon="mdi:${iconName}"></ha-icon>
		`
	}

	renderStatus()
	{
		const { warning_active, headline } = this.getAttributes(this.entity);
		if(warning_active)
		{
			return html`
				<div class="status"> 
					${headline}
				</div> 
			`
		}
		else
		{
			return html`
				<div class="status"> 
					${localize('events.no_warnings')}
				</div> 
			`
		}
	}

	render()
	{
		if(!this.entity)
		{
			return html`
			  <ha-card>
				<div class="container">
					<div class="content"> 
						${this.renderIcon()}
						<div class="status"> 
							${localize('common.not_available')}
						</div>
					</div> 
				</div>
			  </ha-card>
			`;
		}

		return html`
			<ha-card>
				<div 
					class="container"
					style="background-color: ${this.getBackgroundColor()}; color: ${this.getFontColor()};"
					@click="${() => this.handleMore()}"
					?more-info="true" 
				>
					<div class="content">
						${this.renderIcon()} ${this.renderStatus()}
					</div>
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
