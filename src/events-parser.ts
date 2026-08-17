import type { HassEntity } from 'home-assistant-js-websocket';
import { MeteoalarmData, MeteoalarmEventInfo, MeteoalarmLevelInfo } from './data';
import { localize } from './localize/localize';
import { PredefinedCards } from './predefined-cards';
import {
	MeteoalarmAlert,
	MeteoalarmAlertKind,
	MeteoalarmAlertParsed,
	MeteoalarmEventType,
	MeteoalarmIntegration,
	MeteoalarmIntegrationEntityType,
} from './types';
import { formatWarningCaption } from './helpers/warning_time';

/**
 * This is the class that stands between integration and rendering code.
 */
class EventsParser {
	constructor(private integration: MeteoalarmIntegration) {}

	/**
	 * This function parses all of the provided entities and provides their attributes
	 * to integration specified in constructors. The result is additionally processed and
	 * verified then, packed to array of MeteoalarmAlertParsed objects
	 */
	public getEvents(
		entities: HassEntity[],
		disableSweeper = false,
		overrideHeadline = false,
		hideCaption = false,
		showWarningTimes = false,
		ignoredLevels: string[] = [],
		ignoredEvents: string[] = [],
	): MeteoalarmAlertParsed[] {
		if (this.isAnyEntityUnavailable(entities)) {
			return [PredefinedCards.unavailableCard()];
		}
		this.checkIfIntegrationSupportsEntities(entities);

		let alerts = this.sortAlerts(this.graterAllAlerts(entities));
		this.validateAlert(alerts);
		alerts = this.filterAlerts(alerts, ignoredLevels, ignoredEvents);

		const result: MeteoalarmAlertParsed[] = [];
		for (const alert of alerts) {
			const event = MeteoalarmData.getEvent(alert.event);
			const level = MeteoalarmData.getLevel(alert.level);

			const headlines = this.generateHeadlines(event, level);

			// If there is provided headline, and user wants it, push it to headlines
			if (!overrideHeadline && alert.headline) {
				headlines.unshift(alert.headline);
			}

			const now = new Date();
			const warningCaption = hideCaption
				? undefined
				: formatWarningCaption(alert, showWarningTimes, now);

			result.push({
				isActive: true,
				entity: alert._entity!,
				icon: event.icon,
				cssClass: level.cssClass,
				headlines,
				caption: warningCaption?.caption,
				captionPrefixText: warningCaption?.prefixText,
				captionSuffixIcon: warningCaption?.suffixIcon,
			});
		}

		// If there are no results that mean above loop didn't trigger
		// event parsing even once since every sensor was inactive.
		if (result.length == 0) {
			return [PredefinedCards.noWarningsCard(entities[0])];
		}

		return disableSweeper ? result.slice(0, 1) : result;
	}

	/**
	 * Call integration for each of the entities and put all alerts in array
	 */
	private graterAllAlerts(entities: HassEntity[]): MeteoalarmAlert[] {
		const alerts: MeteoalarmAlert[] = [];
		for (const entity of entities) {
			const active = this.integration.alertActive(entity);
			if (!active) continue;

			let entityAlerts = this.integration.getAlerts(entity);
			if (!Array.isArray(entityAlerts)) {
				entityAlerts = [entityAlerts];
			}
			if (entityAlerts.length == 0) {
				throw new Error('Integration is active but did not return any events');
			}
			for (const alert of entityAlerts) {
				alerts.push({ ...alert, _entity: entity });
			}
		}
		return alerts;
	}

	private filterAlerts(
		alerts: MeteoalarmAlert[],
		ignoredLevels: string[],
		ignoredEvents: string[],
	): MeteoalarmAlert[] {
		if (ignoredEvents.length == 0 && ignoredLevels.length == 0) return alerts;
		const result: MeteoalarmAlert[] = [];

		for (const alert of alerts) {
			const eventInfo = MeteoalarmData.events.find((e) => e.type == alert.event)!;
			const levelInfo = MeteoalarmData.levels.find((e) => e.type == alert.level)!;
			if (
				!ignoredEvents.includes(eventInfo.fullName) &&
				!ignoredLevels.includes(levelInfo.fullName)
			) {
				result.push(alert);
			}
		}

		return result;
	}

	private sortAlerts(alertsInput: MeteoalarmAlert[]): MeteoalarmAlert[] {
		let alerts = [...alertsInput];
		// Sort by event, the events list is ordered from most to least dangerous
		const eventsData = MeteoalarmData.events;
		alerts = alerts.sort((a, b) => {
			const aEvent = eventsData.findIndex((e) => e.type == a.event);
			const bEvent = eventsData.findIndex((e) => e.type == b.event);
			return aEvent - bEvent;
		});

		// Sort by level, the levels list is ordered from most to least dangerous
		const levelsData = MeteoalarmData.levels;
		alerts = alerts.sort((a, b) => {
			const aLevel = levelsData.findIndex((l) => l.type == a.level);
			const bLevel = levelsData.findIndex((l) => l.type == b.level);
			return aLevel - bLevel;
		});

		// Push expected events to back of the list
		alerts = alerts.sort((a, b) => {
			if (a.kind === undefined) return 0;
			if (a.kind == MeteoalarmAlertKind.Current && b.kind == MeteoalarmAlertKind.Expected)
				return -1;
			else if (a.kind == MeteoalarmAlertKind.Expected && b.kind == MeteoalarmAlertKind.Current)
				return 1;
			return 0;
		});

		return alerts;
	}
	/**
	 * Validate if specified alert is up to standards
	 */
	private validateAlert(alerts: MeteoalarmAlert[]): void {
		for (const alert of alerts) {
			if (alert.event === undefined || alert.level === undefined) {
				throw new Error(
					`[Alert QA Error] Invalid event object received: event: ${alert.event} level: ${alert.level}`,
				);
			}
			if (!this.integration.metadata.returnHeadline && alert.headline) {
				throw new Error(
					'[Alert QA Error] metadata.returnHeadline is false but headline was returned',
				);
			}
			if (
				this.integration.metadata.type == MeteoalarmIntegrationEntityType.CurrentExpected &&
				alert.kind == undefined
			) {
				throw new Error('[Alert QA Error] CurrentExpected type is required to provide alert.kind');
			}
			if (
				this.integration.metadata.type != MeteoalarmIntegrationEntityType.CurrentExpected &&
				alert.kind != undefined
			) {
				throw new Error('[Alert QA Error] only CurrentExpected type can return alert.kind');
			}
			if (!this.integration.metadata.returnMultipleAlerts && alerts.length > 1) {
				throw new Error(
					'[Alert QA Error] returnMultipleAlerts is false but more than one alert was returned',
				);
			}
		}
	}

	// Artificially generate headlines from event type and level
	private generateHeadlines(event: MeteoalarmEventInfo, level: MeteoalarmLevelInfo): string[] {
		if (event.type === MeteoalarmEventType.Unknown) {
			return [
				localize(level.translationKey + '.generic'),
				localize(level.translationKey + '.color'),
			];
		} else {
			const e = localize(event.translationKey);
			return [
				localize(level.translationKey + '.event').replace(
					'{event}',
					localize(event.translationKey),
				),
				e.charAt(0).toUpperCase() + e.slice(1),
			];
		}
	}

	private isAnyEntityUnavailable(entities: HassEntity[]): boolean {
		return entities.some((e) => {
			return (
				e == undefined || (e.attributes.status || e.attributes.state || e.state) === 'unavailable'
			);
		});
	}

	private checkIfIntegrationSupportsEntities(entities: HassEntity[]): void {
		if (!entities.every((e) => this.integration.supports(e))) {
			if (entities.length == 1) {
				throw new Error(localize('error.entity_invalid.single'));
			} else {
				const unsupportedEntities = entities.filter((e) => !this.integration.supports(e));
				throw new Error(
					localize('error.entity_invalid.multiple').replace(
						'{entity}',
						unsupportedEntities.map((x) => x.entity_id).join(', '),
					),
				);
			}
		}
	}
}

export default EventsParser;
