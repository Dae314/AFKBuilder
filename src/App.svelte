<script>
	import {onMount} from 'svelte';
	import {debounce} from 'lodash';
	import AppData from './stores/AppData.js';
	import Modal from 'svelte-simple-modal';
	import Router from 'svelte-spa-router';
	import {pop as spaRoutePop} from 'svelte-spa-router';
	import {wrap} from 'svelte-spa-router/wrap';

	// imports for GraphQL
	import ApolloClient from 'apollo-boost';
	import { setClient } from "svelte-apollo";

	import Header from './components/Header.svelte';
	import Comps from './components/Comps.svelte';
	import HeroList from './components/HeroList.svelte';
	import MyHeroes from './components/MyHeroes.svelte';
	import Recommendations from './components/Recommendations.svelte';
	import About from './components/About.svelte';
	import Profile from './components/Profile.svelte';

	export let version = '';
	const menuItems = [ 'Comps', 'Recommendations', 'My Heroes', 'Hero List', 'About' ];
	const defaultView = 'comps';
	let isMobile = window.matchMedia("(max-width: 767px)").matches;

	const routes = {
		'/': wrap({
				component: Comps,
				props: { isMobile: isMobile},
			}),
		'/comps': wrap({
				component: Comps,
				props: { isMobile: isMobile},
			}),
		'/recommendations': wrap({
				component: Recommendations,
				props: { isMobile: isMobile },
			}),
		'/myheroes': wrap({
				component: MyHeroes,
				props: { isMobile: isMobile },
			}),
		'/herolist': wrap({
				component: HeroList,
				props: { isMobile: isMobile },
			}),
		'/about': wrap({
				component: About,
				props: {
					version: version,
					isMobile: isMobile,
					},
			}),
		'/profile': wrap({
			component: Profile,
			props: { isMobile: isMobile },
		}),
	}

	// setup GraphQL with ApolloClient
	const client = new ApolloClient({
		uri: GQL_URI,
		request: operation => {
			const token = $AppData.jwt;
			if(token) {
				operation.setContext({
					headers: { authorization: `Bearer ${token}` },
				});
			}
		},
	});
	setClient(client); // provide ApolloClient to all components in the app

	onMount(async () => {
		handleWindowResize();

		// check user's JWT on app start
		if(validateJWT($AppData.jwt)) {
			// user is logged in, try to populate the user's data
			getUserDetails($AppData.jwt).then(user => {
					$AppData.id = user.id;
					$AppData.username = user.username;
					$AppData.email = user.email;
					saveAppData();
				}
			);
		} else {
			$AppData.jwt = '';
		}
	});

	// if the jwt provided is good, return true otherwise return false
	async function validateJWT(jwt) {
		const uri = REST_URI;
		if(jwt) {
			try {
				const response = await fetch(`${uri}/token/validation`, {
					method: 'POST',
					mode: 'cors',
					cache: 'no-cache',
					headers: {
						'Authorization': `Bearer ${jwt}`,
						'Content-Type': 'application/json',
					},
					body: `{ "token": "${jwt}" }`,
				});
				if(response.status !== 200) {
					// bad response code: assume JWT is invalid
					return false;
				} else {
					const responseData = await response.json();
					return Date.now() >= responseData.exp * 1000; // returns false if token is expired
				}
			} catch(err) {
				throw new Error(`An error occurred while fetching JWT token validation: ${err}`);
			}
		}
	}

	// assumes a valid JWT, get details of the logged in user
	// returns an object with user properties
	async function getUserDetails(jwt) {
		const uri = REST_URI;
		if(jwt) {
			try {
				const response = await fetch(`${uri}/users/me`, {
					method: 'GET',
					mode: 'cors',
					cache: 'no-cache',
					headers: {
						'Authorization': `Bearer ${jwt}`,
					},
				});
				if(response.status !== 200) {
					throw new Error(`An error occurred while fetching user information: ${response.json()}`)
				} else {
					const responseData = await response.json();
					return {
						id: responseData.id,
						username: responseData.username,
						email: responseData.email,
						my_heroes: responseData.my_heroes,
						local_comps: responseData.local_comps,
					}
				}
			} catch(err) {
				throw new Error(`An error occurred while fetching user information: ${err}`);
			}
		}
	}

	function saveAppData() {
		window.localStorage.setItem('appData', JSON.stringify($AppData));
	}

	function clearAppData() {
		window.localStorage.removeItem('appData');
		location.reload();
	}

	function resetTutorial() {
		$AppData.dismissImportWarn = false;
		$AppData.dismissMHSearchInfo = false;
		$AppData.dismissHLSearchInfo = false;
		saveAppData();
		location.reload();
	}

	function handleModalClosed() {
		// handle comps modals in Comps.svelte
		if($AppData.activeView === 'comps') {
			$AppData.modalClosed = true;
		} else {
			const queryString = window.location.search;
			const urlParams = new URLSearchParams(queryString);
			if(urlParams.has('modal')) {
				spaRoutePop();
				history.replaceState({view: $AppData.activeView, modal: false}, $AppData.activeView, `${window.location.origin}/#/${$AppData.activeView}`);
			}
		}
	}

	function handleWindowResize() {
		// gymnastics to set height for mobile browsers
		let vh = window.innerHeight * 0.01;
		document.documentElement.style.setProperty('--vh', `${vh}px`);

		// convienence variable to track if window is mobile width or desktop width
		isMobile = window.matchMedia("(max-width: 767px)").matches;
	}

	function handleRouteEvent(event) {
		switch(event.detail.action) {
			case 'saveData':
				saveAppData();
				break;
			case 'clearData':
				clearAppData();
				break;
			case 'resetTutorial':
				resetTutorial();
				break;
			default:
				throw new Error(`Invalid action specified for route event: ${event.detail.action}`);
		}
	}
</script>

<svelte:head>
	<title>AFKBuilder</title>
	<link rel="preconnect" href="https://fonts.gstatic.com">
	<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@900&display=swap" rel="stylesheet">
</svelte:head>

<svelte:window on:resize={debounce(handleWindowResize, 100)} />

<Modal on:closed={handleModalClosed}>
	<div class="AppContainer">
		<Header menu={menuItems} on:saveData={saveAppData} />
		<main>
			<div class="MainWindow">
				<div id="currentDisplay">
					<Router routes={routes} on:routeEvent={handleRouteEvent}/>
				</div>
			</div>
		</main>
	</div>
</Modal>

<style lang="scss">
	.AppContainer {
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 100%;
		padding: 0px;
		margin: 0px;
		background-color: var(--appBGColor);
	}
	main {
		display: flex;
		height: 100%;
		padding-top: var(--headerHeight);
		width: 100%;
	}
	.MainWindow {
		width: 100%;
		height: 100%;
	}
	@media only screen and (min-width: 767px) {
		main {
			padding: 0;
		}
	}
</style>
