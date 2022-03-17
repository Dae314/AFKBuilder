<script>
	import { onMount, tick } from 'svelte';
	import HeroData from '../stores/HeroData.js';
	import AppData from '../stores/AppData.js';
	import ModalCloseButton from './ModalCloseButton.svelte';

	export let config = {};

	let close = () => {};
	let onSuccess = () => {};
	let lineIdx = 0;
	let section = 1;
	let selectedUUID = '';

	$: displayComps = $AppData.Comps.filter(e => !e.hidden);
	$: selectedComp = $AppData.Comps.some(e => e.uuid === selectedUUID) ? $AppData.Comps.find(e => e.uuid === selectedUUID) : {};
	$: displayLines = ('lines' in selectedComp) ? selectedComp.lines : [];

	onMount(async () => {
		close = config.close;
		lineIdx = config.idx;
		onSuccess = config.onSuccess;
	});

	function handleCompClick(uuid) {
		selectedUUID = uuid;
		section = 2;
	}

	function handleBackButtonClick() {
		section = 1;
		selectedUUID = '';
	}

	function handleLineClick(idx) {
		onSuccess({srcUUID: selectedUUID, srcLine: idx, destLine: lineIdx});
		close();
	}
</script>

<div class="background">
	<div class="modalCloseContainer">
		<ModalCloseButton onClose={close} />
	</div>
	<div id="ilContainer" class="importLineContainer" on:click={(e) => e.stopPropagation()}>
		{#if section === 1}
			<div class="compBrowser">
				<div class="compBrowserTitle">Import line from:</div>
				<ul>
					{#each displayComps as comp}
						<li>
							<button type="button" class="optionButton" on:click={() => handleCompClick(comp.uuid)}>
								<div class="optionTitle">
									{comp.name}
								</div>
								<div class="optionHeroes">
									{#each comp.lines[0].heroes as heroID}
										{#if $HeroData.some(e => e.id === heroID)}
											<img draggable="false" class="optionHero" src={$HeroData.find(e => e.id === heroID).portrait} alt={$HeroData.find(e => e.id === heroID).name}>
										{:else}
											<i class="optionHeroEmpty"></i>
										{/if}
									{/each}
								</div>
							</button>
						</li>
					{/each}
				</ul>
			</div>
		{:else if section === 2}
			<div class="lineBrowser">
				<div class="lineBrowserHead">
					<button type="button" class="backButton" on:click={handleBackButtonClick}><span>&#60; Back</span></button>
					<div class="lineBrowserTitle">
						Import Line:
					</div>
				</div>
				<ul>
					{#each displayLines as line, i}
						<li>
							<button type="button" class="optionButton" on:click={() => handleLineClick(i)}>
								<div class="optionTitle">
									{line.name}
								</div>
								<div class="optionHeroes">
									{#each line.heroes as heroID}
										{#if $HeroData.some(e => e.id === heroID)}
											<img draggable="false" class="optionHero" src={$HeroData.find(e => e.id === heroID).portrait} alt={$HeroData.find(e => e.id === heroID).name}>
										{:else}
											<i class="optionHeroEmpty"></i>
										{/if}
									{/each}
								</div>
							</button>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
	.background {
		align-items: center;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		flex-direction: column;
		height: 100%;
		justify-content: center;
		width: 100%;
	}
	.modalCloseContainer {
		margin-left: auto;
		position: relative;
		right: 10%;
	}
	.importLineContainer {
		background: var(--appBGColor);
		border-radius: 10px;
		height: 70%;
		overflow-x: hidden;
		overflow-y: auto;
		padding: 10px;
		position: relative;
		width: 80%;
	}
	.compBrowser {
		.compBrowserTitle {
			font-size: 2.0rem;
			font-weight: bold;
			margin-bottom: 10px;
			text-align: center;
			width: 100%;
		}
		ul {
			display: grid;
			grid-gap: 5px 5px;
			grid-template-columns: repeat(auto-fit, minmax(265px, 1fr));
			grid-auto-rows: 100px;
			list-style-type: none;
			margin: 0;
			padding: 0;
			li {
				display: flex;
				justify-content: center;
			}
		}
	}
	.lineBrowser {
		.lineBrowserHead {
			position: relative;
			width: 100%;
			.backButton {
				background-color: var(--appColorPrimary);
				border: 2px solid var(--appColorPrimary);
				border-radius: 5px;
				color: var(--appBGColor);
				cursor: pointer;
				left: 0px;
				outline: none;
				padding: 3px;
				position: absolute;
				top: 10px;
			}
			.lineBrowserTitle {
				font-size: 2.0rem;
				font-weight: bold;
				text-align: center;
				padding-bottom: 10px;
				width: 100%;
			}
		}
		ul {
			display: grid;
			grid-gap: 5px 5px;
			grid-template-columns: repeat(auto-fit, minmax(265px, 1fr));
			grid-auto-rows: 100px;
			list-style-type: none;
			margin: 0;
			padding: 0;
			li {
				display: flex;
				justify-content: center;
			}
		}
	}
	.optionButton {
		display: flex;
		background-color: transparent;
		border: 2px solid var(--appColorPrimary);
		border-radius: 10px;
		cursor: pointer;
		flex-direction: column;
		outline: none;
		padding: 5px;
		width: 265px;
		.optionTitle {
			font-size: 1.2rem;
			font-weight: bold;
			overflow: hidden;
			padding-bottom: 10px;
		}
		.optionHeroes {
			display: flex;
			.optionHero {
				border-radius: 50%;
				margin: 5px;
				max-width: 40px;
			}
			.optionHeroEmpty {
				border: 2px solid var(--appColorPrimary);
				border-radius: 50%;
				height: 40px;
				margin: 5px;
				width: 40px;
			}
		}
	}

	@media only screen and (min-width: 767px) {
		.modalCloseContainer {
			right: 25%;
		}
		.importLineContainer {
			width: 50%;
		}
	}
</style>
