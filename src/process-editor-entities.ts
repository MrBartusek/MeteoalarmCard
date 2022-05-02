// From https://github.com/home-assistant/frontend/blob/092dfd1e87f882236c250d55868c0066e566e80a/src/panels/lovelace/editor/process-editor-entities.ts#L3
// Process entities into array config object

import { EntityConfig } from 'custom-card-helpers';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function processEditorEntities(entities: Array<any> | string | undefined): EntityConfig[] {
	if(!Array.isArray(entities)) {
		entities = [ entities ];
	}
	if(entities == undefined) {
		return entities;
	}
	return entities.map((entityConf: any) => {
		if (typeof entityConf === 'string') {
			return { entity: entityConf };
		}
		return entityConf;
	});
}
