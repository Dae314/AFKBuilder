<script>
	import { onMount } from 'svelte';
	import Beasts from '../stores/Beasts.js';
	import ModalCloseButton from './ModalCloseButton.svelte';

	export let config = {};

	let close = () => {};
	let onSuccess = () => {};
	let lineIdx = 0;
	let line = {beasts: {}};
	let view = 'beastMain';
	let category = 'none';

	$: availableBeasts = createAvailableBeasts(line.beasts);

	onMount(async () => {
		close = config.close;
		lineIdx = config.lineIdx;
		line = config.line;
		onSuccess = config.onSuccess;
	});

	function createAvailableBeasts(lineBeasts) {
		let usedBeastIDs = [];
		for(const category in lineBeasts) {
			usedBeastIDs = [...usedBeastIDs, ...lineBeasts[category]];
		}
		return $Beasts.filter(i => !usedBeastIDs.some(j => j === i.id));
	}

	function handleAddBeastClick(categoryID) {
		view = 'beastPicker';
		category = categoryID;
	}

	function handleChooseBeast(beastID) {
		line.beasts[category] = [...line.beasts[category], beastID];
		view = 'beastMain';
		category = 'none';
	}

	function handleRemoveBeast(categoryID, index) {
		console.log(index);
		line.beasts[categoryID] = line.beasts[categoryID].filter((item, idx) => idx !== index);
	}

	function saveBeasts() {
		onSuccess({lineIdx: lineIdx, beasts: line.beasts});
	}
</script>

<div class="background">
	<div class="modalCloseContainer">
		<ModalCloseButton onClose={close} />
	</div>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div id="beastEditor" class="beastEditorContainer" on:click|stopPropagation>
		<section class:visible={view === 'beastMain'} class="beastMain">
			<div class="beastMainHead">
				<button type="button" class="saveButton" on:click={saveBeasts}><span>Save</span></button>
			</div>
			{#each Object.keys(line.beasts) as category}
				<h5>{category}</h5>
				<div class="beastView {category}">
					<ul>
						{#each line.beasts[category] as beastID, idx}
							<li>
								<button type="button" class="removeBeastButton" on:click={() => handleRemoveBeast(category, idx)}>
									<div class="mask">
										<img class="beastPortrait" src="{$Beasts.find(e => e.id === beastID).portrait}" alt="{$Beasts.find(e => e.id === beastID).name}">
									</div>
									<p class="beastName">{$Beasts.find(e => e.id === beastID).name}</p>
								</button>
							</li>
						{/each}
						<li>
							<button type="button" class="addBeastButton" on:click={() => handleAddBeastClick(category)}><span>+</span></button>
						</li>
					</ul>
				</div>
			{/each}
		</section>
		<section class:visible={view === 'beastPicker'} class="beastPicker">
			<div class="beastPickerHead">
				<button type="button" class="backButton" on:click={() => view = 'beastMain'}>
					<img class="backImage" draggable="false" src="./img/utility/back_color.png" alt="Back">
				</button>
				<h3>Choose Beast</h3>
			</div>
			<ul class="beastGrid">
				{#each availableBeasts as beast}
					<li>
						<button type="button" class="chooseBeastButton" on:click={() => handleChooseBeast(beast.id)}>
							<div class="mask">
								<img class="beastPortrait" src="{beast.portrait}" alt="{beast.name}">
							</div>
							<p class="beastName">{beast.name}</p>
						</button>
					</li>
				{/each}
			</ul>
		</section>
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
	.beastEditorContainer {
		background: var(--appBGColor);
		border-radius: 10px;
		color: var(--appColorBlack);
		height: 70%;
		overflow-x: hidden;
		overflow-y: auto;
		padding: 10px;
		position: relative;
		width: 80%;
	}
	.beastMain {
		display: none;
		&.visible {
			display: block;
		}
		.beastMainHead {
			display: flex;
			height: 50px;
			position: relative;
			width: 100%;
			.saveButton {
				background-color: var(--appBGColor);
				border: none;
				border-radius: 5px;
				box-shadow: var(--neu-sm-i-BGColor-shadow);
				color: var(--appColorPrimary);
				cursor: pointer;
				font-size: 1.1rem;
				font-weight: bold;
				outline: none;
				padding: 5px;
				position: absolute;
				right: 10px;
			}
		}
		h5 {
			margin: 10px 0px;
			&::first-letter {
				text-transform:capitalize;
			}
		}
		.beastView {
			background-color: var(--appBGColor);
			border-radius: 10px;
			box-shadow: var(--neu-sm-ni-BGColor-inset-shadow);
			margin-top: 5px;
			min-height: 105px;
			overflow-x: auto;
			padding: 10px 5px;
			width: 100%;
			ul {
				display: flex;
				margin: 0;
				padding: 0;
				list-style-type: none;
				li {
					margin: 0;
					padding: 0;
				}
			}
			.removeBeastButton {
				align-items: center;
				background-color: transparent;
				border: none;
				color: var(--appColorBlack);
				cursor: pointer;
				display: flex;
				flex-direction: column;
				justify-content: center;
				margin: 0px 10px;
				padding: 0;
				outline: none;
			}
			.addBeastButton {
				background: transparent;
				border: 3px solid var(--appColorPrimary);
				border-radius: 50%;
				color: var(--appColorPrimary);
				cursor: pointer;
				flex-grow: 0;
				flex-shrink: 0;
				font-size: 1.5rem;
				height: 60px;
				margin: 0px 10px 20px 10px;
				padding: 0;
				width: 60px;
			}
		}
	}
	.beastPicker {
		display: none;
		&.visible {
			display: block;
		}
		.beastPickerHead {
			display: flex;
			height: 50px;
			position: relative;
			width: 100%;
			.backButton {
				align-items: center;
				background-color: var(--appBGColor);
				border: none;
				border-radius: 5px;
				box-shadow: var(--neu-sm-i-BGColor-shadow);
				color: var(--appColorPrimary);
				cursor: pointer;
				display: flex;
				height: 30px;
				justify-content: center;
				left: 10px;
				outline: none;
				padding: 0;
				position: absolute;
				width: 30px;
				.backImage {
					max-width: 15px;
				}
			}
			h3 {
				margin: 0;
				left: 50%;
				position: relative;
				transform: translate(-50%, 0%)
			}
		}
		.beastGrid {
			display: grid;
			grid-gap: 10px 10px;
			grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
			grid-template-rows: repeat(auto-fit, minmax(100px, 1fr));
			justify-content: space-evenly;
			list-style-type: none;
			margin: 0;
			padding: 0;
			li {
				align-items: center;
				display: flex;
				justify-content: center;
			}
			.chooseBeastButton {
				align-items: center;
				background-color: transparent;
				border: none;
				color: var(--appColorBlack);
				cursor: pointer;
				display: flex;
				flex-direction: column;
				justify-content: center;
				margin: 0;
				padding: 0;
				outline: none;
			}
		}
	}
	.mask {
		height: 60px;
		border-radius: 50%;
		overflow: hidden;
		width: 60px;
		.beastPortrait {
			max-width: 60px;
		}
	}
	.beastName {
		margin: 0;
		margin-top: 10px;
		max-width: 70px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	@media only screen and (min-width: 767px) {
		.modalCloseContainer {
			right: 25%;
		}
		.beastEditorContainer {
			width: 50%;
		}
	}
</style>
