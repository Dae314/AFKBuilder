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
	let importLineContainer;

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
		importLineContainer.scrollTop = 0;
	}

	function handleBackButtonClick() {
		section = 1;
		selectedUUID = '';
		importLineContainer.scrollTop = 0;
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
	<div bind:this={importLineContainer} id="ilContainer" class="importLineContainer" on:click={(e) => e.stopPropagation()}>
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
					<button type="button" class="backButton" on:click={handleBackButtonClick}>
						<img class="backImage" draggable="false" src="./img/utility/back_color.png" alt="Back">
					</button>
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
			margin-bottom: 20px;
			text-align: center;
			width: 100%;
		}
		ul {
			display: grid;
			grid-gap: 20px 10px;
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
				align-items: center;
				background-color: var(--appBGColor);
				border: none;
				border-radius: 10px;
				box-shadow: var(--neu-sm-i-BGColor-shadow);
				cursor: pointer;
				display: flex;
				height: 33px;
				justify-content: center;
				left: 0px;
				outline: none;
				position: absolute;
				top: 10px;
				width: 33px;
				.backImage {
					max-width: 17px;
				}
			}
			.lineBrowserTitle {
				font-size: 2.0rem;
				font-weight: bold;
				text-align: center;
				padding-bottom: 20px;
				width: 100%;
			}
		}
		ul {
			display: grid;
			grid-gap: 20px 10px;
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
		background-color: var(--appBGColor);
		border: none;
		border-radius: 10px;
		box-shadow: var(--neu-med-i-BGColor-shadow);
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
