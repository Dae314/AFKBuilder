<script>
	import {onMount} from 'svelte';
	import AppData from './stores/AppData.js';
	import Modal from 'svelte-simple-modal';

	import Header from './components/Header.svelte';
	import Comps from './components/Comps.svelte';
	import HeroList from './components/HeroList.svelte';
	import MyHeroes from './components/MyHeroes.svelte';
	import Recommendations from './components/Recommendations.svelte';
	import About from './components/About.svelte';

	export let version = '';

	onMount(async () => {
		saveAppData();
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
		saveAppData();
		location.reload();
	}
</script>

<svelte:head>
	<title>AFKBuilder</title>
	<link rel="preconnect" href="https://fonts.gstatic.com">
	<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@900&display=swap" rel="stylesheet">
</svelte:head>

<Modal>
	<div class="AppContainer">
		<Header on:saveData={saveAppData} />
		<main>
			<div class="MainWindow">
				<div id="currentDisplay">
					{#if $AppData.activeView === 'comps'}
						<Comps on:saveData={saveAppData} />
					{:else if $AppData.activeView === 'recommendations'}
						<Recommendations />
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

<style>
	.AppContainer {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 100vh;
		width: 100%;
		padding: 0px;
		margin: 0px;
		background-color: var(--appBGColor);
	}
	main {
		display: flex;
		height: 100%;
		padding-top: 45px;
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
