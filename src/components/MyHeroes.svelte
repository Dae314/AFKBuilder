<script>
	import { getContext, createEventDispatcher } from 'svelte';
	import { flip } from 'svelte/animate';
	import JSONURL from 'json-url';
	import AppData from '../stores/AppData.js';
	import HeroData from '../stores/HeroData.js';
	import ModalCloseButton from '../modals/ModalCloseButton.svelte';
	import ImportData from '../modals/ImportData.svelte';
	import HeroDetail from '../modals/HeroDetail.svelte';
	import TutorialBox from '../shared/TutorialBox.svelte';
	import XButton from '../shared/XButton.svelte';
	import AscensionMenu from '../shared/AscensionMenu.svelte';
	import SIMenu from '../shared/SIMenu.svelte';
	import FurnMenu from '../shared/FurnMenu.svelte';
	import EngraveInput from '../shared/EngraveInput.svelte';
	import CopiesInput from '../shared/CopiesInput.svelte';
	import StarsInput from '../shared/StarsInput.svelte';
	import HRadioPicker from '../shared/HRadioPicker.svelte';

	export let isMobile = false;

	const dispatch = createEventDispatcher();
	const jsurl = JSONURL('lzma'); // json-url compressor
	const { open } = getContext('simple-modal');

	$: myHeroList = makeMyHeroList($AppData.MH.List);
	$: unownedHeroList = makeUnownedHeroList($AppData.MH.List);
	$: allFactionsEnabled = $AppData.MH.ShowLB && $AppData.MH.ShowM && $AppData.MH.ShowW && $AppData.MH.ShowGB && $AppData.MH.ShowC && $AppData.MH.ShowH && $AppData.MH.ShowD;
	$: allTypesEnabled = $AppData.MH.ShowInt && $AppData.MH.ShowAgi && $AppData.MH.ShowStr;
	$: allClassEnabled = $AppData.MH.ShowMage && $AppData.MH.ShowWar && $AppData.MH.ShowTank && $AppData.MH.ShowSup && $AppData.MH.ShowRan;
	$: modalHeight = isMobile ? '75vh' : '80vh';

	let openFilters = false;
	let openInOutMenu = false;
	let copyConfirmVisible = false;
	let sections = ['Owned', 'Unowned'];
	let sortOptions = ['Name', 'Asc.', 'Copies', 'Eng.'];

	function sortToOptionIdx(sortType) {
		switch(sortType) {
			case 'name':
				return 0;
				break;
			case 'ascendLv':
				return 1;
				break;
			case 'copies':
				return 2;
				break;
			case 'engraving':
				return 3;
				break;
			default:
				throw new Error(`Invalid sort category specified: ${sortType}`);
		}
	}

	function makeMyHeroList(herolist) {
		let buffer = [];
		let hero;
		let sortOrder = 'desc';
		for(let key in herolist) {
			hero = $HeroData.find(e => e.id === key);
			if(!herolist[key].claimed) continue;
			if(!$AppData.MH.ShowLB && hero.faction.toLowerCase() === 'lightbearer') continue;
			if(!$AppData.MH.ShowM && hero.faction.toLowerCase() === 'mauler') continue;
			if(!$AppData.MH.ShowW && hero.faction.toLowerCase() === 'wilder') continue;
			if(!$AppData.MH.ShowGB && hero.faction.toLowerCase() === 'graveborn') continue;
			if(!$AppData.MH.ShowC && hero.faction.toLowerCase() === 'celestial') continue;
			if(!$AppData.MH.ShowH && hero.faction.toLowerCase() === 'hypogean') continue;
			if(!$AppData.MH.ShowD && hero.faction.toLowerCase() === 'dimensional') continue;
			if(!$AppData.MH.ShowInt && hero.type.toLowerCase() === 'intelligence') continue;
			if(!$AppData.MH.ShowAgi && hero.type.toLowerCase() === 'agility') continue;
			if(!$AppData.MH.ShowStr && hero.type.toLowerCase() === 'strength') continue;
			if(!$AppData.MH.ShowMage && hero.class.toLowerCase() === 'mage') continue;
			if(!$AppData.MH.ShowWar && hero.class.toLowerCase() === 'warrior') continue;
			if(!$AppData.MH.ShowTank && hero.class.toLowerCase() === 'tank') continue;
			if(!$AppData.MH.ShowSup && hero.class.toLowerCase() === 'support') continue;
			if(!$AppData.MH.ShowRan && hero.class.toLowerCase() === 'ranger') continue;
			if($AppData.MH.SearchStr !== '' &&
				 !hero.name.toLowerCase().includes($AppData.MH.SearchStr.toLowerCase()) &&
				 !hero.class.toLowerCase().includes($AppData.MH.SearchStr.toLowerCase()) &&
				 !hero.faction.toLowerCase().includes($AppData.MH.SearchStr.toLowerCase()) &&
				 !hero.type.toLowerCase().includes($AppData.MH.SearchStr.toLowerCase())
				) continue;
			hero = JSON.parse(JSON.stringify(hero)); // make a copy of hero so we don't mutate the original
			hero.ascendLv = herolist[key].ascendLv;
			hero.copies = herolist[key].copies;
			hero.stars = herolist[key].stars;
			hero.furn = herolist[key].furn;
			hero.si = herolist[key].si;
			hero.engraving = herolist[key].engraving;
			buffer.push(hero);
		}
		if($AppData.MH.Sort === 'name') sortOrder = 'asc';
		return buffer.length > 0 ? buffer.sort(compareValues($AppData.MH.Sort, sortOrder)) : buffer;
	}

	function makeUnownedHeroList(herolist) {
		let buffer = [];
		let hero;
		for(let key in herolist) {
			hero = $HeroData.find(e => e.id === key);
			if(herolist[key].claimed) continue;
			if(!$AppData.MH.ShowLB && hero.faction.toLowerCase() === 'lightbearer') continue;
			if(!$AppData.MH.ShowM && hero.faction.toLowerCase() === 'mauler') continue;
			if(!$AppData.MH.ShowW && hero.faction.toLowerCase() === 'wilder') continue;
			if(!$AppData.MH.ShowGB && hero.faction.toLowerCase() === 'graveborn') continue;
			if(!$AppData.MH.ShowC && hero.faction.toLowerCase() === 'celestial') continue;
			if(!$AppData.MH.ShowH && hero.faction.toLowerCase() === 'hypogean') continue;
			if(!$AppData.MH.ShowD && hero.faction.toLowerCase() === 'dimensional') continue;
			if(!$AppData.MH.ShowInt && hero.type.toLowerCase() === 'intelligence') continue;
			if(!$AppData.MH.ShowAgi && hero.type.toLowerCase() === 'agility') continue;
			if(!$AppData.MH.ShowStr && hero.type.toLowerCase() === 'strength') continue;
			if(!$AppData.MH.ShowMage && hero.class.toLowerCase() === 'mage') continue;
			if(!$AppData.MH.ShowWar && hero.class.toLowerCase() === 'warrior') continue;
			if(!$AppData.MH.ShowTank && hero.class.toLowerCase() === 'tank') continue;
			if(!$AppData.MH.ShowSup && hero.class.toLowerCase() === 'support') continue;
			if(!$AppData.MH.ShowRan && hero.class.toLowerCase() === 'ranger') continue;
			if($AppData.MH.SearchStr !== '' &&
				 !hero.name.toLowerCase().includes($AppData.MH.SearchStr.toLowerCase()) &&
				 !hero.class.toLowerCase().includes($AppData.MH.SearchStr.toLowerCase()) &&
				 !hero.faction.toLowerCase().includes($AppData.MH.SearchStr.toLowerCase()) &&
				 !hero.type.toLowerCase().includes($AppData.MH.SearchStr.toLowerCase())
				) continue;
			hero = JSON.parse(JSON.stringify(hero)); // make a copy of hero so we don't mutate the original
			hero.ascendLv = herolist[key].ascendLv;
			hero.copies = herolist[key].copies;
			hero.stars = herolist[key].stars;
			hero.furn = herolist[key].furn;
			hero.si = herolist[key].si;
			hero.engraving = herolist[key].engraving;
			buffer.push(hero);
		}
		return buffer.length > 0 ? buffer.sort(compareValues('name', 'asc')) : buffer;
	}

	function compareValues(key, order='asc') {
		return function innerSort(a, b) {
			if(!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
				// property doesn't exist on either object
				throw new Error(`Invalid My Heroes sort key specified: ${key}.`);
			}
			const varA = (typeof a[key] === 'string') ? a[key].toLowerCase() : a[key];
			const varB = (typeof b[key] === 'string') ? b[key].toLowerCase() : b[key];
			let comparison = 0;
			if(key === 'ascendLv') {
				if(varA > varB) {
					comparison = 1;
				} else if(varA < varB) {
					comparison = -1;
				} else {
					// ascension is the same, compare stars
					if(a.stars > b.stars) {
						comparison = 1;
					} else if(a.stars < b.stars) {
						comparison = -1;
					} else {
						// stars are the same, compare engraving
						if(a.engraving > b.engraving) {
							comparison = 1;
						} else {
							comparison = -1;
						}
					}
				}
			} else if(key === 'engraving') {
				if(varA > varB) {
					comparison = 1;
				} else if (varA < varB) {
					comparison = -1;
				} else {
					// engraving is the same, compare stars
					if(a. stars > b.stars) {
						comparison = 1;
					} else {
						comparison = -1;
					}
				}
			} else {
				if(varA > varB) {
					comparison = 1;
				} else {
					comparison = -1;
				}
			}
			return (
				(order === 'desc') ? (comparison * -1) : comparison
			);
		}
	}

	function updateSearch() {
		myHeroList = makeMyHeroList($AppData.MH.List);
		unownedHeroList = makeUnownedHeroList($AppData.MH.List);
		dispatch('saveData');
	}

	function updateFilters(filter) {
		$AppData.MH[filter] = !$AppData.MH[filter];
		myHeroList = makeMyHeroList($AppData.MH.List);
		unownedHeroList = makeUnownedHeroList($AppData.MH.List);
		dispatch('saveData');
	}

	function updateSort(event) {
		switch(sortOptions[event.detail.value]) {
			case 'Name':
				$AppData.MH.Sort = 'name';
				break;
			case 'Asc.':
				$AppData.MH.Sort = 'ascendLv';
				break;
			case 'Copies':
				$AppData.MH.Sort = 'copies';
				break;
			case 'Eng.':
				$AppData.MH.Sort = 'engraving';
				break;
			default:
				throw new Error(`Invalid sort category specified: ${sortOptions[event.detail.value]}`);
		}
		myHeroList = makeMyHeroList($AppData.MH.List);
		dispatch('saveData');
	}

	function handleFilterMasterButtonClick(category) {
		switch(category) {
			case 'faction':
				if(allFactionsEnabled) {
					$AppData.MH.ShowLB = false;
					$AppData.MH.ShowM = false;
					$AppData.MH.ShowW = false;
					$AppData.MH.ShowGB = false;
					$AppData.MH.ShowC = false;
					$AppData.MH.ShowH = false;
					$AppData.MH.ShowD = false;
				} else {
					$AppData.MH.ShowLB = true;
					$AppData.MH.ShowM = true;
					$AppData.MH.ShowW = true;
					$AppData.MH.ShowGB = true;
					$AppData.MH.ShowC = true;
					$AppData.MH.ShowH = true;
					$AppData.MH.ShowD = true;
				}
				break;
			case 'type':
				if(allTypesEnabled) {
					$AppData.MH.ShowInt = false;
					$AppData.MH.ShowAgi = false;
					$AppData.MH.ShowStr = false;
				} else {
					$AppData.MH.ShowInt = true;
					$AppData.MH.ShowAgi = true;
					$AppData.MH.ShowStr = true;
				}
				break;
			case 'class':
				if(allClassEnabled) {
					$AppData.MH.ShowMage = false;
					$AppData.MH.ShowWar = false;
					$AppData.MH.ShowTank = false;
					$AppData.MH.ShowSup = false;
					$AppData.MH.ShowRan = false;
				} else {
					$AppData.MH.ShowMage = true;
					$AppData.MH.ShowWar = true;
					$AppData.MH.ShowTank = true;
					$AppData.MH.ShowSup = true;
					$AppData.MH.ShowRan = true;
				}
				break;
			default:
				throw new Error(`Invalid category given to handleFilterMasterButtonClick(): ${category}`);
		}
		myHeroList = makeMyHeroList($AppData.MH.List);
		unownedHeroList = makeUnownedHeroList($AppData.MH.List);
		dispatch('saveData');
	}

	function handleHeroClaim(heroID) {
		$AppData.MH.List[heroID].claimed = true;
		$AppData.MH.List[heroID].ascendLv = $HeroData.find(e => e.id === heroID).tier === 'ascended' ? 6 : 5;
		$AppData.MH.List[heroID].si = -1;
		$AppData.MH.List[heroID].furn = 0;
		$AppData.MH.List[heroID].copies = 0;
		$AppData.MH.List[heroID].engraving = 0;
		$AppData.MH.List[heroID].stars = 0;
		myHeroList = makeMyHeroList($AppData.MH.List);
		unownedHeroList = makeUnownedHeroList($AppData.MH.List);
		dispatch('saveData');
	}

	function handleHeroUnclaim(heroID) {
		$AppData.MH.List[heroID].claimed = false;
		$AppData.MH.List[heroID].ascendLv = 0;
		$AppData.MH.List[heroID].si = -1;
		$AppData.MH.List[heroID].furn = 0;
		$AppData.MH.List[heroID].copies = 0;
		$AppData.MH.List[heroID].engraving = 0;
		$AppData.MH.List[heroID].stars = 0;
		myHeroList = makeMyHeroList($AppData.MH.List);
		unownedHeroList = makeUnownedHeroList($AppData.MH.List);
		dispatch('saveData');
	}

	function handleAscChange(heroID, level) {
		$AppData.MH.List[heroID].ascendLv = level;
		if($AppData.MH.List[heroID].ascendLv === 6) {
			$AppData.MH.List[heroID].copies = 0;
		}
		if($AppData.MH.List[heroID].ascendLv < 6) {
			$AppData.MH.List[heroID].furn = 0;
			$AppData.MH.List[heroID].stars = 0;
			$AppData.MH.List[heroID].engraving = 0;
		}
		if($AppData.MH.List[heroID].ascendLv < 4) {
			$AppData.MH.List[heroID].si = -1;
		}
		dispatch('saveData');
	}

	function handleSIChange(heroID, level) {
		$AppData.MH.List[heroID].si = level;
		dispatch('saveData');
	}

	function handleFurnChange(heroID, level) {
		$AppData.MH.List[heroID].furn = level;
		dispatch('saveData');
	}

	function handleNumChange() {
		dispatch('saveData');
	}

	async function handleMyHeroesInput(compressedData) {
		let data;

		// unpack and decompress data
		try {
			const json = await jsurl.decompress(compressedData);
			data = JSON.parse(json);
		} catch(e) {
			// there was a problem unpacking the data, return an error
			console.log(e);
			return {retCode: 1, message: 'Failed to parse data'};
		}

		// run consistency checks on data
		const returnObj = await validateMyHeroData(data);
		if(returnObj.retCode !== 0) {
			// validation error occurred
			return {retCode: returnObj.retCode, message: returnObj.message};
		} else {
			// message should contain a clean MH.List data object now
			$AppData.MH.List = returnObj.message;
			myHeroList = makeMyHeroList($AppData.MH.List);
			unownedHeroList = makeUnownedHeroList($AppData.MH.List);
			dispatch('saveData');
			return { retCode: 0, message: 'Data import successful' }
		}
	}
	
	function handleImportData() {
		open(ImportData, 
		{ dataHandler: handleMyHeroesInput,
			saveAppData: () => dispatch('saveData'),
			title: 'Paste My Hero Data:',
		},
		{ closeButton: ModalCloseButton,
			styleContent: {background: '#F0F0F2', padding: 0, borderRadius: '10px', maxHeight: modalHeight,},
		});
	}

	async function handleExportData() {
		const output = await jsurl.compress(JSON.stringify($AppData.MH.List));
		navigator.clipboard.writeText(output).then(() => {
			copyConfirmVisible = true;
			setTimeout(() => copyConfirmVisible = false, 1000);
		}, () => {
			throw new Error("Error copying Comp data to clipboard.");
		});
	}

	function isCharacterKeyPress(event) {
		let keycode = event.keyCode;
		let valid = 
			(keycode > 64 && keycode < 91)   || // letter keys
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
				$AppData.MH.SearchStr = $AppData.MH.SearchStr + event.key;
				document.querySelector('#searchBox').focus();
				updateSearch();
			}
		}
	}

	function handleHeroDetailClick(heroID) {
		open(HeroDetail, 
		{ heroID: heroID, },
		{ closeButton: ModalCloseButton,
			styleContent: {background: '#F0F0F2', padding: 0, borderRadius: '10px', maxHeight: modalHeight,},
		});
	}
</script>

<svelte:window on:keyup={dynamicSearch} />

<div class="MHContainer" on:click={() => openInOutMenu = false}>
	<section class="sect1">
		<div class="mobileExpander {openFilters ? 'filterOpen' : ''}">
			<div class="searchContainer">
				<div class="search">
					<input id="searchBox" type="search" placeholder="Search" bind:value={$AppData.MH.SearchStr} on:keyup={updateSearch} on:search={updateSearch}>
				</div>
			</div>
			<div class="sortContainer">
				<div class="sortTitle">Sort by:</div>
				<HRadioPicker
					options={sortOptions}
					curOption={sortToOptionIdx($AppData.MH.Sort)}
					on:change={updateSort}
					disabled={$AppData.MH.openSection !== 0}
				/>
			</div>
			<div class="filters">
				<div class="filterSection">
					<button type="button" class="filterMasterButton { allFactionsEnabled ? '' : 'filterMasterDisabled' }" on:click={() => handleFilterMasterButtonClick('faction')}>ALL</button>
					<button type="button" class="filterButton" on:click={() => updateFilters('ShowLB')}>
						<img class="filterImg {$AppData.MH.ShowLB ? '' : 'filterInactive'}" src="./img/factions/lightbearer.png" alt="Lightbearer">
					</button>
					<button type="button" class="filterButton" on:click={() => updateFilters('ShowM')}>
						<img class="filterImg {$AppData.MH.ShowM ? '' : 'filterInactive'}" src="./img/factions/mauler.png" alt="Mauler">
					</button>
					<button type="button" class="filterButton" on:click={() => updateFilters('ShowW')}>
						<img class="filterImg {$AppData.MH.ShowW ? '' : 'filterInactive'}" src="./img/factions/wilder.png" alt="wilder">
					</button>
					<button type="button" class="filterButton" on:click={() => updateFilters('ShowGB')}>
						<img class="filterImg {$AppData.MH.ShowGB ? '' : 'filterInactive'}" src="./img/factions/graveborn.png" alt="Graveborn">
					</button>
					<button type="button" class="filterButton" on:click={() => updateFilters('ShowC')}>
						<img class="filterImg {$AppData.MH.ShowC ? '' : 'filterInactive'}" src="./img/factions/celestial.png" alt="Celestial">
					</button>
					<button type="button" class="filterButton" on:click={() => updateFilters('ShowH')}>
						<img class="filterImg {$AppData.MH.ShowH ? '' : 'filterInactive'}" src="./img/factions/hypogean.png" alt="Hypogean">
					</button>
					<button type="button" class="filterButton" on:click={() => updateFilters('ShowD')}>
						<img class="filterImg {$AppData.MH.ShowD ? '' : 'filterInactive'}" src="./img/factions/dimensional.png" alt="Dimensional">
					</button>
				</div>
				<div class="filterSection">
					<button type="button" class="filterMasterButton { allTypesEnabled ? '' : 'filterMasterDisabled' }" on:click={() => handleFilterMasterButtonClick('type')}>ALL</button>
					<button type="button" class="filterButton" on:click={() => updateFilters('ShowInt')}>
						<img class="filterImg {$AppData.MH.ShowInt ? '' : 'filterInactive'}" src="./img/types/intelligence.png" alt="Intelligence">
					</button>
					<button type="button" class="filterButton" on:click={() => updateFilters('ShowAgi')}>
						<img class="filterImg {$AppData.MH.ShowAgi ? '' : 'filterInactive'}" src="./img/types/agility.png" alt="Agility">
					</button>
					<button type="button" class="filterButton" on:click={() => updateFilters('ShowStr')}>
						<img class="filterImg {$AppData.MH.ShowStr ? '' : 'filterInactive'}" src="./img/types/strength.png" alt="Strength">
					</button>
				</div>
				<div class="filterSection">
					<button type="button" class="filterMasterButton { allClassEnabled ? '' : 'filterMasterDisabled' }" on:click={() => handleFilterMasterButtonClick('class')}>ALL</button>
					<button type="button" class="filterButton" on:click={() => updateFilters('ShowMage')}>
						<img class="filterImg {$AppData.MH.ShowMage ? '' : 'filterInactive'}" src="./img/classes/mage.png" alt="Mage">
					</button>
					<button type="button" class="filterButton" on:click={() => updateFilters('ShowWar')}>
						<img class="filterImg {$AppData.MH.ShowWar ? '' : 'filterInactive'}" src="./img/classes/warrior.png" alt="Warrior">
					</button>
					<button type="button" class="filterButton" on:click={() => updateFilters('ShowTank')}>
						<img class="filterImg {$AppData.MH.ShowTank ? '' : 'filterInactive'}" src="./img/classes/tank.png" alt="Tank">
					</button>
					<button type="button" class="filterButton" on:click={() => updateFilters('ShowSup')}>
						<img class="filterImg {$AppData.MH.ShowSup ? '' : 'filterInactive'}" src="./img/classes/support.png" alt="Support">
					</button>
					<button type="button" class="filterButton" on:click={() => updateFilters('ShowRan')}>
						<img class="filterImg {$AppData.MH.ShowRan ? '' : 'filterInactive'}" src="./img/classes/ranger.png" alt="Ranger">
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
		{#if !$AppData.dismissMHSearchInfo}
			<div class="searchInfo">
				<div class="tutorialBoxContainer">
					<TutorialBox clickable={true} onClick={() => {$AppData.dismissMHSearchInfo = true; dispatch('saveData');}}>
						Just start typing to search! Pressing tab will also open and close the filter area.
					</TutorialBox>
				</div>
			</div>
		{/if}
		<div class="sectionPickerSection">
			<ul class="sectionPicker">
				{#each sections as section, i}
				<li>
					<button type="button" class="sectionButton" class:active={$AppData.MH.openSection === i} on:click={() => { $AppData.MH.openSection = i; dispatch('saveData');} }>{section}</button>
				</li>
				{/each}
			</ul>
		</div>
		{#if $AppData.MH.openSection === 0}
			<section class="MHSection">
				{#if myHeroList.length === 0}
					<div class="noHeroes">
						<span>Claim heroes from the unowned tab!</span>
					</div>
				{:else}
					<div class="MHGrid">
						{#each myHeroList as hero (hero.id)}
						<div class="heroCard" animate:flip="{{duration: 200}}">
							<div class="removeArea">
								<div class="removeHeroButtonContainer">
									<XButton clickCallback={() => handleHeroUnclaim(hero.id)} size="large" hoverable={true} />
								</div>
							</div>
							<div class="heroHeader">
								<div class="attrArea">
									<div class="attrImgContainer">
										<img class="attrImage factionImg" src="./img/factions/{hero.faction.toLowerCase()}.png" alt="{hero.faction}">
										<div class="tooltip tooltip-faction"><span class="tooltipText">{hero.faction}</span></div>
									</div>
									<div class="attrImgContainer">
										<img class="attrImage typeImg" src="./img/types/{hero.type.toLowerCase()}.png" alt={hero.type}>
										<div class="tooltip tooltip-type"><span class="tooltipText">{hero.type}</span></div>
									</div>
									<div class="attrImgContainer">
										<img class="attrImage classImg" src="./img/classes/{hero.class.toLowerCase()}.png" alt={hero.class}>
										<div class="tooltip tooltip-class"><span class="tooltipText">{hero.class}</span></div>
									</div>
								</div>
								<div class="portraitArea">
									<img on:click="{() => handleHeroDetailClick(hero.id)}" class="portrait" src={hero.portrait} alt={hero.name}>
								</div>
							</div>
							<p class="heroName">{hero.name}</p>
							<div class="starsInputArea">
								<StarsInput
									enabled={$AppData.MH.List[hero.id].ascendLv >= 6}
									bind:value={$AppData.MH.List[hero.id].stars}
									bind:engraving={$AppData.MH.List[hero.id].engraving}
									on:change={handleNumChange} />
							</div>
							<div class="flipButtonContainer">
								<div class="ascButtonArea">
									<div class="flipButtonArea">
										<AscensionMenu
											menuItemChangeCallback={(index) => handleAscChange(hero.id, index)}
											activeItem={$AppData.MH.List[hero.id].ascendLv} 
											zIndexBase=2
											tier={$HeroData.find(e => e.id === hero.id).tier}
										/>
									</div>
								</div>
								<div class="siFurnButtonArea">
									<div class="flipButtonArea">
										<SIMenu
											menuItemChangeCallback={(index) => handleSIChange(hero.id, index)}
											activeItem={$AppData.MH.List[hero.id].si === -1 ? 0 : Math.floor($AppData.MH.List[hero.id].si/5) + 1}
											zIndexBase=2
											si40={$HeroData.find(e => e.id === hero.id).faction === 'Dimensional' || $HeroData.find(e => e.id === hero.id).faction === 'Celestial' || $HeroData.find(e => e.id === hero.id).faction === 'Hypogean'}
											active={$HeroData.find(e => e.id === hero.id).tier === 'ascended' && $AppData.MH.List[hero.id].ascendLv >= 4}
										/>
									</div>
									<div class="flipButtonArea">
										<FurnMenu
											menuItemChangeCallback={(index) => handleFurnChange(hero.id, index)}
											activeItem={$AppData.MH.List[hero.id].furn === 0 ? 0 : $AppData.MH.List[hero.id].furn === 3 ? 1 : 2}
											zIndexBase=2
											active={$HeroData.find(e => e.id === hero.id).tier === 'ascended' && $AppData.MH.List[hero.id].ascendLv >= 6}
										/>
									</div>
								</div>
							</div>
							<div class="numInputArea">
								{#if $AppData.MH.List[hero.id].ascendLv < 6}
									<div class="copiesInputArea">
										<CopiesInput
											enabled={true}
											bind:value={$AppData.MH.List[hero.id].copies}
											on:change={handleNumChange} />
									</div>
								{:else}
									<div class="engraveInputArea">
										<EngraveInput
											enabled={$AppData.MH.List[hero.id].stars >= 1}
											max={$HeroData.find(e => e.id === hero.id).faction === 'Dimensional' || $HeroData.find(e => e.id === hero.id).faction === 'Celestial' || $HeroData.find(e => e.id === hero.id).faction === 'Hypogean' ? 100 : 80}
											bind:value={$AppData.MH.List[hero.id].engraving}
											on:change={handleNumChange} />
									</div>
								{/if}
							</div>
						</div>
						{/each}
					</div>
				{/if}
			</section>
		{:else if $AppData.MH.openSection === 1}
			<section class="MHSection unownedSection">
				{#if unownedHeroList.length === 0}
					<div class="noHeroes">
						<span>No unowned heroes</span>
					</div>
				{:else}
					<div class="MHGrid">
						{#each unownedHeroList as hero (hero.id)}
						<div class="heroCard" animate:flip="{{duration: 200}}" on:click={(e) => { handleHeroClaim(hero.id); e.stopPropagation(); }}>
							<div class="heroHeader">
								<div class="attrArea">
									<div class="attrImgContainer">
										<img class="attrImage factionImg" src="./img/factions/{hero.faction.toLowerCase()}.png" alt="{hero.faction}">
										<div class="tooltip tooltip-faction"><span class="tooltipText">{hero.faction}</span></div>
									</div>
									<div class="attrImgContainer">
										<img class="attrImage typeImg" src="./img/types/{hero.type.toLowerCase()}.png" alt={hero.type}>
										<div class="tooltip tooltip-type"><span class="tooltipText">{hero.type}</span></div>
									</div>
									<div class="attrImgContainer">
										<img class="attrImage classImg" src="./img/classes/{hero.class.toLowerCase()}.png" alt={hero.class}>
										<div class="tooltip tooltip-class"><span class="tooltipText">{hero.class}</span></div>
									</div>
								</div>
								<div class="portraitArea">
									<img class="portrait" src={hero.portrait} alt={hero.name}>
								</div>
							</div>
							<p class="heroName">Add {hero.name}</p>
						</div>
						{/each}
					</div>
				{/if}
			</section>
		{/if}
	</section>
	<section class="sect3">
		<div class="inOutMenu {openInOutMenu ? 'open' : ''}">
			<button type="button" class="inOutButton" on:click={handleExportData}><img src="./img/utility/export.png" alt="export"></button>
			<div class="tooltip tooltip-inOutButton1"><span class="tooltipText">Export Data</span></div>
			<button type="button" class="inOutButton" on:click={handleImportData}><img src="./img/utility/import.png" alt="import"></button>
			<div class="tooltip tooltip-inOutButton2"><span class="tooltipText">Import Data</span></div>
		</div>
		<button type="button" class="inOutMenuButton" on:click={(e) => {openInOutMenu = !openInOutMenu; e.stopPropagation();}}><img src="./img/utility/export_import.png" alt="Import/Export"></button>
	</section>
	<section class="sect4">
		<div class="copyConfirm" class:visible={copyConfirmVisible}><span>My Hero Data Copied to Clipboard</span></div>
	</section>
</div>

<style lang="scss">
	.MHContainer {
		height: 100%;
		height: calc(var(--vh, 1vh) * 100 - var(--headerHeight) - 40px); /* gymnastics to set height for mobile browsers */
		overflow-y: auto;
		padding: 10px;
	}
	.sect1 {
		bottom: 0;
		left: 0;
		position: fixed;
		width: 100%;
		z-index: 3;
	}
	.sect2 {
		padding: 10px;
		width: 100%;
	}
	.sect3 {
		bottom: 50px;
		position: fixed;
		right: 20px;
		width: 60px;
		z-index: 2;
	}
	.sect4 {
		left: 50%;
		position: fixed;
		top: 80px;
		transform: translate(-50%, 0);
		width: fit-content;
	}
	.sectionPickerSection {
		margin: 0;
		width: 100%;
	}
	.sectionPicker {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: center;
		list-style-type: none;
		margin: 0;
		padding: 0;
		.sectionButton {
			background-color: transparent;
			border: 3px solid var(--appColorPrimary);
			border-bottom: none;
			border-radius: 10px 10px 0px 0px;
			color: var(--appColorPrimary);
			cursor: pointer;
			font-size: 1rem;
			margin-right: 15px;
			outline: none;
			padding: 5px;
		}
		.sectionButton.active {
			background-color: var(--appColorPrimary);
			color: white;
		}
	}
	.MHSection {
		border: 3px solid var(--appColorPrimary);
		border-radius: 10px;
		padding: 10px;
		width: 100%;
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
	.noHeroes {
		color: rgba(100, 100, 100, 0.3);
		font-size: 4rem;
		font-weight: bold;
		height: 100%;
		padding-top: 50px;
		text-align: center;
		text-transform: uppercase;
		width: 100%;
		user-select: none;
	}
	.copyConfirm {
		background-color: rgba(50, 50, 50, 0.7);
		border-radius: 10px;
		color: rgba(255, 255, 255, 0.7);
		display: none;
		opacity: 0;
		padding: 5px;
		transition: visibility 0.3s, opacity 0.3s;
		visibility: hidden;
	}
	.copyConfirm.visible {
		display: block;
		opacity: 1;
		visibility: visible;
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
	.sortContainer {
		align-items: center;
		border-bottom: 1px solid black;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 5px;
		.sortTitle {
			margin-bottom: 5px;
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
		.filterButton {
			background: transparent;
			border: 0;
			cursor: pointer;
			display: block;
			margin-right: 10px;
			margin-top: 7px;
		}
		.filterImg {
			max-width: 33px;
		}
		.filterInactive {
			filter: grayscale(100%);
		}
	}
	.MHGrid {
		display: grid;
		grid-gap: 10px 5px;
		grid-template-columns: repeat(auto-fill, minmax(330px, 330px));
		grid-auto-rows: 380px;
		justify-content: space-evenly;
	}
	.heroCard {
		border: 3px solid var(--appColorPrimary);
		border-radius: 10px;
		display: flex;
		flex-direction: column;
		max-width: 330px;
		padding: 10px;
		position: relative;
	}
	.removeArea {
		z-index: 1;
	}
	.removeHeroButtonContainer {
		position: absolute;
		top: 5px;
		right: 5px;
	}
	.heroHeader {
		display: flex;
		flex-direction: row;
	}
	.portraitArea {
		border-radius: 10px 10px 0px 0px;
		display: flex;
		height: 50%;
		justify-content: center;
		left: -1px;
		overflow: hidden;
		padding-top: 5px;
		position: absolute;
		top: -1px;
		width: 100%;
	}
	.portrait {
		border-radius: 50%;
		cursor: pointer;
		height: 160px;
		width: 160px;
	}
	.heroName {
		display: flex;
		font-size: 1.7rem;
		font-weight: bold;
		justify-content: center;
		margin: 0;
		margin-top: 45px;
		width: 100%;
	}
	.starsInputArea {
		display: flex;
		justify-content: center;
		margin-bottom: 15px;
	}
	.attrArea {
		background-color: rgba(0, 0, 0, 0.75);
		border-radius: 30px;
		height: fit-content;
		padding: 5px;
		position: relative;
		top: -5px;
		z-index: 1;
	}
	.attrImgContainer {
		position: relative;
		.attrImage {
			max-width: 30px;
		}
	}
	.tooltip {
		display: none;
	}
	.flipButtonContainer {
		align-items: center;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}
	.ascButtonArea {
		padding-bottom: 10px;
	}
	.siFurnButtonArea {
		display: flex;
		flex-direction: row;
		.flipButtonArea {
			&:first-child {
				margin-right: 10px;
			}
		}
	}
	.numInputArea {
		display: flex;
		justify-content: center;
		padding-top: 5px;
	}
	.unownedSection {
		.MHGrid {
			display: grid;
			grid-gap: 10px 5px;
			grid-template-columns: repeat(auto-fill, minmax(330px, 330px));
			grid-auto-rows: 175px;
			justify-content: space-evenly;
		}
		.heroCard {
			border-color: #BEBEBE;
			cursor: pointer;
		}
		.heroHeader {
			display: flex;
			flex-direction: row;
		}
		.attrImgContainer {
			.attrImage {
				filter: grayscale(1);
			}
		}
		.portraitArea {
			border-radius: 10px 10px 0px 0px;
			display: flex;
			height: 80%;
			justify-content: center;
			overflow: hidden;
			position: absolute;
			.portrait {
				filter: grayscale(1);
				height: 120px;
				width: 120px;
			}
		}
		.heroName {
			margin: 0;
			margin-top: 5px;
		}
	}
	.inOutMenuButton {
		align-items: center;
		background-color: var(--appColorPrimary);
		border: 2px solid var(--appColorPrimary);
		border-radius: 50%;
		box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.25);
		cursor: pointer;
		display: flex;
		height: 50px;
		justify-content: center;
		transition: transform 0.3s ease-out;
		width: 50px;
		img {
			max-width: 40px;
		}
	}
	.inOutMenu.open {
		+ {
			.inOutMenuButton {
				transform: rotate(180deg);
			}
		}
		max-height: 350px;
		overflow: visible;
	}
	.inOutMenu {
		align-items: center;
		background-color: transparent;
		border-radius: 5px;
		bottom: 10px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		left: -25px;
		max-height: 0;
		overflow: hidden;
		position: relative;
		transition: max-height 0.4s ease-out;
		width: 100px;
	}
	.inOutButton {
		align-items: center;
		background-color: var(--appColorPrimary);
		border: 2px solid var(--appColorPrimary);
		border-radius: 50%;
		cursor: pointer;
		display: flex;
		font-size: 1.2rem;
		height: 40px;
		justify-content: center;
		width: 40px;
		&:first-child {
			margin-bottom: 10px;
		}
		img {
			max-width: 20px;
		}
	}
	.tooltip-inOutButton1 {
		bottom: 45px;
		display: inline-block;
		position: relative;
		right: 70px;
		width: 100%;
		.tooltipText {
			background-color: var(--appColorPrimary);
			border-radius: 6px;
			color: white;
			padding: 5px;
			position: absolute;
			text-align: center;
		}
	}
	.tooltip-inOutButton2 {
		bottom: 45px;
		display: inline-block;
		position: relative;
		right: 70px;
		width: 100%;
		bottom: 38px;
		.tooltipText {
			background-color: var(--appColorPrimary);
			border-radius: 6px;
			color: white;
			padding: 5px;
			position: absolute;
			text-align: center;
		}
	}
	@media only screen and (min-width: 767px) {
		.MHContainer {
			display: flex;
			flex-direction: column;
			height: 100%;
			height: calc(var(--vh, 1vh) * 100 - var(--headerHeight)); /* gymnastics to set height for mobile browsers */
			padding: 0px;
		}
		.sect1 {
			display: flex;
			flex-direction: row;
			height: fit-content;
			left: 0;
			position: fixed;
			top: 150px;
			width: max-content;
		}
		.sect2 {
			padding-left: 50px;
			padding-right: 50px;
		}
		.sectionPicker {
			justify-content: flex-start;
		}
		.sectionButton {
			margin-right: 0px;
		}
		.MHSection {
			border-radius: 0px 10px 10px 10px;
		}
		.searchInfo {
			display: flex;
			justify-content: center;
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
				text-align: left;
			}
		}
		.tooltip-expander {
			top: -35px;
			left: 5px;
			width: fit-content;
		}
		.tooltip-inOutButton1 {
			bottom: 85px;
			right: 70px;
			width: fit-content;
		}
		.tooltip-inOutButton2 {
			bottom: 85px;
			right: 70px;
			width: fit-content;
			bottom: 35px;
		}
		.tooltip-faction {
			justify-content: flex-start;
			left: 40px;
			top: 0px;
		}
		.tooltip-type {
			justify-content: flex-start;
			left: 40px;
			top: 0px;
		}
		.tooltip-class {
			justify-content: flex-start;
			left: 40px;
			top: 0px;
		}
		.attrImage {
			&:hover+.tooltip {
				opacity: 1;
				visibility: visible;
			}
		}
		.inOutButton {
			&:hover+.tooltip {
				opacity: 1;
				visibility: visible;
				width: 100px;
			}
		}
		.mobileExpander {
			background-color: var(--appBGColor);
			max-height: 465px;
			max-width: 0;
			overflow: none;
			transition: max-width 0.2s ease;
		}
		.mobileExpander.filterOpen {
			box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.25);
			max-height: fit-content;
			max-width: 100%;
			padding: 10px;
		}
		.mobileExpander.filterOpen+.mobileExpanderTitle {
			.tooltip {
				opacity: 0;
				visibility: hidden;
			}
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
			height: fit-content;
			padding-top: 10px;
		}
		.filterSection {
			border: 0;
			display: block;
			padding: 0;
			width: 33%;
			height: fit-content;
			.filterMasterButton {
				&:hover {
					background-color: var(--appColorPrimary);
					color: rgba(255, 255, 255, 0.9);
				}
				margin: 0 auto;
				margin-bottom: 10px;
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
	}
</style>
