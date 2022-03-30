<script>
	import { createEventDispatcher } from 'svelte';
	import AppData from '../stores/AppData.js';
	import HeroData from '../stores/HeroData.js';

	const dispatch = createEventDispatcher();

	export let hero = '';
	export let heroDetails = {};
	export let hideName = false;

	function handleHeroClick(heroID) {
		dispatch('heroButtonEvent', {action: 'heroClick', data: heroID});
	}
</script>

<div class="heroButtonContainer">
	<div class="portraitArea">
		<button type="button" class="heroButton" on:click={() => handleHeroClick(hero)}>
			<img
				draggable="false"
				class="heroImage"
				class:claimed={$AppData.MH.List[hero].claimed}
				src={$HeroData.find(e => e.id === hero).portrait}
				alt={$HeroData.find(e => e.id === hero).name}
			>
		</button>
		<span class="coreMark" class:visible={heroDetails.core}></span>
		<div class="ascMark">
			{#if $HeroData.find(e => e.id === hero).tier === 'ascended'}
				{#if heroDetails.ascendLv >= 6}
					<img src="./img/markers/ascended.png" alt="ascended">
				{:else if heroDetails.ascendLv >= 4}
					<img src="./img/markers/mythic.png" alt="mythic">
				{:else if heroDetails.ascendLv >= 2}
					<img src="./img/markers/legendary.png" alt="legendary">
				{:else}
					<img src="./img/markers/elite.png" alt="elite">
				{/if}
			{:else}
				{#if heroDetails.ascendLv >= 4}
					<img src="./img/markers/legendary.png" alt="legendary">
				{:else if heroDetails.ascendLv >= 2}
					<img src="./img/markers/elite.png" alt="elite">
				{:else}
					<img src="./img/markers/rare.png" alt="rare">
				{/if}
			{/if}
			{#if heroDetails.si >= 30}
				<img src="./img/markers/si30.png" alt="si30">
			{:else if heroDetails.si >= 20}
				<img src="./img/markers/si20.png" alt="si20">
			{:else if heroDetails.si >= 10}
				<img src="./img/markers/si10.png" alt="si10">
			{:else}
				<img src="./img/markers/si0.png" alt="si0">
			{/if}
			{#if heroDetails.furn >= 9}
				<img class:moveup={heroDetails.si < 10} src="./img/markers/9f.png" alt="9f">
			{:else if heroDetails.furn >= 3}
				<img class:moveup={heroDetails.si < 10} src="./img/markers/3f.png" alt="3f">
			{/if}
		</div>
	</div>
	<div class="nameArea">
		<button type="button" class="heroNameButton">
			<span on:click={() => handleHeroClick(hero)}>{$HeroData.find(e => e.id === hero).name}</span>
		</button>
	</div>
</div>

<style lang="scss">
	.portraitArea {
		position: relative;
		.heroButton {
			background: transparent;
			border: none;
			border-radius: 50%;
			cursor: pointer;
			height: 70px;
			margin: 0;
			outline: none;
			padding: 0;
			width: 70px;
			.heroImage {
				border-radius: 50%;
				height: 70px;
				max-width: 70px;
				width: 70px;
				&.claimed {
					border: 5px solid var(--appColorPrimary);
				}
			}
		}
		.coreMark {
			background-color: var(--legendColor);
			border: 3px solid var(--appBGColor);
			border-radius: 50%;
			bottom: 0px;
			display: none;
			height: 22px;
			position: absolute;
			right: 0px;
			visibility: hidden;
			width: 22px;
			&.visible {
				display: inline-block;
				pointer-events: none;
				visibility: visible;
			}
		}
		.ascMark {
			left: -11px;
			position: absolute;
			top: -3px;
			img {
				left: 0;
				max-width: 35px;
				pointer-events: none;
				position: absolute;
				top: 0;
			}
			img.moveup {
				top: -3.5px;
			}
		}
	}
	.nameArea {
		display: flex;
		width: 100%;
		.heroNameButton {
			background: transparent;
			border: none;
			cursor: pointer;
			margin: 0 auto;
			outline: none;
			padding: 0;
		}
	}
	@media only screen and (min-width: 767px) {
		.portraitArea {
			.heroButton {
				.heroImage {
					transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 0);
					&:hover {
						transform: scale(1.1);
					}
				}
			}
		}
	}
</style>
