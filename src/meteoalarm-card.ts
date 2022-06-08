import { LitElement, html, TemplateResult, PropertyValues, CSSResultGroup } from 'lit';
import { customElement, property, state } from 'lit/decorators';
import {
	HomeAssistant,
	hasConfigOrEntityChanged,
	hasAction,
	ActionHandlerEvent,
	handleAction,
	LovelaceCardEditor,
	LovelaceCardConfig,
	debounce,
	EntityConfig
} from 'custom-card-helpers';

import {
	MeteoalarmCardConfig,
	MeteoalarmAlertParsed,
	MeteoalarmEventType,
	MeteoalarmIntegration,
	MeteoalarmLevelType,
	MeteoalarmAlertKind,
	MeteoalarmIntegrationEntityType
} from './types';
import { actionHandler } from './action-handler-directive';
import { version as CARD_VERSION } from '../package.json';
import { localize } from './localize/localize';
import styles from './styles';
import ResizeObserver from 'resize-observer-polyfill';
import { HassEntity } from 'home-assistant-js-websocket';
import { MeteoalarmData, MeteoalarmEventInfo, MeteoalarmLevelInfo } from './data';
import INTEGRATIONS from './integrations/integrations';
import { processConfigEntities } from './process-config-entities';

/* eslint no-console: 0 */
console.info(
	`%c  MeteoalarmCard \n%c  ${localize('common.version')} ${CARD_VERSION}    `,
	'color: white; font-weight: bold; background: #1c1c1c',
	'color: white; font-weight: bold; background: #db4437'
);

// Push card into UI card picker
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
	preview: true,
	type: 'meteoalarm-card',
	name: localize('common.name'),
	description: localize('common.description')
});

@customElement('meteoalarm-card')
export class MeteoalarmCard extends LitElement {
	@property({ attribute: false }) public hass!: HomeAssistant;
	@state() private config!: MeteoalarmCardConfig;
	private resizeObserver!: ResizeObserver;

	static get integrations(): MeteoalarmIntegration[] {
		return INTEGRATIONS.map(i => new i());
	}

	public static async getConfigElement(): Promise<LovelaceCardEditor> {
		await import('./editor');
		return document.createElement('meteoalarm-card-editor');
	}

	public static getStubConfig(hass: HomeAssistant, entities: string[]): Record<string, unknown> {
		// Find fist entity that is supported by any integration
		for(const entity of entities) {
			for(const integration of MeteoalarmCard.integrations) {
				if(integration.supports(hass.states[entity])) {
					return {
						entity: entity,
						integration: integration.metadata.key
					};
				}
			}
		}
		return {
			entity: '',
			integration: ''
		};
	}

	public setConfig(config: LovelaceCardConfig): void {
		if (!config) {
			throw new Error(localize('common.invalid_configuration'));
		}
		else if (config.entities == undefined || (Array.isArray(config.entities) && config.entities.length == 0)) {
			throw new Error(localize('error.missing_entity'));
		}
		else if (!config.integration == undefined) {
			throw new Error(localize('error.missing_entity'));
		}

		this.config = {
			name: 'Meteoalarm',
			...config
		};
	}

	static get styles(): CSSResultGroup {
		return styles;
	}

	public getCardSize(): number {
		return 2;
	}

	protected shouldUpdate(changedProps: PropertyValues): boolean {
		return hasConfigOrEntityChanged(this, changedProps, false);
	}

	public firstUpdated(): void {
		this.measureCard();
		this.attachObserver();
	}

	private attachObserver() {
		if (!this.resizeObserver) {
			this.resizeObserver = new ResizeObserver(
				debounce(() => this.measureCard(), 250, false)
			);
		}
		const card = this.shadowRoot!.querySelector('ha-card');
		if (!card) return;
		this.resizeObserver.observe(card);
	}

	private measureCard() {
		if (!this.isConnected) return;
		const card = this.shadowRoot!.querySelector('ha-card');
		if (!card) return;
		const regular = card.querySelector('.headline-regular') as HTMLElement;
		const narrow = card.querySelector('.headline-narrow') as HTMLElement;
		const veryNarrow = card.querySelector('.headline-verynarrow') as HTMLElement;

		// Normal Size
		regular.style.display = 'flex';
		narrow.style.display = 'none';
		veryNarrow.style.display = 'none';

		// Narrow Size
		if(regular.scrollWidth > regular.clientWidth) {
			regular.style.display = 'none';
			narrow.style.display = 'flex';
			veryNarrow.style.display = 'none';
		}

		// Very Narrow Size
		if(narrow.scrollWidth > narrow.clientWidth) {
			regular.style.display = 'none';
			narrow.style.display = 'none';
			veryNarrow.style.display = 'flex';
		}

		// Only Icon Size
		if(veryNarrow.scrollWidth > veryNarrow.clientWidth) {
			regular.style.display = 'none';
			narrow.style.display = 'none';
			veryNarrow.style.display = 'none';
		}
	}

	private get entities(): HassEntity[] {
		const entities: EntityConfig[] = processConfigEntities(this.config.entities!);
		return entities.map(e => this.hass.states[e.entity]);
	}

	private get integration(): MeteoalarmIntegration {
		const integration = MeteoalarmCard.integrations.find(i => i.metadata.key === this.config.integration);
		if(integration === undefined) {
			throw new Error(localize('error.invalid_integration'));
		}
		if(!this.entities.every(e => integration.supports(e))) {
			if(this.entities.length == 1) {
				throw new Error(localize('error.entity_invalid.single'));
			}
			else {
				throw new Error(
					localize('error.entity_invalid.multiple')
						.replace('{entity}', this.entities.filter(e => !integration.supports(e)).map(x => x.entity_id).join(', '))
				);
			}
		}
		return integration!;
	}

	// This function graters all of the attributes needed for rendering of the card
	// from the selected integration, sometimes doing additional processing and checks
	private getEvents(): MeteoalarmAlertParsed[] {
		// Filter unavailable entities
		const entities = this.entities.filter(e => {
			return e.attributes.status || e.attributes.state || e.state !== 'unavailable';
		});
		if(entities.length === 0) {
			return [{
				icon: 'cloud-question',
				color: MeteoalarmData.getLevel(MeteoalarmLevelType.None).color,
				headlines: [
					localize('common.unavailable.long'),
					localize('common.unavailable.short')
				]
			}];
		}

		const result: MeteoalarmAlertParsed[] = [];
		for(const entity of entities) {
			const active = this.integration.alertActive(entity);
			if(!active) continue;

			const alerts = this.integration.getAlerts(entity);
			if(alerts.length == 0) {
				throw new Error('Integration is active but did not return any events');
			}

			for(const alert of alerts) {
				// Verify that integration response match standards
				if(alert.event === undefined || alert.level === undefined) {
					throw new Error(`[Invalid response from integration] Received partial event: event: ${alert.event} level: ${alert.level}`);
				}
				if(!this.integration.metadata.returnHeadline && alert.headline) {
					throw new Error('[Invalid response from integration] metadata.returnHeadline is false but headline was returned');
				}
				if((this.integration.metadata.type == MeteoalarmIntegrationEntityType.CurrentExpected) == !!alert.kind) {
					throw new Error('[Invalid response from integration] CurrentExpected type is only allowed and obligated to return alert.kind');
				}

				const event = MeteoalarmData.getEvent(alert.event);
				const level = MeteoalarmData.getLevel(alert.level);

				const headlines = this.generateHeadlines(event, level);
				// If there is provided headline, and user wants it, push it to headlines
				if(!this.config.override_headline && alert.headline) {
					headlines.unshift(alert.headline);
				}

				let caption: string | undefined = undefined;
				let captionIcon: string | undefined = undefined;
				if(!this.config.hide_caption) {
					if(alert.kind == MeteoalarmAlertKind.Expected) {
						caption = localize('common.expected');
						captionIcon = 'clock-outline';
					}
				}

				result.push({
					icon: event.icon,
					color: level.color,
					headlines: headlines,
					caption: caption,
					captionIcon: captionIcon
				});
			}
		}

		// If there are no results that mean above loop didn't trigger
		// event parsing even once since every sensor was inactive.
		if(result.length == 0) {
			return [{
				icon: 'shield-outline',
				color: MeteoalarmData.getLevel(MeteoalarmLevelType.None).color,
				headlines: [
					localize('events.no_warnings')
				]
			}];
		}
		return result;
	}

	// Artificially generate headlines from event type and level
	private generateHeadlines(event: MeteoalarmEventInfo, level: MeteoalarmLevelInfo): string[] {
		if(event.type === MeteoalarmEventType.Unknown) {
			return [
				localize(level.translationKey + '.generic'),
				localize(level.translationKey + '.color')
			];
		}
		else {
			const e = localize(event.translationKey);
			return [
				localize(level.translationKey + '.event').replace('{event}', localize(event.translationKey)),
				e.charAt(0).toUpperCase() + e.slice(1)
			];
		}
	}

	protected render(): TemplateResult | void {
		try {
			const events = this.getEvents();
			return html`
				<ha-card
					@action=${this.handleAction}
					.actionHandler=${actionHandler({
						hasHold: hasAction(this.config.hold_action),
						hasDoubleClick: hasAction(this.config.double_tap_action)
					})}
					tabindex="0"
				>
					<div class="container" style="background-color: ${events[0].color};">
							<div class="content">
								${this.renderMainIcon(events[0].icon)}
								${this.renderHeadlines(events[0].headlines)}
							</div>
							${events[0].caption && events[0].captionIcon ? html`
								<div class="caption">
									${this.renderCaption(events[0].captionIcon, events[0].caption)}
								</div>
							` : ''}
					</div>
				</ha-card>
			`;
		}
		catch(error) {
			console.error('=== METEOALARM CARD ERROR ===\nReport issue: https://bit.ly/3hK1hL4 \n\n', error);
			return this.showError(error as string);
		}
	}

	private renderMainIcon(icon: string): TemplateResult {
		return html`<ha-icon class="main-icon" icon="mdi:${icon}"></ha-icon>`;
	}

	// Transfer array of one, two or three headlines in descending length
	// into TemplateResult. These will be selected depending on
	// card width (screen size) by resize observer
	private renderHeadlines(headlines: string[]): TemplateResult {
		// TODO: Fix this array mess
		let regular = '', narrow = '', verynarrow = '';
		if(headlines.length == 0) {
			throw new Error('headlines array length is 0');
		}
		else if(headlines.length == 1) {
			regular = headlines[0];
			narrow = headlines[0];
			verynarrow = headlines[0];
		}
		else if(headlines.length == 2) {
			regular = headlines[0];
			narrow = headlines[1];
			verynarrow = headlines[1];
		}
		else if(headlines.length == 3) {
			regular = headlines[0];
			narrow = headlines[1];
			verynarrow = headlines[2];
		}
		else if(headlines.length > 3) {
			throw new Error('headlines array length is higher than 3');
		}

		return html`
			<div class="headline headline-regular">${regular}</div>
			<div class="headline headline-narrow">${narrow}</div>
			<div class="headline headline-verynarrow">${verynarrow}</div>
		`;
	}

	private renderCaption(icon: string, caption: string): TemplateResult {
		return html`
			<span class="caption-text">${caption}</span>
			<ha-icon class="caption-icon" icon="mdi:${icon}"></ha-icon>
		`;
	}

	private showError(error: string): TemplateResult {
		const errorCard = document.createElement('hui-error-card');
		errorCard.setConfig({
			type: 'error',
			error,
			origConfig: this.config
		});

		return html` ${errorCard} `;
	}

	private handleAction(ev: ActionHandlerEvent): void {
		const config = {
			...this.config,
			entity: this.entities[0].entity_id
		};
		if (this.hass && this.config && ev.detail.action) {
			handleAction(this, this.hass, config, ev.detail.action);
		}
	}
}
