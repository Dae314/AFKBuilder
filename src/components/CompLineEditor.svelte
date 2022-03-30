<script>
	import { createEventDispatcher } from 'svelte'
	import HeroData from '../stores/HeroData.js';
	import AppData from '../stores/AppData.js';

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

	function handleHeroClick(heroID) {
		dispatch('compLineEvent', {action: 'heroClick', data: heroID});
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
								<div class="detailImgContainer">
									<button type="button" class="heroButton"><img draggable="false" on:click={() => handleHeroClick(hero)} class="lineImg" class:claimed={$AppData.MH.List[hero].claimed} src={$HeroData.find(e => e.id === hero).portrait} alt={$HeroData.find(e => e.id === hero).name}></button>
									<span class="coreMark" class:visible={compHeroes[hero].core}></span>
									<div class="ascMark">
										{#if $HeroData.find(e => e.id === hero).tier === 'ascended'}
											{#if compHeroes[hero].ascendLv >= 6}
												<img src="./img/markers/ascended.png" alt="ascended">
											{:else if compHeroes[hero].ascendLv >= 4}
												<img src="./img/markers/mythic.png" alt="mythic">
											{:else if compHeroes[hero].ascendLv >= 2}
												<img src="./img/markers/legendary.png" alt="legendary">
											{:else}
												<img src="./img/markers/elite.png" alt="elite">
											{/if}
										{:else}
											{#if compHeroes[hero].ascendLv >= 4}
												<img src="./img/markers/legendary.png" alt="legendary">
											{:else if compHeroes[hero].ascendLv >= 2}
												<img src="./img/markers/elite.png" alt="elite">
											{:else}
												<img src="./img/markers/rare.png" alt="rare">
											{/if}
										{/if}
										{#if compHeroes[hero].si >= 30}
											<img src="./img/markers/si30.png" alt="si30">
										{:else if compHeroes[hero].si >= 20}
											<img src="./img/markers/si20.png" alt="si20">
										{:else if compHeroes[hero].si >= 10}
											<img src="./img/markers/si10.png" alt="si10">
										{:else}
											<img src="./img/markers/si0.png" alt="si0">
										{/if}
										{#if compHeroes[hero].furn >= 9}
											<img class:moveup={compHeroes[hero].si < 10} src="./img/markers/9f.png" alt="9f">
										{:else if compHeroes[hero].furn >= 3}
											<img class:moveup={compHeroes[hero].si < 10} src="./img/markers/3f.png" alt="3f">
										{/if}
									</div>
								</div>
								<button type="button" class="heroNameButton"><span on:click={() => handleHeroClick(hero)}>{$HeroData.find(e => e.id === hero).name}</span></button>
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
								<div class="detailImgContainer">
									<button type="button" class="heroButton"><img draggable="false" on:click={() => handleHeroClick(hero)} class="lineImg" class:claimed={$AppData.MH.List[hero].claimed} src={$HeroData.find(e => e.id === hero).portrait} alt={$HeroData.find(e => e.id === hero).name}></button>
									<span class="coreMark" class:visible={compHeroes[hero].core}></span>
									<div class="ascMark">
										{#if $HeroData.find(e => e.id === hero).tier === 'ascended'}
											{#if compHeroes[hero].ascendLv >= 6}
												<img src="./img/markers/ascended.png" alt="ascended">
											{:else if compHeroes[hero].ascendLv >= 4}
												<img src="./img/markers/mythic.png" alt="mythic">
											{:else if compHeroes[hero].ascendLv >= 2}
												<img src="./img/markers/legendary.png" alt="legendary">
											{:else}
												<img src="./img/markers/elite.png" alt="elite">
											{/if}
										{:else}
											{#if compHeroes[hero].ascendLv >= 4}
												<img src="./img/markers/legendary.png" alt="legendary">
											{:else if compHeroes[hero].ascendLv >= 2}
												<img src="./img/markers/elite.png" alt="elite">
											{:else}
												<img src="./img/markers/rare.png" alt="rare">
											{/if}
										{/if}
										{#if compHeroes[hero].si >= 30}
											<img src="./img/markers/si30.png" alt="si30">
										{:else if compHeroes[hero].si >= 20}
											<img src="./img/markers/si20.png" alt="si20">
										{:else if compHeroes[hero].si >= 10}
											<img src="./img/markers/si10.png" alt="si10">
										{:else}
											<img src="./img/markers/si0.png" alt="si0">
										{/if}
										{#if compHeroes[hero].furn >= 9}
											<img class:moveup={compHeroes[hero].si < 10} src="./img/markers/9f.png" alt="9f">
										{:else if compHeroes[hero].furn >= 3}
											<img class:moveup={compHeroes[hero].si < 10} src="./img/markers/3f.png" alt="3f">
										{/if}
									</div>
								</div>
								<button type="button" class="heroNameButton"><span on:click={() => handleHeroClick(hero)}>{$HeroData.find(e => e.id === hero).name}</span></button>
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
		.heroButton {
			background: transparent;
			border: none;
			cursor: pointer;
			margin: 0;
			outline: none;
			padding: 0;
		}
		.heroNameButton {
			background: transparent;
			border: none;
			cursor: pointer;
			margin: 0;
			outline: none;
			padding: 0;
		}
		.detailImgContainer {
			position: relative;
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
		.lineImg {
			border-radius: 50%;
			cursor: pointer;
			margin: 5px;
			max-width: 70px;
			&.claimed {
				border: 5px solid var(--appColorPrimary);
			}
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
		.coreMark {
			background-color: var(--legendColor);
			border: 3px solid var(--appBGColor);
			border-radius: 50%;
			bottom: 5px;
			display: none;
			height: 22px;
			position: absolute;
			right: 4px;
			visibility: hidden;
			width: 22px;
			&.visible {
				display: inline-block;
				pointer-events: none;
				visibility: visible;
			}
		}
		.ascMark {
			left: -6px;
			position: absolute;
			top: 3px;
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
			.lineImg {
				transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 0);
				&:hover {
					transform: scale(1.1);
				}
			}
			
		}
	}
</style>
