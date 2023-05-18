import { HassEntity } from 'home-assistant-js-websocket';
import { MeteoalarmData } from './data';
import { localize } from './localize/localize';
import { MeteoalarmAlertParsed, MeteoalarmLevelType } from './types';

export class PredefinedCards {
	public static unavailableCard(): MeteoalarmAlertParsed {
		return {
			isActive: false,
			entity: undefined,
			icon: 'cloud-question',
			color: MeteoalarmData.getLevel(MeteoalarmLevelType.None).color,
			headlines: [
				localize('common.unavailable.long'),
				localize('common.unavailable.short')
			]
		};
	}

	public static noWarningsCard(entity: HassEntity): MeteoalarmAlertParsed {
		return {
			isActive: false,
			entity: entity,
			icon: 'shield-outline',
			color: MeteoalarmData.getLevel(MeteoalarmLevelType.None).color,
			headlines: [
				localize('events.no_warnings')
			]
		};
	}
}

