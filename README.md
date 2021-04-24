# Meteoalarm Card

> Meteoalarm Card card for [Home Assistant](https://www.home-assistant.io/) Lovelace UI

By default, Home Assistant does not provide any card for [Meteoalarm integration](https://www.home-assistant.io/integrations/meteoalarm/). This card displays current weather warnings in your region.

## Installing

1. Download `meteoalarm-card.js` file from the [latest release](https://github.com/MrBartusek/MeteoalarmCard/releases/latest).
2. Put `meteoalarm-card.js` file into your `config/www` folder.
3. Add reference to `meteoalarm-card.js` in Lovelace. There's two way to do that:
   1. **Using UI:** _Configuration_ → _Lovelace Dashboards_ → _Resources Tab_ → Click Plus button → Set _Url_ as `/local/meteoalarm-card.js` → Set _Resource type_ as `JavaScript Module`.
   **Note:** If you do not see the Resources Tab, you will need to enable _Advanced Mode_ in your _User Profile_
   2. **Using YAML:** Add following code to `lovelace` section.
      ```yaml
      resources:
        - url: /local/meteoalarm-card.js
          type: module
      ```
4. Add `custom:meteoalarm-card` to Lovelace UI as any other card.

## Contributing

Want to contribute to the project?

First of all, thanks! Check [contributing guideline](./CONTRIBUTING.md) for more information.