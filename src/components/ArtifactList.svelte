<script>
	import { getContext, onMount, createEventDispatcher } from 'svelte';
	import { flip } from 'svelte/animate';
	import AppData from '../stores/AppData.js';
	import Artifacts from '../stores/Artifacts.js';
	import ModalCloseButton from '../modals/ModalCloseButton.svelte';
	import ArtifactDetail from '../modals/ArtifactDetail.svelte';

	export let isMobile = false;

	const { open } = getContext('simple-modal');
	const dispatch = createEventDispatcher();
	let showFilters = false;

	$: modalHeight = isMobile ? '75vh' : '80vh';
	$: allClassEnabled = $AppData.HL.ArtiShowMage && $AppData.HL.ArtiShowWar && $AppData.HL.ArtiShowTank && $AppData.HL.ArtiShowSup && $AppData.HL.ArtiShowRan;

	let displayList = [];

	onMount(async () => {
		displayList = sortDisplayList($AppData.HL.ArtiSort, $AppData.HL.ArtiOrder, makeDisplayList());
	});

	function makeDisplayList() {
		let retVal = [];
		let artiIDs = Object.keys($Artifacts);
		let arti;

		for (let i = 0; i < artiIDs.length; i++) {
			arti = $Artifacts[artiIDs[i]];
			// if all classes are disabled, don't show anything
			if(!($AppData.HL.ArtiShowMage || $AppData.HL.ArtiShowWar || $AppData.HL.ArtiShowTank || $AppData.HL.ArtiShowSup || $AppData.HL.ArtiShowRan)) continue;
			if(!$AppData.HL.ArtiShowMage && arti.class.toLowerCase() === 'mage') continue;
			if(!$AppData.HL.ArtiShowWar && arti.class.toLowerCase() === 'warrior') continue;
			if(!$AppData.HL.ArtiShowTank && arti.class.toLowerCase() === 'tank') continue;
			if(!$AppData.HL.ArtiShowSup && arti.class.toLowerCase() === 'support') continue;
			if(!$AppData.HL.ArtiShowRan && arti.class.toLowerCase() === 'ranger') continue;
			if($AppData.HL.ArtiSearch !== '' &&
				 !arti.name.toLowerCase().includes($AppData.HL.ArtiSearch.toLowerCase())
				) continue;
			retVal.push({
				id: artiIDs[i],
				name: arti.name,
				image: arti.image,
				class: arti.class,
			});
		}
		return retVal;
	}

	function sortDisplayList(col, order, displayList) {
		switch(col) {
			case 'image':
			case 'name':
				return [...displayList].sort(compareValues('name', order));
				break;
			default:
				throw new Error('Invalid Artifact List sort column.');
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

	function updateSearch() {
		displayList = sortDisplayList($AppData.HL.ArtiSort, $AppData.HL.ArtiOrder, makeDisplayList());
		dispatch('routeEvent', {action: 'saveData'});
	}

	function updateSort(order) {
		$AppData.HL.ArtiOrder = order;
		displayList = sortDisplayList($AppData.HL.ArtiSort, $AppData.HL.ArtiOrder, makeDisplayList());
		dispatch('routeEvent', {action: 'saveData'});
	}

	function updateFilters(filter) {
		$AppData.HL[filter] = !$AppData.HL[filter];
		displayList = sortDisplayList($AppData.HL.Sort, $AppData.HL.Order, makeDisplayList());
		dispatch('routeEvent', {action: 'saveData'});
	}

	function handleFilterMasterButtonClick(category) {
		switch(category) {
			case 'class':
				if(allClassEnabled) {
					$AppData.HL.ArtiShowMage = false;
					$AppData.HL.ArtiShowWar = false;
					$AppData.HL.ArtiShowTank = false;
					$AppData.HL.ArtiShowSup = false;
					$AppData.HL.ArtiShowRan = false;
				} else {
					$AppData.HL.ArtiShowMage = true;
					$AppData.HL.ArtiShowWar = true;
					$AppData.HL.ArtiShowTank = true;
					$AppData.HL.ArtiShowSup = true;
					$AppData.HL.ArtiShowRan = true;
				}
				break;
			default:
				throw new Error(`Invalid category given to handleFilterMasterButtonClick(): ${category}`);
		}
		displayList = sortDisplayList($AppData.HL.ArtiSort, $AppData.HL.ArtiOrder, makeDisplayList());
		dispatch('routeEvent', {action: 'saveData'});
	}

	function handleArtiClick(artiID) {
		const bgColor = window.getComputedStyle(document.documentElement).getPropertyValue('--appBGColor');
		open(ArtifactDetail, 
		{ artifactID: artiID, },
		{ closeButton: ModalCloseButton,
			styleWindow: { background: bgColor },
			styleContent: {background: bgColor, padding: 0, borderRadius: '10px', maxHeight: modalHeight,},
		});
	}
</script>

<div class="ArtiContainer">
	<section class="sect1">
		<div class="searchArea">
			<input id="searchBox" type="search" placeholder="Search" bind:value={$AppData.HL.ArtiSearch} on:keyup={updateSearch} on:search={updateSearch}>
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
					<button type="button" class="sortButton" class:selected={$AppData.HL.ArtiOrder === 'asc'} on:click={() => updateSort('asc')}>
						<p>A-Z</p>
					</button>
					<button type="button" class="sortButton" class:selected={$AppData.HL.ArtiOrder === 'desc'} on:click={() => updateSort('desc')}>
						<p>Z-A</p>
					</button>
				</div>
			</div>
			<div class="filterSection classFilters">
				<button type="button" class="filterMasterButton { allClassEnabled ? '' : 'filterMasterDisabled' }" on:click={() => handleFilterMasterButtonClick('class')}>ALL</button>
				<button type="button" class="filterButton" on:click={() => updateFilters('ArtiShowMage')}>
					<img class="filterImg {$AppData.HL.ArtiShowMage ? '' : 'filterInactive'}" src="./img/classes/mage.png" alt="Mage">
				</button>
				<button type="button" class="filterButton" on:click={() => updateFilters('ArtiShowWar')}>
					<img class="filterImg {$AppData.HL.ArtiShowWar ? '' : 'filterInactive'}" src="./img/classes/warrior.png" alt="Warrior">
				</button>
				<button type="button" class="filterButton" on:click={() => updateFilters('ArtiShowTank')}>
					<img class="filterImg {$AppData.HL.ArtiShowTank ? '' : 'filterInactive'}" src="./img/classes/tank.png" alt="Tank">
				</button>
				<button type="button" class="filterButton" on:click={() => updateFilters('ArtiShowSup')}>
					<img class="filterImg {$AppData.HL.ArtiShowSup ? '' : 'filterInactive'}" src="./img/classes/support.png" alt="Support">
				</button>
				<button type="button" class="filterButton" on:click={() => updateFilters('ArtiShowRan')}>
					<img class="filterImg {$AppData.HL.ArtiShowRan ? '' : 'filterInactive'}" src="./img/classes/ranger.png" alt="Ranger">
				</button>
			</div>
		</div>
	</section>
	<section class="sect2">
		<div class='artiGrid'>
			{#each displayList as arti (arti.id)}
				<button type="button" class="artiButton" on:click={() => handleArtiClick(arti.id)} animate:flip="{{duration: 200}}">
					<div class="artiCard">
						<div class="classArea">
							{#if arti.class === 'Any'}
								<div class="allClasses">ANY</div>
							{:else}
								<img draggable="false" class="classImage" src="./img/classes/{arti.class.toLowerCase()}.png" alt={arti.class}>
							{/if}
						</div>
						<div class="imageContainer">
							<img draggable="false" class="portrait" src={arti.image} alt={arti.name}>
						</div>
						<p class="artiName">{arti.name}</p>
					</div>
				</button>
			{/each}
		</div>
	</section>
</div>

<style lang="scss">
	.ArtiContainer {
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
				&.classFilters {
					flex-direction: row;
					justify-content: center;
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
			.filterMasterButton {
				align-items: center;
				background: var(--appBGColor);
				border: 3px solid var(--appColorPrimary);
				border-radius: 50%;
				color: var(--appColorPrimary);
				cursor: pointer;
				display: flex;
				font-size: 0.6rem;
				height: 33px;
				justify-content: center;
				margin-right: 15px;
				margin-top: 7px;
				padding: 0;
				text-decoration: none;
				transition: all .3s;
				width: 33px;
				&:active {
					background-color: var(--appColorPriDark);
					border-color: var(--appColorPriDark);
					color: white;
				}
				&.filterMasterDisabled {
					border-color: #888;
					color: #888;
					&:active {
						background-color: #666;
						border-color: #666;
						color: white;
					}
				}
			}
			.filterButton {
				background: transparent;
				border: 0;
				cursor: pointer;
				display: block;
				margin-right: 10px;
				margin-top: 7px;
				padding: 0;
				.filterImg {
					max-width: 33px;
					&.filterInactive {
						filter: grayscale(100%);
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
	.artiGrid {
		display: grid;
		grid-gap: 20px 20px;
		grid-template-columns: repeat(auto-fill, minmax(150px, 150px));
		grid-auto-rows: 175px;
		justify-content: space-evenly;
		padding-top: 10px;
		width: 100%;
		.artiButton {
			background: transparent;
			border: none;
			cursor: pointer;
			outline: none;
		}
		.artiCard {
			align-items: center;
			background: var(--appBGColor);
			border-radius: 10px;
			box-shadow: var(--neu-med-i-BGColor-shadow);
			display: flex;
			flex-direction: column;
			height: 100%;
			padding: 5px;
			justify-content: center;
			width: 100%;
			.classArea {
				display: flex;
				justify-content: flex-end;
				margin-bottom: 5px;
				width: 100%;
				.allClasses {
					align-items: center;
					background: var(--appBGColor);
					border: 3px solid var(--appColorPrimary);
					border-radius: 50%;
					color: var(--appColorPrimary);
					display: flex;
					font-size: 0.6rem;
					font-weight: bold;
					height: 33px;
					justify-content: center;
					padding: 0;
					text-decoration: none;
					width: 33px;
				}
				.classImage {
					max-width: 33px;
				}
			}
			.imageContainer {
				align-items: center;
				display: flex;
				justify-content: center;
				.portrait {
					border-radius: 50%;
					height: 70px;
					width: 70px;
					max-width: 70px;
				}
			}
			.artiName {
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
		.ArtiContainer {
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
