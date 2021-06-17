<script>
	import { getContext, createEventDispatcher } from 'svelte';
	import { flip } from 'svelte/animate';
	import AppData from '../stores/AppData.js';
	import HeroData from '../stores/HeroData.js';
	import HeroDetail from '../modals/HeroDetail.svelte';
	import ModalCloseButton from '../modals/ModalCloseButton.svelte';
	import AscendBox from '../shared/AscendBox.svelte';
	import SIFurnBox from '../shared/SIFurnBox.svelte';

	const { open } = getContext('simple-modal');
	const dispatch = createEventDispatcher();

	const starredComps = $AppData.Comps.filter(e => e.starred);
	const compHeroes = buildCompHeroes();
	let recommendations = buildRecs();
	const sections = [
		"Ascension",
		"Signature Item",
		"Furniture",
	]

	// loop through the hero list for every starred comp and compile a list of all of them
	function buildCompHeroes() {
		let buffer = [];
		for(const comp of starredComps) {
			for(const [id, data] of Object.entries(comp.heroes)) {
				if(buffer.some(e => e.id === id)) {
					// hero already in buffer, update values only if they're higher
					let idx = buffer.findIndex(e => e.id === id);
					buffer[idx].ascendLv = buffer[idx].ascendLv < data.ascendLv ? data.ascendLv : buffer[idx].ascendLv;
					buffer[idx].si = buffer[idx].si < data.si ? data.si : buffer[idx].si;
					buffer[idx].furn = buffer[idx].furn < data.si ? data.furn : buffer[idx].furn;
					buffer[idx].core = buffer[idx].core || data.core;
					buffer[idx].comps.push({id: comp.uuid, name: comp.name});
				} else {
					// new hero, create a new entry
					buffer.push({
						id: id,
						ascendLv: data.ascendLv,
						si: data.si,
						furn: data.furn,
						core: data.core,
						comps: [{id: comp.uuid, name: comp.name}],
					});
				}
			}
		}
		return buffer;
	}

	// compare compHeroes with MH.List and create recommendation objects where values differ
	function buildRecs() {
		let buffer = [];
		for(const hero of compHeroes) {
			if(!$AppData.MH.List[hero.id].claimed) {
				buffer.push({
					id: hero.id,
					type: 'ascend',
					value: hero.ascendLv,
					comps: hero.comps,
					core: hero.core,
				});
			} else {
				if($AppData.MH.List[hero.id].ascendLv < hero.ascendLv) {
					buffer.push({
						id: hero.id,
						type: 'ascend',
						value: hero.ascendLv,
						comps: hero.comps,
						core: hero.core,
					});
				}
				if($AppData.MH.List[hero.id].si < hero.si) {
					buffer.push({
						id: hero.id,
						type: 'si',
						value: hero.si,
						comps: hero.comps,
						core: hero.core,
					});
				}
				if($AppData.MH.List[hero.id].furn < hero.furn) {
					buffer.push({
						id: hero.id,
						type: 'furn',
						value: hero.furn,
						comps: hero.comps,
						core: hero.core,
					});
				}
			}
		}
		return buffer;
	}

	function sortByCore(a, b) {
		if(a.core && !b.core) {
			return -1;
		} else if(!a.core && b.core) {
			return 1;
		} else {
			if(a.comps.length > b.comps.length) {
				return -1;
			} else if(a.comps.length < b.comps.length) {
				return 1;
			} else {
				return 0;
			}
		}
	}

	function handleCompClick(compID) {
		$AppData.selectedComp = $AppData.Comps.findIndex(e => e.uuid === compID);
		$AppData.activeView = 'comps';
	}

	function handlePortraitClick(heroID) {
		open(HeroDetail, 
		{ heroID: heroID, },
		{ closeButton: ModalCloseButton,
			styleContent: {background: '#F0F0F2', padding: 0, borderRadius: '10px'},
		});
	}

	function handleClaimClick(heroID, value, type) {
		$AppData.MH.List[heroID].claimed = true;
		switch(type) {
			case 'asc':
				$AppData.MH.List[heroID].ascendLv = value;
				break;
			case 'si':
				$AppData.MH.List[heroID].si = value;
				break;
			case 'furn':
				$AppData.MH.List[heroID].furn = value;
				break;
			default:
				throw new Error(`Invalid type received ${type} should be 'asc', 'si', or 'furn'.`);
		}
		recommendations = buildRecs();
		dispatch('saveData');
	}
</script>

<div class="recContainer">
	<div class="sectionPickerSection">
		<ul class="sectionPicker">
			{#each sections as section, i}
			<li>
				<button class="sectionButton" class:active={$AppData.REC.openSection === i} on:click={() => { $AppData.REC.openSection = i; dispatch('saveData');} }>{section}</button>
			</li>
			{/each}
		</ul>
	</div>
	{#if $AppData.REC.openSection === 0}
	<section class="recSection buildSection">
		<div class="recArea">
			{#if recommendations.filter(e => e.type === 'ascend').length > 0}
				{#each recommendations.filter(e => e.type === 'ascend').sort(sortByCore) as rec (rec.id+'_asc')}
					<div class="recCard" animate:flip="{{duration: 200}}">
						<div class="claimButtonArea">
							<button class="claimButton" on:click={handleClaimClick(rec.id, rec.value, 'asc')}>&#10004;</button>
						</div>
						<h4>{$HeroData.find(e => e.id === rec.id).name}</h4>
						<div class="portraitContainer">
							<button class="portraitButton" on:click={() => handlePortraitClick(rec.id)}>
								<img class="portrait" src={$HeroData.find(e => e.id === rec.id).portrait} alt={$HeroData.find(e => e.id === rec.id).name}>
								<span class="coreMark" class:visible={rec.core}></span>
							</button>
						</div>
						<div class="recText">
							<AscendBox ascendLv="{rec.value}" />
						</div>
						<div class="compArea">
							<h5>Used in</h5>
							<ul>
							{#each rec.comps as comp}
								<li><button class="compButton" on:click={() => handleCompClick(comp.id)}>{comp.name}</button></li>
							{/each}
							</ul>
						</div>
					</div>
				{/each}
			{:else}
				<div class="noRec"><span>No Build Recommendations</span></div>
			{/if}
		</div>
	</section>
	{:else if $AppData.REC.openSection === 1}
	<section class="recSection siSection">
		<div class="recArea">
			{#if recommendations.filter(e => e.type === 'si').length > 0}
				{#each recommendations.filter(e => e.type === 'si').sort(sortByCore) as rec (rec.id+'_si')}
					<div class="recCard" animate:flip="{{duration: 200}}">
						<div class="claimButtonArea">
							<button class="claimButton" on:click={handleClaimClick(rec.id, rec.value, 'si')}>&#10004;</button>
						</div>
						<h4>{$HeroData.find(e => e.id === rec.id).name}</h4>
						<div class="portraitContainer">
							<button class="portraitButton" on:click={() => handlePortraitClick(rec.id)}>
								<img class="portrait" src={$HeroData.find(e => e.id === rec.id).portrait} alt={$HeroData.find(e => e.id === rec.id).name}>
								<span class="coreMark" class:visible={rec.core}></span>
							</button>
						</div>
						<div class="recText">
							<SIFurnBox type="si" num="{rec.value}" fullName={true} maxWidth="100px" />
						</div>
						<div class="compArea">
							<h5>Used in</h5>
							<ul>
							{#each rec.comps as comp}
								<li><button class="compButton" on:click={() => handleCompClick(comp.id)}>{comp.name}</button></li>
							{/each}
							</ul>
						</div>
					</div>
				{/each}
			{:else}
				<div class="noRec"><span>No Signature Item Recommendations</span></div>
			{/if}
		</div>
	</section>
	{:else if $AppData.REC.openSection === 2}
	<section class="recSection furnSection">
		<div class="recArea">
			{#if recommendations.filter(e => e.type === 'furn').length > 0}
				{#each recommendations.filter(e => e.type === 'furn').sort(sortByCore) as rec (rec.id+'_furn')}
					<div class="recCard" animate:flip="{{duration: 200}}">
						<div class="claimButtonArea">
							<button class="claimButton" on:click={handleClaimClick(rec.id, rec.value, 'furn')}>&#10004;</button>
						</div>
						<h4>{$HeroData.find(e => e.id === rec.id).name}</h4>
						<div class="portraitContainer">
							<button class="portraitButton" on:click={() => handlePortraitClick(rec.id)}>
								<img class="portrait" src={$HeroData.find(e => e.id === rec.id).portrait} alt={$HeroData.find(e => e.id === rec.id).name}>
								<span class="coreMark" class:visible={rec.core}></span>
							</button>
						</div>
						<div class="recText">
							<SIFurnBox type="furn" num="{rec.value}" />
						</div>
						<div class="compArea">
							<h5>Used in</h5>
							<ul>
							{#each rec.comps as comp}
								<li><button class="compButton" on:click={() => handleCompClick(comp.id)}>{comp.name}</button></li>
							{/each}
							</ul>
						</div>
					</div>
				{/each}
			{:else}
				<div class="noRec"><span>No Furniture Recommendations</span></div>
			{/if}
		</div>
	</section>
	{/if}
</div>

<style>
	.recContainer {
		height: 100%;
		padding: 10px;
		width: 100%;
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
	}
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
	.recSection {
		border: 3px solid var(--appColorPrimary);
		border-radius: 10px;
		padding: 10px;
		width: 100%;
	}
	.recArea {
		display: grid;
		grid-gap: 10px 5px;
		grid-template-columns: repeat(auto-fit, minmax(200px, 250px));
		justify-content: space-evenly;
		margin-bottom: 10px;
		overflow: hidden;
	}
	.noRec {
		align-items: center;
		display: flex;
		height: 100%;
		justify-content: center;
		-ms-user-select: none;
		-webkit-user-select: none;
		width: 100%;
		user-select: none;
	}
	.noRec span {
		color: rgba(100, 100, 100, 0.3);
		font-size: 2.5rem;
		font-weight: bold;
		text-align: center;
		text-transform: uppercase;
	}
	.recCard {
		background-color: transparent;
		border: 3px solid var(--appColorPrimary);
		border-radius: 10px;
		padding: 10px;
		position: relative;
	}
	.claimButtonArea {
		position: absolute;
		right: 5px;
		top: 5px;
	}
	.claimButton {
		background-color: transparent;
		border: 2px solid var(--appColorPrimary);
		border-radius: 50%;
		color: var(--appColorPrimary);
		cursor: pointer;
		font-size: 0.9rem;
		height: 25px;
		outline: none;
		padding: 0px;
		width: 25px;
	}
	.recCard h4 {
		font-size: 1.2rem;
		margin: 0;
		margin-bottom: 5px;
		text-align: center;
		width: 100%;
	}
	.portraitContainer {
		align-items: center;
		display: flex;
		justify-content: center;
		margin-bottom: 10px;
		position: relative;
		width: 100%;
	}
	.portraitButton {
		background: transparent;
		border: none;
		cursor: pointer;
		outline: none;
	}
	.portrait {
		border-radius: 50%;
		max-width: 100px;
	}
	.coreMark {
		background-color: var(--appDelColor);
		border-radius: 50%;
		bottom: 5px;
		display: none;
		height: 25px;
		position: absolute;
		right: 65px;
		visibility: hidden;
		width: 25px;
	}
	.coreMark.visible {
		display: inline-block;
		pointer-events: none;
		visibility: visible;
	}
	.recText {
		display: flex;
		justify-content: center;
		margin-bottom: 10px;
		width: 100%;
	}
	.compArea {
		width: 100%;
	}
	.compArea h5 {
		font-size: 1rem;
		margin: 0;
		-ms-user-select: none;
		text-align: center;
		-webkit-user-select: none;
		width: 100%;
		user-select: none;
	}
	.compArea ul {
		align-items: center;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: center;
		list-style-type: none;
		margin: 0;
		padding: 0;
	}
	.compArea li {
		padding: 5px;
	}
	.compButton {
		background-color: transparent;
		border: 2px solid var(--appColorPrimary);
		border-radius: 5px;
		color: var(--appColorPrimary);
		cursor: pointer;
		font-size: 1rem;
	}
	@media only screen and (min-width: 767px) {
		.sectionPicker {
			justify-content: flex-start;
		}
		.sectionButton {
			margin-right: 0px;
		}
		.recSection {
			border-radius: 0px 10px 10px 10px;
		}
		.noRec span {
			font-size: 6rem;
		}
		.claimButton:hover {
			background-color: var(--appColorPrimary);
			color: white;
		}
		.compButton:hover {
			background-color: var(--appColorPrimary);
			color: white;
		}
		.portrait {
			transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 0);
		}
		.portrait:hover {
			transform: scale(1.05);
		}
	}
</style>
