import { EVENTS, LEVELS } from '../../data';

export class MeteoAlarmStrategy {
    static supports(sourceType) {
        return sourceType === 'meteoalarm';
    }

    static isAvailable(entity) {
        return (entity.attributes.status || entity.attributes.state || entity.state) != 'unavailable'
    }

    static isWarningActive(entity) {
        return (entity.attributes.status || entity.attributes.state || entity.state) != 'off';
    }

    static getResult(entity) {
        return {
            headline: entity.attributes.event || entity.attributes.headline,
            awarenessLevel: LEVELS[Number(entity.attributes.awarenessLevel.split(';')[0]) - 2],
            awarenessType: EVENTS[Number(entity.attributes.awarenessType.split(';')[0]) - 2]
        }
    }
}