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
	export let selectedLine = 0; // must be a binding
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

	function handleLineNavClick(type) {
		switch(type) {
			case 'prev':
				if(selectedLine === null || selectedLine === undefined || --selectedLine < 0) selectedLine = 0;
				break;
			case 'next':
				if(selectedLine === null || selectedLine === undefined) {
					selectedLine = 0;
					break;
				}
				if(++selectedLine >= lines.length) selectedLine = lines.length - 1;
				break;
			default:
				throw new Error(`Invalid type specified for lineNavClick: ${type}`);
		}
	}
</script>

<div class="compLineEditorContainer">
	<div class="lineDisplay">
		{#if lines[selectedLine]}
			<div class="lineTitle"><span>{lines[selectedLine].name}</span></div>
			<div class="lineMembers">
				<div class="detailBackline">
					{#if lines.length > 0}
						{#each lines[selectedLine].heroes as hero, i}
							{#if i >= 2}
								{#if $HeroData.some(e => e.id === hero)}
									<div class="heroButtonArea">
										<HeroButton
											hero={hero}
											heroDetails={compHeroes[hero]}
											on:heroButtonEvent={handleHeroButtonEvent}
										/>
									</div>
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
									<div class="heroButtonArea">
										<HeroButton
											hero={hero}
											heroDetails={compHeroes[hero]}
											on:heroButtonEvent={handleHeroButtonEvent}
										/>
									</div>
								{:else}
									<i class="emptyLineSlot"></i>
								{/if}
							{/if}
						{/each}
					{/if}
				</div>
			</div>
		{:else}
			<div class="noLine">
				<span>Select a line below</span>
			</div>
		{/if}
		<button type="button" class="lineNavButton prevLineButton" disabled={selectedLine <= 0} on:click={() => handleLineNavClick('prev')}>&#10096;</button>
		<button type="button" class="lineNavButton nextLineButton" disabled={selectedLine >= lines.length - 1} on:click={() => handleLineNavClick('next')}>&#10097;</button>
	</div>
	<div class="lineSwitcher">
		{#each lines as line, i}
			<button type="button" class="lineSwitchButton" class:active={selectedLine === i} on:click={() => selectedLine = i}></button>
		{/each}
	</div>
</div>

<style lang="scss">
	.compLineEditorContainer {
		padding-bottom: 10px;
		width: 100%;
	}
	.lineDisplay {
		align-items: center;
		border-radius: 10px;
		box-shadow: var(--neu-med-ni-BGColor-shadow);
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 10px;
		position: relative;
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
		.heroButtonArea {
			margin: 5px;
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
		.lineNavButton {
			align-items: center;
			background-color: transparent;
			border: none;
			cursor: pointer;
			display: flex;
			font-size: 2rem;
			height: 100%;
			outline: none;
			justify-content: center;
			position: absolute;
			transition: all 0.2s;
			width: 50px;
			&.prevLineButton {
				border-radius: 10px 0px 0px 10px;
				left: 0px;
			}
			&.nextLineButton {
				border-radius: 0px 10px 10px 0px;
				right: 0px;
			}
			&:disabled {
				color: var(--appColorDisabled);
				cursor: default;
			}
		}
		.noLine {
			align-items: center;
			height: 100%;
			color: var(--appColorDisabled);
			font-size: 1.5rem;
			font-weight: bold;
			justify-content: center;
			text-align: center;
			width: 100%;
		}
	}
	.lineSwitcher {
		align-items: center;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: center;
		margin-top: 10px;
		width: 100%;
		.lineSwitchButton {
			background-color: var(--appColorDisabled);
			border: none;
			border-radius: 50%;
			cursor: pointer;
			height: 10px;
			margin: 5px;
			width: 10px;
			&.active {
				background-color: var(--appColorPrimary);
			}
		}
	}
	@media only screen and (min-width: 767px) {
		.compLineEditorContainer {
			flex-grow: 0;
			flex-shrink: 0;
			margin-right: 10px;
			width: 340px;
		}
		.lineDisplay {
			max-height: 375px;
			min-height: 375px;
			.lineNavButton {
				&:hover {
					background-color: var(--appBGColorDark);
				}
				&:disabled {
					&:hover {
						background-color: transparent;
					}
				}
			}
		}
	}
</style>
