import { HassEntity } from 'home-assistant-js-websocket';
import { MeteoalarmData } from './data';
import { localize } from './localize/localize';
import { MeteoalarmAlertParsed, MeteoalarmLevelType } from './types';

export class PredefinedCards {
	public static unavailableCard(): MeteoalarmAlertParsed {
		return {
			isActive: true,
			entity: undefined,
			icon: 'cloud-question',
			cssClass: MeteoalarmData.getLevel(MeteoalarmLevelType.None).cssClass,
			headlines: [localize('common.unavailable.long'), localize('common.unavailable.short')],
		};
	}

	public static noWarningsCard(entity: HassEntity): MeteoalarmAlertParsed {
		return {
			isActive: false,
			entity: entity,
			icon: 'shield-outline',
			cssClass: MeteoalarmData.getLevel(MeteoalarmLevelType.None).cssClass,
			headlines: [localize('events.no_warnings')],
		};
	}
}
