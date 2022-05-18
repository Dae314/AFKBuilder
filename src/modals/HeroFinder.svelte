<script>
	import { onMount, tick } from 'svelte';
	import { flip } from 'svelte/animate';
	import HeroData from '../stores/HeroData.js';
	import Artifacts from '../stores/Artifacts.js';
	import AppData from '../stores/AppData.js';
	import ModalCloseButton from './ModalCloseButton.svelte';
	import AscensionMenu from '../shared/AscensionMenu.svelte';
	import SIMenu from '../shared/SIMenu.svelte';
	import FurnMenu from '../shared/FurnMenu.svelte';
	import XButton from '../shared/XButton.svelte';
	import StarsInput from '../shared/StarsInput.svelte';
	import EngraveInput from '../shared/EngraveInput.svelte';

	export let config = {};
	export let isMobile = false;

	$: heroes = makeHeroList();
	$: allFactionsEnabled = showLB && showM && showW && showGB && showC && showH && showD;
	$: allTypesEnabled = showInt && showAgi && showStr;
	$: allClassEnabled = showMage && showWar && showTank && showSup && showRan;
	$: unusedArtifacts = makeUnusedArtifactList();

	let close = () => {};
	let section = 1;
	let selectedHero = {};
	let showFilters = false;
	let idx = 0;
	let pos = 0;
	let onSuccess = () => {};
	let oldHeroID = '';
	let oldHeroData = {};
	let compHeroData = {};
	let pickArtifactPri = false;
	let pickArtifactSec = false;
	let pickArtifactSit = false;
	let desktopSearch;

	onMount(async () => {
		close = config.close;
		idx = config.idx;
		pos = config.pos;
		onSuccess = config.onSuccess;
		compHeroData = config.compHeroData;
		if('oldHeroID' in config) {
			oldHeroID = config.oldHeroID;
			oldHeroData = compHeroData[oldHeroID];
		}
		if(oldHeroID !== '') {
			section = 2;
			selectedHero = {
				id: oldHeroID,
				ascendLv: oldHeroData.ascendLv,
				si: oldHeroData.si,
				furn: oldHeroData.furn,
				stars: oldHeroData.stars,
				engraving: oldHeroData.engraving,
				artifacts: JSON.parse(JSON.stringify(oldHeroData.artifacts)),
				core: oldHeroData.core,
				notes: oldHeroData.notes,
			}
			unusedArtifacts = makeUnusedArtifactList();
		}
		heroes = makeHeroList();
		desktopSearch.focus();
	});

	// filter variables
	let showLB = true;
	let showM = true;
	let showW = true;
	let showGB = true;
	let showC = true;
	let showH = true;
	let showD = true;
	let showInt = true;
	let showAgi = true;
	let showStr = true;
	let showMage = true;
	let showWar = true;
	let showTank = true;
	let showSup = true;
	let showRan = true;
	let searchStr = '';

	function makeHeroList() {
		let buffer = [];
		for(const hero of $HeroData) {
			if(!showLB && hero.faction.toLowerCase() === 'lightbearer') continue;
			if(!showM && hero.faction.toLowerCase() === 'mauler') continue;
			if(!showW && hero.faction.toLowerCase() === 'wilder') continue;
			if(!showGB && hero.faction.toLowerCase() === 'graveborn') continue;
			if(!showC && hero.faction.toLowerCase() === 'celestial') continue;
			if(!showH && hero.faction.toLowerCase() === 'hypogean') continue;
			if(!showD && hero.faction.toLowerCase() === 'dimensional') continue;
			if(!showInt && hero.type.toLowerCase() === 'intelligence') continue;
			if(!showAgi && hero.type.toLowerCase() === 'agility') continue;
			if(!showStr && hero.type.toLowerCase() === 'strength') continue;
			if(!showMage && hero.class.toLowerCase() === 'mage') continue;
			if(!showWar && hero.class.toLowerCase() === 'warrior') continue;
			if(!showTank && hero.class.toLowerCase() === 'tank') continue;
			if(!showSup && hero.class.toLowerCase() === 'support') continue;
			if(!showRan && hero.class.toLowerCase() === 'ranger') continue;
			if(searchStr !== '' &&
				 !hero.name.toLowerCase().includes(searchStr.toLowerCase()) &&
				 !hero.class.toLowerCase().includes(searchStr.toLowerCase()) &&
				 !hero.faction.toLowerCase().includes(searchStr.toLowerCase()) &&
				 !hero.type.toLowerCase().includes(searchStr.toLowerCase())
				) continue;
			buffer.push(hero);
		}
		return buffer.length > 0 ? buffer.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1) : buffer;
	}

	function makeUnusedArtifactList() {
		let buffer = Object.keys($Artifacts);
		let artifactsInLine = [];
		for(const key in selectedHero.artifacts) {
			for(const artifact of selectedHero.artifacts[key]) {
				artifactsInLine.push(artifact);
			}
		}
		if('artifacts' in selectedHero && 'id' in selectedHero) {
			const heroClass = $HeroData.find(e => e.id === selectedHero.id).class;
			// filter for artifacts of the right class
			buffer = buffer.filter(e => $Artifacts[e].class === heroClass || $Artifacts[e].class === 'Any');
			// filter out artifacts that are already in a line
			buffer = buffer.filter(e => !artifactsInLine.includes(e));
		}
		return buffer.sort();
	}

	function handleFilterMasterButtonClick(category) {
		switch(category) {
			case 'faction':
				showLB = true;
				showM = true;
				showW = true;
				showGB = true;
				showC = true;
				showH = true;
				showD = true;
				break;
			case 'type':
				showInt = true;
				showAgi = true;
				showStr = true;
				break;
			case 'class':
				showMage = true;
				showWar = true;
				showTank = true;
				showSup = true;
				showRan = true;
				break;
			default:
				throw new Error(`Invalid category given to handleFilterMasterButtonClick(): ${category}`);
		}
		heroes = makeHeroList();
	}

	function handleFilterButtonClick(category) {
		switch(category) {
			case 'LB':
				showLB = true;
				showM = false;
				showW = false;
				showGB = false;
				showC = false;
				showH = false;
				showD = false;
				break;
			case 'M':
				showLB = false;
				showM = true;
				showW = false;
				showGB = false;
				showC = false;
				showH = false;
				showD = false;
				break;
			case 'W':
				showLB = false;
				showM = false;
				showW = true;
				showGB = false;
				showC = false;
				showH = false;
				showD = false;
				break;
			case 'GB':
				showLB = false;
				showM = false;
				showW = false;
				showGB = true;
				showC = false;
				showH = false;
				showD = false;
				break;
			case 'C':
				showLB = false;
				showM = false;
				showW = false;
				showGB = false;
				showC = true;
				showH = false;
				showD = false;
				break;
			case 'H':
				showLB = false;
				showM = false;
				showW = false;
				showGB = false;
				showC = false;
				showH = true;
				showD = false;
				break;
			case 'D':
				showLB = false;
				showM = false;
				showW = false;
				showGB = false;
				showC = false;
				showH = false;
				showD = true;
				break;
			case 'Int':
				showInt = true;
				showAgi = false;
				showStr = false;
				break;
			case 'Agi':
				showInt = false;
				showAgi = true;
				showStr = false;
				break;
			case 'Str':
				showInt = false;
				showAgi = false;
				showStr = true;
				break;
			case 'Mage':
				showMage = true;
				showWar = false;
				showTank = false;
				showSup = false;
				showRan = false;
				break;
			case 'War':
				showMage = false;
				showWar = true;
				showTank = false;
				showSup = false;
				showRan = false;
				break;
			case 'Tank':
				showMage = false;
				showWar = false;
				showTank = true;
				showSup = false;
				showRan = false;
				break;
			case 'Sup':
				showMage = false;
				showWar = false;
				showTank = false;
				showSup = true;
				showRan = false;
				break;
			case 'Ran':
				showMage = false;
				showWar = false;
				showTank = false;
				showSup = false;
				showRan = true;
				break;
			default:
				throw new Error(`Invalid category given to handleFilterButtonClick(): ${category}`);
		}
		heroes = makeHeroList();
	}

	function handleSIChange(level) {
		selectedHero.si = level;
	}

	function handleAscChange(level) {
		selectedHero.ascendLv = level;
		if(selectedHero.ascendLv < 6) {
			selectedHero.furn = 0;
			selectedHero.stars = 0;
			selectedHero.engraving = 0;
		}
		if(selectedHero.ascendLv < 4) {
			selectedHero.si = -1;
		}
	}

	function handleFurnChange(level) {
		selectedHero.furn = level;
	}

	function handleStarsChange(event) {
		if(event.detail.value <= 0) {
			selectedHero.engraving = 0;
		}
	}

	function handleAddArtifact(artifact, line) {
		if(artifact in $Artifacts) {
			if(!selectedHero.artifacts[line].includes(artifact)) {
				selectedHero.artifacts[line] = [...selectedHero.artifacts[line], artifact];
			}
			unusedArtifacts = makeUnusedArtifactList();
		}
		switch(line) {
			case 'primary':
				pickArtifactPri = false;
				break;
			case 'secondary':
				pickArtifactSec = false;
				break;
			case 'situational':
				pickArtifactSit = false;
				break;
			default:
				throw new Error(`Error invalid artifact line type given: ${line}`);
		}
	}

	function handleRemoveArtifact(artifact, line) {
		if(!(line in selectedHero.artifacts)) throw new Error(`Invalid artifact line given: ${line}`);
		selectedHero.artifacts[line] = selectedHero.artifacts[line].filter((e) => e !== artifact);
		unusedArtifacts = makeUnusedArtifactList();
	}

	async function checkHero(hero) {
		const expectedProps = [
			{name: 'id', type: 'string'},
			{name: 'ascendLv', type: 'number'},
			{name: 'si', type: 'number'},
			{name: 'furn', type: 'number'},
			{name: 'stars', type: 'number'},
			{name: 'engraving', type: 'number'},
			{name: 'artifacts', type: 'object'},
			{name: 'core', type: 'boolean'},
			{name: 'notes', type: 'string'},
		];

		// make sure that hero is an object (and nothing else)
		// https://javascript.plainenglish.io/javascript-check-if-a-variable-is-an-object-and-nothing-else-not-an-array-a-set-etc-a3987ea08fd7
		if(Object.prototype.toString.call(hero) !== '[object Object]') return { retCode: 1, message: 'Hero must be an object.'};

		// hero must be an object at this point, so make sure it's consistent with the format we expect
		for(const prop of expectedProps) {
			if(!(prop.name in hero)) {
				return { retCode: 1, message: `Hero object missing property: ${prop.name}`};
			} else {
				if(prop.type === 'array') {
					if(!Array.isArray(hero[prop.name])) return { retCode: 1, message: `Hero object property, ${prop.name}, is type ${typeof hero[prop.name]}. Expected ${prop.type}.`};
				} else if(prop.type === 'object') {
					if(!Object.prototype.toString.call(hero[prop.name]) === '[object Object]') return { retCode: 1, message: `Hero object property, ${prop.name}, is type ${typeof hero[prop.name]}. Expected ${prop.type}.`};
				} else {
					if(!(typeof hero[prop.name] === prop.type)) return { retCode: 1, message: `Hero object property, ${prop.name}, is type ${typeof hero[prop.name]}. Expected ${prop.type}.`};
				}
			}
		}

		// delete any props in hero that aren't expected
		for(const key in hero) {
			if(!expectedProps.some(e => e.name === key)) delete hero[key];
		}

		// make sure values are within expected ranges
		if(!$HeroData.some(e => e.id === hero.id)) return { retCode: 1, message: `Hero ID not found in $HeroData database: ${hero.id}` };
		if(!(hero.ascendLv >= 0 && hero.ascendLv <= 6)) return { retCode: 1, message: `Hero ascend level must be between 0-30: ${hero.ascendLv}` };
		if(!(hero.ascendLv >= 0 && hero.ascendLv <= 30)) return { retCode: 1, message: `Hero si level must be between 0-30: ${hero.si}` };
		if(!(hero.ascendLv >= 0 && hero.ascendLv <= 9)) return { retCode: 1, message: `Hero furniture level must be between 0-30: ${hero.furn}` };
		let artifactsInLine = [];
		for(const key in selectedHero.artifacts) {
			for(const artifact of selectedHero.artifacts[key]) {
				artifactsInLine.push(artifact);
			}
		}
		for(const artifact of artifactsInLine) {
			if(!Object.keys($Artifacts).includes(artifact)) return { retCode: 1, message: `Artifact not found in $Artifacts database: ${artifact}` };
		}

		// everything should be good now, return the clean MH.List object
		return {retCode: 0, message: hero};
	}

	async function saveHero() {
		const returnObj = await checkHero(selectedHero);
		if(returnObj.retCode !== 0) {
			// validation error occurred
			throw new Error(`Hero validation error occurred for hero: ${returnObj.message}`);
		} else {
			// message should contain a clean hero object now
			selectedHero = returnObj.message;
		}
		onSuccess(idx, pos, selectedHero, oldHeroID);
		close();
	}

	function selectHero(heroID) {
		if(heroID in compHeroData) {
			selectedHero = {
				id: heroID,
				ascendLv: compHeroData[heroID].ascendLv,
				si: compHeroData[heroID].si,
				furn: compHeroData[heroID].furn,
				stars: compHeroData[heroID].stars,
				engraving: compHeroData[heroID].engraving,
				artifacts: JSON.parse(JSON.stringify(compHeroData[heroID].artifacts)),
				core: compHeroData[heroID].core,
				notes: compHeroData[heroID].notes,
			};
		} else {
			selectedHero = {
				id: heroID,
				ascendLv: $HeroData.find(e => e.id === heroID).tier === 'ascended' ? 6 : 5,
				si: $HeroData.find(e => e.id === heroID).si_benchmark,
				furn: $HeroData.find(e => e.id === heroID).furn_benchmark,
				stars: $HeroData.find(e => e.id === heroID).engraving_benchmark > 0 ? 1 : 0,
				engraving: $HeroData.find(e => e.id === heroID).engraving_benchmark,
				artifacts: {primary: [], secondary: [], situational: []},
				core: false,
				notes: '',
			};
		}
		changeSection(2);
		unusedArtifacts = makeUnusedArtifactList();
	}

	async function changeSection(sectNum) {
		section = sectNum;
		// scroll back to top
		document.getElementById('hfContainer').scrollTop = 0;
	}

	function handleSearchButtonClick() {
		heroes = makeHeroList();
	}
</script>

<div class="background">
	<div class="modalCloseContainer">
		<ModalCloseButton onClose={close} />
	</div>
	<div id="hfContainer" class="heroFinderContainer" on:click={(e) => e.stopPropagation()}>
		{#if section === 1}
			<div class="section1">
				<div class="heroFinderHead">
					<div class="searchContainer">
						<input type="search" placeholder="Search" class="mobileSearch" bind:value={searchStr} on:keyup={() => heroes = makeHeroList()} on:search={() => heroes = makeHeroList()}>
						<input type="search" placeholder="Search" class="desktopSearch" bind:this={desktopSearch} bind:value={searchStr} on:keyup={() => heroes = makeHeroList()} on:search={() => heroes = makeHeroList()}>
						<button type="button" class="headButton searchButton" on:click={handleSearchButtonClick}>
							<img class="searchImage" class:light={$AppData.colorProfile === 'light'} src="./img/utility/search_white.png" alt="search" />
						</button>
						<button type="button" class="headButton openFiltersButton" class:open={showFilters} on:click={() => showFilters = !showFilters}>
							<img class="openFiltersImage" class:light={$AppData.colorProfile === 'light'} src="./img/utility/filter_white.png" alt="Open Filters">
						</button>
					</div>
					<div class="filters" class:open={showFilters}>
						<div class="filterSection">
							<button type="button" class="filterMasterButton" class:filterMasterDisabled={!allFactionsEnabled} on:click={() => handleFilterMasterButtonClick('faction')}>ALL</button>
							<button type="button" class="filterButton" on:click={() => {handleFilterButtonClick('LB')}}>
								<img class="filterImg" class:filterSelected={showLB && !allFactionsEnabled} class:filterInactive={!showLB} src="./img/factions/lightbearer.png" alt="Lightbearer">
							</button>
							<button type="button" class="filterButton" on:click={() => {handleFilterButtonClick('M')}}>
								<img class="filterImg" class:filterSelected={showM && !allFactionsEnabled} class:filterInactive={!showM} src="./img/factions/mauler.png" alt="Mauler">
							</button>
							<button type="button" class="filterButton" on:click={() => {handleFilterButtonClick('W')}}>
								<img class="filterImg" class:filterSelected={showW && !allFactionsEnabled} class:filterInactive={!showW} src="./img/factions/wilder.png" alt="wilder">
							</button>
							<button type="button" class="filterButton" on:click={() => {handleFilterButtonClick('GB')}}>
								<img class="filterImg" class:filterSelected={showGB && !allFactionsEnabled} class:filterInactive={!showGB} src="./img/factions/graveborn.png" alt="Graveborn">
							</button>
							<button type="button" class="filterButton" on:click={() => {handleFilterButtonClick('C')}}>
								<img class="filterImg" class:filterSelected={showC && !allFactionsEnabled} class:filterInactive={!showC} src="./img/factions/celestial.png" alt="Celestial">
							</button>
							<button type="button" class="filterButton" on:click={() => {handleFilterButtonClick('H')}}>
								<img class="filterImg" class:filterSelected={showH && !allFactionsEnabled} class:filterInactive={!showH} src="./img/factions/hypogean.png" alt="Hypogean">
							</button>
							<button type="button" class="filterButton" on:click={() => {handleFilterButtonClick('D')}}>
								<img class="filterImg" class:filterSelected={showD && !allFactionsEnabled} class:filterInactive={!showD} src="./img/factions/dimensional.png" alt="Dimensional">
							</button>
						</div>
						<div class="filterSection">
							<button type="button" class="filterMasterButton" class:filterMasterDisabled={!allTypesEnabled} on:click={() => handleFilterMasterButtonClick('type')}>ALL</button>
							<button type="button" class="filterButton" on:click={() => {handleFilterButtonClick('Int')}}>
								<img class="filterImg" class:filterSelected={showInt && !allTypesEnabled} class:filterInactive={!showInt} src="./img/types/intelligence.png" alt="Intelligence">
							</button>
							<button type="button" class="filterButton" on:click={() => {handleFilterButtonClick('Agi')}}>
								<img class="filterImg" class:filterSelected={showAgi && !allTypesEnabled} class:filterInactive={!showAgi} src="./img/types/agility.png" alt="Agility">
							</button>
							<button type="button" class="filterButton" on:click={() => {handleFilterButtonClick('Str')}}>
								<img class="filterImg" class:filterSelected={showStr && !allTypesEnabled} class:filterInactive={!showStr} src="./img/types/strength.png" alt="Strength">
							</button>
						</div>
						<div class="filterSection">
							<button type="button" class="filterMasterButton" class:filterMasterDisabled={!allClassEnabled} on:click={() => handleFilterMasterButtonClick('class')}>ALL</button>
							<button type="button" class="filterButton" on:click={() => {handleFilterButtonClick('Mage')}}>
								<img class="filterImg" class:filterSelected={showMage && !allClassEnabled} class:filterInactive={!showMage} src="./img/classes/mage.png" alt="Mage">
							</button>
							<button type="button" class="filterButton" on:click={() => {handleFilterButtonClick('War')}}>
								<img class="filterImg" class:filterSelected={showWar && !allClassEnabled} class:filterInactive={!showWar} src="./img/classes/warrior.png" alt="Warrior">
							</button>
							<button type="button" class="filterButton" on:click={() => {handleFilterButtonClick('Tank')}}>
								<img class="filterImg" class:filterSelected={showTank && !allClassEnabled} class:filterInactive={!showTank} src="./img/classes/tank.png" alt="Tank">
							</button>
							<button type="button" class="filterButton" on:click={() => {handleFilterButtonClick('Sup')}}>
								<img class="filterImg" class:filterSelected={showSup && !allClassEnabled} class:filterInactive={!showSup} src="./img/classes/support.png" alt="Support">
							</button>
							<button type="button" class="filterButton" on:click={() => {handleFilterButtonClick('Ran')}}>
								<img class="filterImg" class:filterSelected={showRan && !allClassEnabled} class:filterInactive={!showRan} src="./img/classes/ranger.png" alt="Ranger">
							</button>
						</div>
					</div>
				</div>
				<div class="heroGrid">
					{#each heroes as hero (hero.id)}
						<button type="button" class="heroPortrait" on:click={() => selectHero(hero.id)} class:active={hero.id in compHeroData} animate:flip="{{duration: 200}}">
							<img src="{hero.portrait}" alt="hero.name">
							<p>{hero.name}</p>
						</button>
					{/each}
				</div>
			</div>
		{:else if section === 2}
			<div class="section2">
				<div class="heroEditHead">
					<button type="button" class="backButton" on:click={() => changeSection(1)}>
						<img class="backImage" draggable="false" src="./img/utility/back_color.png" alt="Back">
					</button>
					<button type="button" class="saveButton" on:click={() => saveHero()}><span>Save</span></button>
				</div>
				<div class="heroEditor">
					<div class="portraitArea">
						<div class="siFlipButtonArea">
							<SIMenu
								menuItemChangeCallback={(index) => handleSIChange(index)}
								activeItem={selectedHero.si === -1 ? 0 : Math.floor(selectedHero.si/5) + 1}
								centerMenu={true}
								zIndexBase=4
								si40={$HeroData.find(e => e.id === selectedHero.id).faction === 'Dimensional' || $HeroData.find(e => e.id === selectedHero.id).faction === 'Celestial' || $HeroData.find(e => e.id === selectedHero.id).faction === 'Hypogean'}
								active={$HeroData.find(e => e.id === selectedHero.id).tier === 'ascended' && selectedHero.ascendLv >= 4}
							/>
						</div>
						<div class="portraitContainer">
							<img class="editorPortrait" src="{$HeroData.find(e => e.id === selectedHero.id).portrait}" alt="{$HeroData.find(e => e.id === selectedHero.id).name}">
						</div>
						<div class="furnFlipButtonArea">
							<FurnMenu
								menuItemChangeCallback={(index) => handleFurnChange(index)}
								activeItem={selectedHero.furn === 0 ? 0 : selectedHero.furn === 3 ? 1 : 2}
								centerMenu={true}
								zIndexBase=4
								active={$HeroData.find(e => e.id === selectedHero.id).tier === 'ascended' && selectedHero.ascendLv >= 6}
							/>
						</div>
					</div>
					<div class="heroName">{$HeroData.find(e => e.id === selectedHero.id).name}</div>
					<div class="starsInputContainer">
						<StarsInput 
							bind:value={selectedHero.stars}
							enabled={selectedHero.ascendLv >= 6}
							engraving={selectedHero.engraving}
							on:change={handleStarsChange} />
					</div>
					<div class="ascFlipButtonArea">
						<AscensionMenu
							menuItemChangeCallback={(index) => handleAscChange(index)}
							activeItem={selectedHero.ascendLv}
							centerMenu={true}
							zIndexBase=4
							tier={$HeroData.find(e => e.id === selectedHero.id).tier}
						/>
					</div>
					<div class="engraveInputContainer">
						<EngraveInput
								enabled={selectedHero.stars >= 1}
								max={$HeroData.find(e => e.id === selectedHero.id).faction === 'Dimensional' || $HeroData.find(e => e.id === selectedHero.id).faction === 'Celestial' || $HeroData.find(e => e.id === selectedHero.id).faction === 'Hypogean' ? 100 : 80}
								bind:value={selectedHero.engraving} />
					</div>
					<div class="coreArea">
						<button type="button" class="coreButton" class:on={selectedHero.core} on:click={() => selectedHero.core = !selectedHero.core}><span>Core</span></button>
					</div>
					<h4>Notes</h4>
					<div class="notesArea">
						<textarea class="notesEditor" maxlength={$AppData.maxNoteLen} bind:value={selectedHero.notes}></textarea>
						<div class="noteLimitArea" class:maxed={selectedHero.notes.length >= $AppData.maxNoteLen}><span>{selectedHero.notes.length}/{$AppData.maxNoteLen}</span></div>
					</div>
					<h4>Artifacts</h4>
					<div class="selectedArtifacts">
						<div class="gridCell">
							<h5>Primary</h5>
							<div class="artifactLine priArtifactLine">
								{#if !pickArtifactPri}
									{#each selectedHero.artifacts.primary as artifact, i (artifact)}
										<div class="artifactContainer">
											<div class="artifactImgContainer">
												<img class="artifactImg listImg" src="{$Artifacts[artifact].image}" alt="{$Artifacts[artifact].name}">
												<div class="removeArtifactButtonContainer">
													<XButton clickCallback={() => handleRemoveArtifact(artifact, 'primary')} size="medium" hoverable={false} />
												</div>
											</div>
											<p>{$Artifacts[artifact].name}</p>
										</div>
									{/each}
									{#if unusedArtifacts.length > 0}
										<button type="button" class="addArtifactButton" on:click={() => pickArtifactPri = true}><span>+</span></button>
									{/if}
								{:else}
									<div class="mobileArtifactPicker">
										{#each unusedArtifacts as artifact (artifact)}
											<button type="button" class="artifactButton" on:click={() => handleAddArtifact(artifact, 'primary') }>
												<img class="artifactImg" src="{$Artifacts[artifact].image}" alt="{$Artifacts[artifact].name}">
												<p>{$Artifacts[artifact].name}</p>
											</button>
										{/each}
									</div>
								{/if}
							</div>
						</div>
						<div class="gridCell">
							<h5>Secondary</h5>
							<div class="artifactLine secArtifactLine">
								{#if !pickArtifactSec}
									{#each selectedHero.artifacts.secondary as artifact (artifact)}
										<div class="artifactContainer">
											<div class="artifactImgContainer">
												<img class="artifactImg listImg" src="{$Artifacts[artifact].image}" alt="{$Artifacts[artifact].name}">
												<div class="removeArtifactButtonContainer">
													<XButton clickCallback={() => handleRemoveArtifact(artifact, 'secondary')} size="medium" hoverable={false} />
												</div>
											</div>
											<p>{$Artifacts[artifact].name}</p>
										</div>
									{/each}
									{#if unusedArtifacts.length > 0}
										<button type="button" class="addArtifactButton" on:click={() => pickArtifactSec = true}><span>+</span></button>
									{/if}
								{:else}
									<div class="mobileArtifactPicker">
										{#each unusedArtifacts as artifact (artifact)}
											<button type="button" class="artifactButton" on:click={() => handleAddArtifact(artifact, 'secondary') }>
												<img class="artifactImg" src="{$Artifacts[artifact].image}" alt="{$Artifacts[artifact].name}">
												<p>{$Artifacts[artifact].name}</p>
											</button>
										{/each}
									</div>
								{/if}
							</div>
						</div>
						<div class="gridCell">
							<h5>Situational</h5>
							<div class="artifactLine sitArtifactLine">
								{#if !pickArtifactSit}
									{#each selectedHero.artifacts.situational as artifact (artifact)}
										<div class="artifactContainer">
											<div class="artifactImgContainer">
												<img class="artifactImg listImg" src="{$Artifacts[artifact].image}" alt="{$Artifacts[artifact].name}">
												<div class="removeArtifactButtonContainer">
													<XButton clickCallback={() => handleRemoveArtifact(artifact, 'situational')} size="medium" hoverable={false} />
												</div>
											</div>
											<p>{$Artifacts[artifact].name}</p>
										</div>
									{/each}
									{#if unusedArtifacts.length > 0}
										<button type="button" class="addArtifactButton" on:click={() => pickArtifactSit = true}><span>+</span></button>
									{/if}
								{:else}
									<div class="mobileArtifactPicker">
										{#each unusedArtifacts as artifact (artifact)}
											<button type="button" class="artifactButton" on:click={() => handleAddArtifact(artifact, 'situational') }>
												<img class="artifactImg" src="{$Artifacts[artifact].image}" alt="{$Artifacts[artifact].name}">
												<p>{$Artifacts[artifact].name}</p>
											</button>
										{/each}
									</div>
								{/if}
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<div class="desktopArtifactPicker" class:open={pickArtifactPri || pickArtifactSec || pickArtifactSit}>
	<div class="background" on:click={() => {
		const line = pickArtifactPri ? 'primary' : pickArtifactSec ? 'secondary' : 'situational';
		handleAddArtifact('cancel', line);
	}}>
		<div class="artifactModalCloseContainer">
			<ModalCloseButton onClose={() => {
				const line = pickArtifactPri ? 'primary' : pickArtifactSec ? 'secondary' : 'situational';
				handleAddArtifact('cancel', line);
			}} />
		</div>
		<div class="artifactPickerWindow" on:click={e => e.stopPropagation()}>
			{#each unusedArtifacts as artifact (artifact)}
				<button type="button" class="artifactButton"
					on:click={() => {
						const line = pickArtifactPri ? 'primary' : pickArtifactSec ? 'secondary' : 'situational';
						handleAddArtifact(artifact, line);
					}}>
					<img class="artifactImg" src="{$Artifacts[artifact].image}" alt="{$Artifacts[artifact].name}">
					<p>{$Artifacts[artifact].name}</p>
				</button>
			{/each}
		</div>
	</div>
</div>

<style lang="scss">
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
	.heroFinderContainer {
		background: var(--appBGColor);
		border-radius: 10px;
		height: 70%;
		overflow-x: hidden;
		overflow-y: auto;
		position: relative;
		width: 80%;
	}
	.section1 {
		.heroFinderHead {
			padding: 10px;
			position: relative;
			.searchContainer {
				display: flex;
				justify-content: center;
				padding: 5px;
				padding-bottom: 10px;
				.desktopSearch {
					display: none;
				}
				.mobileSearch {
					display: block;
				}
				input {
					background-color: var(--appBGColorLight);
					border: none;
					border-radius: 5px;
					box-shadow: var(--neu-sm-i-BGColor-shadow);
					color: var(--appColorBlack);
					font-size: 1rem;
					outline: none;
					padding: 5px;
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
					top: 10px;
					transition: all 0.2s;
					width: 40px;
				}
				.searchButton {
					right: 65px;
					.searchImage {
						max-width: 20px;
						opacity: 0.3;
						&.light {
							filter: invert(1);
						}
					}
				}
				.openFiltersButton {
					right: 33px;
					.openFiltersImage {
						max-width: 20px;
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
			.filters {
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
				top: 60px;
				transform: translate(-50%, 0);
				transition: all 0.2s;
				visibility: hidden;
				width: 90%;
				&.open {
					visibility: visible;
					opacity: 1;
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
						&.filterSelected {
							border-radius: 50%;
							box-shadow: 0 0 7px 2px var(--appColorPrimary);
						}
					}
				}
			}
		}
		.heroGrid {
			display: grid;
			grid-gap: 10px 10px;
			grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
			grid-template-rows: repeat(auto-fit, minmax(100px, 1fr));
			justify-content: space-evenly;
			overflow: hidden;
		}
		.heroPortrait {
			background: transparent;
			border: none;
			cursor: pointer;
			outline: none;
			img {
				border-radius: 50%;
				max-width: 100px;
			}
			p {
				color: var(--appColorBlack);
				font-weight: bold;
				margin: 0;
			}
			&.active {
				img {
					border: 5px solid var(--appColorPrimary);
				}
			}
		}
	}
	.section2 {
		.heroEditHead {
			display: flex;
			height: 50px;
			padding: 10px;
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
		.heroName {
			font-size: 1.3rem;
			font-weight: bold;
			text-align: center;
			width: 100%;
		}
		.starsInputContainer {
			margin-top: 5px;
		}
		.heroEditor {
			align-items: center;
			display: flex;
			flex-direction: column;
			justify-content: center;
			padding: 10px;
			padding-top: 0px;
			h4 {
				margin: 10px 0px;
				text-align: center;
				width: 100%;
			}
			.portraitArea {
				align-items: center;
				display: flex;
				flex-direction: row;
				justify-content: center;
				max-width: 400px;
				padding: 5px;
				width: 100%;
			}
			.siFlipButtonArea {
				align-items: center;
				display: flex;
				justify-content: center;
				width: 33%;
			}
			.portraitContainer {
				align-items: center;
				display: flex;
				flex-direction: column;
				justify-content: center;
				width: 33%;
				.editorPortrait {
					border-radius: 50%;
					max-width: 150px;
				}
			}
			.furnFlipButtonArea {
				align-items: center;
				display: flex;
				justify-content: center;
				width: 33%;
			}
			.ascFlipButtonArea {
				display: flex;
				justify-content: center;
				padding: 5px;
				width: 100%;
			}
			.engraveInputContainer {
				margin: 10px 0px;
			}
			.coreArea {
				align-items: center;
				display: flex;
				justify-content: center;
				padding-top: 10px;
				width: 100%;
				.coreButton {
					background-color: var(--appBGColor);
					border: none;
					border-radius: 10px;
					box-shadow: var(--neu-sm-i-BGColor-shadow);
					color: var(--appColorBlack);
					cursor: pointer;
					font-size: 1rem;
					padding: 5px;
					&.on {
						background-color: var(--legendColor);
						color: white;
					}
				}
			}
			.notesArea {
				align-items: center;
				display: flex;
				flex-direction: column;
				justify-content: center;
				width: 100%;
				.notesEditor {
					background: var(--appBGColor);
					border: none;
					border-radius: 10px;
					box-shadow: var(--neu-sm-i-BGColor-shadow);
					color: var(--appColorBlack);
					height: 100px;
					outline: 0;
					padding: 5px;
					width: 100%;
					&:focus {
					background-color: var(--appTextInputFocusBG);
					}
					&::placeholder {
						color: var(--appColorBlack);
						opacity: 0.5;
					}
				}
				.noteLimitArea {
					font-size: 0.8rem;
					margin-top: 5px;
					text-align: right;
					width: 100%;
					&.maxed {
						color: var(--appDelColor);
						font-weight: bold;
					}
				}
			}
			.selectedArtifacts {
				display: grid;
				grid-gap: 5px 5px;
				grid-template-columns: 100%;
				justify-content: space-evenly;
				overflow: hidden;
				width: 100%;
				.gridCell {
					h5 {
						margin: 0;
						margin-top: 5px;
						padding-left: 5px;
					}
					.artifactLine {
						align-items: end;
						background-color: var(--appBGColor);
						border-radius: 10px;
						box-shadow: var(--neu-sm-ni-BGColor-inset-shadow);
						display: grid;
						grid-auto-flow: column;
						grid-gap: 5px;
						grid-template-columns: repeat(auto-fit, minmax(80px, max-content));
						margin-top: 5px;
						min-height: 105px;
						overflow-x: auto;
						padding: 5px;
						padding-left: 10px;
						width: 100%;
					}
					.mobileArtifactPicker {
						display: grid;
						grid-gap: 5px;
						grid-auto-flow: column;
						grid-template-columns: repeat(auto-fit, minmax(80px, max-content));
					}
					.artifactContainer {
						align-items: center;
						display: flex;
						flex-direction: column;
						justify-content: center;
						p {
							color: var(--appColorBlack);
							font-size: 0.8rem;
							margin: 0;
							width: 80px;
							overflow: hidden;
							text-align: center;
							text-overflow: ellipsis;
							user-select: none;
							white-space: nowrap;
						}
						.artifactImgContainer {
							position: relative;
							.artifactImg {
								border-radius: 50%;
								max-width: 60px;
							}
							.removeArtifactButtonContainer {
								position: absolute;
								right: -10px;
								top: -10px;
							}
						}
					}
					.addArtifactButton {
						background: transparent;
						border: 3px solid var(--appColorPrimary);
						border-radius: 50%;
						color: var(--appColorPrimary);
						cursor: pointer;
						flex-grow: 0;
						flex-shrink: 0;
						font-size: 1.5rem;
						height: 60px;
						margin-bottom: 20px;
						margin-left: auto;
						margin-right: auto;
						padding: 0;
						width: 60px;
					}
				}
			}
		}
	}
	.artifactButton {
		align-items: center;
		background-color: transparent;
		border: none;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		justify-content: center;
		outline: none;
		.artifactImg {
			border-radius: 50%;
			max-width: 60px;
		}
		p {
			color: var(--appColorBlack);
			margin: 0;
			width: 80px;
			overflow: hidden;
			text-overflow: ellipsis;
			user-select: none;
			white-space: nowrap;
		}
	}
	.desktopArtifactPicker {
		display: none;
	}
	@media only screen and (min-width: 767px) {
		.modalCloseContainer {
			right: 25%;
		}
		.heroFinderContainer {
			width: 50%;
		}
		.section1 {
			.heroFinderHead {
				.searchContainer {
					.desktopSearch {
						display: block;
					}
					.mobileSearch {
						display: none;
					}
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
				.filters {
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
		}
		.section2 {
			.heroEditHead {
				.backButton {
					&:hover {
						background: var(--neu-convex-BGColor-wide-bg);
					}
				}
				.saveButton {
					&:hover {
						background: var(--neu-convex-BGColor-wide-bg);
					}
				}
			}
			.heroEditor {
				.notesArea {
					.notesEditor {
						width: 75%;
					}
					.noteLimitArea {
						width: 75%;
					}
				}
				.selectedArtifacts {
					.gridCell {
						.mobileArtifactPicker {
							display: none;
						}
						.artifactLine {
							grid-auto-flow: row;
						}
					}
				}
			}
		}
		.desktopArtifactPicker {
			display: none;
			visibility: hidden;
			.background {
				height: 100%;
				position: relative;
				width: 100%;
				z-index: 5;
			}
			&.open {
				display: block;
				height: 100%;
				position: fixed;
				left: 0;
				top: 0;
				visibility: visible;
				width: 100%;
				z-index: 5;
			}
			.artifactModalCloseContainer {
				margin-left: auto;
				position: relative;
				right: 37.5%;
			}
			.artifactPickerWindow {
				background-color: var(--appBGColor);
				border-radius: 10px;
				display: grid;
				grid-gap: 5px;
				grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
				padding: 10px;
				width: 25%;
				z-index: 5;
			}
		}
	}
</style>
