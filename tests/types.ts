import type { HassEntity } from 'home-assistant-js-websocket';
import { MeteoalarmAlertKind, MeteoalarmEventType, MeteoalarmLevelType, MeteoalarmAlertTiming } from '../src/types';

export type FixtureEntity = HassEntity & {
	active: boolean;
};

export interface FixtureAlert {
	event: MeteoalarmEventType;
	level: MeteoalarmLevelType;
	headline?: string;
	kind?: MeteoalarmAlertKind;
	timing?: MeteoalarmAlertTiming;
}

export interface Fixture {
	description: string;
	entities: FixtureEntity[];
	expected: FixtureAlert[];
}

export interface LoadedFixture {
	integrationKey: string;
	name: string;
	fixture: Fixture;
}
