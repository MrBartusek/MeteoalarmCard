import type { HassEntity } from 'home-assistant-js-websocket';
import { MeteoalarmAlertKind, MeteoalarmEventType, MeteoalarmLevelType } from '../src/types';

/** Fixtures only carry entity_id, state and attributes, nothing else is ever read */
export type FixtureEntity = HassEntity & {
	active: boolean;
};

export interface FixtureAlert {
	event: MeteoalarmEventType;
	level: MeteoalarmLevelType;
	headline?: string;
	kind?: MeteoalarmAlertKind;
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
