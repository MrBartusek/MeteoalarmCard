# Contributing

Thank you for investing your time in contributing to our project! Any contribution you make will be reflected on
the next release of MeteoalarmCard.

## How to report bugs and propose new features

If you spot a problem in the project or want to propose a improvement or new integration to the project. [Search
if an issue already exists](https://github.com/MrBartusek/MeteoalarmCard/issues). If a related issue doesn't exist,
you can [open a new issue](https://github.com/MrBartusek/MeteoalarmCard/issues/new/choose).

## Setup local environment

If you don't have MeteoalarmCard running locally please follow this setup guide.

1. Install newest LTS release of [Node.js](https://nodejs.org/en/), it has NPM package manager bundled with it.
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
1. Install dependencies (Node.js and npm are required):
   ```sh
   npm install
   ```
1. Run development server. It's going to watch source files, recompile on changes and server compiled file on local server.
   ```sh
   npm start
   ```
1. Add `http://localhost:5000/meteoalarm-card.js` to your [Lovelace Resources](https://my.home-assistant.io/redirect/lovelace_resources/).
1. Add `custom: Meteoalarm Card` to your Dashboard.

After successfully following this guide you should have card in your dashboard that is complied from your local code. Development server
is going to recompile any changes that you make and after that you can see them after refreshing your Home Assistant tab.

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
1. Make sure your changes are working locally. Run `npm run build` to check if project builds and code style.
1. Create a Pull Request (PR). Make sure to describe the changes that you made and use the `Fixes: #number` keyword if
you were working on a issue.

## How to add translations

We are currently looking to implement more languages to MeteoalarmCard. If you are able to add or improve translations in language you speak don't hastate to make a PR.

**If you want to improve existing translation:**
1. Follow the [setup guide](#setup-local-environment) and [contributing guide](#how-to-contribute)
1. Modify the language file in the `src/localize/languages` directory
1. Remember that key that are not yet translated have `null` instead of the string. Please replace them with translated
messages.
1. Open a Pull.

**If you want to create a new translation
1. Follow the [setup guide](#setup-local-environment) and [contributing guide](#how-to-contribute)
1. Copy `src/localize/languages/en.json` file and name it with appropriate language code.
1. Translate only the keys (second quotation mark).
1. Import your translation in `src/localize/localize.ts` file.
1. Mention your translation in `README.md` file (list should be sorted alphabetically).
1. Open a Pull Request.