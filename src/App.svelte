<script>
	import {onMount} from 'svelte';
	import {debounce} from 'lodash';
	import AppData from './stores/AppData.js';
	import Modal from 'svelte-simple-modal';
	import Router from 'svelte-spa-router';
	import {pop as spaRoutePop, querystring} from 'svelte-spa-router';
	import {wrap} from 'svelte-spa-router/wrap';
	import JSONURL from 'json-url';
	import {
		validateJWT,
		getUserDetails,
		getLikedComps,
		getDislikedComps,
		getPublishedComps,
		getSavedComps,
		getCompByUUID,
	} from './rest/RESTFunctions.svelte';

	// imports for GraphQL
	import ApolloClient from 'apollo-boost';
	import { setClient } from "svelte-apollo";

	import Header from './components/Header.svelte';
	import Explore from './components/Explore.svelte';
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
	const menuItems = [
		{ name: 'Explore', icon: './img/utility/explore_white.png' },
		{ name: 'Comps', icon: '' },
		{ name: 'Recommendations', icon: ''},
		{ name: 'My Heroes', icon: ''},
		{ name: 'Hero List', icon: ''},
		{ name: 'About', icon: ''},
	];
	const defaultView = 'comps';
	const jsurl = JSONURL('lzma'); // json-url compressor
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
			props: {},
		}),
		'/users/:username': wrap({
			component: User,
			props: {},
		}),
		'/explore/comp/:uuid': wrap({
			component: CompLibDetail,
			props: { isMobile: isMobile },
		}),
		'/explore': wrap({
			component: Explore,
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
			// now sync the user's favorited comps
			await syncFavoriteComps();
		} else {
			await handleLogout(false);
		}
	});

	async function saveAppData() {
		window.localStorage.setItem('appData', JSON.stringify($AppData));
	}

	async function handleLogout(showWarn = true) {
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
			if(showWarn) {
				await displayNotice({
					type: 'warning',
					message: 'Login required'
				});
			}
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
			return;
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

	// function assumes that $AppData.user.jwt was set correctly
	async function syncFavoriteComps() {
		// step 1: add/update comps in the favorited list
		if($AppData.user.saved_comps.length > 0) {
			for(const saveComp of $AppData.user.saved_comps) {
				if(!$AppData.user.published_comps.some(e => e.uuid === saveComp.uuid)) {
					// favorited comp is not one of the user's own published comps, retrieve
					// sync the comp from the DB
					let svrComp = await getCompByUUID(saveComp.uuid);
					let compData;
					if(svrComp.status !== 200) {
						console.log(`Unable to sync favorited comp with uuid: ${saveComp.uuid}`);
						displayNotice({ type: 'error', message: 'Favorite sync failed', });
						continue;
					}
					if(svrComp.data.length === 0) {
						// status was 200, but no data was returned, assume comp was deleted and remove from favorites
						$AppData.user.saved_comps = $AppData.user.saved_comps.filter(e => e.uuid !== saveComp.uuid);
						// cleanup will happen in step 2, no need to cleanup here
						continue;
					}

					// parse the comp_string
					try {
						const json = await jsurl.decompress(svrComp.data[0].attributes.comp_string);
						compData = JSON.parse(json);
					} catch(err) {
						console.log(`Unable to parse favorited comp with uuid: ${saveComp.uuid}`);
						console.log(err);
						displayNotice({ type: 'error', message: 'Favorite sync failed', });
						continue;
					}
					if('lastUpdate' in compData) compData.lastUpdate = new Date(compData.lastUpdate);

					// validate resulting data is good
					const returnObj = await validateComp(compData);
					if(returnObj.retCode !== 0) {
						console.log(`Unable to validate favorited comp with uuid: ${saveComp.uuid}`);
						displayNotice({ type: 'error', message: 'Favorite sync failed', });
						continue;
					}
					// message should contain a clean comp object now
					if($AppData.Comps.some(e => e.uuid === returnObj.message.uuid)) {
						// comp exists, check if it needs to be updated
						const idx = $AppData.Comps.findIndex(e => e.uuid === returnObj.message.uuid);
						if($AppData.Comps[idx].lastUpdate < returnObj.message.lastUpdate) {
							// comp needs to be updated
							returnObj.message.starred = $AppData.Comps[idx].starred;
							returnObj.message.source = 'favorite';
							$AppData.Comps[idx] = returnObj.message;
						}
					} else {
						// comp not in list yet, add it to the list
						returnObj.message.starred = false;
						returnObj.message.source = 'favorite';
						$AppData.Comps = [...$AppData.Comps, returnObj.message];
					}
				}
			}
		}
		// step 2: remove remote comps that are not on the favorited list anymore
		for(const comp of $AppData.Comps.filter(e => e.source === 'favorite')) {
			if(!$AppData.user.saved_comps.some(e => e.uuid === comp.uuid)) {
				// comp is no longer in favorites, delete it from local list
				$AppData.Comps = $AppData.Comps.filter(e => e.uuid !== comp.uuid);
			}
		}
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
		// handle modals in Comps.svelte and Explore.svelte separately
		if($AppData.activeView === 'comps') {
			$AppData.modalClosed = true;
		} else {
			const queryString = window.location.search;
			const urlParams = new URLSearchParams(queryString);
			if(urlParams.has('modal')) {
				spaRoutePop();
				window.addEventListener('popstate', function updateURL(event) {
					const uri = $querystring ? `${window.location.origin}/#/${$AppData.activeView}?${$querystring}` : `${window.location.origin}/#/${$AppData.activeView}`
					history.replaceState({view: $AppData.activeView, modal: false}, $AppData.activeView, uri);
					window.removeEventListener('popstate', updateURL);
				});
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
			case 'syncFavorites':
				await syncFavoriteComps();
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
