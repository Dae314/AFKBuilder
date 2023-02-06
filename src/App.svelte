<script>
	import {onMount} from 'svelte';
	import {debounce} from 'lodash';
	import AppData from './stores/AppData.js';
	import Modal from 'svelte-simple-modal';
	import Router from 'svelte-spa-router';
	import {pop as spaRoutePop, querystring, location} from 'svelte-spa-router';
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
	import { setClient, mutation } from "svelte-apollo";
	import { gql_UPDATE_MY_HEROES, gql_UPDATE_LOCAL_COMPS } from './gql/queries.svelte';

	import Header from './components/Header.svelte';
	import Explore from './components/Explore.svelte';
	import Comps from './components/Comps.svelte';
	import DataTables from './components/DataTables.svelte';
	import MyHeroes from './components/MyHeroes.svelte';
	import Recommendations from './components/Recommendations.svelte';
	import About from './components/About.svelte';
	import CookieConsent from './components/CookieConsent.svelte';
	import Profile from './components/Profile.svelte';
	import PostLogin from './components/PostLogin.svelte';
	import User from './components/User.svelte';
	import CompLibDetail from './components/CompLibDetail.svelte';
	import ErrorDisplay from './components/ErrorDisplay.svelte';
	import LoadingSpinner from './shared/LoadingSpinner.svelte';
	import TOS from './components/TOS.svelte';
	import PrivPolicy from './components/PrivPolicy.svelte';

	export let version = '';
	const menuItems = [
		{ name: 'Explore', icon: './img/utility/explore_white.png' },
		{ name: 'Comps', icon: './img/utility/comps_white.png' },
		{ name: 'Recommendations', icon: './img/utility/recommendations_white.png'},
		{ name: 'My Heroes', icon: './img/utility/my_heroes_white.png'},
		{ name: 'Hero List', icon: './img/utility/hero_list_white.png'},
		{ name: 'About', icon: './img/utility/about_white.png'},
	];
	const defaultView = 'comps';
	const jsurl = JSONURL('lzma'); // json-url compressor
	let isMobile = window.matchMedia("(max-width: 767px)").matches;
	let showErrorDisplay = false;
	let errorDisplayConf = {};
	let showNotice = false;
	let noticeConf = {};
	let noticeTimeout;

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
			component: DataTables,
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
		'/privacy': wrap({
			component: PrivPolicy,
			props: {},
		}),
		'/terms': wrap({
			component: TOS,
			props: {}
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

	const gqlUpdateMyHeroes = mutation(gql_UPDATE_MY_HEROES);
	const gqlUpdateLocalComps = mutation(gql_UPDATE_LOCAL_COMPS);

	onMount(async () => {
		handleWindowResize();
		await changeColorProfile($AppData.colorProfile);

		// check user's JWT on app start
		const valid = await validateJWT($AppData.user.jwt);
		if(valid) {
			// user is logged in, try to populate the user's data
			await populateUserData();
			// now sync the user's favorited comps, myHeroes, and local comps
			await syncFavoriteComps();
			await syncMyHeroes();
			await syncLocalComps();
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
			window.localStorage.removeItem('tokenCache');
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
		await displayNotice({type: 'loading'});
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
			clearNotice();
			return;
		}
		const user = response.data;
		if(user.my_heroes) {
			if('lastUpdate' in user.my_heroes) user.my_heroes.lastUpdate = new Date(user.my_heroes.lastUpdate);
		}
		if(user.local_comps) {
			if('lastUpdate' in user.local_comps) user.local_comps.lastUpdate = new Date(user.local_comps.lastUpdate);
		}
		$AppData.user.id = user.id;
		$AppData.user.username = user.username;
		$AppData.user.local_comps = user.local_comps;
		$AppData.user.my_heroes = user.my_heroes;
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
			clearNotice();
			return;
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
			clearNotice();
			return;
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
			clearNotice();
			return;
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
			clearNotice();
			return;
		}
		const savedComps = response.data.map(e => {
			e.comp_update = new Date(e.comp_update);
			return e;
		});
		$AppData.user.saved_comps = savedComps;

		saveAppData();
		clearNotice();
	}

	// function assumes that $AppData.user.jwt was set correctly
	async function syncFavoriteComps() {
		// step 1: add/update comps in the favorited list
		if($AppData.user.saved_comps.length > 0) {
			for(const saveComp of $AppData.user.saved_comps) {
				if(!$AppData.user.published_comps.some(e => e.uuid === saveComp.uuid)) {
					// favorited comp is not one of the user's own published comps
					let needsUpdate = true;
					let curCompExists = $AppData.Comps.some(e => e.uuid === saveComp.uuid);
					let curIdx;
					if(curCompExists) {
						// comp already exists, check if it needs an update
						curIdx = $AppData.Comps.findIndex(e => e.uuid === saveComp.uuid);
						needsUpdate = $AppData.Comps[curIdx].lastUpdate < saveComp.comp_update;
					}
					if(needsUpdate) {
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
						if(curCompExists) {
							returnObj.message.starred = $AppData.Comps[curIdx].starred;
							returnObj.message.source = 'favorite';
							$AppData.Comps[curIdx] = returnObj.message;
						} else {
							// comp not in list yet, add it to the list
							returnObj.message.starred = false;
							returnObj.message.source = 'favorite';
							$AppData.Comps = [...$AppData.Comps, returnObj.message];
						}
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

	// function assumes that $AppData.user.jwt was set correctly
	async function syncMyHeroes() {
		// check if update is necessary
		let updateType = 'push'; // assume push is necessary if user.my_heroes.lastUpdate is invalid
		if($AppData.user.my_heroes && 'lastUpdate' in $AppData.user.my_heroes) {
			// my_heroes.lastUpdate is valid, so check the type of update
			if($AppData.user.my_heroes.lastUpdate > $AppData.MH.lastUpdate) {
				// server is ahead of local
				updateType = 'pull';
			} else if($AppData.user.my_heroes.lastUpdate.getTime() === $AppData.MH.lastUpdate.getTime()) {
				// server and local are sync'd no need to update
				updateType = 'none';
			} // else local is ahead of server, so do a push that's already set
		}
		switch(updateType) {
			case 'push':
				await displayNotice({type: 'loading'});
				try {
					const mhData = await jsurl.compress(JSON.stringify($AppData.MH.List));
					const response = await gqlUpdateMyHeroes({variables: { id: $AppData.user.id, mh: {lastUpdate: $AppData.MH.lastUpdate, data: mhData} }});
					const newMyHeroes = response.data.updateUsersPermissionsUser.data.attributes.my_heroes;
					newMyHeroes.lastUpdate = new Date(newMyHeroes.lastUpdate);
					$AppData.user.my_heroes = newMyHeroes;
					saveAppData();
					clearNotice();
				} catch(err) {
					console.log(`Error: unable to upload My Heroes data to server`);
					console.log(err);
					displayNotice({ type: 'error', message: 'MH sync failed', });
					return;
				}
				break;
			case 'pull':
				// parse the data
				let mhData;
				try {
					const json = await jsurl.decompress($AppData.user.my_heroes.data);
					mhData = JSON.parse(json);
				} catch(err) {
					console.log(`Error: unable to parse My Heroes data from server`);
					console.log(err);
					displayNotice({ type: 'error', message: 'MH sync failed', });
					return;
				}
				// validate resulting data is good
				const returnObj = await validateMyHeroData(mhData);
				if(returnObj.retCode !== 0) {
					console.log(`Error: server My Heroes data is invalid`);
					displayNotice({ type: 'error', message: 'MH sync failed', });
					return;
				}
				// message should contain a clean MH List object now
				$AppData.MH.List = returnObj.message;
				$AppData.MH.lastUpdate = $AppData.user.my_heroes.lastUpdate;
				saveAppData();
				break;
			case 'none':
				// do nothing
				break;
			default:
				throw new Error(`Error, invalid updateType computed in syncMyHeroes something really went wrong. ${updateType}`);
		}
	}

	// function assumes that $AppData.user.jwt was set correctly
	async function syncLocalComps() {
		// check if update is necessary
		let updateType = 'push'; // assume push is necessary if user.local_comps.lastUpdate is invalid
		if($AppData.user.local_comps && 'lastUpdate' in $AppData.user.local_comps) {
			// local_comps.lastUpdate is valid, so check the type of update
			if($AppData.user.local_comps.lastUpdate > $AppData.compLastUpdate) {
				// server is ahead of local
				updateType = 'pull';
			} else if($AppData.user.local_comps.lastUpdate.getTime() === $AppData.compLastUpdate.getTime()) {
				// server and local are sync'd no need to update
				updateType = 'none';
			} // else local is ahead of server, so do a push that's already set
		}
		switch(updateType) {
			case 'push':
				try {
					await displayNotice({type: 'loading'});
					const localComps = $AppData.Comps.filter(e => e.source === 'local' && !e.hidden);
					const compData = await jsurl.compress(JSON.stringify(localComps));
					const groupData = await jsurl.compress(JSON.stringify($AppData.compGroups));
					const response = await gqlUpdateLocalComps({variables: { id: $AppData.user.id, comps: {lastUpdate: $AppData.compLastUpdate, data: compData, groups: groupData} }});
					const newLocalComps = response.data.updateUsersPermissionsUser.data.attributes.local_comps;
					newLocalComps.lastUpdate = new Date(newLocalComps.lastUpdate);
					$AppData.user.local_comps = newLocalComps;
					saveAppData();
					clearNotice();
				} catch(err) {
					console.log(`Error: unable to upload local comp data to server`);
					console.log(err);
					displayNotice({ type: 'error', message: 'Comps sync failed', });
					return;
				}
				break;
			case 'pull':
				// parse the data
				let compsData;
				let groupData;
				try {
					const json = await jsurl.decompress($AppData.user.local_comps.data);
					compsData = JSON.parse(json);
					const groupJSON = await jsurl.decompress($AppData.user.local_comps.groups);
					groupData = JSON.parse(groupJSON);
				} catch(err) {
					console.log(`Error: unable to parse local comp data from server`);
					console.log(err);
					displayNotice({ type: 'error', message: 'Comps sync failed', });
					return;
				}

				// validate resulting data is good
				for(const comp of compsData) {
					comp.lastUpdate = new Date(comp.lastUpdate);
					let returnObj = await validateComp(comp);
					if(returnObj.retCode !== 0) {
						console.log(`Error: server local comp data is invalid`);
						console.log(returnObj.message);
						displayNotice({ type: 'error', message: 'Comps sync failed', });
						return;
					}
					// message should contain a clean comp object now, try to merge it into Comps
					if($AppData.Comps.some(e => e.uuid === returnObj.message.uuid)) {
						// comp already exists, update it but don't update hidden comps
						const idx = $AppData.Comps.findIndex(e => e.uuid === returnObj.message.uuid);
						if(!$AppData.Comps[idx].hidden) $AppData.Comps[idx] = returnObj.message;
					} else {
						// comp does not exist yet, add it
						$AppData.Comps = [...$AppData.Comps, returnObj.message];
					}
				}

				// repair group dates
				for(const group of groupData) {
					group.createdAt = new Date(group.createdAt);
				}
				// now update groups
				$AppData.compGroups = groupData;

				// this function will not delete comps
				$AppData.compLastUpdate = $AppData.user.local_comps.lastUpdate;
				saveAppData();
				break;
			case 'none':
				// do nothing
				break;
			default:
				throw new Error(`Error, invalid updateType computed in syncMyHeroes something really went wrong. ${updateType}`);
		}
	}

	async function clearAppData() {
		window.localStorage.removeItem('appData');
		window.localStorage.removeItem('tokenCache');
		window.location.reload();
	}

	async function resetTutorial() {
		$AppData.dismissImportWarn = false;
		$AppData.dismissCookieConsent = false;
		await saveAppData();
		window.location.reload();
	}

	function handleModalClosed() {
		const queryString = window.location.search;
		const urlParams = new URLSearchParams(queryString);
		if(urlParams.has('modal')) {
			spaRoutePop();
			window.addEventListener('popstate', function updateURL(event) {
				const uri = $querystring ? `${window.location.origin}/#${$location}?${$querystring}` : `${window.location.origin}/#${$location}`;
				history.replaceState({view: $AppData.activeView, modal: false}, $AppData.activeView, uri);
				window.removeEventListener('popstate', updateURL);
			});
		}
	}

	function handleWindowResize() {
		// gymnastics to set height for mobile browsers
		let vh = window.innerHeight * 0.01;
		document.documentElement.style.setProperty('--vh', `${vh}px`);

		// convienence variable to track if window is mobile width or desktop width
		isMobile = window.matchMedia("(max-width: 767px)").matches;
	}

	function clearError() {
		showErrorDisplay = false;
		errorDisplayConf = {};
	}

	function clearNotice() {
		clearTimeout(noticeTimeout);
		showNotice = false;
		noticeConf = {};
	}

	async function changeColorProfile(profile) {
		const root = document.documentElement;
		switch(profile) {
			case 'light':
				root.style.setProperty('--scrollbarBG', '#DFE7EE');
				root.style.setProperty('--appColorPrimary', '#6B8DF2');
				root.style.setProperty('--appColorPriAccent', '#A1B5F1');
				root.style.setProperty('--appColorPriDark', '#3B62D6');
				root.style.setProperty('--appColorPriOpaque', 'rgb(107, 141, 242, 0.30)');
				root.style.setProperty('--appBGColor', '#F0F0F2');
				root.style.setProperty('--appBGColorDark', '#c2c2c2');
				root.style.setProperty('--appBGColorLight', '#f6f6f6');
				root.style.setProperty('--appDelColor', '#F26B6B');
				root.style.setProperty('--appDelColorOpaque', 'rgba(242, 107, 107, 0.90)');
				root.style.setProperty('--appColorSecondary', '#8AA7FF');
				root.style.setProperty('--appColorTertiary', '#3854A6');
				root.style.setProperty('--appColorQuaternary', '#94C6F2');
				root.style.setProperty('--appColorDisabled', '#7e7e7e');
				root.style.setProperty('--appColorBlack', '#333');
				root.style.setProperty('--appColorWhite', '#F0F0F2');
				root.style.setProperty('--appHeaderHighlight', '#4567CC');
				root.style.setProperty('--appTextInputFocusBG', '#FFF');
				root.style.setProperty('--appFilterColorPrimary', '#d6d6d6');
				root.style.setProperty('--appFilterColorSecondary', '#999');
				root.style.setProperty('--neu-convex-BGLight-bg', 'linear-gradient(145deg, #ffffff, #ebebeb)');
				root.style.setProperty('--neu-convex-BGColor-bg', 'linear-gradient(145deg, #ffffff, #d8d8da)');
				root.style.setProperty('--neu-convex-BGColor-wide-bg', 'linear-gradient(160deg, #ffffff, #d8d8da)');
				root.style.setProperty('--neu-concave-BGColor-bg', 'linear-gradient(145deg, #d8d8da, #ffffff)');
				root.style.setProperty('--neu-large-ni-BGColor-shadow', '8px 8px 20px #ccccce, 8px -8px 20px #ffffff');
				root.style.setProperty('--neu-med-i-BGLight-shadow', '5px 5px 10px #d1d1d1, -5px -5px 10px #ffffff');
				root.style.setProperty('--neu-med-i-BGLight-hover-shadow', '8px 8px 16px #d1d1d1, -8px -8px 16px #ffffff');
				root.style.setProperty('--neu-med-i-BGColor-shadow', '5px 5px 8px #ccccce, -5px -5px 8px #ffffff');
				root.style.setProperty('--neu-med-i-BGColor-hover-shadow', '8px 8px 16px #ccccce, -8px -8px 16px #ffffff');
				root.style.setProperty('--neu-med-i-BGColor-pressed-shadow', '3px 3px 5px #ccccce, -3px -3px 5px #ffffff');
				root.style.setProperty('--neu-med-i-BGColor-inset-shadow', 'inset 5px 5px 8px #ccccce, inset -5px -5px 8px #ffffff');
				root.style.setProperty('--neu-sm-i-BGColor-shadow', '5px 5px 5px #ccccce, -5px -5px 5px #ffffff');
				root.style.setProperty('--neu-sm-i-BGLight-shadow', '5px 5px 5px #d1d1d1, -5px -5px 5px #ffffff');
				root.style.setProperty('--neu-sm-i-BGColor-hover-shadow', '8px 8px 10px #ccccce, -8px -8px 10px #ffffff');
				root.style.setProperty('--neu-sm-i-BGColor-pressed-shadow', '3px 3px 3px #ccccce, -3px -3px 3px #ffffff');
				root.style.setProperty('--neu-sm-i-BGLight-pressed-shadow', '3px 3px 3px #d1d1d1, -3px -3px 3px #ffffff');
				root.style.setProperty('--neu-med-ni-BGColor-shadow', '5px 5px 8px #ccccce, -5px -5px 8px #ffffff');
				root.style.setProperty('--neu-sm-ni-BGColor-shadow', '5px 5px 5px #ccccce, -5px -5px 5px #ffffff');
				root.style.setProperty('--neu-sm-ni-BGColor-pressed-shadow', '3px 3px 3px #ccccce, -3px -3px 3px #ffffff');
				root.style.setProperty('--neu-sm-ni-BGColor-inset-shadow', 'inset 3px 3px 3px #ccccce, inset -3px -3px 3px #ffffff');
				$AppData.colorProfile = profile;
				break;
			case 'dark':
				// Dark mode colors thanks to:
				// https://www.nordtheme.com/docs/colors-and-palettes
				root.style.setProperty('--scrollbarBG', '#DFE7EE');
				root.style.setProperty('--appColorPrimary', '#6B8DF2');
				root.style.setProperty('--appColorPriAccent', '#5E81AC');
				root.style.setProperty('--appColorPriDark', '#3B62D6');
				root.style.setProperty('--appColorPriOpaque', 'rgb(107, 141, 242, 0.30)');
				root.style.setProperty('--appBGColor', '#2E3440');
				root.style.setProperty('--appBGColorDark', '#202124');
				root.style.setProperty('--appBGColorLight', '#434C5E');
				root.style.setProperty('--appDelColor', '#F26B6B');
				root.style.setProperty('--appDelColorOpaque', 'rgba(242, 107, 107, 0.90)');
				root.style.setProperty('--appColorSecondary', '#8AA7FF');
				root.style.setProperty('--appColorTertiary', '#5E81AC');
				root.style.setProperty('--appColorQuaternary', '#94C6F2');
				root.style.setProperty('--appColorDisabled', '#595959');
				root.style.setProperty('--appColorBlack', '#ECEFF4');
				root.style.setProperty('--appColorWhite', '#F0F0F2');
				root.style.setProperty('--appHeaderHighlight', '#81A1C1');
				root.style.setProperty('--appTextInputFocusBG', '#4C566A');
				root.style.setProperty('--appFilterColorPrimary', '#4C566A');
				root.style.setProperty('--appFilterColorSecondary', '#3B4252');
				root.style.setProperty('--neu-convex-BGLight-bg', 'linear-gradient(145deg, #485165, #3c4455)');
				root.style.setProperty('--neu-convex-BGColor-bg', 'linear-gradient(145deg, #313844, #292f3a)');
				root.style.setProperty('--neu-convex-BGColor-wide-bg', 'linear-gradient(160deg, #313844, #292f3a)');
				root.style.setProperty('--neu-concave-BGColor-bg', 'linear-gradient(145deg, #292f3a, #313844)');
				root.style.setProperty('--neu-large-ni-BGColor-shadow', '8px 8px 20px #272c36, 8px -8px 20px #353c4a');
				root.style.setProperty('--neu-med-i-BGLight-shadow', '5px 5px 10px #394150, -5px -5px 10px #4d576c');
				root.style.setProperty('--neu-med-i-BGLight-hover-shadow', '8px 8px 16px #394150, -8px -8px 16px #4d576c');
				root.style.setProperty('--neu-med-i-BGColor-shadow', '5px 5px 8px #272c36, -5px -5px 8px #353c4a');
				root.style.setProperty('--neu-med-i-BGColor-hover-shadow', '8px 8px 16px #272c36, -8px -8px 16px #353c4a');
				root.style.setProperty('--neu-med-i-BGColor-pressed-shadow', '3px 3px 5px #272c36, -3px -3px 5px #353c4a');
				root.style.setProperty('--neu-med-i-BGColor-inset-shadow', 'inset 5px 5px 8px #272c36, inset -5px -5px 8px #353c4a');
				root.style.setProperty('--neu-sm-i-BGColor-shadow', '5px 5px 5px #272c36, -5px -5px 5px #353c4a');
				root.style.setProperty('--neu-sm-i-BGLight-shadow', '5px 5px 5px #394150, -5px -5px 5px #4d576c');
				root.style.setProperty('--neu-sm-i-BGColor-hover-shadow', '8px 8px 10px #272c36, -8px -8px 10px #353c4a');
				root.style.setProperty('--neu-sm-i-BGColor-pressed-shadow', '3px 3px 3px #272c36, -3px -3px 3px #353c4a');
				root.style.setProperty('--neu-sm-i-BGLight-pressed-shadow', '3px 3px 3px #394150, -3px -3px 3px #4d576c');
				root.style.setProperty('--neu-med-ni-BGColor-shadow', '5px 5px 8px #272c36, -5px -5px 8px #353c4a');
				root.style.setProperty('--neu-sm-ni-BGColor-shadow', '5px 5px 5px #272c36, -5px -5px 5px #353c4a');
				root.style.setProperty('--neu-sm-ni-BGColor-pressed-shadow', '3px 3px 3px #272c36, -3px -3px 3px #353c4a');
				root.style.setProperty('--neu-sm-ni-BGColor-inset-shadow', 'inset 3px 3px 3px #272c36, inset -3px -3px 3px #353c4a');
				$AppData.colorProfile = profile;
				break;
			default:
				throw new Error(`ERROR invalid color profile specified: ${profile}`);
		}
		await saveAppData();
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
			case 'syncMyHeroes':
				await syncMyHeroes();
				break;
			case 'syncLocalComps':
				await syncLocalComps();
				break;
			case 'resetTutorial':
				await resetTutorial();
				break;
			case 'showNotice':
				await displayNotice(event.detail.data.noticeConf);
				break;
			case 'clearError':
				clearError();
				break;
			case 'clearNotice':
				clearNotice();
				break;
			case 'changeColorProfile':
				await changeColorProfile(event.detail.data.newMode);
				break;
			default:
				throw new Error(`Invalid action specified for route event: ${event.detail.action}`);
		}
	}

	async function displayNotice(notice_config) {
		clearNotice();
		noticeConf = notice_config;
		showNotice = true;
		if(noticeConf.type !== 'loading') noticeTimeout = setTimeout(() => clearNotice(), 2000);
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
		<Header menu={menuItems} on:routeEvent={handleRouteEvent} />
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
			 class:error={noticeConf.type === 'error'}
			 class:loading={noticeConf.type === 'loading'}>
		{#if noticeConf.type === 'loading'}
			<LoadingSpinner type="dual-ring" size="small" color="white" />
		{:else}
			<span>
				{noticeConf.message}
			</span>
		{/if}
	</div>
</Modal>

<style lang="scss">
	.AppContainer {
		display: flex;
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
		z-index: 4;
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
		&.loading {
			align-items: center;
			background-color: rgba(50, 50, 50, 0.7);
			display: flex;
			justify-content: center;
		}
	}
	@media only screen and (min-width: 767px) {
		main {
			height: 100vh;
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
