<script>
	import { createEventDispatcher } from 'svelte';
	import HeroData from '../stores/HeroData.js';
	import HeroButton from '../shared/HeroButton.svelte';

	const dispatch = createEventDispatcher();

	/* expext format:
		[{name: str, heroes: [heroID]}]
	*/
	export let lines = [];
	/* expect format:
		{ heroID: {
				artifacts: {primary: [str], secondary: [str], situational: [str]},
				ascendLv: int,
				core: bool,
				engraving: int,
				furn: int,
				notes: str,
				si: int,
				stars: int,
			},
			...
		}
	*/
	export let compHeroes = [];
	export let selectedLine = 0;
	export let editMode = false;

	function handleHeroButtonEvent(event) {
		switch(event.detail.action) {
			case 'heroClick':
				dispatch('compLineEvent', {action: 'heroClick', data: event.detail.data});
				break;
			default:
				throw new Error(`Invalid action specified on heroButtonEvent: ${action}`);
		}
	}
</script>

<div class="compLineEditorContainer">
	<div class="lineSwitcher">
		{#each lines as line, i}
		<button type="button" class="lineSwitchButton" class:active={selectedLine === i} on:click={() => selectedLine = i}>{line.name}</button>
		{/each}
	</div>
	<div class="lineDisplay">
		{#if lines.length > 0}
			<div class="lineTitle"><span>{lines[selectedLine].name}</span></div>
		{/if}
		<div class="lineMembers">
			<div class="detailBackline">
				{#if lines.length > 0}
					{#each lines[selectedLine].heroes as hero, i}
						{#if i >= 2}
							{#if $HeroData.some(e => e.id === hero)}
								<HeroButton
									hero={hero}
									heroDetails={compHeroes[hero]}
									on:heroButtonEvent={handleHeroButtonEvent}
								/>
							{:else}
								<i class="emptyLineSlot"></i>
							{/if}
						{/if}
					{/each}
				{/if}
			</div>
			<div class="detailFrontline">
				{#if lines.length > 0}
					{#each lines[selectedLine].heroes as hero, i}
						{#if i < 2}
							{#if $HeroData.some(e => e.id === hero)}
								<HeroButton
									hero={hero}
									heroDetails={compHeroes[hero]}
									on:heroButtonEvent={handleHeroButtonEvent}
								/>
							{:else}
								<i class="emptyLineSlot"></i>
							{/if}
						{/if}
					{/each}
				{/if}
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	.compLineEditorContainer {
		padding-bottom: 10px;
		width: 100%;
	}
	.lineSwitcher {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: center;
		.lineSwitchButton {
			background-color: transparent;
			border: 2px solid var(--appColorPrimary);
			border-bottom: none;
			border-radius: 5px 5px 0px 0px;
			color: var(--appColorPrimary);
			cursor: pointer;
			font-size: 1.0rem;
			margin-right: 5px;
			max-width: 100px;
			min-height: 26px;
			min-width: 30px;
			overflow: hidden;
			padding: 3px;
			text-overflow: ellipsis;
			white-space: nowrap;
			&.active {
				background-color: var(--appColorPrimary);
				color: white;
			}
		}
	}
	.lineDisplay {
		align-items: center;
		border: 2px solid var(--appColorPrimary);
		border-radius: 10px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 10px;
		width: 100%;
		.lineTitle {
			padding: 10px;
			font-size: 1.1rem;
			font-weight: bold;
			max-width: 300px;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.lineMembers {
			align-items: center;
			border-radius: 10px;
			display: flex;
			flex-direction: row;
			justify-content: center;
			min-height: 295px;
			width: 100%;
		}
		.detailFrontline {
			align-items: center;
			display: flex;
			flex-direction: column;
			justify-content: center;
			width: 80px;
		}
		.detailBackline {
			align-items: center;
			display: flex;
			flex-direction: column;
			justify-content: center;
			width: 80px;
			margin-right: 10px;
		}
		.emptyLineSlot {
			background: transparent;
			border: 3px solid var(--appColorPriAccent);
			border-radius: 50%;
			flex-grow: 0;
			flex-shrink: 0;
			height: 70px;
			margin: 5px;
			width: 70px;
		}
	}
	@media only screen and (min-width: 767px) {
		.compLineEditorContainer {
			flex-grow: 0;
			flex-shrink: 0;
			margin-right: 10px;
			width: 340px;
		}
		.lineSwitcher {
			display: flex;
			flex-direction: row;
			justify-content: flex-start;
			.lineSwitchButton {
				margin-right: 0px;
			}
		}
		.lineDisplay {
			border-radius: 0px 10px 10px 10px;
			max-height: 375px;
			min-height: 375px;
		}
	}
</style>
