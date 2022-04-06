<script>
	import { getContext, createEventDispatcher, onMount } from 'svelte';
	import { flip } from 'svelte/animate';
	import AppData from '../stores/AppData.js';
	import HeroData from '../stores/HeroData.js';
	import HeroDetail from '../modals/HeroDetail.svelte';
	import ModalCloseButton from '../modals/ModalCloseButton.svelte';
	import AscendBox from '../shared/AscendBox.svelte';
	import SIFurnEngBox from '../shared/SIFurnEngBox.svelte';
	import StarsInput from '../shared/StarsInput.svelte';

	const { open } = getContext('simple-modal');
	const dispatch = createEventDispatcher();

	export let isMobile = false;

	const starredComps = $AppData.Comps.filter(e => e.starred);
	const compHeroes = buildCompHeroes();
	let recommendations = buildRecs();
	const sections = [
		"Ascension",
		"Sig. Item",
		"Furniture",
		"Eng.",
	];
	
	$: modalHeight = isMobile ? '75vh' : '80vh';

	onMount(async () => {
		$AppData.activeView = 'recommendations';
		dispatch('routeEvent', {action: 'saveData'});
	});

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
					buffer[idx].furn = buffer[idx].furn < data.furn ? data.furn : buffer[idx].furn;
					buffer[idx].engraving = buffer[idx].engraving < data.engraving ? data.engraving : buffer[idx].engraving;
					buffer[idx].stars = buffer[idx].stars < data.stars ? data.stars : buffer[idx].stars;
					buffer[idx].core = buffer[idx].core || data.core;
					buffer[idx].comps.push({id: comp.uuid, name: comp.name});
				} else {
					// new hero, create a new entry
					buffer.push({
						id: id,
						ascendLv: data.ascendLv,
						si: data.si,
						furn: data.furn,
						engraving: data.engraving,
						stars: data.stars,
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
					value: { ascendLv: hero.ascendLv, stars: hero.stars },
					comps: hero.comps,
					core: hero.core,
				});
			} else {
				if($AppData.MH.List[hero.id].ascendLv < hero.ascendLv || $AppData.MH.List[hero.id].stars < hero.stars) {
					buffer.push({
						id: hero.id,
						type: 'ascend',
						value: { ascendLv: hero.ascendLv, stars: hero.stars },
						comps: hero.comps,
						core: hero.core,
					});
				}
				if($AppData.MH.List[hero.id].si < hero.si) {
					buffer.push({
						id: hero.id,
						type: 'si',
						value: { si: hero.si, },
						comps: hero.comps,
						core: hero.core,
					});
				}
				if($AppData.MH.List[hero.id].furn < hero.furn) {
					buffer.push({
						id: hero.id,
						type: 'furn',
						value: { furn: hero.furn, },
						comps: hero.comps,
						core: hero.core,
					});
				}
				if($AppData.MH.List[hero.id].engraving < hero.engraving) {
					buffer.push({
						id: hero.id,
						type: 'engraving',
						value: { engraving: hero.engraving, stars: hero.stars },
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

	async function handleCompClick(compID) {
		$AppData.selectedComp = compID;

		dispatch('routeEvent', {action: 'saveData'})
		// navigate to comps page and clear all query parameters except the one specified below
		window.location.assign(`${window.location.origin}/?comp=true#/comps`);
	}

	function handlePortraitClick(heroID) {
		open(HeroDetail, 
		{ heroID: heroID, },
		{ closeButton: ModalCloseButton,
			styleContent: {background: '#F0F0F2', padding: 0, borderRadius: '10px', maxHeight: modalHeight,},
		});
	}

	function handleClaimClick(heroID, value, type) {
		$AppData.MH.List[heroID].claimed = true;
		switch(type) {
			case 'asc':
				$AppData.MH.List[heroID].ascendLv = value.ascendLv;
				$AppData.MH.List[heroID].stars = value.stars;
				break;
			case 'si':
				// allow claiming of si levels before mythic but set to mythic automatically
				if($AppData.MH.List[heroID].ascendLv < 4) $AppData.MH.List[heroID].ascendLv = 4;
				$AppData.MH.List[heroID].si = value.si;
				break;
			case 'furn':
				// allow claiming of furniture levels before ascended but set to ascended automatically
				if($AppData.MH.List[heroID].ascendLv < 6) $AppData.MH.List[heroID].ascendLv = 6;
				$AppData.MH.List[heroID].furn = value.furn;
				break;
			case 'engraving':
				// allow claiming of engraving levels before ascended but set to ascended automatically
				if($AppData.MH.List[heroID].ascendLv < 6) $AppData.MH.List[heroID].ascendLv = 6;
				// allow claiming of engraving levels with 0* but set stars to recommended stars
				if($AppData.MH.List[heroID].stars < value.stars) $AppData.MH.List[heroID].stars = value.stars;
				$AppData.MH.List[heroID].engraving = value.engraving;
				break;
			default:
				throw new Error(`Invalid type received ${type} should be 'asc', 'si', or 'furn'.`);
		}
		recommendations = buildRecs();
		dispatch('routeEvent', {action: 'saveData'})
	}
</script>

<div class="recContainer">
	<div class="sectionPickerSection">
		<ul class="sectionPicker">
			{#each sections as section, i}
			<li>
				<button type="button" class="sectionButton" class:active={$AppData.REC.openSection === i} on:click={() => { $AppData.REC.openSection = i; dispatch('routeEvent', {action: 'saveData'})} }>
					<span>{section}</span>
				</button>
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
							<button
								type="button"
								class="claimButton"
								on:click={handleClaimClick(rec.id, rec.value, 'asc')}>&#10004;</button>
						</div>
						<div class="portraitContainer">
							<button type="button" class="portraitButton" on:click={() => handlePortraitClick(rec.id)}>
								<img class="portrait" src={$HeroData.find(e => e.id === rec.id).portrait} alt={$HeroData.find(e => e.id === rec.id).name}>
								<span class="coreMark" class:visible={rec.core}></span>
							</button>
						</div>
						<h4>{$HeroData.find(e => e.id === rec.id).name}</h4>
						<div class="starsInputContainer">
							<StarsInput
								value={rec.value.stars}
								enabled={rec.value.ascendLv >= 6}
								engraving=0
								displayOnly={true} />
						</div>
						<div class="recText">
							<AscendBox
								ascendLv="{rec.value.ascendLv}"
								tier={$HeroData.find(e => e.id === rec.id).tier}
							/>
						</div>
						<div class="compArea">
							<h5>Used in</h5>
							<ul>
							{#each rec.comps as comp}
								<li>
									<button type="button" class="compButton" on:click={() => handleCompClick(comp.id)} title={comp.name}>{comp.name}</button>
								</li>
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
							<button type="button" class="claimButton" on:click={handleClaimClick(rec.id, rec.value, 'si')}>&#10004;</button>
						</div>
						<div class="portraitContainer">
							<button type="button" class="portraitButton" on:click={() => handlePortraitClick(rec.id)}>
								<img class="portrait" src={$HeroData.find(e => e.id === rec.id).portrait} alt={$HeroData.find(e => e.id === rec.id).name}>
								<span class="coreMark" class:visible={rec.core}></span>
							</button>
						</div>
						<h4>{$HeroData.find(e => e.id === rec.id).name}</h4>
						<div class="recText">
							<SIFurnEngBox type="si" num="{rec.value.si}" fullName={true} maxWidth="100px" />
						</div>
						<div class="compArea">
							<h5>Used in</h5>
							<ul>
							{#each rec.comps as comp}
								<li>
									<button type="button" class="compButton" on:click={() => handleCompClick(comp.id)} title={comp.name}>{comp.name}</button>
								</li>
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
							<button type="button" class="claimButton" on:click={handleClaimClick(rec.id, rec.value, 'furn')}>&#10004;</button>
						</div>
						<div class="portraitContainer">
							<button type="button" class="portraitButton" on:click={() => handlePortraitClick(rec.id)}>
								<img class="portrait" src={$HeroData.find(e => e.id === rec.id).portrait} alt={$HeroData.find(e => e.id === rec.id).name}>
								<span class="coreMark" class:visible={rec.core}></span>
							</button>
						</div>
						<h4>{$HeroData.find(e => e.id === rec.id).name}</h4>
						<div class="recText">
							<SIFurnEngBox type="furn" num="{rec.value.furn}" />
						</div>
						<div class="compArea">
							<h5>Used in</h5>
							<ul>
							{#each rec.comps as comp}
								<li>
									<button type="button" class="compButton" on:click={() => handleCompClick(comp.id)} title={comp.name}>{comp.name}</button>
								</li>
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
	{:else if $AppData.REC.openSection === 3}
	<section class="recSection engSection">
		<div class="recArea">
			{#if recommendations.filter(e => e.type === 'engraving').length > 0}
				{#each recommendations.filter(e => e.type === 'engraving').sort(sortByCore) as rec (rec.id+'_eng')}
					<div class="recCard" animate:flip="{{duration: 200}}">
						<div class="claimButtonArea">
							<button type="button" class="claimButton" on:click={handleClaimClick(rec.id, rec.value, 'engraving')}>&#10004;</button>
						</div>
						<div class="portraitContainer">
							<button type="button" class="portraitButton" on:click={() => handlePortraitClick(rec.id)}>
								<img class="portrait" src={$HeroData.find(e => e.id === rec.id).portrait} alt={$HeroData.find(e => e.id === rec.id).name}>
								<span class="coreMark" class:visible={rec.core}></span>
							</button>
						</div>
						<h4>{$HeroData.find(e => e.id === rec.id).name}</h4>
						<div class="starsInputContainer">
							<StarsInput
								value={rec.value.stars}
								enabled={true}
								engraving={rec.value.engraving}
								displayOnly={true} />
						</div>
						<div class="recText">
							<SIFurnEngBox type="engraving" num="{rec.value.engraving}" />
						</div>
						<div class="compArea">
							<h5>Used in</h5>
							<ul>
							{#each rec.comps as comp}
								<li>
									<button type="button" class="compButton" on:click={() => handleCompClick(comp.id)} title={comp.name}>{comp.name}</button>
								</li>
							{/each}
							</ul>
						</div>
					</div>
				{/each}
			{:else}
				<div class="noRec"><span>No Engraving Recommendations</span></div>
			{/if}
		</div>
	</section>
	{/if}
</div>

<style lang="scss">
	.recContainer {
		height: 100%;
		height: calc(var(--vh, 1vh) * 100 - var(--headerHeight)); /* gymnastics to set height for mobile browsers */
		padding: 10px;
		overflow-y: auto;
		width: 100%;
	}
	.sectionPickerSection {
		margin: 10px;
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
			align-items: center;
			border: none;
			border-radius: 10px;
			box-shadow: var(--neu-med-i-BGColor-shadow);
			color: var(--appColorPrimary);
			cursor: pointer;
			display: flex;
			font-size: 1.2rem;
			justify-content: center;
			margin: 5px 8px;
			outline: none;
			padding: 5px;
			span {
				opacity: 0.3;
			}
			&.active {
				background: var(--neu-convex-BGLight-bg);
				span {
					opacity: 1;
				}
			}
		}
	}
	.recSection {
		padding: 10px;
		width: 100%;
	}
	.recArea {
		display: grid;
		grid-gap: 20px 20px;
		grid-template-columns: repeat(auto-fit, minmax(250px, 270px));
		justify-content: space-evenly;
		margin-bottom: 10px;
	}
	.noRec {
		align-items: center;
		display: flex;
		height: 100%;
		justify-content: center;
		width: 100%;
		user-select: none;
		span {
			color: rgba(100, 100, 100, 0.3);
			font-size: 2.2rem;
			font-weight: bold;
			text-align: center;
			text-transform: uppercase;
		}
	}
	.recCard {
		background-color: var(--appBGColor);
		border: none;
		border-radius: 10px;
		box-shadow: var(--neu-med-i-BGColor-shadow);
		padding: 10px;
		position: relative;
		h4 {
			font-size: 1.2rem;
			margin: 0;
			margin-bottom: 3px;
			text-align: center;
			width: 100%;
		}
		.starsInputContainer {
			display: flex;
			justify-content: center;
		}
	}
	.claimButtonArea {
		position: absolute;
		right: 5px;
		top: 5px;
		z-index: 1;
		.claimButton {
			background-color: transparent;
			border: none;
			border-radius: 50%;
			box-shadow: var(--neu-sm-i-BGColor-pressed-shadow);
			color: var(--appColorPrimary);
			cursor: pointer;
			font-size: 0.9rem;
			height: 25px;
			outline: none;
			padding: 0px;
			width: 25px;
		}
	}
	.portraitContainer {
		align-items: center;
		display: flex;
		justify-content: center;
		position: relative;
		width: 100%;
		.portraitButton {
			background: transparent;
			border: none;
			cursor: pointer;
			outline: none;
			.portrait {
				border-radius: 50%;
				max-width: 100px;
			}
		}
		.coreMark {
			background-color: var(--legendColor);
			border: 4px solid var(--appBGColor);
			border-radius: 50%;
			bottom: 2px;
			display: none;
			height: 28px;
			position: absolute;
			right: 75px;
			visibility: hidden;
			width: 28px;
		}
		.coreMark.visible {
			display: inline-block;
			pointer-events: none;
			visibility: visible;
		}
	}
	.recText {
		display: flex;
		justify-content: center;
		margin: 10px 0px;
		width: 100%;
	}
	.compArea {
		width: 100%;
		h5 {
			font-size: 1rem;
			margin: 0;
			text-align: center;
			width: 100%;
			user-select: none;
		}
		ul {
			align-items: center;
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
			justify-content: center;
			list-style-type: none;
			margin: 0;
			padding: 0;
		}
		li {
			.compButton {
				background-color: transparent;
				border: none;
				border-radius: 5px;
				box-shadow: var(--neu-sm-i-BGColor-shadow);
				color: var(--appColorPrimary);
				cursor: pointer;
				font-size: 1rem;
				margin: 5px 8px;
				max-width: 100px;
				overflow: hidden;
				padding: 2px;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
		}
	}
	@media only screen and (min-width: 767px) {
		.recContainer {
			height: 100vh;
		}
		.sectionPicker {
			justify-content: flex-start;
			li {
				&:first-child {
					.sectionButton {
						margin-left: 0px;
					}
				}
			}
		}
		.recSection {
			border-radius: 0px 10px 10px 10px;
		}
		.noRec {
			span {
				font-size: 6rem;
			}
		}
		.claimButton {
			&:hover {
				background: var(--neu-convex-BGColor-bg);
			}
		}
		.compArea {
			li {
				.compButton {
					&:hover {
						background: var(--neu-convex-BGColor-bg);
					}
				}
			}
		}
	}
</style>
