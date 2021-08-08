<script>
	import { onMount, tick } from 'svelte';
	import { flip } from 'svelte/animate';
	import HeroData from '../stores/HeroData.js';
	import Artifacts from '../stores/Artifacts.js';
	import AppData from '../stores/AppData.js';
	import ModalCloseButton from '../modals/ModalCloseButton.svelte';
	import AscensionMenu from '../shared/AscensionMenu.svelte';
	import SIMenu from '../shared/SIMenu.svelte';
	import FurnMenu from '../shared/FurnMenu.svelte';

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
	let openFilters = !isMobile;
	let idx = 0;
	let pos = 0;
	let onSuccess = () => {};
	let oldHeroID = '';
	let oldHeroData = {};
	let compHeroData = {};
	let pickArtifactPri = false;
	let pickArtifactSec = false;
	let pickArtifactSit = false;

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
				artifacts: JSON.parse(JSON.stringify(oldHeroData.artifacts)),
				core: oldHeroData.core,
				notes: oldHeroData.notes,
			}
			unusedArtifacts = makeUnusedArtifactList();
		}
		heroes = makeHeroList();
		if(section === 1) {
			await tick();
			if(!isMobile) document.querySelector('#searchBox').focus();
		}
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

	function handleSIChange(level) {
		selectedHero.si = level;
	}

	function handleAscChange(level) {
		selectedHero.ascendLv = level;
	}

	function handleFurnChange(level) {
		selectedHero.furn = level;
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
				artifacts: JSON.parse(JSON.stringify(compHeroData[heroID].artifacts)),
				core: compHeroData[heroID].core,
				notes: compHeroData[heroID].notes,
			};
		} else {
			selectedHero = {
				id: heroID,
				ascendLv: 6,
				si: $HeroData.find(e => e.id === heroID).si_benchmark,
				furn: $HeroData.find(e => e.id === heroID).furn_benchmark,
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
		if(section === 1) {
			await tick();
			document.querySelector('#searchBox').focus();
		}
		// scroll back to top
		document.getElementById('hfContainer').scrollTop = 0;
	}
</script>

<div class="background">
	<div class="modalCloseContainer">
		<ModalCloseButton onClose={close} />
	</div>
	<div id="hfContainer" class="heroFinderContainer" on:click={(e) => e.stopPropagation()}>
		{#if section === 1}
			<div class="section1">
				<div class="mobileExpanderTitle">
					<button type="button" class="filtersButton" on:click={() => openFilters = !openFilters}><i class="arrow {openFilters ? 'open' : 'right' }"></i><span>Search and Filters</span></button>
				</div>
				<div class="mobileExpander" class:filterOpen={openFilters}>
					<div class="searchContainer">
						<div class="search">
							<input id="searchBox" type="search" placeholder="Search" bind:value={searchStr} on:keyup={() => heroes = makeHeroList()} on:search={() => heroes = makeHeroList()}>
						</div>
					</div>
					<div class="filters">
						<div class="filterSection">
							<button type="button" class="filterMasterButton" class:filterMasterDisabled={!allFactionsEnabled} on:click={() => handleFilterMasterButtonClick('faction')}>ALL</button>
							<button type="button" class="filterButton" on:click={() => {showLB = !showLB; heroes = makeHeroList(); }}>
								<img class="filterImg" class:filterInactive={!showLB} src="./img/factions/lightbearer.png" alt="Lightbearer">
							</button>
							<button type="button" class="filterButton" on:click={() => { showM = !showM; heroes = makeHeroList(); }}>
								<img class="filterImg" class:filterInactive={!showM} src="./img/factions/mauler.png" alt="Mauler">
							</button>
							<button type="button" class="filterButton" on:click={() => { showW = !showW; heroes = makeHeroList(); }}>
								<img class="filterImg" class:filterInactive={!showW} src="./img/factions/wilder.png" alt="wilder">
							</button>
							<button type="button" class="filterButton" on:click={() => { showGB = !showGB; heroes = makeHeroList(); }}>
								<img class="filterImg" class:filterInactive={!showGB} src="./img/factions/graveborn.png" alt="Graveborn">
							</button>
							<button type="button" class="filterButton" on:click={() => { showC = !showC; heroes = makeHeroList(); }}>
								<img class="filterImg" class:filterInactive={!showC} src="./img/factions/celestial.png" alt="Celestial">
							</button>
							<button type="button" class="filterButton" on:click={() => { showH = !showH; heroes = makeHeroList(); }}>
								<img class="filterImg" class:filterInactive={!showH} src="./img/factions/hypogean.png" alt="Hypogean">
							</button>
							<button type="button" class="filterButton" on:click={() => { showD = !showD; heroes = makeHeroList(); }}>
								<img class="filterImg" class:filterInactive={!showD} src="./img/factions/dimensional.png" alt="Dimensional">
							</button>
						</div>
						<div class="filterSection">
							<button type="button" class="filterMasterButton" class:filterMasterDisabled={!allTypesEnabled} on:click={() => handleFilterMasterButtonClick('type')}>ALL</button>
							<button type="button" class="filterButton" on:click={() => { showInt = !showInt; heroes = makeHeroList(); }}>
								<img class="filterImg" class:filterInactive={!showInt} src="./img/types/intelligence.png" alt="Intelligence">
							</button>
							<button type="button" class="filterButton" on:click={() => { showAgi = !showAgi; heroes = makeHeroList(); }}>
								<img class="filterImg" class:filterInactive={!showAgi} src="./img/types/agility.png" alt="Agility">
							</button>
							<button type="button" class="filterButton" on:click={() => { showStr = !showStr; heroes = makeHeroList(); }}>
								<img class="filterImg" class:filterInactive={!showStr} src="./img/types/strength.png" alt="Strength">
							</button>
						</div>
						<div class="filterSection">
							<button type="button" class="filterMasterButton" class:filterMasterDisabled={!allClassEnabled} on:click={() => handleFilterMasterButtonClick('class')}>ALL</button>
							<button type="button" class="filterButton" on:click={() => { showMage = !showMage; heroes = makeHeroList(); }}>
								<img class="filterImg" class:filterInactive={!showMage} src="./img/classes/mage.png" alt="Mage">
							</button>
							<button type="button" class="filterButton" on:click={() => { showWar = !showWar; heroes = makeHeroList(); }}>
								<img class="filterImg" class:filterInactive={!showWar} src="./img/classes/warrior.png" alt="Warrior">
							</button>
							<button type="button" class="filterButton" on:click={() => { showTank = !showTank; heroes = makeHeroList(); }}>
								<img class="filterImg" class:filterInactive={!showTank} src="./img/classes/tank.png" alt="Tank">
							</button>
							<button type="button" class="filterButton" on:click={() => { showSup = !showSup; heroes = makeHeroList(); }}>
								<img class="filterImg" class:filterInactive={!showSup} src="./img/classes/support.png" alt="Support">
							</button>
							<button type="button" class="filterButton" on:click={() => { showRan = !showRan; heroes = makeHeroList(); }}>
								<img class="filterImg" class:filterInactive={!showRan} src="./img/classes/ranger.png" alt="Ranger">
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
					<button type="button" class="backButton" on:click={() => changeSection(1)}><span>&lt; Heroes</span></button>
					<button type="button" class="saveButton" on:click={() => saveHero()}><span>Save</span></button>
				</div>
				<div class="heroEditor">
					<div class="heroName">{$HeroData.find(e => e.id === selectedHero.id).name}</div>
					<div class="portraitArea">
						<div class="siFlipButtonArea">
							<SIMenu
								menuItemChangeCallback={(index) => handleSIChange(index)}
								activeItem={selectedHero.si === -1 ? 0 : Math.floor(selectedHero.si/5) + 1}
								centerMenu={true}
								zIndexBase=4
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
							/>
						</div>
					</div>
					<div class="ascFlipButtonArea">
						<AscensionMenu
							menuItemChangeCallback={(index) => handleAscChange(index)}
							activeItem={selectedHero.ascendLv}
							centerMenu={true}
							zIndexBase=4
						/>
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
												<button type="button" class="removeButton" on:click={(e) => { handleRemoveArtifact(artifact, 'primary'); e.stopPropagation(); }}><span>x</span></button>
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
												<button type="button" class="removeButton" on:click={(e) => { handleRemoveArtifact(artifact, 'secondary'); e.stopPropagation(); }}><span>x</span></button>
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
												<button type="button" class="removeButton" on:click={(e) => { handleRemoveArtifact(artifact, 'situational'); e.stopPropagation(); }}><span>x</span></button>
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
	}
	.arrow.open {
		transform: rotate(45deg);
	}
	.mobileExpander {
		background-color: var(--appBGColor);
		margin-bottom: 10px;
		max-height: 0;
		overflow: hidden;
		transition: max-height 0.2s ease;
	}
	.mobileExpander.filterOpen {
		box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.15);
		max-height: 500px;
	}
	.filters {
		display: flex;
		flex-direction: row;
		width: 100%;
		display: flex;
		flex-direction: column;
		height: 100%;
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
		input {
			height: 1.6rem;
			width: 50%;
		}
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
		img {
			border-radius: 50%;
			max-width: 100px;
		}
		p {
			font-weight: bold;
			margin: 0;
		}
	}
	.heroPortrait.active {
		img {
			border: 5px solid var(--appColorPrimary);
		}
	}
	.heroEditHead {
		border-bottom: 1px solid black;
		display: flex;
		height: 40px;
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
		cursor: pointer;
		font-size: 1.1rem;
		left: 5px;
		outline: none;
		padding: 2px;
		position: absolute;
		&:active {
			box-shadow: none;
		}
	}
	.saveButton {
		background-color: var(--appColorPrimary);
		border: 2px solid var(--appColorPrimary);
		border-radius: 5px;
		color: white;
		cursor: pointer;
		font-size: 1.1rem;
		outline: none;
		padding: 2px;
		position: absolute;
		right: 5px;
		&:active {
			box-shadow: none;
		}
	}
	.heroEditor {
		align-items: center;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 10px;
		h4 {
			margin: 10px 0px;
			text-align: center;
			width: 100%;
		}
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
		background-color: var(--legendColor);
		box-shadow: none;
	}
	.notesArea {
		align-items: center;
		display: flex;
		flex-direction: column;
		justify-content: center;
		width: 100%;
		.notesEditor {
			border: 1px solid var(--appColorPrimary);
			height: 100px;
			outline: 0;
			width: 100%;
		}
		.noteLimitArea {
			font-size: 0.8rem;
			text-align: right;
			width: 100%;
		}
		.noteLimitArea.maxed {
			color: var(--appDelColor);
			font-weight: bold;
		}
	}
	.selectedArtifacts {
		display: grid;
		grid-gap: 5px 5px;
		grid-template-columns: 100%;
		justify-content: space-evenly;
		overflow: hidden;
		width: 100%;
	}
	.gridCell {
		h5 {
			margin: 0;
			margin-top: 5px;
			padding-left: 5px;
		}
	}
	.artifactLine {
		align-items: center;
		background-color: var(--appBGColorDark);
		border-radius: 10px;
		display: grid;
		grid-auto-flow: column;
		grid-gap: 5px;
		grid-template-columns: repeat(auto-fit, minmax(80px, max-content));
		margin-top: 5px;
		min-height: 90px;
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
			font-size: 0.8rem;
			margin: 0;
			width: 80px;
			overflow: hidden;
			text-align: center;
			text-overflow: ellipsis;
			user-select: none;
			white-space: nowrap;
		}
	}
	.artifactImgContainer {
		position: relative;
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
		p {
			margin: 0;
			width: 80px;
			overflow: hidden;
			text-overflow: ellipsis;
			user-select: none;
			white-space: nowrap;
		}
	}
	.artifactImg {
		border-radius: 50%;
		max-width: 60px;
	}
	.removeButton {
		background-color: var(--appDelColor);
		border: none;
		border-radius: 50%;
		cursor: pointer;
		font-weight: normal;
		outline: none;
		position: absolute;
		right: -3px;
		top: 0;
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
		width: 60px;
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
		.filterMasterButton {
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
		.backButton {
			&:hover {
				background-color: var(--appColorPrimary);
				box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.25);
				color: white;
			}
		}
		.saveButton {
			&:hover {
				box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.25);
			}
		}
		.notesArea {
			.notesEditor {
				width: 75%;
			}
			.noteLimitArea {
				width: 75%;
			}
		}
		.mobileArtifactPicker {
			display: none;
		}
		.artifactLine {
			grid-auto-flow: row;
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
		}
		.desktopArtifactPicker.open {
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
		.artifactButton {
			&:hover {
				p {
					overflow: visible;
					width: fit-content;
				}
			}
			p {
				&:hover {
					overflow: visible;
					width: fit-content;
				}
			}
		}
	}
</style>
