<script>
	import { onMount, getContext } from 'svelte';
	import HeroData from '../stores/HeroData.js';
	import AppData from '../stores/AppData.js';
	import SIFurnEngBox from '../shared/SIFurnEngBox.svelte';
	
	const { close } = getContext('simple-modal');

	export let heroID;
	const hero = $HeroData.find(e => e.id === heroID);
	let openSkills = true;
	let openSI = false;
	let openFurn = false;
	$: skillShown = 0;

	onMount(async () => {
		history.pushState({view: $AppData.activeView, modal: true}, "Hero Detail", `${window.location.hash}?modal=true`);
	});

	function handlePopState() {
		close();
	}
</script>

<svelte:window on:popstate={handlePopState} />

<div class="container">
	<section class="headerSection">
		<h3 class="heroName">{hero.name}</h3>
		<div class="imageContainer">
			<div class="factionContainer">
				<div class="attrImgContainer">
					<img draggable="false" class="attrImg" src="./img/factions/{hero.faction.toLowerCase()}.png" alt="{hero.faction}">
					<div class="tooltip factionTooltip"><span class="tooltipText">{hero.faction}</span></div>
				</div>
			</div>
			<div class="portraitContainer">
				<img draggable="false" class="portrait" src={hero.portrait} alt={hero.name}>
			</div>
			<div class="typeClassContainer">
				<div class="attrImgContainer">
					<img draggable="false" class="attrImg" src="./img/types/{hero.type.toLowerCase()}.png" alt="{hero.type}">
					<div class="tooltip"><span class="tooltipText">{hero.type}</span></div>
				</div>
				<div class="attrImgContainer">
					<img draggable="false" class="attrImg" src="./img/classes/{hero.class.toLowerCase()}.png" alt="{hero.class}">
					<div class="tooltip"><span class="tooltipText">{hero.class}</span></div>
				</div>
			</div>
		</div>
	</section>
	<section class="siFurnSection">
		<div class="benchmarkSection">
			<h4>SI Benchmark</h4>
			<SIFurnEngBox type='si' num={hero.si_benchmark} maxWidth='50px' />
		</div>
		<div class="benchmarkSection">
			<h4>Furn Benchmark</h4>
			<SIFurnEngBox type='furn' num={hero.furn_benchmark} maxWidth='50px' />
		</div>
		<div class="benchmarkSection">
			<h4>Eng. Benchmark</h4>
			<SIFurnEngBox type='engraving' num={hero.engraving_benchmark} maxWidth='50px' />
		</div>
	</section>
	<section class="skillsSection">
		<div class="mobileExpanderTitle">
			<button type="button" class="expanderButton" on:click={() => openSkills = !openSkills}><i class="arrow {openSkills ? 'down' : 'right' }"></i>Skills</button>
		</div>
		<div class="mobileExpander {openSkills ? 'isOpen' : '' }">
			<div class="skillDisplay">
				<div class="skillPicker">
					{#each hero.skills as skill, i}
					<img draggable="false" class="{skillShown === i ? 'activeSkill' : ''}" on:click={() => skillShown = i} src={skill.image} alt={skill.name}>
					{/each}
				</div>
				<div class="skillDetails">
					{#each hero.skills as skill, i}
					<div class="skill { skillShown === i ? 'skillVisible' : ''}">
						<h5 class="skillName">{skill.name}</h5>
						{#if skill.type === 'level'}
							<p class="skillUnlock">lv {skill.unlock}:</p>
						{:else if skill.type === 'engraving'}
							<p class="skillUnlock engraveUnlock">Engraving lv {skill.unlock}:</p>
						{/if}
						<p class="skillDesc">{@html skill.desc}</p>
						{#each skill.upgrades as upgrade}
							{#if upgrade.type === 'level'}
								<p class="skillUnlock">lv {upgrade.unlock}:</p>
							{:else if upgrade.type === 'engraving'}
								<p class="skillUnlock engraveUnlock">Engraving lv {upgrade.unlock}:</p>
							{/if}
							<p class="skillDesc">{@html upgrade.desc}</p>
						{/each}
					</div>
					{/each}
				</div>
			</div>
		</div>
	</section>
	{#if hero.tier === 'ascended'}
		<section class="sigItemSection">
			<div class="mobileExpanderTitle">
				<button type="button" class="expanderButton" on:click={() => openSI = !openSI}><i class="arrow {openSI ? 'down' : 'right' }"></i>Signature Item</button>
			</div>
			<div class="mobileExpander {openSI ? 'isOpen' : '' }">
				<div class="siFurnArea">
					<div class="imageArea">
						<img draggable="false" src={hero.sig_item.image} alt={hero.sig_item.name}>
						<h5 class="siFurnName">{hero.sig_item.name}</h5>
					</div>
					<p class="siFurnUnlock">Unlocked at +0:</p>
					<p class="siFurnDesc">{@html hero.sig_item.desc}</p>
					<div class="siFurnUpgrades">
						{#each hero.sig_item.upgrades as upgrade}
							<p class="siFurnUnlock">Unlocked at +{upgrade.unlock}:</p>
							<p class="siFurnDesc">{@html upgrade.desc}</p>
						{/each}
					</div>
				</div>
			</div>
		</section>
		<section class="furnitureSection">
			<div class="mobileExpanderTitle">
				<button type="button" class="expanderButton" on:click={() => openFurn = !openFurn}><i class="arrow {openFurn ? 'down' : 'right' }"></i>Furniture</button>
			</div>
			<div class="mobileExpander {openFurn ? 'isOpen' : '' }">
				<div class="siFurnArea">
					<div class="imageArea">
						<img draggable="false" src={hero.furniture.image} alt={hero.furniture.name}>
						<h5 class="siFurnName">{@html hero.furniture.name}</h5>
					</div>
					<div class="siFurnUpgrades">
						{#each hero.furniture.upgrades as upgrade}
							<p class="siFurnUnlock">Unlocked at {upgrade.unlock}:</p>
							<p class="siFurnDesc">{@html upgrade.desc}</p>
						{/each}
					</div>
				</div>
			</div>
		</section>
	{/if}
</div>

<style lang="scss">
	.container {
		position: relative;
	}
	.heroName {
		background-color: var(--appColorPrimary);
		color: white;
		font-family: 'Roboto' sans-serif;
		font-size: 2.0rem;
		font-weight: bold;
		letter-spacing: 1px;
		margin: 0;
		padding: 10px 0px;
		padding-left: 10px;
		text-align: center;
		text-transform: uppercase;
	}
	.imageContainer {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		padding: 0;
		padding-bottom: 20px;
		padding-top: 20px;
	}
	.factionContainer {
		align-items: center;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}
	.typeClassContainer {
		align-items: center;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}
	.portraitContainer {
		align-items: center;
		display: flex;
		justify-content: center;
	}
	.attrImgContainer {
		align-items: center;
		display: flex;
		justify-content: center;
		position: relative;
	}
	.attrImg {
		margin: 10px;
		max-width: 60px;
		width: 100%;
	}
	.tooltip {
		display: none;
	}
	.portrait {
		border-radius: 50%;
		transition: all 0.2s;
		width: 100%;
	}
	.siFurnSection {
		display: flex;
		flex-direction: row;
		justify-content: center;
	}
	.benchmarkSection {
		align-content: center;
		display: flex;
		flex-direction: column;
		padding: 10px;
		padding-top: 0px;
		h4 {
			margin: 0;
			padding: 0;
			padding-bottom: 10px;
			text-align: center;
		}
	}
	.skillsSection {
		padding-top: 10px;
	}
	.skillPicker {
		border-bottom: 1px solid black;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: center;
		padding: 10px;
		width: 100%;
		img {
			border-radius: 50%;
			cursor: pointer;
			margin: 5px 10px;
			max-width: 70px;
			transition: all 0.2s;
			&:active {
				transform: scale(0.9);
			}
		}
		img.activeSkill {
			border: 5px solid var(--appColorPrimary);
		}
	}
	.skill {
		display: none;
		padding: 10px;
	}
	.skill.skillVisible {
		display: flex;
		flex-direction: column;
	}
	.skillName {
		font-size: 1.3rem;
		font-weight: bold;
		margin: 0 auto;
	}
	.skillUnlock {
		font-size: 1.05rem;
		font-weight: bold;
		margin: 0;
		padding-bottom: 5px;
	}
	.engraveUnlock {
		color: var(--appColorPrimary);
	}
	.skillDesc {
		margin: 0;
		padding-bottom: 20px;
		padding-left: 15px;
		:global(em) {
			color: var(--appColorPrimary);
			font-style: normal;
			font-weight: bold;
		}
	}
	.siFurnArea {
		padding: 10px;
	}
	.imageArea {
		align-items: center;
		border-bottom: 1px solid black;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding-bottom: 10px;
		img {
			max-width: 120px;
		}
	}
	.siFurnName {
		font-size: 1.3rem;
		font-weight: bold;
		margin: 0;
	}
	.siFurnUnlock {
		font-size: 1.05rem;
		font-weight: bold;
		margin: 0;
		padding-bottom: 5px;
		padding-top: 10px;
	}
	.siFurnDesc {
		margin: 0;
		padding-bottom: 10px;
		padding-left: 15px;
		:global(em) {
			color: var(--appColorPrimary);
			font-style: normal;
			font-weight: bold;
		}
	}
	.expanderButton {
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
	.right {
		transform: rotate(-45deg);
	}
	.down {
		transform: rotate(45deg);
	}
	.mobileExpander {
		margin-bottom: 10px;
		max-height: 0;
		overflow: hidden;
		transition: max-height 0.2s ease-out;
	}
	.mobileExpander.isOpen {
		max-height: 1000px;
	}
	@media only screen and (min-width: 767px) {
		.attrImg {
			max-width: 80px;
			&:hover+.tooltip {
				opacity: 1;
				visibility: visible;
			}
		}
		.tooltip {
			bottom: -25px;
			display: flex;
			justify-content: center;
			left: -64px;
			opacity: 0;
			position: absolute;
			transition: opacity 0.2s;
			visibility: hidden;
			width: 200px;
			z-index: 4;
		}
		.factionTooltip {
			left: -58px;
		}
		.tooltipText {
			background-color: var(--appColorPrimary);
			border-radius: 6px;
			color: white;
			padding: 5px;
			user-select: none;
		}
		.skillPicker {
			img {
				&:hover {
					border: 2px solid var(--appColorPrimary);
				}
			}
		}
	}
</style>
