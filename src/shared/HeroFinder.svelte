<script>
	import { onMount } from 'svelte';
	import HeroData from '../stores/HeroData.js';
	import Artifacts from '../stores/Artifacts.js';
	import ModalCloseButton from '../modals/ModalCloseButton.svelte';
	import FlipButton from '../shared/FlipButton.svelte';

	export let config = {};

	$: heroes = makeHeroList();
	$: allFactionsEnabled = showLB && showM && showW && showGB && showC && showH && showD;
	$: allTypesEnabled = showInt && showAgi && showStr;
	$: allClassEnabled = showMage && showWar && showTank && showSup && showRan;
	$: unusedArtifacts = makeUnusedArtifactList();

	let close = () => {};
	let section = 1;
	let selectedHero = {};
	let openFilters = false;
	let idx = 0;
	let pos = 0;
	let onSuccess = () => {};
	let oldHeroID = '';
	let oldHeroData = {};
	let compHeroData = {};

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
				artifact: oldHeroData.artifact,
				core: oldHeroData.core
			}
			unusedArtifacts = makeUnusedArtifactList();
		}
		heroes = makeHeroList();
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
		let buffer = [];
		if('artifact' in selectedHero && 'id' in selectedHero) {
			const heroClass = $HeroData.find(e => e.id === selectedHero.id).class;
			if('artifact' in selectedHero) {
				for(const artifact in $Artifacts) {
					if($Artifacts[artifact].class === heroClass || $Artifacts[artifact].class === 'Any') {
						if(!selectedHero.artifact.includes(artifact)) {
							buffer.push(artifact);
						}
					}
				}
			} else {
				for(const artifact in $Artifacts) {
					buffer.push(artifact);
				}
			}
		}
		return buffer.sort();
	}

	function handleFilterMasterButtonClick(category) {
		switch(category) {
			case 'faction':
				if(allFactionsEnabled) {
					showLB = false;
					showM = false;
					showW = false;
					showGB = false;
					showC = false;
					showH = false;
					showD = false;
				} else {
					showLB = true;
					showM = true;
					showW = true;
					showGB = true;
					showC = true;
					showH = true;
					showD = true;
				}
				break;
			case 'type':
				if(allTypesEnabled) {
					showInt = false;
					showAgi = false;
					showStr = false;
				} else {
					showInt = true;
					showAgi = true;
					showStr = true;
				}
				break;
			case 'class':
				if(allClassEnabled) {
					showMage = false;
					showWar = false;
					showTank = false;
					showSup = false;
					showRan = false;
				} else {
					showMage = true;
					showWar = true;
					showTank = true;
					showSup = true;
					showRan = true;
				}
				break;
			default:
				throw new Error(`Invalid category given to handleFilterMasterButtonClick(): ${category}`);
		}
		heroes = makeHeroList();
	}

	function handleSIChange() {
		selectedHero.si+=5;
		if(selectedHero.si > 30) {
			selectedHero.si = 0;
		}
	}

	function handleAscChange() {
		if(++selectedHero.ascendLv > 6) {
			selectedHero.ascendLv = 0;
		}
	}

	function handleFurnChange() {
		switch(selectedHero.furn) {
			case 0:
				selectedHero.furn = 3;
				break;
			case 3:
				selectedHero.furn = 9;
				break;
			case 9:
				selectedHero.furn = 0;
				break;
			default:
				throw new Error(`Error in handleFurnChange, selectedHero.furn is an invalid level: ${selectedHero.furn}`);
		}
	}

	function handleAddArtifact(artifact) {
		if(!selectedHero.artifact.includes(artifact)) {
			selectedHero.artifact = [...selectedHero.artifact, artifact];
		}
		unusedArtifacts = makeUnusedArtifactList();
	}

	function handleRemoveArtifact(artifact) {
		selectedHero.artifact = selectedHero.artifact.filter((e) => e !== artifact);
		unusedArtifacts = makeUnusedArtifactList();
	}

	async function checkHero(hero) {
		const expectedProps = [
			{name: 'id', type: 'string'},
			{name: 'ascendLv', type: 'number'},
			{name: 'si', type: 'number'},
			{name: 'furn', type: 'number'},
			{name: 'artifact', type: 'array'},
			{name: 'core', type: 'boolean'},
		];

		// make sure that hero is an object (and nothing else)
		// https://javascript.plainenglish.io/javascript-check-if-a-variable-is-an-object-and-nothing-else-not-an-array-a-set-etc-a3987ea08fd7
		if(Object.prototype.toString.call(hero) !== '[object Object]') return { retCode: 1, message: 'Hero must be an object.'};

		// hero must be an object at this point, so make sure it's consistent with the format we expect
		for(const prop of expectedProps) {
			if(!(prop.name in hero)) {
				return { retCode: 1, message: `Hero object missing property: ${prop.name}`};
			} else {
				if(prop.type != 'array') {
					if(!(typeof hero[prop.name] === prop.type)) return { retCode: 1, message: `Hero object property, ${prop.name}, is type ${typeof hero[prop.name]}. Expected ${prop.type}.`};
				} else {
					if(!Array.isArray(hero[prop.name])) return { retCode: 1, message: `Hero object property, ${prop.name}, is type ${typeof hero[prop.name]}. Expected ${prop.type}.`};
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
		for(const artifact of hero.artifact) {
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
		onSuccess(idx, pos, selectedHero);
		close();
	}

	function selectHero(heroID) {
		if(heroID in compHeroData) {
			selectedHero = {
				id: heroID,
				ascendLv: compHeroData[heroID].ascendLv,
				si: compHeroData[heroID].si,
				furn: compHeroData[heroID].furn,
				artifact: compHeroData[heroID].artifact,
				core: compHeroData[heroID].core,
			};
		} else {
			selectedHero = {
				id: heroID,
				ascendLv: 6,
				si: 20,
				furn: 3,
				artifact: [],
				core: false,
			};
		}
		section = 2;
		unusedArtifacts = makeUnusedArtifactList();
	}
</script>

<div class="background" on:click={close}>
	<div class="modalCloseContainer">
		<ModalCloseButton onClose={close} />
	</div>
	<div class="heroFinderContainer" on:click={(e) => e.stopPropagation()}>
		{#if section === 1}
			<div class="section1">
				<div class="mobileExpanderTitle">
					<button class="filtersButton" on:click={() => openFilters = !openFilters}><i class="arrow {openFilters ? 'open' : 'right' }"></i><span>Search and Filters</span></button>
				</div>
				<div class="mobileExpander" class:filterOpen={openFilters}>
					<div class="searchContainer">
						<div class="search">
							<input type="search" placeholder="Search" bind:value={searchStr} on:keyup={() => heroes = makeHeroList()} on:search={() => heroes = makeHeroList()}>
						</div>
					</div>
					<div class="filters">
						<div class="filterSection">
							<button class="filterMasterButton" class:filterMasterDisabled={!allFactionsEnabled} on:click={() => handleFilterMasterButtonClick('faction')}>ALL</button>
							<button class="filterButton" on:click={() => {showLB = !showLB; heroes = makeHeroList(); }}>
								<img class="filterImg" class:filterInactive={!showLB} src="./img/factions/lightbearer.png" alt="Lightbearer">
							</button>
							<button class="filterButton" on:click={() => { showM = !showM; heroes = makeHeroList(); }}>
								<img class="filterImg" class:filterInactive={!showM} src="./img/factions/mauler.png" alt="Mauler">
							</button>
							<button class="filterButton" on:click={() => { showW = !showW; heroes = makeHeroList(); }}>
								<img class="filterImg" class:filterInactive={!showW} src="./img/factions/wilder.png" alt="wilder">
							</button>
							<button class="filterButton" on:click={() => { showGB = !showGB; heroes = makeHeroList(); }}>
								<img class="filterImg" class:filterInactive={!showGB} src="./img/factions/graveborn.png" alt="Graveborn">
							</button>
							<button class="filterButton" on:click={() => { showC = !showC; heroes = makeHeroList(); }}>
								<img class="filterImg" class:filterInactive={!showC} src="./img/factions/celestial.png" alt="Celestial">
							</button>
							<button class="filterButton" on:click={() => { showH = !showH; heroes = makeHeroList(); }}>
								<img class="filterImg" class:filterInactive={!showH} src="./img/factions/hypogean.png" alt="Hypogean">
							</button>
							<button class="filterButton" on:click={() => { showD = !showD; heroes = makeHeroList(); }}>
								<img class="filterImg" class:filterInactive={!showD} src="./img/factions/dimensional.png" alt="Dimensional">
							</button>
						</div>
						<div class="filterSection">
							<button class="filterMasterButton" class:filterMasterDisabled={!allTypesEnabled} on:click={() => handleFilterMasterButtonClick('type')}>ALL</button>
							<button class="filterButton" on:click={() => { showInt = !showInt; heroes = makeHeroList(); }}>
								<img class="filterImg" class:filterInactive={!showInt} src="./img/types/intelligence.png" alt="Intelligence">
							</button>
							<button class="filterButton" on:click={() => { showAgi = !showAgi; heroes = makeHeroList(); }}>
								<img class="filterImg" class:filterInactive={!showAgi} src="./img/types/agility.png" alt="Agility">
							</button>
							<button class="filterButton" on:click={() => { showStr = !showStr; heroes = makeHeroList(); }}>
								<img class="filterImg" class:filterInactive={!showStr} src="./img/types/strength.png" alt="Strength">
							</button>
						</div>
						<div class="filterSection">
							<button class="filterMasterButton" class:filterMasterDisabled={!allClassEnabled} on:click={() => handleFilterMasterButtonClick('class')}>ALL</button>
							<button class="filterButton" on:click={() => { showMage = !showMage; heroes = makeHeroList(); }}>
								<img class="filterImg" class:filterInactive={!showMage} src="./img/classes/mage.png" alt="Mage">
							</button>
							<button class="filterButton" on:click={() => { showWar = !showWar; heroes = makeHeroList(); }}>
								<img class="filterImg" class:filterInactive={!showWar} src="./img/classes/warrior.png" alt="Warrior">
							</button>
							<button class="filterButton" on:click={() => { showTank = !showTank; heroes = makeHeroList(); }}>
								<img class="filterImg" class:filterInactive={!showTank} src="./img/classes/tank.png" alt="Tank">
							</button>
							<button class="filterButton" on:click={() => { showSup = !showSup; heroes = makeHeroList(); }}>
								<img class="filterImg" class:filterInactive={!showSup} src="./img/classes/support.png" alt="Support">
							</button>
							<button class="filterButton" on:click={() => { showRan = !showRan; heroes = makeHeroList(); }}>
								<img class="filterImg" class:filterInactive={!showRan} src="./img/classes/ranger.png" alt="Ranger">
							</button>
						</div>
					</div>
				</div>
				<div class="heroGrid">
					{#each heroes as hero}
						<button class="heroPortrait" on:click={() => selectHero(hero.id)} class:active={hero.id in compHeroData}>
							<img src="{hero.portrait}" alt="hero.name">
							<p>{hero.name}</p>
						</button>
					{/each}
				</div>
			</div>
		{:else if section === 2}
			<div class="section2">
				<div class="heroEditHead">
					<button class="backButton" on:click={() => section = 1}><span>&lt; Heroes</span></button>
					<div class="heroName">{$HeroData.find(e => e.id === selectedHero.id).name}</div>
					<button class="saveButton" on:click={() => saveHero()}><span>Save</span></button>
				</div>
				<div class="heroEditor">
					<div class="portraitArea">
						<div class="siFlipButtonArea">
							<FlipButton options="{['SI +0', 'SI +5', 'SI +10', 'SI +15', 'SI +20', 'SI +25', 'SI +30']}"
								optionStyles="{[
									'background-color: #6B8DF2; color: white; border: 3px solid #6B8DF2; border-radius: 10px; padding: 5px; width: 75px; font-size: 1.05rem;',
									'background-color: #6B8DF2; color: white; border: 3px solid #6B8DF2; border-radius: 10px; padding: 5px; width: 75px; font-size: 1.05rem;',
									'background-color: #6B8DF2; color: white; border: 3px solid #6B8DF2; border-radius: 10px; padding: 5px; width: 75px; font-size: 1.05rem;',
									'background-color: #6B8DF2; color: white; border: 3px solid #6B8DF2; border-radius: 10px; padding: 5px; width: 75px; font-size: 1.05rem;',
									'background-color: #6B8DF2; color: white; border: 3px solid #6B8DF2; border-radius: 10px; padding: 5px; width: 75px; font-size: 1.05rem;',
									'background-color: #6B8DF2; color: white; border: 3px solid #6B8DF2; border-radius: 10px; padding: 5px; width: 75px; font-size: 1.05rem;',
									'background-color: #6B8DF2; color: white; border: 3px solid #6B8DF2; border-radius: 10px; padding: 5px; width: 75px; font-size: 1.05rem;',
									]}"
									curOption="{Math.floor(selectedHero.si/5)}"
									onClick="{handleSIChange}" />
						</div>
						<div class="portraitContainer">
							<img class="editorPortrait" src="{$HeroData.find(e => e.id === selectedHero.id).portrait}" alt="{$HeroData.find(e => e.id === selectedHero.id).name}">
						</div>
						<div class="furnFlipButtonArea">
							<FlipButton options="{['0f', '3f', '9f']}"
								optionStyles="{[
									'background-color: #6B8DF2; color: white; border: 3px solid #6B8DF2; border-radius: 10px; padding: 5px; width: 50px; font-size: 1.05rem;',
									'background-color: #6B8DF2; color: white; border: 3px solid #6B8DF2; border-radius: 10px; padding: 5px; width: 50px; font-size: 1.05rem;',
									'background-color: #6B8DF2; color: white; border: 3px solid #6B8DF2; border-radius: 10px; padding: 5px; width: 50px; font-size: 1.05rem;',
								]}"
								curOption="{selectedHero.furn === 0 ? 0 : selectedHero.furn === 3 ? 1 : 2 }"
								onClick="{handleFurnChange}" />
						</div>
					</div>
					<div class="ascFlipButtonArea">
						<FlipButton options="{['Elite', 'Elite+', 'Legendary', 'Legendary+', 'Mythic', 'Mythic+', 'Ascended']}"
							optionStyles="{[
								'background-color: #AF3CEA; color: white; border: 3px solid #AF3CEA; border-radius: 10px; padding: 7px 20px; font-size: 1.1rem; font-weight: bold;',
								'background-color: #AF3CEA; color: white; border: 3px solid #6D2691; border-radius: 10px; padding: 7px 20px; font-size: 1.1rem; font-weight: bold;',
								'background-color: #F7C331; color: white; border: 3px solid #F7C331; border-radius: 10px; padding: 7px 20px; font-size: 1.1rem; font-weight: bold;',
								'background-color: #F7C331; color: white; border: 3px solid #AD8823; border-radius: 10px; padding: 7px 20px; font-size: 1.1rem; font-weight: bold;',
								'background-color: #FE481A; color: white; border: 3px solid #FE481A; border-radius: 10px; padding: 7px 20px; font-size: 1.1rem; font-weight: bold;',
								'background-color: #FE481A; color: white; border: 3px solid #B33212; border-radius: 10px; padding: 7px 20px; font-size: 1.1rem; font-weight: bold;',
								'background: linear-gradient(#91BDFF, transparent), linear-gradient(-45deg, #E196FF, transparent), linear-gradient(45deg, #B1A3FE, transparent); background-blend-mode: multiply; color: white; border: 3px solid #B289E8; border-radius: 10px; padding: 7px 20px; font-size: 1.1rem; font-weight: bold;',
								]}"
								curOption="{selectedHero.ascendLv}"
								onClick="{handleAscChange}" />
					</div>
					<div class="coreArea">
						<button class="coreButton" class:on={selectedHero.core} on:click={() => selectedHero.core = !selectedHero.core}><span>Core</span></button>
					</div>
					<h4>Artifacts</h4>
					<div class="artifactLine">
						{#each selectedHero.artifact as artifact, i}
							<button class="artifactButton" on:click={() => handleRemoveArtifact(artifact) }>
								<img class="artifactImg" src="{$Artifacts[artifact].image}" alt="{$Artifacts[artifact].name}">
								<p>{$Artifacts[artifact].name}</p>
							</button>
							{#if i < selectedHero.artifact.length - 1}
								<span>&gt;</span>
							{/if}
						{/each}
					</div>
					<div class="artifactPicker">
						<div class="artifactGrid">
							{#each unusedArtifacts as artifact}
								<button class="artifactButton" on:click={() => handleAddArtifact(artifact) }>
									<img class="artifactImg" src="{$Artifacts[artifact].image}" alt="{$Artifacts[artifact].name}">
									<p>{$Artifacts[artifact].name}</p>
								</button>
							{/each}
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
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
		background: white;
		border-radius: 10px;
		height: 80%;
		overflow-x: hidden;
		overflow-y: auto;
		position: relative;
		width: 80%;
	}
	.filtersButton {
		background-color: var(--appColorSecondary);
		border: none;
		color: black;
		cursor: pointer;
		font-size: 1.1rem;
		height: 40px;
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
		-webkit-transform: rotate(-45deg);
	}
	.arrow.open {
		transform: rotate(45deg);
		-webkit-transform: rotate(45deg);
	}
	.mobileExpander {
		background-color: var(--appBGColor);
		margin-bottom: 10px;
		max-height: 0;
		overflow: hidden;
		transition: max-height 0.2s ease;
	}
	.mobileExpander.filterOpen {
		box-shadow: 0px 0px 10px #aaa;
		max-height: 500px;
	}
	.filters {
		display: flex;
		flex-direction: row;
		width: 100%;
	}
	.searchContainer {
		border-bottom: 1px solid black;
		padding-bottom: 15px;
		padding-top: 15px;
		text-align: center;
	}
	.search {
		display: inline-block;
		width: 100%;
	}
	.search input {
		height: 1.6rem;
		width: 50%;
	}
	.filters {
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 100%;
	}
	.filterMasterButton {
		align-items: center;
		border: 3px solid var(--appColorPrimary);
		border-radius: 50%;
		color: var(--appColorPrimary);
		display: flex;
		font-size: 0.6rem;
		height: 33px;
		justify-content: center;
		margin-right: 15px;
		margin-top: 7px;
		text-decoration: none;
		transition: all .3s;
		width: 33px;
	}
	.filterMasterButton:active {
		background-color: var(--appColorPriDark);
		border-color: var(--appColorPriDark);
		color: white;
	}
	.filterMasterDisabled {
		border-color: #888;
		color: #888;
	}
	.filterMasterDisabled:active {
		background-color: #666;
		border-color: #666;
		color: white;
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
	}
	.heroPortrait img {
		border-radius: 50%;
		max-width: 100px;
	}
	.heroPortrait.active img {
		border: 5px solid var(--appColorPrimary);
	}
	.heroPortrait p {
		font-weight: bold;
		margin: 0;
	}
	.heroEditHead {
		border-bottom: 1px solid black;
		display: flex;
		padding: 5px;
		position: relative;
		width: 100%;
	}
	.heroName {
		font-size: 1.3rem;
		font-weight: bold;
		text-align: center;
		width: 100%;
	}
	.backButton {
		background-color: transparent;
		border: 2px solid var(--appColorPrimary);
		border-radius: 5px;
		color: var(--appColorPrimary);
		font-size: 1.1rem;
		left: 5px;
		outline: none;
		padding: 2px;
		position: absolute;
	}
	.backButton:active {
		box-shadow: none;
	}
	.saveButton {
		background-color: var(--appColorPrimary);
		border: 2px solid var(--appColorPrimary);
		border-radius: 5px;
		color: white;
		font-size: 1.1rem;
		outline: none;
		padding: 2px;
		position: absolute;
		right: 5px;
	}
	.saveButton:active {
		box-shadow: none;
	}
	.heroEditor {
		align-items: center;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 5px;
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
	}
	.editorPortrait {
		border-radius: 50%;
		max-width: 150px;
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
	.coreArea {
		align-items: center;
		display: flex;
		justify-content: center;
		padding-top: 10px;
		width: 100%;
	}
	.coreButton {
		background-color: #aaa;
		border: none;
		border-radius: 10px;
		color: white;
		cursor: pointer;
		font-size: 1rem;
		padding: 5px;
	}
	.coreButton.on {
		background-color: var(--appDelColor);
		box-shadow: none;
	}
	.heroEditor h4 {
		margin: 10px 0px;
		text-align: center;
		width: 100%;
	}
	.artifactLine {
		align-items: center;
		background-color: var(--appBGColorDark);
		border-radius: 10px;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: center;
		margin-top: 5px;
		min-height: 90px;
		padding: 5px;
		width: 100%;
	}
	.artifactLine span {
		font-size: 2rem;
		font-weight: bold;
	}
	.artifactPicker {
		background-color: var(--appBGColorDark);
		border-radius: 10px;
		margin-top: 10px;
		padding: 5px;
		width: 100%;
	}
	.artifactGrid {
		display: grid;
		grid-gap: 5px 5px;
		grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
		grid-template-rows: repeat(auto-fit, minmax(50px, 1fr));
		justify-content: space-evenly;
		overflow: hidden;
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
	}
	.artifactImg {
		border-radius: 50%;
		max-width: 80px;
	}
	.artifactButton p {
		margin: 0;
		max-width: 160px;
	}
	@media only screen and (min-width: 767px) {
		.modalCloseContainer {
			right: 25%;
		}
		.heroFinderContainer {
			width: 50%;
		}
		.filterMasterButton:hover {
			background-color: var(--appColorPrimary);
			color: rgba(255, 255, 255, 0.9);
		}
		.filterMasterDisabled:hover {
			background-color: #888;
			color: rgba(255, 255, 255, 0.9);
		}
		.backButton:hover {
			background-color: var(--appColorPrimary);
			box-shadow: 2px 2px 5px #aaa;
			color: white;
		}
		.saveButton:hover {
			box-shadow: 2px 2px 5px #aaa;
		}
	}
</style>
