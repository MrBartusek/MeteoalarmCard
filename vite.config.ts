import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		target: 'es2017',
		// 'oxc' and `true` are silently ignored for library builds, terser is not
		minify: 'terser',
		lib: {
			entry: 'src/meteoalarm-card.ts',
			formats: ['es'],
			fileName: () => 'meteoalarm-card.js'
		},
		rollupOptions: {
			output: {
				// The card is loaded as a single Lovelace resource, so the lazily
				// imported editor has to be inlined rather than split out
				codeSplitting: false
			}
		}
	},
	json: {
		stringify: false
	},
	preview: {
		port: 5000,
		strictPort: true,
		host: '0.0.0.0',
		cors: true
	}
});
