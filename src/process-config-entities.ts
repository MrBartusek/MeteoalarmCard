// Modified version of: https://github.com/home-assistant/frontend/blob/092dfd1e87f882236c250d55868c0066e566e80a/src/panels/lovelace/common/process-config-entities.ts
// Parse array of entity objects from config

import { EntityConfig } from 'custom-card-helpers';

export function processConfigEntities(entities: Array<EntityConfig | string> | string | EntityConfig): EntityConfig[] {
	if (!Array.isArray(entities)) {
		entities = [ entities ];
	}

	return entities.map(
		(entityConf, index): any=> {
			if (
				typeof entityConf === 'object' &&
        !Array.isArray(entityConf) &&
        entityConf.type
			) {
				return entityConf;
			}

			let config: EntityConfig;

			if (typeof entityConf === 'string') {
				config = { entity: entityConf } as EntityConfig;
			}
			else if (typeof entityConf === 'object' && !Array.isArray(entityConf)) {
				if (!('entity' in entityConf)) {
					throw new Error(
            `Entity object at position ${index} is missing entity field.`
					);
				}
				config = entityConf as EntityConfig;
			}
			else {
				throw new Error(`Invalid entity specified at position ${index}.`);
			}
			console.log(config);
			return config;
		}
	);
}
