# Meteoalarm Card

[![version](https://img.shields.io/npm/v/meteoalarm-card?label=version)](https://www.npmjs.com/package/meteoalarm-card)
[![hacs_badge](https://img.shields.io/badge/HACS-Default-41BDF5.svg)](https://github.com/hacs/integration)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/MrBartusek/MeteoalarmCard/build.yaml?branch=master)](https://github.com/MrBartusek/MeteoalarmCard/actions)
[![downloads](https://img.shields.io/github/downloads/MrBartusek/MeteoalarmCard/total?color=brightgreen)](https://github.com/MrBartusek/MeteoalarmCard/releases) 

MeteoalarmCard is a powerful yet simple custom card to show meteorological warnings card for [Home Assistant][ha]. It supports most of the core integrations as well as custom integrations like [MeteoAlarm][meteoalarm], [Météo-France][meteo-france], [NINA][nina], [DWD][dwd] and [more](#supported-integrations)! When there are any alerts issued, card will change color to let you know about upcoming dangerous conditions.

![cover](https://i.imgur.com/esXewN6.png)

[ha]: https://www.home-assistant.io/
<!-- Link for integrations are specified in integrations list-->

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
| `entities`             | `array`   | **Required** | Entity ID, a list of entity IDs or a list of entity objects.                         |
| `override_headline`    | `boolean` | `false`      | _[Only some integrations]_ Override headline proved by integration by generated one. |
| `scaling_mode`         | `string`  | `headline_and_scale` | Headline scaling mode. See [scaling-mode.md](dosc/scaling-mode.md)           |
| `disable_swiper`       | `boolean` | `false`      | _[Only some integrations]_ Disable slider when displaying multiple alerts, you may not see some important alerts. |
| `hide_caption`         | `boolean` | `false`      | _[DWD only]_ Hide top-right caption when showing advance alerts.
| `hide_when_no_warning` | `boolean` | `false`      | Hide the card when no warning is active. This works like a [conditional card](https://www.home-assistant.io/lovelace/conditional/). |
| `ignored_levels`*      | `array`   | `[]`         | List of levels that will not be shown on the card. Possible values are: `Yellow`, `Orange` and `Red` |
| `ignored_events`*      | `array`   | `[]`         | List of events that will not be shown on the card. Possible values are: `Nuclear Event`, `Hurricane`, `Tornado`,`Coastal Event`,`Tsunami`,`Forest Fire`,`Avalanches`,`Earthquake`,`Volcanic Activity`,`Flooding`,`Sea Event`,`Thunderstorms`,`Rain`,`Snow/Ice`,`High Temperature`,`Low Temperature`,`Dust`,`Wind`, `Fog`, `Air Quality` and `Unknown Event` |

\* Not available thought visual editor

Example configuration for [Meteoalarm](meteoalarm):

```yaml
type: 'custom:meteoalarm-card'
integration: 'meteoalarm'
entities: 'binary_sensor.meteoalarm'
override_headline: false
```

Example configuration for [Deutscher Wetterdienst (DWD)](dwd):

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
- Български (Bulgarian)
- Čeština (Czech)
- Deutsch (German)
- Eesti (Estonian)
- Español (Spanish)
- Français (French)
- Hrvatski (Croatian)
- Italiano (Italian)
- Nederlands (Dutch)
- Polski (Polish)
- Português (Portuguese)
- Slovenský (Slovak)
- Svenska (Swedish)
- [_Your language?_](./CONTRIBUTING.md#how-to-add-translation)

## Supported integrations

Expect Meteoalarm this card supports many other integrations:

| Integration                         | Key              | Description              |
| ----------------------------------- | ---------------- | ------------------------ |
| [MeteoAlarm][meteoalarm]            | `meteoalarm`     | Warnings for Europe collected by [MeteoAlarm][meteoalarm-direct] (EUMETNET). The website integrates all important severe weather information originating from the official National Public Weather Services across a large number of European countries  |
| [Météo-France][meteo-france]        | `meteofrance`    | Warnings for France from [Météo-France][meteo-france-direct]. |
| [Deutscher Wetterdienst (DWD)][dwd] | `dwd`            | Warnings for Germany from [Dutscher Wetterdienst][dwd-direct]. |
| [Environnement Canada][env-canada]  | `env_canada`     | Warnings for Canada from [Environment and Climate Change Canada][env-canada-direct]. |
| [NINA][nina]                        | `nina`           | Warnings for Germany from [Bundesamt für Bevölkerungsschutz und Katastrophenhilfe][nina-direct]. This integration doesn't provide much atributes thus using it generates very generic card. |
| [Burze.dzis.net][burze]             | `burze_dzis_net` | Custom integration for warnings in Poland from [Burze.dzis.net][burze-direct]. These warnings are issued by [Skywarn / Polscy Łowcy Burz ](https://lowcyburz.pl) which is not backed by government or any official agency. |
| [weatheralerts][weatheralerts]      | `weatheralerts`  | Custom integration for USA from [National Weather Service (NWS)][weatheralerts-direct]. |
| [_New integration?_](https://github.com/MrBartusek/MeteoalarmCard/issues/new/choose) | | [You can request a new integration to be added here!]((https://github.com/MrBartusek/MeteoalarmCard/issues/new/choose)) |

[meteoalarm]: https://www.home-assistant.io/integrations/meteoalarm/
[meteoalarm-direct]: https://www.meteoalarm.org
[meteo-france]: https://www.home-assistant.io/integrations/meteo_france/
[meteo-france-direct]: https://meteofrance.com
[dwd]: https://www.home-assistant.io/integrations/dwd_weather_warnings/
[dwd-direct]: https://www.dwd.de/
[env-canada]: https://www.home-assistant.io/integrations/environment_canada/
[env-canada-direct]: https://weather.gc.ca/
[nina]: https://www.home-assistant.io/integrations/nina/
[nina-direct]: https://www.bbk.bund.de/
[burze]: https://github.com/PiotrMachowski/Home-Assistant-custom-components-Burze.dzis.net
[burze-direct]: https://burze.dzis.net
[weatheralerts]: https://github.com/custom-components/weatheralerts
[weatheralerts-direct]: https://www.weather.gov

## Contributing

Want to contribute to the project?

First of all, thanks! Check [contributing guidelines](./CONTRIBUTING.md) for more information.
