<script>
	import { getContext, onMount, createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import AppData from '../stores/AppData.js';
	import HeroData from '../stores/HeroData.js';
	import ModalCloseButton from '../modals/ModalCloseButton.svelte';
	import HeroDetail from '../modals/HeroDetail.svelte';
	import SIFurnBox from '../shared/SIFurnBox.svelte';
	import TutorialBox from '../shared/TutorialBox.svelte';

	const { open } = getContext('simple-modal');
	const dispatch = createEventDispatcher();
	let displayList = [];
	let openFilters = false;
	$: allFactionsEnabled = $AppData.HL.ShowLB && $AppData.HL.ShowM && $AppData.HL.ShowW && $AppData.HL.ShowGB && $AppData.HL.ShowC && $AppData.HL.ShowH && $AppData.HL.ShowD;
	$: allTypesEnabled = $AppData.HL.ShowInt && $AppData.HL.ShowAgi && $AppData.HL.ShowStr;
	$: allClassEnabled = $AppData.HL.ShowMage && $AppData.HL.ShowWar && $AppData.HL.ShowTank && $AppData.HL.ShowSup && $AppData.HL.ShowRan;

	onMount(async () => {
		displayList = sortDisplayList($AppData.HL.Sort, $AppData.HL.Order, makeDisplayList());
		dispatch('saveData');
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
				si_benchmark: hero.si_benchmark,
				furn_benchmark: hero.furn_benchmark,
			});
		}
		return retVal;
	}

	function updateFilters(filter) {
		$AppData.HL[filter] = !$AppData.HL[filter];
		displayList = sortDisplayList($AppData.HL.Sort, $AppData.HL.Order, makeDisplayList());
		dispatch('saveData');
	}

	function updateSearch() {
		displayList = sortDisplayList($AppData.HL.Sort, $AppData.HL.Order, makeDisplayList());
		dispatch('saveData');
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
		open(HeroDetail, 
		{ heroID: heroID, },
		{ closeButton: ModalCloseButton,
			styleContent: {background: '#F0F0F2', padding: 0, borderRadius: '10px'},
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
		dispatch('saveData');
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
		dispatch('saveData');
	}

	function handlePortraitClick(heroID) {
		$AppData.MH.List[heroID].claimed = !$AppData.MH.List[heroID].claimed;
		dispatch('saveData');
	}

	function isCharacterKeyPress(event) {
		let keycode = event.keyCode;
		let valid = 
			(keycode > 47 && keycode < 58)   || // number keys
			(keycode > 64 && keycode < 91)   || // letter keys
			(keycode > 95 && keycode < 112)  || // numpad keys
			(keycode > 185 && keycode < 193) || // ;=,-./` (in order)
			(keycode > 218 && keycode < 223) || // [\]' (in order)
			(keycode === 9);										// tab
		return valid;
	}

	function dynamicSearch(event) {
		if(isCharacterKeyPress(event)) {
			if(event.keyCode === 9) {
				// tab pressed, toggle openFilters
				openFilters = !openFilters;
				openFilters ? document.querySelector('#searchBox').focus() : document.querySelector('#searchBox').blur();
			} else if(!openFilters) {
				openFilters = true;
				$AppData.HL.SearchStr = $AppData.HL.SearchStr + event.key;
				document.querySelector('#searchBox').focus();
				updateSearch();
			}
		}
	}
</script>

<svelte:window on:keyup={dynamicSearch} />

<div class="HLContainer">
	<section class="sect1">
		<div class="mobileExpander" class:filterOpen={openFilters}>
			<div class="searchContainer">
				<div class="search">
					<input id="searchBox" type="search" placeholder="Search" bind:value={$AppData.HL.SearchStr} on:keyup={updateSearch} on:search={updateSearch}>
				</div>
			</div>
			<div class="filters">
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
		</div>
		<div class="mobileExpanderTitle">
			<button type="button" class="filtersButton" on:click={() => openFilters = !openFilters}><i class="arrow {openFilters ? 'open' : 'right' }"></i><span>Search and Filters</span></button>
			<div class="tooltip tooltip-expander"><span class="tooltipText">Filters</span></div>
		</div>
	</section>
	<section class="sect2">
		{#if !$AppData.dismissHLSearchInfo}
			<div class="searchInfo" transition:fade="{{duration: 200}}">
				<div class="tutorialBoxContainer">
					<TutorialBox clickable={true} onClick={() => {$AppData.dismissHLSearchInfo = true; dispatch('saveData');}}>
						Just start typing to search! Pressing tab will also open and close the filter area.
					</TutorialBox>
				</div>
			</div>
		{/if}
		<div class='tableContainer'>
			<table class='heroTable'>
				<thead>
					<th class="sortHeader" on:click={() => handleHeaderClick('name')}>Hero</th>
					<th class="nonSortHeader">Attributes</th>
					<th class="sortHeader" on:click={() => handleHeaderClick('si')}>SI <span class="hiddenMobile">Benchmark</span></th>
					<th class="sortHeader" on:click={() => handleHeaderClick('furn')}>Furn <span class="hiddenMobile">Benchmark</span></th>
				</thead>
				{#each displayList as hero (hero.id)}
				<tr class="heroRow" on:click={() => handleHeroClick(hero.id)} animate:flip="{{duration: 200}}">
					<td>
						<img on:click={(e) => { handlePortraitClick(hero.id); e.stopPropagation();} } class="portrait" class:owned={$AppData.MH.List[hero.id].claimed} src={hero.portrait} alt={hero.name}>
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
								<img class="attrImage" src="./img/classes/{hero.class.toLowerCase()}.png" alt={hero.class}>
								<div class="tooltip tooltip-bot"><span class="tooltipText">{hero.class}</span></div>
							</div>
						</div>
					</td>
					<td>
						<SIFurnBox type='si' num={hero.si_benchmark} maxWidth='58px' />
					</td>
					<td>
						<SIFurnBox type='furn' num={hero.furn_benchmark} maxWidth='58px' />
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
		height: calc(100vh - 85px);
		padding-top: 10px;
		overflow-y: auto;
		width: 100%;
	}
	.sect1 {
		bottom: 0;
		left: 0;
		position: fixed;
		width: 100%;
		z-index: 1;
	}
	.sect2 {
		padding: 10px;
	}
	input {
		border: 1px solid var(--appColorPrimary);
		border-radius: 5px;
		transition: box-shadow 0.1s;
		&:focus {
			border-color: var(--appColorPrimary);
			box-shadow: 0 0 0 2px var(--appColorPrimary);
			outline: 0;
		}
	}
	.searchInfo {
		display: none;
		visibility: hidden;
	}
	.filtersButton {
		background-color: var(--appColorSecondary);
		border: none;
		color: black;
		cursor: pointer;
		font-size: 1.1rem;
		outline: none;
		padding: 10px;
		text-align: left;
		width: 100%;
	}
	.arrow {
		border: solid black;
		border-width: 0 3px 3px 0;
		display: inline-block;
		margin-right: 16px;
		padding: 3px;
		transition: transform 0.2s ease-out;
	}
	.arrow.right {
		transform: rotate(-45deg);
	}
	.arrow.open {
		transform: rotate(-135deg);
	}
	.filters {
		display: flex;
		flex-direction: row;
		height: 500px;
		width: 100%;
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 100%;
	}
	.mobileExpander {
		background-color: var(--appBGColor);
		max-height: 0;
		overflow: hidden;
		transition: max-height 0.2s ease;
	}
	.mobileExpander.filterOpen {
		box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.15);
		max-height: 500px;
	}
	.searchContainer {
		border-bottom: 1px solid black;
		padding-bottom: 15px;
		padding-top: 15px;
		text-align: center;
		.search {
			display: inline-block;
			width: 100%;
			input {
				height: 1.6rem;
				width: 50%;
			}
		}
	}
	.filterMasterButton {
		align-items: center;
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
		text-decoration: none;
		transition: all .3s;
		width: 33px;
		&:active {
			background-color: var(--appColorPriDark);
			border-color: var(--appColorPriDark);
			color: white;
		}
	}
	.filterMasterDisabled {
		border-color: #888;
		color: #888;
		&:active {
			background-color: #666;
			border-color: #666;
			color: white;
		}
	}
	.filterSection {
		border-bottom: 1px solid black;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: center;
		padding-bottom: 7px;
		padding-left: 10px;
		width: 100%;
		.filterButton {
			background: transparent;
			border: 0;
			cursor: pointer;
			display: block;
			margin-right: 10px;
			margin-top: 7px;
			.filterImg {
				max-width: 33px;
			}
		}
		.filterInactive {
			filter: grayscale(100%);
		}
	}
	.tableContainer {
		display: flex;
		justify-content: center;
		width: 100%;
	}
	table {
		border-radius: 6px;
		border-spacing: 0;
		box-shadow: 0px 0px 30px rgba(0, 0, 0, 0.15);
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
	.hiddenMobile {
		display: none;
		visibility: hidden;
	}
	.portrait {
		border-radius: 50%;
		cursor: pointer;
		max-width: 70px;
		transition: all 0.2s cubic-bezier(0.2, 0, 0.4, 0);
		&:active {
			transform: scale(0.9);
		}
	}
	.portrait.owned {
		border: 5px solid var(--appColorPrimary);
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
			display: flex;
			flex-direction: row;
			height: calc(100vh - 45px);
		}
		.sect1 {
			display: flex;
			flex-direction: row;
			left: 0;
			max-height: max-content;
			position: fixed;
			top: 150px;
			width: max-content;
		}
		.sect2 {
			padding: 0;
			padding-left: 50px;
			width: 100%;
		}
		.searchInfo {
			display: flex;
			justify-content: center;
			margin-bottom: 10px;
			visibility: visible;
			width: 100%;
		}
		.tutorialBoxContainer {
			width: 50%;
		}
		.mobileExpanderTitle {
			height: auto;
			width: 35px;
		}
		.filtersButton {
			border-radius: 0 50px 50px 0;
			box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.25);
			height: 50px;
			span {
				display: none;
			}
			&:hover+.tooltip {
				opacity: 1;
				visibility: visible;
			}
		}
		.mobileExpander {
			background-color: var(--appBGColor);
			max-height: max-content;
			max-width: 0;
			overflow: none;
			transition: max-width 0.2s ease;
		}
		.mobileExpander.filterOpen {
			box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.25);
			max-height: max-content;
			max-width: 100%;
			padding: 10px;
		}
		.arrow.open {
			transform: rotate(135deg);
		}
		.searchContainer {
			padding-bottom: 20px;
			padding-top: 10px;
			text-align: center;
			.search {
				display: inline-block;
				input {
					height: 1.5rem;
					width: 220px;
				}
			}
		}
		.filters {
			display: flex;
			flex-direction: row;
			padding-top: 10px;
		}
		.filterSection {
			border: 0;
			display: block;
			padding: 0;
			width: 33%;
			.filterMasterButton {
				margin: 0 auto;
				margin-bottom: 10px;
				&:hover {
					background-color: var(--appColorPrimary);
					color: rgba(255, 255, 255, 0.9);
				}
			}
			.filterMasterDisabled {
				&:hover {
					background-color: #888;
					color: rgba(255, 255, 255, 0.9);
				}
			}
			.filterButton {
				margin: 0 auto;
				margin-bottom: 10px;
			}
		}
		.hiddenMobile {
			display: inline-block;
			visibility: visible;
		}
		.heroTable {
			max-width: 1500px;
		}
		table {
			width: 90%;
		}
		.sortHeader {
			&:hover {
				background-color: var(--appColorPriAccent);
			}
		}
		.heroRow {
			transition: background-color 0.4s;
			&:hover {
				background-color: var(--appColorQuaternary);
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
		.tooltip-expander {
			top: -35px;
			left: 5px;
			width: fit-content;
		}
		.attrImage {
			&:hover+.tooltip {
				opacity: 1;
				visibility: visible;
			}
		}
		.mobileExpander.filterOpen+.mobileExpanderTitle {
			.tooltip {
				opacity: 0;
				visibility: hidden;
			}
		}
	}
	@media only screen and (min-width: 1200px) {
		table {
			width: 70%;
		}
	}
</style>
