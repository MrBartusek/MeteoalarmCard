import { LitElement, html } from 'lit-element';
import { hasConfigOrEntityChanged, fireEvent } from 'custom-card-helpers';
import './editor';
import localize from './localize';
import styles from './styles';
import ResizeObserver from 'resize-observer-polyfill';
import { debounce } from './debounce';

import { MeteoAlarmIntegration } from './integrations/meteoalarm';
import { MeteoFranceIntegration } from './integrations/meteofrance';
import { DWDIntegration } from './integrations/dwd';
import { WeatherAlertsIntegration } from './integrations/weatheralerts';

import { version } from '../package.json';
import Data from './data';

console.info(
  `%c METEOALARM-CARD %c ${version} `,
  'color: white; background: #1c1c1c; font-weight: 700;',
  'color: white; background: #db4437; font-weight: 700;'
);

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
		// Find fist entity that is supported by any integration
		const entity = entities.find((eid) => this.integrations.some((integration) => integration.supports(hass.states[eid])));

		return {
			entity: entity || ''
		};
	}

	static getConfigElement()
	{
		return document.createElement('meteoalarm-card-editor');
	}

	static get integrations()
	{
		return [MeteoAlarmIntegration, MeteoFranceIntegration, DWDIntegration, WeatherAlertsIntegration];
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
		return this.keyToIntegration(this.config.integration || 'automatic');
	}

	setConfig(config)
	{
		if(!config.entity)
		{
			throw new Error(localize('error.missing_entity'));
		}
		if(config.integration != 'automatic' && config.integration != undefined && this.keyToIntegration(config.integration, config.entity) == undefined)
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
		const regular = card.querySelector('.headline-regular');
		const narrow = card.querySelector('.headline-narrow');
		const veryNarrow = card.querySelector('.headline-verynarrow');

		// Normal Size
		regular.style.display = 'flex';
		narrow.style.display = 'none';
		veryNarrow.style.display = 'none';

		// Narrow Size
		if(regular.scrollWidth > regular.clientWidth)
		{
			regular.style.display = 'none';
			narrow.style.display = 'flex';
			veryNarrow.style.display = 'none';
		}

		// Very Narrow Size
		if(narrow.scrollWidth > narrow.clientWidth)
		{
			regular.style.display = 'none';
			narrow.style.display = 'none';
			veryNarrow.style.display = 'flex';
		}

		// Only Icon Size
		if(veryNarrow.scrollWidth > veryNarrow.clientWidth)
		{
			regular.style.display = 'none';
			narrow.style.display = 'none';
			veryNarrow.style.display = 'none';
		}
	}

	keyToIntegration(key, entity = this.entity)
	{
		if(key == 'automatic')
		{
			const result = MeteoalarmCard.integrations.find((i) => i.supports(entity));
			if(result == undefined)
			{
				throw Error(localize('error.automatic_failed'));
			}
			return result;
		}
		else
		{
			return MeteoalarmCard.integrations.find((i) => i.name == key);
		}
	}

	isEntityAvailable(entity)
	{
		return (entity.attributes.status || entity.attributes.state || entity.state) != 'unavailable';
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
				...this.filterResults(this.integration.getResult(entity)),
			};

			// Handle entity parsing errors
			if(result.level == undefined || result.event == undefined)
			{
				console.log('level', result.level);
				console.log('event', result.event);
				throw Error(
					localize('error.entity_invalid')
						.replace('{entity}', `(${entity.entity_id})`)
						.replace('{integration}', `(${this.integration.name})`)
				);
			}

			// Generate Headlines
			if(result.headline === undefined || this.overrideHeadline)
			{
				result.headline = this.generateHeadline(result.event, result.level);
			}
			result.headlineNarrow = this.generateHeadline(result.event, result.level);
			result.headlineVeryNarrow = this.generateHeadline(result.event, result.level, true);

		}
		return result;
	}

	filterResults(results)
	{
		if(!Array.isArray(results)) results = [ results ];
		let topResult = results[0];
		for(const result of results)
		{
			const isHigherLevel = Data.levels.findIndex(x => x.name == result.level.name) > Data.levels.findIndex(x => x.name == topResult.level.name);
			const isHigherEvent = Data.events.findIndex(x => x.name == result.event.name) < Data.events.findIndex(x => x.name == topResult.event.name);
			if(isHigherEvent || isHigherLevel)
			{
				topResult = result;
			}
		}
		return topResult;
	}

	generateHeadline(event, level, narrow = false)
	{
		if(event.name == 'Unknown Event')
		{
			if(narrow)
			{
				return localize(level.translationKey).color;
			}
			else
			{
				return localize(level.translationKey).generic;
			}
		}
		else
		{
			if(narrow)
			{
				const awareness = localize(event.translationKey);
				return awareness.charAt(0).toUpperCase() + awareness.slice(1);
			}
			else
			{
				return localize(level.translationKey).event.replace('{event}', localize(event.translationKey));
			}
		}
	}

	getBackgroundColor()
	{
		const { isWarningActive, level } = this.getAttributes(this.entity);
		return isWarningActive ? level.color : 'inherit';
	}

	getFontColor()
	{
		const { isWarningActive } = this.getAttributes(this.entity);
		return isWarningActive ? '#fff' : '--primary-text-color';
	}

	renderIcon()
	{
		let iconName = '';
		if(!this.entity || !this.getAttributes(this.entity).isAvailable)
		{
			iconName = 'cloud-question';
		}
		else
		{
			const { isWarningActive, event } = this.getAttributes(this.entity);

			iconName = isWarningActive ? event.icon : 'shield-outline';
		}
		return html`
			<ha-icon class="main-icon" icon="mdi:${iconName}"></ha-icon>
		`;
	}

	renderStatus()
	{
		const {
			isWarningActive,
			headline,
			headlineNarrow,
			headlineVeryNarrow,
		} = this.getAttributes(this.entity);

		if(isWarningActive)
		{
			return html`
				<div class="headline headline-regular"> ${headline}</div> 
				<div class="headline headline-narrow"> ${headlineNarrow}</div> 
				<div class="headline headline-verynarrow"> ${headlineVeryNarrow}</div> 
			`;
		}
		else
		{
			return html`
				<div class="headline headline-regular">${localize('events.no_warnings')}</div>
				<div class="headline headline-narrow">${localize('events.no_warnings')}</div>
				<div class="headline headline-verynarrow">${localize('events.no_warnings')}</div> 
			`;
		}
	}

	renderNotAvailable()
	{
		return html`
			<ha-card>
				<div class="container">
					<div class="content"> 
						${this.renderIcon()}
						<div class="headline headline-regular">${localize('common.unavailable').long}</div>
						<div class="headline headline-narrow">${localize('common.unavailable').short}</div>
						<div class="headline headline-verynarrow">${localize('common.unavailable').short}</div> 
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

		return html`${errorCard}`;
	}

	render()
	{
		try
		{
			if(!this.entity || !this.getAttributes(this.entity).isAvailable)
			{
				return this.renderNotAvailable();
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
			console.error('=== METEOALARM CARD ERROR ===\nReport issue: https://bit.ly/3hK1hL4 \n\n', error);
			return this.renderError(error);
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
