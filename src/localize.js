// Borrowed from:
// https://github.com/custom-cards/boilerplate-card/blob/master/src/localize/localize.ts

import * as de from './translations/de.json';
import * as en from './translations/en.json';
import * as fr from './translations/fr.json';
import * as it from './translations/it.json';
import * as nl from './translations/nl.json';
import * as pl from './translations/pl.json';
import * as et from './translations/et.json';

var languages = {
	de,
	en,
	nl,
	pl,
	et,
	fr,
	it
};

const DEFAULT_LANG = 'en';

export default function localize(string)
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

	let translated;

	try
	{
		translated = languages[lang][section][key];
	}
	catch (e)
	{
		translated = languages[DEFAULT_LANG][section][key];
	}

	if (translated === undefined)
	{
		translated = languages[DEFAULT_LANG][section][key] || string.toLowerCase();
	}

	return translated;
}
