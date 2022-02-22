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
	let showErrorDisplay = false;
	let errorDisplayConf = {};
	let showNotice = false;
	let noticeConf = {};

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
		'/explore/comp/:uuid': wrap({
			component: CompLibDetail,
			props: { isMobile: isMobile },
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
		} else {
			await handleLogout();
		}
	});

	async function saveAppData() {
		window.localStorage.setItem('appData', JSON.stringify($AppData));
	}

	async function handleLogout() {
		if($AppData.user.jwt) {
			// JWT is set, perform a full logout
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
		} else {
			// JWT is not set, assume user performed action that only logged in users can perform
			await displayNotice({
				type: 'warning',
				message: 'Login required'
			});
		}
	}

	// function assumes that $AppData.user.jwt was set correctly
	// function will populate $Appdata.user object with data
	async function populateUserData() {
		let response;

		response = await getUserDetails($AppData.user.jwt);
		if(response.status !== 200) {
			errorDisplayConf = {
				errorCode: response.status,
				headText: 'Something went wrong',
				detailText: response.data,
				showHomeButton: true,
			};
			showErrorDisplay = true;
		}
		const user = response.data;
		$AppData.user.id = user.id;
		$AppData.user.username = user.username;
		$AppData.user.local_comps = user.local_comps;
		$AppData.user.avatar = user.avatar;
		
		response = await getLikedComps($AppData.user.jwt);
		if(response.status !== 200) {
			errorDisplayConf = {
				errorCode: response.status,
				headText: 'Something went wrong',
				detailText: response.data,
				showHomeButton: true,
			};
			showErrorDisplay = true;
		}
		const likedComps = response.data;
		$AppData.user.liked_comps = likedComps;

		response = await getDislikedComps($AppData.user.jwt);
		if(response.status !== 200) {
			errorDisplayConf = {
				errorCode: response.status,
				headText: 'Something went wrong',
				detailText: response.data,
				showHomeButton: true,
			};
			showErrorDisplay = true;
		}
		const dislikedComps = response.data;
		$AppData.user.disliked_comps = dislikedComps;

		response = await getPublishedComps($AppData.user.jwt);
		if(response.status !== 200) {
			errorDisplayConf = {
				errorCode: response.status,
				headText: 'Something went wrong',
				detailText: response.data,
				showHomeButton: true,
			};
			showErrorDisplay = true;
		}
		const publishedComps = response.data;
		$AppData.user.published_comps = publishedComps;

		response = await getSavedComps($AppData.user.jwt);
		if(response.status !== 200) {
			errorDisplayConf = {
				errorCode: response.status,
				headText: 'Something went wrong',
				detailText: response.data,
				showHomeButton: true,
			};
			showErrorDisplay = true;
		}
		const savedComps = response.data;
		$AppData.user.saved_comps = savedComps;

		saveAppData();
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
			case 'showNotice':
				await displayNotice(event.detail.data.noticeConf);
				break;
			default:
				throw new Error(`Invalid action specified for route event: ${event.detail.action}`);
		}
	}

	async function displayNotice(notice_config) {
		noticeConf = notice_config;
		showNotice = true;
		setTimeout(() => {
			showNotice = false;
			noticeConf = {};
		}, 2000);
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
		{#if showErrorDisplay}
			<ErrorDisplay
				errorCode={errorDisplayConf.errorCode}
				headText={errorDisplayConf.headText}
				detailText={errorDisplayConf.detailText}
				showHomeButton={errorDisplayConf.showHomeButton}
			/>
		{:else}
			<main>
				<div class="MainWindow">
					<div id="currentDisplay">
						<Router routes={routes} on:routeEvent={handleRouteEvent}/>
					</div>
				</div>
			</main>
			<CookieConsent on:routeEvent={handleRouteEvent} />
		{/if}
	</div>
	<div class="noticeContainer"
			 class:open={showNotice}
			 class:info={ !noticeConf.type || noticeConf.type === 'info'}
			 class:warning={noticeConf.type === 'warning'}
			 class:error={noticeConf.type === 'error'}>
		<span>
			{noticeConf.message}
		</span>
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
	.noticeContainer {
		border-radius: 10px;
		display: none;
		left: 50%;
		max-width: 500px;
		opacity: 0;
		padding: 7px;
		position: fixed;
		text-align: center;
		top: 80px;
		transform: translate(-50%, 0);
		transition: visibility 0.3s, opacity 0.3s;
		visibility: hidden;
		&.open {
			display: block;
			opacity: 1;
			visibility: visible;
		}
		&.info {
			background-color: rgba(50, 50, 50, 0.7);
			color: rgba(255, 255, 255, 0.7);
			font-weight: bold;
		}
		&.warning {
			background-color: rgba(247, 188, 25, 0.7);
			color: rgba(0, 0, 0, 0.7);
			font-weight: bold;
		}
		&.error {
			background-color: rgba(242, 107, 107, 0.7);
			color: rgba(255, 255, 255, 0.7);
			font-weight: bold;
		}
	}
	@media only screen and (min-width: 767px) {
		main {
			padding: 0;
		}
	}
</style>

<!--
                     ⢀⣠⣴⣶⣾⣿⣿⣿⣿⣶⣄
                    ⢀⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧
                  ⡔⠉⠙⠻⡟⠛⠛⠛⠛⠿⣿⠻⣿⣿⣿⣿
                ⠈⡄⢢              ⣨⣿⣿⠃
⣷⣄             ⢰⣿⣆⡁    ⠠⠤⢤⣤⣀   ⠰⡁
⣿⣿⣷⣦⣀⣀⡀    ⣾⣿⣿⡿      ⠠⠊⠁⠊  ⡗⠒⠁　Y-a-Y
⠟⢻⢟⠒⢦⠤⣈⠑⠒⣿⣿⣿⣇        ⣀⣤⣄⣠⡤⠜
 ⢞⠢⣉⡒⠉   ⢱⢸⣿⣿⣿⣦⡴⠋⣿⣿⣿⣿ ⡴⠛⣿⡇
 ⢸⠉⠒⠧⢀⣀⠔⠁⠘⣿⣿⣿⣿⣧  ⠸⣿⣿⣿⣷⣤⣾⡿⠁
⢠⠚   ⢠⠋⢹   ⢸⠒⠻⣿⣿⣿⣿  ⠙⠻⠿⠿⠛⠁
⠇   ⡎⢠⡾    ⣸⡤  ⣿⣿⣿⣿
   ⢰⠁⢸⡇    ⣿⣤⣴⣿⣿⣿⠟
   ⠸⡀⠈⡇    ⠘⡟⠛⠋⡏⠁
⠢⠤⠤⠜⠉⢧⣀⣀⣀⡸ ⠒⠒⠁
-->
