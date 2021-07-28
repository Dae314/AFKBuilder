<script>
	import {onMount} from 'svelte';
	import {debounce} from 'lodash';
	import AppData from './stores/AppData.js';
	import Modal from 'svelte-simple-modal';

	import Header from './components/Header.svelte';
	import Comps from './components/Comps.svelte';
	import HeroList from './components/HeroList.svelte';
	import MyHeroes from './components/MyHeroes.svelte';
	import Recommendations from './components/Recommendations.svelte';
	import About from './components/About.svelte';

	export let version = '';
	const menuItems = [ 'Comps', 'Recommendations', 'My Heroes', 'Hero List', 'About' ];
	const defaultView = 'comps';

	onMount(async () => {
		const queryString = window.location.search;
		const urlParams = new URLSearchParams(queryString);
		if(urlParams.has('view')) {
			const menuItemsLower = menuItems.map((e) => e.toLowerCase());
			if(menuItemsLower.includes(urlParams.get('view'))) {
				$AppData.activeView = urlParams.get('view');
			} else {
				$AppData.activeView = defaultView;
			}
		} else {
			$AppData.activeView = defaultView;
		}
		history.replaceState({view: $AppData.activeView, modal: false}, $AppData.activeView, `?view=${$AppData.activeView}`);
		saveAppData();
		handleWindowResize();
	});

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

	function handlePopState(event) {
		const state = event.state;
		if(state !== null) {
			if('view' in state) {
				if(state.modal) {
					history.replaceState({view: $AppData.activeView, modal: false}, $AppData.activeView, `?view=${$AppData.activeView}`);
				}else{
					$AppData.activeView = state.view;
				}
			} else {
				$AppData.activeView = defaultView;
			}
			saveAppData();
		}
	}

	function handleModalClosed() {
		const queryString = window.location.search;
		const urlParams = new URLSearchParams(queryString);
		if(urlParams.has('modal')) {
			history.back();
		}
		history.replaceState({view: $AppData.activeView, modal: false}, $AppData.activeView, `?view=${$AppData.activeView}`);
	}

	function handleWindowResize() {
		// gymnastics to set height for mobile browsers
		let vh = window.innerHeight * 0.01;
		document.documentElement.style.setProperty('--vh', `${vh}px`);
	}
</script>

<svelte:head>
	<title>AFKBuilder</title>
	<link rel="preconnect" href="https://fonts.gstatic.com">
	<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@900&display=swap" rel="stylesheet">
</svelte:head>

<svelte:window on:popstate={handlePopState} on:resize={debounce(handleWindowResize, 100)} />

<Modal on:closed={handleModalClosed}>
	<div class="AppContainer">
		<Header menu={menuItems} on:saveData={saveAppData} />
		<main>
			<div class="MainWindow">
				<div id="currentDisplay">
					{#if $AppData.activeView === 'comps'}
						<Comps on:saveData={saveAppData} />
					{:else if $AppData.activeView === 'recommendations'}
						<Recommendations on:saveData={saveAppData} />
					{:else if $AppData.activeView === 'my heroes'}
						<MyHeroes on:saveData={saveAppData} />
					{:else if $AppData.activeView === 'hero list' }
						<HeroList on:saveData={saveAppData} />
					{:else if $AppData.activeView === 'about' }
						<About version={version} on:clearData={clearAppData} on:resetTutorial={resetTutorial} />
					{:else}
						<h2>you shouldn't be able to get here</h2>
					{/if}
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
