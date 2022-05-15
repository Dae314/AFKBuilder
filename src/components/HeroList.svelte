<script>
	import { getContext, onMount, createEventDispatcher } from 'svelte';
	import { flip } from 'svelte/animate';
	import AppData from '../stores/AppData.js';
	import HeroData from '../stores/HeroData.js';
	import ModalCloseButton from '../modals/ModalCloseButton.svelte';
	import HeroDetail from '../modals/HeroDetail.svelte';
	import SIFurnEngBox from '../shared/SIFurnEngBox.svelte';

	export let isMobile = false;

	const { open } = getContext('simple-modal');
	const dispatch = createEventDispatcher();
	let showFilters = false;

	$: modalHeight = isMobile ? '75vh' : '80vh';
	$: allFactionsEnabled = $AppData.HL.ShowLB && $AppData.HL.ShowM && $AppData.HL.ShowW && $AppData.HL.ShowGB && $AppData.HL.ShowC && $AppData.HL.ShowH && $AppData.HL.ShowD;
	$: allTypesEnabled = $AppData.HL.ShowInt && $AppData.HL.ShowAgi && $AppData.HL.ShowStr;
	$: allClassEnabled = $AppData.HL.ShowMage && $AppData.HL.ShowWar && $AppData.HL.ShowTank && $AppData.HL.ShowSup && $AppData.HL.ShowRan;

	let displayList = [];
	let openFilters = false;

	onMount(async () => {
		displayList = sortDisplayList($AppData.HL.Sort, $AppData.HL.Order, makeDisplayList());
		$AppData.activeView = 'herolist';
		dispatch('routeEvent', {action: 'saveData'});
	});

	function makeDisplayList() {
		let retVal = [];
		let hero;
		for (let i = 0; i < $HeroData.length; i++) {
			hero = $HeroData[i];
			if(!$AppData.HL.ShowLB && hero.faction.toLowerCase() === 'lightbearer') continue;
			if(!$AppData.HL.ShowM && hero.faction.toLowerCase() === 'mauler') continue;
			if(!$AppData.HL.ShowW && hero.faction.toLowerCase() === 'wilder') continue;
			if(!$AppData.HL.ShowGB && hero.faction.toLowerCase() === 'graveborn') continue;
			if(!$AppData.HL.ShowC && hero.faction.toLowerCase() === 'celestial') continue;
			if(!$AppData.HL.ShowH && hero.faction.toLowerCase() === 'hypogean') continue;
			if(!$AppData.HL.ShowD && hero.faction.toLowerCase() === 'dimensional') continue;
			if(!$AppData.HL.ShowInt && hero.type.toLowerCase() === 'intelligence') continue;
			if(!$AppData.HL.ShowAgi && hero.type.toLowerCase() === 'agility') continue;
			if(!$AppData.HL.ShowStr && hero.type.toLowerCase() === 'strength') continue;
			if(!$AppData.HL.ShowMage && hero.class.toLowerCase() === 'mage') continue;
			if(!$AppData.HL.ShowWar && hero.class.toLowerCase() === 'warrior') continue;
			if(!$AppData.HL.ShowTank && hero.class.toLowerCase() === 'tank') continue;
			if(!$AppData.HL.ShowSup && hero.class.toLowerCase() === 'support') continue;
			if(!$AppData.HL.ShowRan && hero.class.toLowerCase() === 'ranger') continue;
			if($AppData.HL.SearchStr !== '' &&
				 !hero.name.toLowerCase().includes($AppData.HL.SearchStr.toLowerCase()) &&
				 !hero.class.toLowerCase().includes($AppData.HL.SearchStr.toLowerCase()) &&
				 !hero.faction.toLowerCase().includes($AppData.HL.SearchStr.toLowerCase()) &&
				 !hero.type.toLowerCase().includes($AppData.HL.SearchStr.toLowerCase())
				) continue;
			retVal.push({
				id: hero.id,
				name: hero.name,
				portrait: hero.portrait,
				class: hero.class,
				faction: hero.faction,
				type: hero.type,
				tier: hero.tier,
				si_benchmark: hero.si_benchmark,
				furn_benchmark: hero.furn_benchmark,
				engraving_benchmark: hero.engraving_benchmark,
			});
		}
		return retVal;
	}

	function updateFilters(filter) {
		$AppData.HL[filter] = !$AppData.HL[filter];
		displayList = sortDisplayList($AppData.HL.Sort, $AppData.HL.Order, makeDisplayList());
		dispatch('routeEvent', {action: 'saveData'});
	}

	function updateSearch() {
		displayList = sortDisplayList($AppData.HL.Sort, $AppData.HL.Order, makeDisplayList());
		dispatch('routeEvent', {action: 'saveData'});
	}

	function sortDisplayList(col, order, displayList) {
		switch(col) {
			case 'portrait':
			case 'name':
				return [...displayList].sort(compareValues('name', order));
				break;
			case 'si':
				return [...displayList].sort(compareValues('si_benchmark', order));
				break;
			case 'furn':
				return [...displayList].sort(compareValues('furn_benchmark', order));
				break;
			case 'engraving':
				return [...displayList].sort(compareValues('engraving_benchmark', order));
				break;
			default:
				throw new Error('Invalid Hero List sort column.');
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

	function handleHeroClick(heroID) {
		const bgColor = window.getComputedStyle(document.documentElement).getPropertyValue('--appBGColor');
		open(HeroDetail, 
		{ heroID: heroID, },
		{ closeButton: ModalCloseButton,
			styleWindow: { background: bgColor },
			styleContent: {background: bgColor, padding: 0, borderRadius: '10px', maxHeight: modalHeight,},
		});
	}

	function handleHeaderClick(col) {
		let order = '';
		if($AppData.HL.Sort === col) {
			order = $AppData.HL.Order === 'asc' ? 'desc' : 'asc';
		} else {
			order = 'asc';
		}
		displayList = sortDisplayList(col, order, makeDisplayList());
		$AppData.HL.Sort = col;
		$AppData.HL.Order = order;
		dispatch('routeEvent', {action: 'saveData'});
	}

	function handleFilterMasterButtonClick(category) {
		switch(category) {
			case 'faction':
				if(allFactionsEnabled) {
					$AppData.HL.ShowLB = false;
					$AppData.HL.ShowM = false;
					$AppData.HL.ShowW = false;
					$AppData.HL.ShowGB = false;
					$AppData.HL.ShowC = false;
					$AppData.HL.ShowH = false;
					$AppData.HL.ShowD = false;
				} else {
					$AppData.HL.ShowLB = true;
					$AppData.HL.ShowM = true;
					$AppData.HL.ShowW = true;
					$AppData.HL.ShowGB = true;
					$AppData.HL.ShowC = true;
					$AppData.HL.ShowH = true;
					$AppData.HL.ShowD = true;
				}
				break;
			case 'type':
				if(allTypesEnabled) {
					$AppData.HL.ShowInt = false;
					$AppData.HL.ShowAgi = false;
					$AppData.HL.ShowStr = false;
				} else {
					$AppData.HL.ShowInt = true;
					$AppData.HL.ShowAgi = true;
					$AppData.HL.ShowStr = true;
				}
				break;
			case 'class':
				if(allClassEnabled) {
					$AppData.HL.ShowMage = false;
					$AppData.HL.ShowWar = false;
					$AppData.HL.ShowTank = false;
					$AppData.HL.ShowSup = false;
					$AppData.HL.ShowRan = false;
				} else {
					$AppData.HL.ShowMage = true;
					$AppData.HL.ShowWar = true;
					$AppData.HL.ShowTank = true;
					$AppData.HL.ShowSup = true;
					$AppData.HL.ShowRan = true;
				}
				break;
			default:
				throw new Error(`Invalid category given to handleFilterMasterButtonClick(): ${category}`);
		}
		displayList = sortDisplayList($AppData.HL.Sort, $AppData.HL.Order, makeDisplayList());
		dispatch('routeEvent', {action: 'saveData'});
	}
</script>

<div class="HLContainer">
	<section class="sect1">
		<div class="searchArea">
			<input id="searchBox" type="search" placeholder="Search" bind:value={$AppData.HL.SearchStr} on:keyup={updateSearch} on:search={updateSearch}>
			<button type="button" class="headButton searchButton" on:click={updateSearch}>
				<img class="searchImage" class:light={$AppData.colorProfile === 'light'} src="./img/utility/search_white.png" alt="search" />
			</button>
			<button type="button" class="headButton openFiltersButton" class:open={showFilters} on:click={() => showFilters = !showFilters}>
				<img class="openFiltersImage" class:light={$AppData.colorProfile === 'light'} src="./img/utility/filter_white.png" alt="Open Filters">
			</button>
		</div>
		<div class="filterArea" class:open={showFilters}>
			<div class="filterSection">
				<button type="button" class="filterMasterButton { allFactionsEnabled ? '' : 'filterMasterDisabled' }" on:click={() => handleFilterMasterButtonClick('faction')}>ALL</button>
				<button type="button" class="filterButton" on:click={() => updateFilters('ShowLB')}>
					<img class="filterImg {$AppData.HL.ShowLB ? '' : 'filterInactive'}" src="./img/factions/lightbearer.png" alt="Lightbearer">
				</button>
				<button type="button" class="filterButton" on:click={() => updateFilters('ShowM')}>
					<img class="filterImg {$AppData.HL.ShowM ? '' : 'filterInactive'}" src="./img/factions/mauler.png" alt="Mauler">
				</button>
				<button type="button" class="filterButton" on:click={() => updateFilters('ShowW')}>
					<img class="filterImg {$AppData.HL.ShowW ? '' : 'filterInactive'}" src="./img/factions/wilder.png" alt="wilder">
				</button>
				<button type="button" class="filterButton" on:click={() => updateFilters('ShowGB')}>
					<img class="filterImg {$AppData.HL.ShowGB ? '' : 'filterInactive'}" src="./img/factions/graveborn.png" alt="Graveborn">
				</button>
				<button type="button" class="filterButton" on:click={() => updateFilters('ShowC')}>
					<img class="filterImg {$AppData.HL.ShowC ? '' : 'filterInactive'}" src="./img/factions/celestial.png" alt="Celestial">
				</button>
				<button type="button" class="filterButton" on:click={() => updateFilters('ShowH')}>
					<img class="filterImg {$AppData.HL.ShowH ? '' : 'filterInactive'}" src="./img/factions/hypogean.png" alt="Hypogean">
				</button>
				<button type="button" class="filterButton" on:click={() => updateFilters('ShowD')}>
					<img class="filterImg {$AppData.HL.ShowD ? '' : 'filterInactive'}" src="./img/factions/dimensional.png" alt="Dimensional">
				</button>
			</div>
			<div class="filterSection">
				<button type="button" class="filterMasterButton { allTypesEnabled ? '' : 'filterMasterDisabled' }" on:click={() => handleFilterMasterButtonClick('type')}>ALL</button>
				<button type="button" class="filterButton" on:click={() => updateFilters('ShowInt')}>
					<img class="filterImg {$AppData.HL.ShowInt ? '' : 'filterInactive'}" src="./img/types/intelligence.png" alt="Intelligence">
				</button>
				<button type="button" class="filterButton" on:click={() => updateFilters('ShowAgi')}>
					<img class="filterImg {$AppData.HL.ShowAgi ? '' : 'filterInactive'}" src="./img/types/agility.png" alt="Agility">
				</button>
				<button type="button" class="filterButton" on:click={() => updateFilters('ShowStr')}>
					<img class="filterImg {$AppData.HL.ShowStr ? '' : 'filterInactive'}" src="./img/types/strength.png" alt="Strength">
				</button>
			</div>
			<div class="filterSection">
				<button type="button" class="filterMasterButton { allClassEnabled ? '' : 'filterMasterDisabled' }" on:click={() => handleFilterMasterButtonClick('class')}>ALL</button>
				<button type="button" class="filterButton" on:click={() => updateFilters('ShowMage')}>
					<img class="filterImg {$AppData.HL.ShowMage ? '' : 'filterInactive'}" src="./img/classes/mage.png" alt="Mage">
				</button>
				<button type="button" class="filterButton" on:click={() => updateFilters('ShowWar')}>
					<img class="filterImg {$AppData.HL.ShowWar ? '' : 'filterInactive'}" src="./img/classes/warrior.png" alt="Warrior">
				</button>
				<button type="button" class="filterButton" on:click={() => updateFilters('ShowTank')}>
					<img class="filterImg {$AppData.HL.ShowTank ? '' : 'filterInactive'}" src="./img/classes/tank.png" alt="Tank">
				</button>
				<button type="button" class="filterButton" on:click={() => updateFilters('ShowSup')}>
					<img class="filterImg {$AppData.HL.ShowSup ? '' : 'filterInactive'}" src="./img/classes/support.png" alt="Support">
				</button>
				<button type="button" class="filterButton" on:click={() => updateFilters('ShowRan')}>
					<img class="filterImg {$AppData.HL.ShowRan ? '' : 'filterInactive'}" src="./img/classes/ranger.png" alt="Ranger">
				</button>
			</div>
		</div>
	</section>
	<section class="sect2">
		<div class='tableContainer'>
			<table class='heroTable'>
				<thead>
					<th class="sortHeader" on:click={() => handleHeaderClick('name')}>Hero</th>
					<th class="nonSortHeader">Attributes</th>
					<th class="sortHeader" on:click={() => handleHeaderClick('si')}>SI <span class="spanHiddenMobile">Benchmark</span></th>
					<th class="sortHeader" on:click={() => handleHeaderClick('furn')}>Furn <span class="spanHiddenMobile">Benchmark</span></th>
					<th class="sortHeader blockHiddenMobile" on:click={() => handleHeaderClick('engraving')}>Eng. <span class="spanHiddenMobile">Benchmark</span></th>
				</thead>
				{#each displayList as hero (hero.id)}
				<tr class="heroRow" on:click={() => handleHeroClick(hero.id)} animate:flip="{{duration: 200}}">
					<td>
						<img class="portrait" src={hero.portrait} alt={hero.name}>
						<p class="heroName">{hero.name}</p>
					</td>
					<td class="attrArea">
						<div class="factionArea">
							<div class="attrImgContainer">
								<img class="attrImage factionImg" src="./img/factions/{hero.faction.toLowerCase()}.png" alt="{hero.faction}">
								<div class="tooltip tooltip-top"><span class="tooltipText">{hero.faction}</span></div>
							</div>
						</div>
						<div class="typeClassArea">
							<div class="attrImgContainer">
								<img class="attrImage" src="./img/types/{hero.type.toLowerCase()}.png" alt={hero.type}>
								<div class="tooltip tooltip-bot"><span class="tooltipText">{hero.type}</span></div>
							</div>
							<div class="attrImgContainer">
								{#if hero.tier === 'legendary'}
									<img class="attrImage" src="./img/classes/fodder_{hero.class.toLowerCase()}.png" alt={hero.class}>
								{:else}
									<img class="attrImage" src="./img/classes/{hero.class.toLowerCase()}.png" alt={hero.class}>
								{/if}
								<div class="tooltip tooltip-bot"><span class="tooltipText">{hero.class}</span></div>
							</div>
						</div>
					</td>
					<td>
						<SIFurnEngBox type='si' num={hero.si_benchmark} maxWidth='58px' />
					</td>
					<td>
						<SIFurnEngBox type='furn' num={hero.furn_benchmark} maxWidth='58px' />
					</td>
					<td class="blockHiddenMobile">
						<SIFurnEngBox type='engraving' num={hero.engraving_benchmark} maxWidth='58px' />
					</td>
				</tr>
				{/each}
			</table>
		</div>
	</section>
</div>

<style lang="scss">
	.HLContainer {
		display: flex;
		flex-direction: column;
		height: 100%;
		height: calc(var(--vh, 1vh) * 100 - var(--headerHeight)); /* gymnastics to set height for mobile browsers */
		overflow-y: auto;
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
			display: flex;
			flex-direction: row;
			background: var(--appBGColor);
			border-radius: 10px;
			box-shadow: var(--neu-sm-i-BGColor-shadow);
			display: flex;
			flex-direction: column;
			left: 50%;
			opacity: 0;
			position: absolute;
			top: 115px;
			transform: translate(-50%, 0);
			transition: all 0.2s;
			visibility: hidden;
			width: 90%;
			z-index: 2;
			.filterSection {
				border-bottom: 1px solid black;
				display: flex;
				flex-direction: row;
				flex-wrap: wrap;
				justify-content: center;
				padding-bottom: 7px;
				padding-left: 10px;
				width: 100%;
				&:last-child {
					border-bottom: none;
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
	.tableContainer {
		display: flex;
		justify-content: center;
		padding-top: 10px;
		width: 100%;
	}
	table {
		border-radius: 10px;
		border-spacing: 0;
		box-shadow: var(--neu-large-ni-BGColor-shadow);
		margin: 0;
		padding: 0;
		table-layout: fixed;
		width: 100%;
		th {
			font-size: 0.9rem;
			letter-spacing: .08rem;
			text-transform: uppercase;
			padding: 10px 0px;
			text-align: center;
			&:first-child {
				border-radius: 6px 0 0 0;
			}
			&:last-child {
				border-radius: 0 6px 0 0;
			}
		}
		td {
			padding: 10px 0px;
			text-align: center;
			p {
				margin: 0;
			}
		}
	}
	.sortHeader {
		cursor: pointer;
	}
	.heroRow {
		cursor: pointer;
	}
	.spanHiddenMobile {
		display: none;
		visibility: hidden;
	}
	.blockHiddenMobile {
		display: none;
		visibility: hidden;
	}
	.portrait {
		border-radius: 50%;
		max-width: 70px;
		transition: all 0.2s cubic-bezier(0.2, 0, 0.4, 0);
	}
	.heroName {
		font-weight: bold;
		padding-top: 4px;
	}
	.attrArea {
		align-items: center;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}
	.factionArea {
		height: 50%;
	}
	.typeClassArea {
		display: flex;
		height: 50%;
	}
	.attrImgContainer {
		position: relative;
		margin: 0px 5px;
	}
	.attrImage {
		max-width: 40px;
	}
	.factionImg {
		max-width: 70px;
	}
	.tooltip {
		display: none;
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
				top: 75px;
				width: 700px;
				.filterMasterButton {
					&:hover {
						background-color: var(--appColorPrimary);
						color: rgba(255, 255, 255, 0.9);
					}
					&.filterMasterDisabled {
						&:hover {
							background-color: #888;
							color: rgba(255, 255, 255, 0.9);
						}
					}
				}
			}
		}
		.spanHiddenMobile {
			display: inline-block;
			visibility: visible;
		}
		.blockHiddenMobile {
			display: block;
			visibility: visible;
		}
		.heroTable {
			max-width: 1500px;
		}
		table {
			width: 90%;
		}
		.sortHeader {
			transition: all 0.2s;
			&:hover {
				box-shadow: var(--neu-med-i-BGColor-shadow);
				transition: none;
			}
		}
		.heroRow {
			transition: all 0.2s;
			&:hover {
				box-shadow: var(--neu-med-i-BGColor-shadow);
				transition: none;
			}
		}
		.tooltip {
			display: flex;
			justify-content: center;
			opacity: 0;
			position: absolute;
			transition: opacity 0.2s;
			visibility: hidden;
			width: 200px;
			z-index: 1;
			.tooltipText {
				background-color: var(--appColorPrimary);
				border-radius: 6px;
				color: white;
				padding: 5px;
				text-align: center;
				user-select: none;
			}
		}
		.tooltip-top {
			top: 18px;
			left: 70px;
			width: fit-content;
		}
		.tooltip-bot {
			bottom: -30px;
			left: -80px;
		}
		.attrImage {
			&:hover+.tooltip {
				opacity: 1;
				visibility: visible;
			}
		}
	}
	@media only screen and (min-width: 1200px) {
		table {
			width: 70%;
		}
	}
</style>
