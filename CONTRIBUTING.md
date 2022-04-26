# Contributing

If you plan to contribute back to this repo, please fork & open a PR.

## How to add translation

We are currently looking to implement languages of all countries supported by meteoalarm. If you are able to add or improve translations in language you speak don't hastate to make a PR. Some of the keys are replaced with `null` that means specified key is not yet translated.

1. Clone the repository - [How to run locally](#How-to-run-locally). Follow steps 1 and 2.
1. Copy `src/translations/en.json` file and name it with appropriate language code.
1. Translate only the keys (second quotation mark)
1. Import your translation in `src/localize.js` file.
1. Mention your translation in `README.md` file (list should be sorted alphabetically).
1. Open a Pull Request.
1. Wait for maintainer to review your changes and merge PR.

**Note:** You can find translation for `events` under _captions_ at [meteoalarm.eu](https://www.meteoalarm.eu)

## How to run locally

1. Clone this repo to wherever you want:
   ```sh
   git clone https://github.com/MrBartusek/MeteoalarmCard.git
   ```
2. Go into the repo folder:
   ```sh
   cd MeteoalarmCard
   ```
3. Install dependencies (Node.js and npm are required):
   ```sh
   npm install
   ```
4. Run development server. It's going to watch source files, recompile on changes and server compiled file on local server.
   ```sh
   npm start
   ```
5. Add `http://localhost:5000/meteoalarm-card.js` to your [Lovelace Resources](https://my.home-assistant.io/redirect/lovelace_resources/).

Now you can make changes to files in `src` folder. Development server will automatically rebuild on changes. Lovelace will load resource from development server. Refresh the browser to see changes. Be sure to disable cache in your browser developer tools.

Before making a Pull Request make sure that build and linting pass locally `npm run build`
