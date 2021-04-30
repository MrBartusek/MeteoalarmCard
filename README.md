# Meteoalarm Card


By default [Home Assistant](https://www.home-assistant.io/) does not provide any card for [Meteoalarm integration](https://www.home-assistant.io/integrations/meteoalarm/). This simple card shows you the current active meteorological warning for Lovelace UI.

![cover](https://i.imgur.com/jsLOGIv.png)

## Installing

### HACS

Soon™

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

## Supported languages

This card supports translations. Please, help to add more translations and improve existing ones. Here's a list of supported languages:

- English
- Polski (Polish)
- [_Your language?_](./CONTRIBUTING.md#how-to-add-translation)

## Contributing

Want to contribute to the project?

First of all, thanks! Check [contributing guideline](./CONTRIBUTING.md) for more information.