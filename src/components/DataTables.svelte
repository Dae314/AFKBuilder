<script>
	import {onMount, createEventDispatcher} from 'svelte';
	import AppData from '../stores/AppData';
	import HeroList from './HeroList.svelte';
	import BeastList from './BeastList.svelte';
	import ArtifactList from './ArtifactList.svelte';
	import HRadioPicker from '../shared/HRadioPicker.svelte';

	export let isMobile = false;
	const dispatch = createEventDispatcher();

	onMount(async () => {
		$AppData.activeView = 'herolist';
		dispatch('routeEvent', {action: 'saveData'});
	});

	let sectOptions = ['Heroes', 'Beasts', 'Artifacts'];

	function handleViewChange() {
		dispatch('routeEvent', {action: 'saveData'});
	}
</script>

<div class="DTContainer">
	<section class="sect1">
		<div class="pickerArea">
			<div class="sortContainer">
				<HRadioPicker
					options={sectOptions}
					bind:curOption={$AppData.HL.CurSect}
					on:change={handleViewChange}
				/>
			</div>
		</div>
	</section>
	<section class="sect2">
		<div class='tableContainer'>
			{#if $AppData.HL.CurSect === 0}
				<HeroList {isMobile} on:routeEvent />
			{:else if $AppData.HL.CurSect === 1}
				<BeastList {isMobile} on:routeEvent />
			{:else if $AppData.HL.CurSect === 2}
				<ArtifactList {isMobile} on:routeEvent />
			{/if}
		</div>
	</section>
</div>

<style lang="scss">
	.DTContainer {
		height: 100%;
		height: calc(var(--vh, 1vh) * 100 - var(--headerHeight)); /* gymnastics to set height for mobile browsers */
		overflow-y: auto;
		width: 100%;
	}
	.pickerArea {
		display: flex;
		padding-top: 10px;
		justify-content: center;
	}
	@media only screen and (min-width: 767px) {
		.DTContainer {
			height: 100vh;
		}
	}
</style>
