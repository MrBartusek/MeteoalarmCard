import { LitElement, html } from 'lit-element';
import { hasConfigOrEntityChanged, fireEvent } from 'custom-card-helpers';
import './editor'
import localize from './localize';
import styles from './styles';
import ResizeObserver from 'resize-observer-polyfill'
import { debounce } from './debounce'

import { MeteoAlarmIntegration } from './integrations/meteoalarm-integration';
import { MeteoFranceIntegration } from './integrations/meteofrance-integration';
import { MeteoAlarmeuIntegration } from './integrations/meteoalarmeu-integration';

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
			integration: 'automatic'
		};
	}

	static getConfigElement()
	{
		return document.createElement('meteoalarm-card-editor');
	}

	get integrations()
	{
		return [MeteoAlarmIntegration, MeteoAlarmeuIntegration, MeteoFranceIntegration];
	}

	get entity()
	{
		return this.hass.states[this.config.entity];
	}

	get overrideHeadline()
	{
		return this.config.override_headline === true;
	}

	get integration()
	{
		return this.keyToIntegration(this.config.integration)
	}

	setConfig(config)
	{
		if(!config.entity)
		{
			throw new Error(localize('error.missing_entity'));
		}
		if(!config.integration)
		{
			throw new Error(localize('error.missing_integration'));
		}
		if(config.integration != 'automatic' && this.keyToIntegration(config.integration, config.entity) == undefined)
		{
			throw new Error(localize('error.invalid_integration'));
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

	firstUpdated()
	{
		this.measureCard();
		this.attachObserver();
	}

	async attachObserver()
	{
		if (!this._resizeObserver)
		{
			this.resizeObserver = new ResizeObserver(
				debounce(() => this.measureCard(), 250, false)
			);
		}
		const card = this.shadowRoot.querySelector('ha-card');
		if (!card) return;
		this.resizeObserver.observe(card);
	}

	measureCard()
	{
		if (!this.isConnected) return;
		const card = this.shadowRoot.querySelector('ha-card');
		if (!card) return;

		if (card.offsetWidth < 375)
		{
			this.setAttribute('narrow', '');
		}
		else
		{
			this.removeAttribute('narrow');
		}
		if (card.offsetWidth < 200)
		{
			this.setAttribute('verynarrow', '');
		}
		else
		{
			this.removeAttribute('verynarrow');
		}
	}

	keyToIntegration(key, entity = this.entity)
	{
		if(key == 'automatic')
		{
			const result = this.integrations.find((i) => i.supports(entity))
			if(result == undefined)
			{
				throw Error(localize('error.automatic_failed'))
			}
			return result;
		}
		else
		{
			return this.integrations.find((i) => i.name == key)
		}
	}

	isEntityAvailable(entity)
	{
		return (entity.attributes.status || entity.attributes.state || entity.state) != 'unavailable'
	}

	getAttributes(entity)
	{
		let result = {
			isAvailable: this.isEntityAvailable(entity),
			isWarningActive: this.isEntityAvailable(entity) ? this.integration.isWarningActive(entity) : false,
		};

		if(result.isWarningActive)
		{
			result = {
				...result,
				...this.integration.getResult(entity),
			}

			if(result.awarenessLevel == undefined || result.awarenessType == undefined)
			{
				throw Error(localize('error.entity_not_supported'))
			}

			if(result.headline === undefined || this.overrideHeadline)
			{
				// If headline is not issued, generate default one
				result.headline = this.generateHeadline(result.awarenessType, result.awarenessLevel)
			}
			result.headlineNarrow = this.generateHeadline(result.awarenessType, result.awarenessLevel, true)

		}
		return result
	}

	generateHeadline(awarenessType, awarenessLevel, narrow = false)
	{
		if(narrow)
		{
			const awareness = localize(awarenessType.translationKey);
			return awareness.charAt(0).toUpperCase() + awareness.slice(1)
		}
		else
		{
			return localize(awarenessLevel.translationKey).replace('{0}', localize(awarenessType.translationKey))
		}
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
		const { isWarningActive: isWarningActive, headline, headlineNarrow } = this.getAttributes(this.entity);

		if(isWarningActive)
		{
			return html`
				<div class="status"> 
					${headline}
				</div> 
				<div class="status-narrow"> 
					${headlineNarrow}
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

	renderError(error)
	{
		const errorCard = document.createElement('hui-error-card');
		errorCard.setConfig({
			type: 'error',
			error,
			origConfig: this.config,
		});

		return html`${errorCard}`
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
		catch(error)
		{
			console.error('=== METEOALARM CARD ERROR ===\nReport issue: https://bit.ly/3hK1hL4 \n\n', error)
			return this.renderError(error)
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
