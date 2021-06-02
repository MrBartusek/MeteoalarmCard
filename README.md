# Meteoalarm Card

[![version](https://img.shields.io/npm/v/meteoalarm-card?label=version)](https://www.npmjs.com/package/meteoalarm-card) [![hacs badge](https://img.shields.io/badge/HACS-default-orange.svg)](https://hacs.xyz) [![build status](https://img.shields.io/github/workflow/status/MrBartusek/MeteoalarmCard/Lint)](https://github.com/MrBartusek/MeteoalarmCard/actions) [![downloads](https://img.shields.io/github/downloads/MrBartusek/MeteoalarmCard/total?color=brightgreen)](https://github.com/MrBartusek/MeteoalarmCard/releases)

By default [Home Assistant](https://www.home-assistant.io/) does not provide any card for [Meteoalarm](https://www.home-assistant.io/integrations/meteoalarm/) or [Météo-France](https://www.home-assistant.io/integrations/meteo_france/). This simple card shows you the current active meteorological warnings.

![cover](https://i.imgur.com/jsLOGIv.png)

## Installing

### HACS

We recommend installing meteoalarm card via [Home Assistant Community Store](https://hacs.xyz)

Just search for `Meteoalarm Card` in `Frontend` tab.

### Manual Installation

1. Download `meteoalarm-card.js` file from the [latest release](https://github.com/MrBartusek/MeteoalarmCard/releases/latest).
2. Put `meteoalarm-card.js` file into your `config/www` folder. You can use _File Editor_ add-on.
3. Add reference to `meteoalarm-card.js` in Lovelace. There's two way to do that:
   1. **Using UI:** [Navigate to Lovelace Resources](https://my.home-assistant.io/redirect/lovelace_resources/) → Click Plus button → Set _URL_ as `/local/meteoalarm-card.js` → Set _Resource type_ as `JavaScript Module`.<br>
   **Note:** If you do not see the Resources Tab, you will need to enable _Advanced Mode_ in your [User Profile](https://my.home-assistant.io/redirect/profile/)
   2. **Using YAML:** Add following code to `lovelace` section.
      ```yaml
      resources:
        - url: /local/meteoalarm-card.js
          type: module
      ```
4. Add `custom:meteoalarm-card` to Lovelace UI as any other card.

## Using the card

After completing installation you can add this card like any other to your dashboard.

1. Navigate to your dashboard → click 3 dots in the top left corner.
2. Select _Edit Dashboard_
3. Click _+ New Card_ button
4. Select `Custom: Meteoalarm Card`

Here is what configuration options mean:

| Name                | Type      | Default      | Description                                                                      |
| ------------------- | --------- | ------------ | -------------------------------------------------------------------------------- |
| `type`              | `string`  | **Required** | `custom:meteoalarm-card`                                                         |
| `entity`            | `string`  | **Required** | An entity_id with weather alerts                                                 |
| `integration`       | `string`  | `automatic`  | Name of the integration. Available options: <ul><li>`automatic`</li><li>`meteoalarm`</li><li>`meteofrance`</li><li>`meteoalarmeu` |
| `override_headline` | `boolean` | `false`      | **Core Meteoalarm** provides `event` and `headline` attributes which are used for text displayed on the card. This option forces card to always generate own headline.

Example configuration for [Meteoalarm](https://www.home-assistant.io/integrations/meteoalarm/):

```yaml
type: 'custom:meteoalarm-card'
entity: 'binary_sensor.meteoalarm'
integration: 'automatic'
override_headline: false
```

## Supported languages

This card supports translations. Please, help to add more translations and improve existing ones. Here's a list of supported languages:

<!-- Languages are sorted alphabetically -->
- English (Default language)
- Deutsch (German)
- Eesti (Estonian)
- Español (Spanish)
- Français (French)
- Italiano (Italian)
- Nederlands (Dutch)
- Polski (Polish)
- Slovesnky (Slovak)
- [_Your language?_](./CONTRIBUTING.md#how-to-add-translation)

## Supported integrations

This card supports many other integrations.

- [Meteoalarm](https://www.home-assistant.io/integrations/meteoalarm/) - Home Assistant core integration based on ATOM Feed.
- [Météo-France](https://www.home-assistant.io/integrations/meteo_france/) - Home Assistant core integration for Météo France alerts.
- [xlcnd/meteoalarmeu](https://github.com/xlcnd/meteoalarmeu) - RRS Feed alternative for countries that does not use ATOM anymore.
- [_New integration?_](https://github.com/MrBartusek/MeteoalarmCard/issues/new/choose)


## Contributing

Want to contribute to the project?

First of all, thanks! Check [contributing guideline](./CONTRIBUTING.md) for more information.
