# Meteoalarm Card

[![version](https://img.shields.io/npm/v/meteoalarm-card?label=version)](https://www.npmjs.com/package/meteoalarm-card) [![hacs_badge](https://img.shields.io/badge/HACS-Default-41BDF5.svg)](https://github.com/hacs/integration) [![build status](https://img.shields.io/github/workflow/status/MrBartusek/MeteoalarmCard/Lint)](https://github.com/MrBartusek/MeteoalarmCard/actions) [![LGTM alerts](https://img.shields.io/lgtm/alerts/g/MrBartusek/MeteoalarmCard.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/MrBartusek/MeteoalarmCard/alerts/) [![downloads](https://img.shields.io/github/downloads/MrBartusek/MeteoalarmCard/total?color=brightgreen)](https://github.com/MrBartusek/MeteoalarmCard/releases) 

MeteoalarmCard is a powerful yet simple custom card to show meteorological warnings card for [Home Assistant](https://www.home-assistant.io/). It supports most of the core integrations and custom integrations like [Meteoalarm](https://www.home-assistant.io/integrations/meteoalarm/), [Météo-France](https://www.home-assistant.io/integrations/meteo_france/), [NINA](https://www.home-assistant.io/integrations/nina/), [DWD](https://www.home-assistant.io/integrations/dwd_weather_warnings/) and [more](#supported-integrations)! When there are any alerts issued, card will change color to let you know about upcoming dangerous conditions.

![cover](https://i.imgur.com/esXewN6.png)

## Installing

### HACS

We recommend installing MeteoalarmCard via [Home Assistant Community Store](https://hacs.xyz)

Just search for `Meteoalarm Card` in `Frontend` tab and hit download.

### Manual Installation

1. Download `meteoalarm-card.js` file from the [latest release](https://github.com/MrBartusek/MeteoalarmCard/releases/latest).
2. Put `meteoalarm-card.js` file into your `config/www` folder. You can use _File Editor_ add-on or any FTP client.
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

| Name                   | Type      | Default      | Description                                                                          |
| ---------------------- | --------- | ------------ | ------------------------------------------------------------------------------------ |
| `type`                 | `string`  | **Required** | `custom:meteoalarm-card`                                                             |
| `integration`          | `string`  | **Required** | Name of the integration. Available options are listed under [Supported integrations](#supported-integrations) |
| `entities`             | `string`  | **Required** | Entity ID, a list of entity IDs or a list of entity objects.                         |
| `override_headline`    | `boolean` | `false`      | *[Only some integrations]* Override headline proved by integration by generated one. |
| `disable_swiper`       | `boolean` | `false`      | *[Only some integrations]* Disable slider when displaying multiple alerts, you may not see some important alerts. |
| `hide_caption`         | `boolean` | `false`      | *[DWD only]* Hide top-right caption when showing advance alerts.
| `hide_when_no_warning` | `boolean` | `false`      | Hide the card when no warning is active. This works like a [conditional card](https://www.home-assistant.io/lovelace/conditional/). |

Example configuration for [Meteoalarm](https://www.home-assistant.io/integrations/meteoalarm/):

```yaml
type: 'custom:meteoalarm-card'
integration: 'meteoalarm'
entities: 'binary_sensor.meteoalarm'
override_headline: false
```

Example configuration for [Deutscher Wetterdienst (DWD)](https://www.home-assistant.io/integrations/dwd_weather_warnings/):

```yaml
type: 'custom:meteoalarm-card'
integration: 'dwd'
entities:
  - entity: 'sensor.dwd_weather_warnings_current_warning_level'
  - entity: 'sensor.dwd_weather_warnings_advance_warning_level'
override_headline: false
```

## Supported languages

This card supports translations. Please, help to add more translations and improve existing ones. Here's a list of supported languages:

<!-- Languages except English are sorted alphabetically -->
- English
- Čeština (Czech)
- Deutsch (German)
- Eesti (Estonian)
- Español (Spanish)
- Français (French)
- Hrvatski (Croatian)
- Italiano (Italian)
- Nederlands (Dutch)
- Polski (Polish)
- Slovenský (Slovak)
- Svenska (Swedish)

- [_Your language?_](./CONTRIBUTING.md#how-to-add-translation)

## Supported integrations

This card supports many other integrations.

- [Meteoalarm](https://www.home-assistant.io/integrations/meteoalarm/) (`meteoalarm`) - Core integration for alerts in Europe from [MeteoAlarm](https://www.meteoalarm.org) (EUMETNET).
- [Météo-France](https://www.home-assistant.io/integrations/meteo_france/) (`meteofrance`) - Core integration for alerts in France from [Météo-France](https://meteofrance.com).
- [Deutscher Wetterdienst (DWD)](https://www.home-assistant.io/integrations/dwd_weather_warnings/) (`dwd`) - Core integration for alerts in Germany from [Dutscher Wetterdienst](https://www.dwd.de/).
- [Environnement Canada](https://www.home-assistant.io/integrations/environment_canada/) (`env_canada`) - Core integration for alerts in Canada from [Environment and Climate Change Canada](https://weather.gc.ca/).
- [NINA](https://www.home-assistant.io/integrations/nina/) (`nina`) - Core integration for alerts in Germany from [Bundesamt für Bevölkerungsschutz und Katastrophenhilfe](https://www.bbk.bund.de/).
- [Burze.dzis.net](https://github.com/PiotrMachowski/Home-Assistant-custom-components-Burze.dzis.net) (`burze_dzis_net`) - Custom integration for alerts in Poland from [Burze.dzis.net](https://burze.dzis.net).
- [weatheralerts](https://github.com/custom-components/weatheralerts) (`weatheralerts`) - Custom integration for alerts in USA from [National Weather Service (NWS)](https://www.weather.gov).
- [_New integration?_](https://github.com/MrBartusek/MeteoalarmCard/issues/new/choose)


## Contributing

Want to contribute to the project?

First of all, thanks! Check [contributing guidelines](./CONTRIBUTING.md) for more information.