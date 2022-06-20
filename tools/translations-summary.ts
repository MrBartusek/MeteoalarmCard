import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TRANSLATIONS_PATH = path.join(__dirname, '../../src/localize/languages');

function readPraseFile(file: fs.PathLike) {
	const content = fs.readFileSync(file, 'utf8');
	return JSON.parse(content);
}

const result: {lang: string, hits: number, misses: number}[] = [];

fs.readdirSync(TRANSLATIONS_PATH).forEach((file_path) => {
	const translationData = readPraseFile(path.join(TRANSLATIONS_PATH, file_path));
	let hits = 0, misses = 0;
	const iterate = (obj) => {
		Object.keys(obj).forEach(key => {
			if (typeof obj[key] === 'object' && obj[key] !== null) {
				iterate(obj[key]);
			}
			else {
				if(obj[key] == null) {
					misses++;
				}
				else {
					hits++;
				}
			}
		});
	};
	iterate(translationData);
	result.push({
		lang: file_path.replace('.json', ''),
		hits: hits,
		misses: misses
	});
});
/* eslint-disable */
console.log('=== METEOALARM TRANSLATIONS SUMMARY ===');
for(const lang of result!.sort((a,b) => b.hits - a.hits)) {
	const percentage = Math.round(lang.hits / (lang.hits + lang.misses) * 100)
	console.log(`${lang.lang} - ${percentage}% translated`)
}
