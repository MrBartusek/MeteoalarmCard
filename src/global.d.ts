import { LovelaceCard, LovelaceCardEditor } from 'custom-card-helpers';

declare global {
	interface HTMLElementTagNameMap {
		'meteoalarm-card-editor': LovelaceCardEditor;
		'hui-error-card': LovelaceCard;
	}
}
