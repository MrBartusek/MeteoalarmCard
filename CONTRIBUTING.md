# Contributing

Thank you for investing your time in contributing to our project! Any contribution you make will be reflected on
the next release of MeteoalarmCard.

## How to report bugs and propose new features

If you spot a problem in the project or want to propose a improvement or new integration to the project. [Search
if an issue already exists](https://github.com/MrBartusek/MeteoalarmCard/issues). If a related issue doesn't exist,
you can [open a new issue](https://github.com/MrBartusek/MeteoalarmCard/issues/new/choose).

## Setup local environment

If you don't have MeteoalarmCard running locally please follow this setup guide.

1. Install newest LTS release of [Node.js](https://nodejs.org/en/) and the [pnpm](https://pnpm.io/installation) package manager.
1. Fork this repository using [Fork](https://github.com/MrBartusek/MeteoalarmCard/fork) button. This will create a new
repository on your account named `<your username>/MeteoalarmCard`
1. Clone this repo to wherever you want:
   ```sh
   git clone https://github.com/<your username>/MeteoalarmCard.git
   ```
1. Go into the repo folder:
   ```sh
   cd MeteoalarmCard
   ```
1. Install dependencies (Node.js and pnpm are required):
   ```sh
   pnpm install
   ```
1. Run the development server in the first terminal. It's going to watch source files, recompile on changes and serve the compiled card on `http://localhost:5000`.
   ```sh
   pnpm start
   ```

Now pick where you want to see the card render. Either way the dev server rebuilds on save, so you refresh the browser tab to pick up your changes.

### Option A: the bundled Home Assistant (recommended)

Spins up a preconfigured instance of Home Assistant with the bundled integrations and a development dashboard. The integrations pull live data, so most cards show *No active warnings* unless there is real weather somewhere. Every `pnpm run dev` starts from scratch, so anything you change in the Home Assistant UI is gone on the next run.

1. Install [Docker](https://docs.docker.com/get-docker/) with the Compose plugin.
1. Run the Docker containers. The first boot may take a couple of minutes, it will download ~2 GB of images and needs internet access.
   ```sh
   pnpm run dev
   ```
1. Open <http://localhost:8123>. You should auto-login to the preconfigured Home Assistant instance. Open **MeteoalarmCard** in the sidebar.

Other commands:

- `pnpm run dev:down` stops the instance
- `pnpm run dev:clean` stops it and deletes `hass-dev/config`

### Option B: your own Home Assistant

Use this if you already run Home Assistant and want the card next to your real entities.

1. Add `http://localhost:5000/meteoalarm-card.js` to your [Lovelace Resources](https://my.home-assistant.io/redirect/lovelace_resources/) as a **JavaScript Module**.
1. Add a **Meteoalarm Card** to any dashboard.

Your browser is what loads the file, so this works as long as you browse Home Assistant from the machine running `pnpm start`.

## How to contribute

1. Fork the project and clone it to your local machine. Follow the [setup guide](#setup-local-environment).
1. Before making any changes pull from the remote repository to update your main branch
   ```sh
      git pull upstream master
   ```
1. Create a branch on which you will be working.
   ```sh
       git checkout -b update-polish-translation
   ```
1. Commit your changes and push it to your fork of the repository.
1. Make sure your changes are working locally. Run `pnpm run lint` to check code style and `pnpm run build` to build the card.
1. Create a Pull Request (PR). Make sure to describe the changes that you made and use the `Fixes: #number` keyword if
you were working on a issue.

## How to add translations

We are currently looking to implement more languages to MeteoalarmCard. If you are able to add or improve translations in language you speak don't hastate to make a PR.

**Notes about current translation keys**
- `editor.error` - These keys may use the `{expected_entities_count}` and `{selected_entities_count}` placeholders, which are replaced with the number of entities the integration expects and the number you selected. Never translate a placeholder - copy it exactly, including the braces. You can leave one out if your sentence doesn't need it.
- `editor.disable_swiper` - If there is not a good translation for *swiper* you can keep this word untranslated.
- `editor.description` - These keys are used to generate helpful description for users selecting entities. Please make sure they sound correctly in all combinations. The formula is `start + any middle key + end`
- `editor.description.warning_watch_statement_advisory` - If there is not a good translation for words (*warning, watch, statement*, *advisory*) you can keep these words untranslated.

**If you want to improve existing translation:**
1. Follow the [setup guide](#setup-local-environment) and [contributing guide](#how-to-contribute)
2. Modify the language file in the `src/localize/languages` directory
3. Remember that key that are not yet translated have `null` instead of the string. Please replace them with translated
messages.
1. Open a Pull Request.

**If you want to create a new translation:**
1. Follow the [setup guide](#setup-local-environment) and [contributing guide](#how-to-contribute)
1. Copy `src/localize/languages/en.json` file and name it with appropriate language code.
1. Translate only the keys (second quotation mark).
1. Import your translation in `src/localize/localize.ts` file.
1. Mention your translation in `README.md` file (list should be sorted alphabetically).
1. Open a Pull Request.
