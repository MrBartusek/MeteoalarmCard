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

const en_data = readPraseFile(path.join(TRANSLATIONS_PATH, 'en.json'));

fs.readdirSync(TRANSLATIONS_PATH).forEach((file_path) => {
	const translationData = readPraseFile(path.join(TRANSLATIONS_PATH, file_path));
	const iterate = (obj, translationValue) => {
		Object.keys(obj).forEach(key => {
			if (typeof obj[key] === 'object' && obj[key] !== null) {
				iterate(obj[key], translationValue[key]);
			}
			else {
				if(translationValue && typeof translationValue === 'object' && key in translationValue) {
					obj[key] = translationValue[key];
				}
				else {
					obj[key] = null;
				}
			}
		});
	};
	const result = { ...en_data };
	iterate(en_data, translationData);
	result['$schema'] = '../schema/schema.json';
	fs.writeFileSync(path.join(TRANSLATIONS_PATH, file_path), JSON.stringify(result, null, 2) + '\r\n');
});
