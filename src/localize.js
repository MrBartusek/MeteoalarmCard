// Borrowed from:
// https://github.com/custom-cards/boilerplate-card/blob/master/src/localize/localize.ts

import * as de from './translations/de.json';
import * as en from './translations/en.json';
import * as fr from './translations/fr.json';
import * as it from './translations/it.json';
import * as nl from './translations/nl.json';
import * as pl from './translations/pl.json';
import * as et from './translations/et.json';
import * as es from './translations/es.json';

var languages = {
	de,
	en,
	nl,
	pl,
	et,
	fr,
	it,
	es
};

const DEFAULT_LANG = 'en';

export default function localize(string, search, replace)
{
	const [section, key] = string.toLowerCase().split('.');

	let langStored;

	try
	{
		langStored = JSON.parse(localStorage.getItem('selectedLanguage'));
	}
	catch (e)
	{
		langStored = localStorage.getItem('selectedLanguage');
	}

	const lang = (langStored || navigator.language.split('-')[0] || DEFAULT_LANG)
		.replace(/['"]+/g, '')
		.replace('-', '_');

	let tranlated;

	try
	{
		tranlated = languages[lang][section][key];
	}
	catch (e)
	{
		tranlated = languages[DEFAULT_LANG][section][key];
	}

	if (tranlated === undefined)
	{
		tranlated = languages[DEFAULT_LANG][section][key];
	}

	if (search !== '' && replace !== '')
	{
		tranlated = tranlated.replace(search, replace);
	}

	return tranlated;
}
