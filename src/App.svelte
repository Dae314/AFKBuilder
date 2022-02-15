<script>
	import {onMount} from 'svelte';
	import {debounce} from 'lodash';
	import AppData from './stores/AppData.js';
	import Modal from 'svelte-simple-modal';
	import Router from 'svelte-spa-router';
	import {pop as spaRoutePop} from 'svelte-spa-router';
	import {wrap} from 'svelte-spa-router/wrap';
	import {
		validateJWT,
		getUserDetails,
		getLikedComps,
		getDislikedComps,
		getPublishedComps,
		getSavedComps,
	} from './rest/RESTFunctions.svelte';

	// imports for GraphQL
	import ApolloClient from 'apollo-boost';
	import { setClient } from "svelte-apollo";

	import Header from './components/Header.svelte';
	import Comps from './components/Comps.svelte';
	import HeroList from './components/HeroList.svelte';
	import MyHeroes from './components/MyHeroes.svelte';
	import Recommendations from './components/Recommendations.svelte';
	import About from './components/About.svelte';
	import CookieConsent from './components/CookieConsent.svelte';
	import Profile from './components/Profile.svelte';
	import PostLogin from './components/PostLogin.svelte';
	import User from './components/User.svelte';
	import CompLibDetail from './components/CompLibDetail.svelte';
	import ErrorDisplay from './components/ErrorDisplay.svelte';

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
		'/users/:username': wrap({
			component: User,
			props: {},
		}),
		'/library/comp/:uuid': wrap({
			component: CompLibDetail,
			props: {},
		}),
		'/connect/:provider/redirect': wrap({
			component: PostLogin,
			props: {},
		}),
		'*': wrap({
			component: ErrorDisplay,
			props: {
				errorCode: 404,
				headText: 'We couldn\'t find that',
				detailText: 'Sorry about that!',
				showHomeButton: true,
			},
		}),
	}

	// setup GraphQL with ApolloClient
	const client = new ApolloClient({
		uri: GQL_URI,
		request: operation => {
			const token = $AppData.user.jwt;
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
		const valid = await validateJWT($AppData.user.jwt);
		if(valid) {
			// user is logged in, try to populate the user's data
			await populateUserData();
			await saveAppData();
		} else {
			await handleLogout();
		}
	});

	async function saveAppData() {
		window.localStorage.setItem('appData', JSON.stringify($AppData));
	}

	async function handleLogout() {
		$AppData.user.avatar = '';
		$AppData.user.username = '';
		$AppData.user.id = '';
		$AppData.user.jwt = '';
		$AppData.user.liked_comps = [];
		$AppData.user.disliked_comps = [];
		$AppData.user.local_comps = [];
		$AppData.user.published_comps = [];
		$AppData.user.saved_comps = [];
		await saveAppData();
		window.location.assign(`${window.location.origin}/#/`);
	}

	// function assumes that $AppData.user.jwt was set correctly
	// function will populate $Appdata.user object with data
	async function populateUserData() {
		let response;

		response = await getUserDetails($AppData.user.jwt);
		if(response.status !== 200) {
			throw new Error(`ERROR: received ${response.status} when querying for user details: ${response.data}`);
		}
		const user = response.data;
		$AppData.user.id = user.id;
		$AppData.user.username = user.username;
		$AppData.user.local_comps = user.local_comps;
		$AppData.user.avatar = user.avatar;
		
		response = await getLikedComps($AppData.user.jwt);
		if(response.status !== 200) {
			throw new Error(`ERROR: received ${response.status} when querying for user liked comps: ${response.data}`);
		}
		const likedComps = response.data;
		$AppData.user.liked_comps = likedComps;

		response = await getDislikedComps($AppData.user.jwt);
		if(response.status !== 200) {
			throw new Error(`ERROR: received ${response.status} when querying for user disliked comps: ${response.data}`);
		}
		const dislikedComps = response.data;
		$AppData.user.disliked_comps = dislikedComps;

		response = await getPublishedComps($AppData.user.jwt);
		if(response.status !== 200) {
			throw new Error(`ERROR: received ${response.status} when querying for user published comps: ${response.data}`);
		}
		const publishedComps = response.data;
		$AppData.user.published_comps = publishedComps;

		response = await getSavedComps($AppData.user.jwt);
		if(response.status !== 200) {
			throw new Error(`ERROR: received ${response.status} when querying for user saved comps: ${response.data}`);
		}
		const savedComps = response.data;
		$AppData.user.saved_comps = savedComps;
	}

	async function clearAppData() {
		window.localStorage.removeItem('appData');
		location.reload();
	}

	async function resetTutorial() {
		$AppData.dismissImportWarn = false;
		$AppData.dismissMHSearchInfo = false;
		$AppData.dismissHLSearchInfo = false;
		await saveAppData();
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

	async function handleRouteEvent(event) {
		switch(event.detail.action) {
			case 'saveData':
				await saveAppData();
				break;
			case 'clearData':
				await clearAppData();
				break;
			case 'logout':
				await handleLogout();
				break;
			case 'populateUserData':
				await populateUserData();
				break;
			case 'resetTutorial':
				await resetTutorial();
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
		<CookieConsent on:routeEvent={handleRouteEvent} />
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
