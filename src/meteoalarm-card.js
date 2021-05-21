import { LitElement, html } from 'lit-element';
import { hasConfigOrEntityChanged, fireEvent } from 'custom-card-helpers';
import localize from './localize';
import styles from './styles';

import { MeteoAlarmIntegration } from './integrations/meteoalarm-integration';
import { MeteoFranceIntegration } from './integrations/meteofrance-integration';
import { MeteoAlarmeuIntegration } from './integrations/meteoalarmeu-integration';

class MeteoalarmCard extends LitElement
{
	getStategies()
	{
		return [
			MeteoAlarmIntegration,
			MeteoFranceIntegration,
			MeteoAlarmeuIntegration
		];
	}

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
			entity: entity || ''
		};
	}

	get entity()
	{
		return this.hass.states[this.config.entity];
	}

	get sourceType()
	{
		return this.config.sourceType;
	}

	setConfig(config)
	{
		if(!config.entity)
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
		if(
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

	entityIsAvailable(entity)
	{
		return (entity.attributes.status || entity.attributes.state || entity.state) != 'unavailable'
	}

	getAttributes(entity)
	{
		let result = {
			isAvailable: false,
			isWarningActive: false
		};

		this.getStategies().forEach(strategy =>
		{
			if(!strategy.supports(this.sourceType, entity))
			{
				return;
			}

			if(!this.entityIsAvailable(entity))
			{
				return;
			}

			result.isAvailable = true;

			if(!strategy.isWarningActive(entity))
			{
				return;
			}

			result.isWarningActive = true;

			result = {
				...result,
				...strategy.getResult(entity)
			}
		});

		if(result.headline == undefined && result.isWarningActive)
		{
			result.headline = this.generateHeadline(result.awarenessType, result.awarenessLevel)
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
		const { isWarningActive: isWarningActive, awarenessLevel } = this.getAttributes(this.entity);
		return isWarningActive ? awarenessLevel.color : 'inherit'
	}

	getFontColor()
	{
		const { isWarningActive: isWarningActive } = this.getAttributes(this.entity);
		return isWarningActive ? '#fff' : '--primary-text-color'
	}

	renderIcon()
	{
		let iconName = ''
		if(!this.entity || !this.getAttributes(this.entity).isAvailable)
		{
			iconName = 'cloud-question'
		}
		else
		{
			const { isWarningActive: isWarningActive, awarenessType } = this.getAttributes(this.entity);

			iconName = isWarningActive ? awarenessType.icon : 'shield-outline'
		}
		return html`
			<ha-icon class="main-icon" icon="mdi:${iconName}"></ha-icon>
		`
	}

	renderStatus()
	{
		const { isWarningActive: isWarningActive, headline } = this.getAttributes(this.entity);

		if(isWarningActive)
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

	renderNotAvailable()
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

	renderError()
	{
		return html`
			<ha-card>
				<div class="container" style="background-color: #db4437; color: #fff">
					<div class="content"> 
						<ha-icon class="main-icon" icon="mdi:alert-circle-outline"></ha-icon>
						<div class="status"> Error (see console) </div>
					</div>
				</div>
			</ha-card>
		`;
	}

	render()
	{
		try
		{
			if(!this.entity || !this.getAttributes(this.entity).isAvailable)
			{
				return this.renderNotAvailable()
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
		catch(e)
		{
			console.error('=== METEOALARM CARD ERROR ===\nReport issue: https://bit.ly/3hK1hL4 \n\n', e)
			return this.renderError()
		}
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
