<script>
	import { onMount, getContext } from 'svelte';
	import Beasts from '../stores/Beasts.js';
	import AppData from '../stores/AppData.js';
	
	const { close } = getContext('simple-modal');

	export let beastID;
	const beast = $Beasts.find(e => e.id === beastID);
	let openSkills = true;
	let skillShown = 0;
	let openBuffs = false;
	let buffShown = 'team';

	onMount(async () => {
		const queryString = window.location.search;
		const urlParams = new URLSearchParams(queryString);
		if(urlParams.has('comp')) {
			history.pushState({view: $AppData.activeView, modal: true, comp: true}, "Beast Detail", `?comp=true&modal=true${window.location.hash}`);
		} else {
			history.pushState({view: $AppData.activeView, modal: true, comp: false}, "Beast Detail", `?modal=true${window.location.hash}`);
		}
	});

	function handlePopState() {
		close();
	}
</script>

<svelte:window on:popstate={handlePopState} />

<div class="container">
	<section class="headerSection">
		<h3 class="beastName">{beast.name}</h3>
		<div class="imageContainer">
			<div class="portraitContainer">
				<div class="mask">
					<img draggable="false" class="portrait" src={beast.portrait} alt={beast.name}>
				</div>
			</div>
		</div>
	</section>
	<section class="skillsSection">
		<div class="mobileExpanderTitle">
			<button type="button" class="expanderButton" on:click={() => openSkills = !openSkills}><i class="expanderArrow {openSkills ? 'down' : 'right' }"></i>Skills</button>
		</div>
		<div class="mobileExpander {openSkills ? 'isOpen' : '' }">
			<div class="skillDisplay">
				<div class="skillPicker">
					{#each beast.skills as skill, i}
						<button type="button" class="skillButton" on:click={() => skillShown = i}>
							<img draggable="false" class="{skillShown === i ? 'activeSkill' : ''}" src={skill.image} alt={skill.name}>
						</button>
					{/each}
				</div>
				<div class="skillDetails">
					{#each beast.skills as skill, i}
						<div class="skill { skillShown === i ? 'skillVisible' : ''}">
							<h5 class="skillName">{skill.name}</h5>
							{#if skill.type === 'level'}
								<p class="skillUnlock">lv {skill.unlock}:</p>
							{/if}
							<p class="skillDesc">{@html skill.desc}</p>
							{#each skill.upgrades as upgrade}
								{#if upgrade.type === 'level'}
									<p class="skillUnlock">lv {upgrade.unlock}:</p>
								{/if}
								<p class="skillDesc">{@html upgrade.desc}</p>
							{/each}
						</div>
					{/each}
				</div>
			</div>
		</div>
	</section>
	<section class="buffsSection">
		<div class="mobileExpanderTitle">
			<button type="button" class="expanderButton" on:click={() => openBuffs = !openBuffs}><i class="expanderArrow {openBuffs ? 'down' : 'right' }"></i>Buffs</button>
		</div>
		<div class="mobileExpander {openBuffs ? 'isOpen' : '' }">
			<div class="buffDisplay">
				<div class="buffPicker">
					{#each Object.keys(beast.buffs) as buffCat}
						<button type="button" class="buffButton" on:click={() => buffShown = buffCat}>
							{#if buffCat === 'team'}
								<div class="teamIcon {buffShown === buffCat ? 'activeBuff' : ''}"><span>Team</span></div>
							{:else if buffCat === 'str'}
								<img draggable="false" class="{buffShown === buffCat ? 'activeBuff' : ''}" src="./img/types/strength.png" alt="Strength">
							{:else if buffCat === 'int'}
								<img draggable="false" class="{buffShown === buffCat ? 'activeBuff' : ''}" src="./img/types/intelligence.png" alt="Intelligence">
							{:else if buffCat === 'agi'}
								<img draggable="false" class="{buffShown === buffCat ? 'activeBuff' : ''}" src="./img/types/agility.png" alt="Agility">
							{/if}
						</button>
					{/each}
				</div>
				<div class="buffDetails">
					<ul>
						{#each beast.buffs[buffShown] as buff}
							<li>
								<div class="statBox">
									<p class="num">{buff.attribute} {buff.value}</p>
								</div>
							</li>
						{/each}
					</ul>
				</div>
			</div>
		</div>
	</section>
</div>

<style lang="scss">
	.container {
		color: var(--appColorBlack);
		position: relative;
		padding: 0px 10px;
	}
	.beastName {
		color: var(--appColorBlack);
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
	.portraitContainer {
		align-items: center;
		display: flex;
		justify-content: center;
		.mask {
			border-radius: 50%;
			height: 90px;
			overflow: hidden;
			width: 90px;
		}
		.portrait {
			max-width: 90px;
		}
	}
	.skillsSection {
		padding-top: 10px;
		.skillPicker {
			border-bottom: 1px solid black;
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
			justify-content: center;
			padding: 10px;
			width: 100%;
			.skillButton {
				background-color: transparent;
				border: none;
				color: var(--appColorBlack);
				cursor: pointer;
				margin: 5px 10px;
				outline: none;
				padding: 0;
				img {
					border-radius: 50%;
					cursor: pointer;
					max-width: 70px;
					transition: all 0.2s;
					&.activeSkill {
						border: 5px solid var(--appColorPrimary);
					}
					&:active {
						transform: scale(0.9);
					}
				}
			}
		}
		.skill {
			display: none;
			padding: 10px;
			&.skillVisible {
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
			.specialUnlock {
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
		}
	}
	.buffsSection {
		padding-top: 10px;
		.buffPicker {
			border-bottom: 1px solid black;
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
			justify-content: center;
			margin-bottom: 20px;
			padding: 10px;
			width: 100%;
			.buffButton {
				background-color: transparent;
				border: none;
				color: var(--appColorBlack);
				cursor: pointer;
				margin: 5px 10px;
				outline: none;
				padding: 0;
				.teamIcon {
					align-items: center;
					border: 3px solid var(--appColorPrimary);
					border-radius: 50%;
					color: var(--appColorPrimary);
					display: flex;
					font-weight: bold;
					height: 50px;
					justify-content: center;
					transition: all 0.2s;
					width: 50px;
					&.activeBuff {
						border: 6px solid var(--appColorPrimary);
					}
					&:active {
						transform: scale(0.9);
					}
				}
				img {
					border-radius: 50%;
					cursor: pointer;
					max-width: 50px;
					transition: all 0.2s;
					&.activeBuff {
						border: 5px solid var(--appColorPrimary);
					}
					&:active {
						transform: scale(0.9);
					}
				}
			}
		}
		.buffDetails {
			display: flex;
			justify-content: center;
			ul {
				display: grid;
				list-style-type: none;
				margin: 0;
				padding: 0;
				width: 75%;
				display: grid;
				grid-gap: 15px 15px;
				grid-template-columns: repeat(auto-fill, minmax(120px, 120px));
				grid-auto-rows: 50px;
				justify-content: space-evenly;
			}
			li {
				align-items: center;
				display: flex;
				padding: 0;
				justify-content: center;
			}
			.statBox {
				align-items: center;
				background-color: var(--appBGColor);
				border-radius: 10px;
				box-shadow: var(--neu-sm-ni-BGColor-shadow);
				color: var(--appColorBlack);
				display: flex;
				font-size: 1rem;
				font-weight: bold;
				justify-content: center;
				margin: 0 auto;
				max-height: max-content;
				max-width: 150px;
				padding: 5px;
				width: 150px;
				white-space: nowrap;
				.num {
					margin: 0;
					padding: 0;
					user-select: none;
				}
			}
		}
	}
	.expanderButton {
		background-color: var(--appBGColor);
		border: none;
		border-radius: 10px;
		box-shadow: var(--neu-med-i-BGColor-shadow);
		color: var(--appColorBlack);
		cursor: pointer;
		font-size: 1.1rem;
		outline: none;
		padding: 10px;
		text-align: left;
		width: 100%;
		.expanderArrow {
			border: solid var(--appColorBlack);
			border-width: 0 3px 3px 0;
			display: inline-block;
			margin-right: 16px;
			padding: 3px;
			transition: transform 0.2s ease-out;
			&.right {
				transform: rotate(-45deg);
			}
			&.down {
				transform: rotate(45deg);
			}
		}
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
	}
</style>
