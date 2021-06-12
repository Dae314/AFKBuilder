# AFKBuilder
<sup>version: 0.6.0</sup>

AFKBuilder is a tool designed to help players build, share, and use community made team compositions for AFKArena.

## Getting Started

This project uses Svelte as the main front end library. All game logic runs in Javascript on the client side. No user information is shared outside of the application. User data is saved on the browser's local storage. _Caution:_ Be sure to make a backup of your comps and hero list before clearing your browser data or clearing the app data.

### Prerequisites

To compile, you must have NodeJS >=14.16.1 installed.

### Installing

1. Clone a copy of the repository
	1. `cd /project/directory`
	1. `git clone https://github.com/Dae314/AFKBuilder.git`
1. Install the necessary packages
	1. `cd /project/directory/AFKBuilder`
	1. `npm install`
1. Start up a development environment using npm
	1. `npm run dev`
1. RECOMMENDED: track all branches
	1. `git checkout gh-pages`
	1. `git checkout dev`

## Deployment

1. Enter the project directory
	1. `cd /project/directory`
1. Merge changes from the dev branch into main
	1. `git checkout dev`
	1. `git pull origin dev`
	1. `git checkout main`
	1. `git merge --no-ff dev`
	1. Recommend performing local testing here.
	1. `git push origin main`
1. Run the deployment script
	1. `npm run deploy`
	1. App should be available at http://dae314.github.io/AFKBuilder/
1. OPTIONAL: switch back to dev branch for continued development
	1. `git checkout dev`

## Built With

* [NodeJS](https://nodejs.org/en/) - JS Development Environment
* [Svelte](https://svelte.dev/) - Front End Library

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/Dae314/AFKBuilder/tags). 

## Authors

* **Dae314** - *Maintainer* - [Dae314](https://github.com/Dae314)
* **Wyatt Rice** - *Designer* - [Wyatt Rice](https://www.twitter.com/wyattjrice)

See also the list of [contributors](https://github.com/Dae314/AFKBuilder/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* PurpleBooth - for the [README.md](https://gist.github.com/PurpleBooth/109311bb0361f32d87a2) and [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) templates
* [Stefan Taubert](https://www.iconfinder.com/stefantaubert) - for the export, import, and pencil icons
* [BomSymbols](https://www.iconfinder.com/korawan_m) - for the trashcan icon
