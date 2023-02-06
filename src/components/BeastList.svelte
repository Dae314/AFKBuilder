<script>
	import { getContext, onMount, createEventDispatcher } from 'svelte';
	import { flip } from 'svelte/animate';
	import AppData from '../stores/AppData.js';
	import Beasts from '../stores/Beasts.js';
	import ModalCloseButton from '../modals/ModalCloseButton.svelte';
	import BeastDetail from '../modals/BeastDetail.svelte';

	export let isMobile = false;

	const { open } = getContext('simple-modal');
	const dispatch = createEventDispatcher();
	let showFilters = false;

	$: modalHeight = isMobile ? '75vh' : '80vh';

	let displayList = [];

	onMount(async () => {
		displayList = sortDisplayList($AppData.HL.BeastSort, $AppData.HL.BeastOrder, makeDisplayList());
	});

	function makeDisplayList() {
		let retVal = [];
		let beast;
		for (let i = 0; i < $Beasts.length; i++) {
			beast = $Beasts[i];
			if($AppData.HL.BeastSearch !== '' &&
				 !beast.name.toLowerCase().includes($AppData.HL.BeastSearch.toLowerCase())
				) continue;
			retVal.push({
				id: beast.id,
				name: beast.name,
				portrait: beast.portrait,
			});
		}
		return retVal;
	}

	function updateSearch() {
		displayList = sortDisplayList($AppData.HL.BeastSort, $AppData.HL.BeastOrder, makeDisplayList());
		dispatch('routeEvent', {action: 'saveData'});
	}

	function updateSort(order) {
		$AppData.HL.BeastOrder = order;
		displayList = sortDisplayList($AppData.HL.BeastSort, $AppData.HL.BeastOrder, makeDisplayList());
		dispatch('routeEvent', {action: 'saveData'});
	}

	function sortDisplayList(col, order, displayList) {
		switch(col) {
			case 'portrait':
			case 'name':
				return [...displayList].sort(compareValues('name', order));
				break;
			default:
				throw new Error('Invalid Beast List sort column.');
		}
	}

	function compareValues(key, order='asc') {
		return function innerSort(a, b) {
			if(!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
				// property doesn't exist on either object
				throw new Error('Invalid Hero List sort key specified.');
			}
			const varA = (typeof a[key] === 'string') ? a[key].toLowerCase() : a[key];
			const varB = (typeof b[key] === 'string') ? b[key].toLowerCase() : b[key];
			let comparison = 0;
			if(varA > varB) {
				comparison = 1;
			} else {
				comparison = -1;
			}
			return (
				(order === 'desc') ? (comparison * -1) : comparison
			);
		}
	}

	function handleBeastClick(beastID) {
		const bgColor = window.getComputedStyle(document.documentElement).getPropertyValue('--appBGColor');
		open(BeastDetail, 
		{ beastID: beastID, },
		{ closeButton: ModalCloseButton,
			styleWindow: { background: bgColor },
			styleContent: {background: bgColor, padding: 0, borderRadius: '10px', maxHeight: modalHeight,},
		});
	}
</script>

<div class="BLContainer">
	<section class="sect1">
		<div class="searchArea">
			<input id="searchBox" type="search" placeholder="Search" bind:value={$AppData.HL.BeastSearch} on:keyup={updateSearch} on:search={updateSearch}>
			<button type="button" class="headButton searchButton" on:click={updateSearch}>
				<img class="searchImage" class:light={$AppData.colorProfile === 'light'} src="./img/utility/search_white.png" alt="search" />
			</button>
			<button type="button" class="headButton openFiltersButton" class:open={showFilters} on:click={() => showFilters = !showFilters}>
				<img class="openFiltersImage" class:light={$AppData.colorProfile === 'light'} src="./img/utility/filter_white.png" alt="Open Filters">
			</button>
		</div>
		<div class="filterArea" class:open={showFilters}>
			<div class="filterSection">
				<h5>Sort:</h5>
				<div class="sortArea">
					<button type="button" class="sortButton" class:selected={$AppData.HL.BeastOrder === 'asc'} on:click={() => updateSort('asc')}>
						<p>A-Z</p>
					</button>
					<button type="button" class="sortButton" class:selected={$AppData.HL.BeastOrder === 'desc'} on:click={() => updateSort('desc')}>
						<p>Z-A</p>
					</button>
				</div>
			</div>
		</div>
	</section>
	<section class="sect2">
		<div class='beastGrid'>
			{#each displayList as beast (beast.id)}
				<button type="button" class="beastButton" on:click={() => handleBeastClick(beast.id)} animate:flip="{{duration: 200}}">
					<div class="beastCard">
						<div class="portraitContainer">
							<div class="mask">
								<img draggable="false" class="portrait" src={beast.portrait} alt={beast.name}>
							</div>
						</div>
						<p class="beastName">{beast.name}</p>
					</div>
				</button>
			{/each}
		</div>
	</section>
</div>

<style lang="scss">
	.BLContainer {
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 100%;
	}
	.sect1 {
		width: 100%;
		.searchArea {
			align-items: center;
			display: flex;
			justify-content: center;
			padding: 15px;
			padding-top: 10px;
			position: relative;
			width: 100%;
			#searchBox {
				background-color: var(--appBGColorLight);
				border: none;
				border-radius: 5px;
				box-shadow: var(--neu-med-i-BGColor-shadow);
				color: var(--appColorBlack);
				font-size: 1.2rem;
				outline: none;
				padding: 8px;
				width: 100%;
				&:focus {
					background-color: var(--appTextInputFocusBG);
				}
				&::placeholder {
					color: var(--appColorBlack);
					opacity: 0.5;
				}
			}
			.headButton {
				align-items: center;
				background-color: transparent;
				border: none;
				border-radius: 10px;
				cursor: pointer;
				display: flex;
				height: 40px;
				justify-content: center;
				outline: none;
				position: absolute;
				transition: all 0.2s;
				width: 40px;
			}
			.searchButton {
				right: 79px;
				.searchImage {
					max-width: 25px;
					opacity: 0.3;
					&.light {
						filter: invert(1);
					}
				}
			}
			.openFiltersButton {
				right: 42px;
				.openFiltersImage {
					max-width: 25px;
					opacity: 0.3;
					&.light {
						filter: invert(1);
					}
				}
				&.open {
					.openFiltersImage {
						opacity: 0.7;
					}
				}
			}
		}
		.filterArea {
			align-items: center;
			display: flex;
			flex-direction: row;
			background: var(--appBGColor);
			border-radius: 10px;
			box-shadow: var(--neu-sm-i-BGColor-shadow);
			display: flex;
			flex-direction: column;
			left: 50%;
			opacity: 0;
			padding: 5px;
			position: absolute;
			top: 140px;
			transform: translate(-50%, 0);
			transition: all 0.2s;
			visibility: hidden;
			width: 90%;
			z-index: 2;
			.filterSection {
				align-items: center;
				border-bottom: 1px solid black;
				display: flex;
				flex-direction: column;
				flex-wrap: wrap;
				padding-bottom: 7px;
				padding-left: 10px;
				width: 100%;
				&:last-child {
					border-bottom: none;
				}
				h5 {
					margin: 0px 0px 5px 0px;
					font-size: 1rem;
				}
				.sortArea {
					display: flex;
					.sortButton {
						background: var(--appBGColor);
						border: none;
						border-radius: 5px;
						box-shadow: var(--neu-sm-i-BGColor-shadow);
						cursor: pointer;
						outline: none;
						margin: 5px;
						padding: 5px;
						p {
							color: var(--appColorBlack);
							margin: 0;
							opacity: 0.3;
						}
						&.selected {
							background: var(--neu-convex-BGColor-bg);
							p {
								opacity: 1;
							}
						}
					}
				}
			}
			&.open {
				opacity: 1;
				visibility: visible;
			}
		}
	}
	.sect2 {
		padding: 0px 10px;
	}
	.beastGrid {
		display: grid;
		grid-gap: 20px 20px;
		grid-template-columns: repeat(auto-fill, minmax(150px, 150px));
		grid-auto-rows: 170px;
		justify-content: space-evenly;
		padding-top: 10px;
		width: 100%;
		.beastButton {
			background: transparent;
			border: none;
			cursor: pointer;
			outline: none;
		}
		.beastCard {
			align-items: center;
			background: var(--appBGColor);
			border-radius: 10px;
			box-shadow: var(--neu-med-i-BGColor-shadow);
			display: flex;
			flex-direction: column;
			height: 100%;
			justify-content: center;
			padding: 5px;
			width: 100%;
			.portraitContainer {
				align-items: center;
				display: flex;
				justify-content: center;
				.mask {
					border-radius: 50%;
					height: 70px;
					overflow: hidden;
					width: 70px;
				}
				.portrait {
					max-width: 70px;
				}
			}
			.beastName {
				color: var(--appColorBlack);
				font-size: 1rem;
				font-weight: bold;
				padding-top: 4px;
				max-width: 120px;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
		}
	}
	@media only screen and (min-width: 767px) {
		.HLContainer {
			height: 100vh;
		}
		.sect1 {
			.searchArea {
				margin: 0 auto;
				padding-top: 15px;
				width: 70%;
				.headButton {
					&:hover {
						.searchImage {
							opacity: 0.5;
						}
						.openFiltersImage {
							opacity: 0.5;
						}
					}
				}
				.openFiltersButton {
					&.open {
						.openFiltersImage {
							opacity: 0.7;
						}
					}
				}
			}
			.filterArea {
				top: 100px;
				width: 700px;
			}
		}
	}
</style>
