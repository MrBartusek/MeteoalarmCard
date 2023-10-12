import { HassEntity } from 'home-assistant-js-websocket';
import { MeteoalarmData, MeteoalarmEventInfo, MeteoalarmLevelInfo } from './data';
import { localize } from './localize/localize';
import { PredefinedCards } from './predefined-cards';
import {
	MeteoalarmAlert,
	MeteoalarmAlertKind,
	MeteoalarmAlertParsed,
	MeteoalarmEventType,
	MeteoalarmIntegration,
	MeteoalarmIntegrationEntityType
} from './types';
import { HomeAssistant } from 'custom-card-helpers';

/**
 * This is the class that stands between integration and rendering code.
 */
class EventsParser {
	constructor(
        private integration: MeteoalarmIntegration
	) {}

	/**
     * This function parses all of the provided entities and provides their attributes
     * to integration specified in constructors. The result is additionally processed and
     * verified then, packed to array of MeteoalarmAlertParsed objects
     */
	public async getEvents(
		hass: HomeAssistant,
		entities: HassEntity[],
		disableSweeper = false,
		overrideHeadline = false,
		hideCaption = false,
		ignoredLevels: string[] = [],
		ignoredEvents: string[] = []
	): Promise<MeteoalarmAlertParsed[]> {
		if(this.isAnyEntityUnavailable(entities)) {
			return [ PredefinedCards.unavailableCard() ];
		}
		await this.checkIfIntegrationSupportsEntities(hass, entities);

		let alerts = this.sortAlerts(await this.graterAllAlerts(hass, entities));
		this.validateAlert(alerts);
		alerts = this.filterAlerts(alerts, ignoredLevels, ignoredEvents);

		const result: MeteoalarmAlertParsed[] = [];
		for(const alert of alerts) {
			const event = MeteoalarmData.getEvent(alert.event);
			const level = MeteoalarmData.getLevel(alert.level);

			const headlines = this.generateHeadlines(event, level);

			// If there is provided headline, and user wants it, push it to headlines
			if(!overrideHeadline && alert.headline) {
				headlines.unshift(alert.headline);
			}

			let caption: string | undefined = undefined;
			let captionIcon: string | undefined = undefined;
			if(!hideCaption) {
				if(alert.kind == MeteoalarmAlertKind.Expected) {
					caption = localize('common.expected');
					captionIcon = 'clock-outline';
				}
			}

			result.push({
				isActive: true,
				entity: alert._entity!,
				icon: event.icon,
				color: level.color,
				headlines: headlines,
				caption: caption,
				captionIcon: captionIcon
			});
		}

		// If there are no results that mean above loop didn't trigger
		// event parsing even once since every sensor was inactive.
		if(result.length == 0) {
			return [ PredefinedCards.noWarningsCard(entities[0]) ];
		}

		return disableSweeper ? result.slice(1) : result;
	}

	/**
     * Call integration for each of the entities and put all alerts in array
     */
	private async graterAllAlerts(hass: HomeAssistant, entities: HassEntity[]): Promise<MeteoalarmAlert[]> {
		const alerts: MeteoalarmAlert[] = [];
		for(const entity of entities) {
			const active = this.integration.alertActive(entity);
			if(!active) continue;

			let entityAlerts = await this.integration.getAlerts(hass, entity);
			if(!Array.isArray(entityAlerts)) {
				entityAlerts = [ entityAlerts ];
			}
			if(entityAlerts.length == 0) {
				throw new Error('Integration is active but did not return any events');
			}
			for(const alert of entityAlerts) {
				alerts.push({...alert, _entity: entity});
			}
		}
		return alerts;
	}

	private filterAlerts(
		alerts: MeteoalarmAlert[],
		ignoredLevels: string[],
		ignoredEvents: string[]
	): MeteoalarmAlert[] {
		if(ignoredEvents.length == 0 && ignoredLevels.length == 0) return alerts;
		const result: MeteoalarmAlert[] = [];

		for(const alert of alerts) {
			const eventInfo = MeteoalarmData.events.find(e => e.type == alert.event)!;
			const levelInfo = MeteoalarmData.levels.find(e => e.type == alert.level)!;
			if(!ignoredEvents.includes(eventInfo.fullName) && !ignoredLevels.includes(levelInfo.fullName)) {
				result.push(alert);
			}
		}

		return result;
	}

	private sortAlerts(alertsInput: MeteoalarmAlert[]): MeteoalarmAlert[] {
		let alerts = [...alertsInput];
		// Sort by how dangerous events are
		alerts = alerts.sort((a, b) => {
			const eventsData = MeteoalarmData.events;
			const aLevel = eventsData.indexOf(eventsData.find(e => e.type == a.event)!);
			const bLevel = eventsData.indexOf(eventsData.find(e => e.type == b.event)!);
			return(bLevel - aLevel);
		});

		// Sort by level
		alerts = alerts.sort((a, b) => (b.level - a.level));

		// Push expected events to back of the list
		alerts = alerts.sort((a, b) => {
			if(a.kind === undefined) return 0;
			if(a.kind == MeteoalarmAlertKind.Current && b.kind == MeteoalarmAlertKind.Expected) return -1;
			else if(a.kind == MeteoalarmAlertKind.Expected && b.kind == MeteoalarmAlertKind.Current) return 1;
			return 0;
		});

		return alerts;
	}
	/**
     * Validate if specified alert is up to standards
     */
	private validateAlert(alerts: MeteoalarmAlert[]): void {
		for(const alert of alerts) {
			if(alert.event === undefined || alert.level === undefined) {
				throw new Error(
                    `[Alert QA Error] Invalid event object received: event: ${alert.event} level: ${alert.level}`);
			}
			if(!this.integration.metadata.returnHeadline && alert.headline) {
				throw new Error(
					'[Alert QA Error] metadata.returnHeadline is false but headline was returned');
			}
			if(
				(this.integration.metadata.type == MeteoalarmIntegrationEntityType.CurrentExpected)
                && alert.kind == undefined
			) {
				throw new Error(
					'[Alert QA Error] CurrentExpected type is required to provide alert.kind');
			}
			if(
				(this.integration.metadata.type != MeteoalarmIntegrationEntityType.CurrentExpected)
                && alert.kind != undefined
			) {
				throw new Error(
					'[Alert QA Error] only CurrentExpected type can return alert.kind');
			}
			if(!this.integration.metadata.returnMultipleAlerts && alerts.length > 1) {
				throw new Error(
					'[Alert QA Error] returnMultipleAlerts is false but more than one alert was returned');
			}
		}
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

	private isAnyEntityUnavailable(entities: HassEntity[]): boolean {
		return entities.some(e => {
			return e == undefined || (e.attributes.status || e.attributes.state || e.state) === 'unavailable';
		});
	}

	private async checkIfIntegrationSupportsEntities(hass: HomeAssistant, entities: HassEntity[]): Promise<void> {
		const supportData = await Promise.all(entities.map(async e => {
			const supports = await this.integration.supports(hass, e);
			return {entity: e, supports};
		}));
		if(!supportData.every(e => e.supports)) {
			if(entities.length == 1) {
				throw new Error(localize('error.entity_invalid.single'));
			}
			else {
				const unsupportedEntities = supportData.filter(e => !e.supports);
				throw new Error(
					localize('error.entity_invalid.multiple')
						.replace('{entity}', unsupportedEntities.map(x => x.entity.entity_id).join(', '))
				);
			}
		}
	}

}

export default EventsParser;
