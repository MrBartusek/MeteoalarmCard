export type ConfigEntry = {
	domain: string;
	title: string;
	uniqueId: string | null;
	data: Record<string, unknown>;
	[key: string]: unknown;
};

export type Integration = {
	title: string;
	path: string;
	cards: { integration: string; entities: string[] }[];
	entries: ConfigEntry[];
};
