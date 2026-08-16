import { HaFormSchema, MeteoalarmIntegration, MeteoalarmIntegrationEntityType } from '../types';

export function isSingleEntity(integration?: MeteoalarmIntegration): boolean {
	return integration?.metadata.type === MeteoalarmIntegrationEntityType.SingleEntity;
}

export function schemaNames(schema: HaFormSchema[]): string[] {
	return schema.reduce<string[]>(
		(names, field) => names.concat(field.schema ? schemaNames(field.schema) : field.name),
		[],
	);
}
