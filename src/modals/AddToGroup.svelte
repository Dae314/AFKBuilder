<script>
	import { onMount, getContext } from 'svelte';
	import AppData from '../stores/AppData.js';
	import HeroData from '../stores/HeroData.js';

	export let groupUUID = '';
	export let onSuccess = () => {};

	const { close } = getContext('simple-modal');

	$: group = JSON.parse(JSON.stringify($AppData.compGroups.find(e => e.uuid === groupUUID)));
	$: compList = makeCompList(group);

	onMount(async () => {
		history.pushState({view: $AppData.activeView, modal: true}, "Add to Group", `?modal=true${window.location.hash}`);
	});

	function makeCompList(group) {
		const comps = [...$AppData.Comps].filter(e => !e.hidden);
		let compList = [];
		let tempComp;

		for(const comp of comps) {
			tempComp = JSON.parse(JSON.stringify(comp));
			tempComp.inGroup = group.comps.includes(comp.uuid);
			compList.push(tempComp);
		}

		return compList;
	}

	function handleCompClick(uuid, inGroup) {
		if(inGroup) {
			// comp is already in the group, remove it
			group.comps = group.comps.filter(e => e !== uuid);
		} else {
			// comp not in group yet, add it
			group.comps = [...group.comps, uuid];
		}
	}

	function handlePopState() {
		close();
	}
	
	function handleSave() {
		onSuccess(group);
		close();
	}
</script>

<svelte:window on:popstate={handlePopState} />

<div class="addToGroupContainer">
	<h5>Add Comps to {group.name}</h5>
	<div class="body">
		<ul class="compGrid">
			{#each compList as comp}
				<li>
					<button class="optionButton" class:claimed={comp.inGroup} on:click={() => handleCompClick(comp.uuid, comp.inGroup)}>
						<div class="optionTitle">
							{comp.name}
						</div>
						<div class="optionHeroes">
							{#each comp.lines[0].heroes as heroID}
								{#if $HeroData.some(e => e.id === heroID)}
									<img draggable="false" class="optionHero" src={$HeroData.find(e => e.id === heroID).portrait} alt={$HeroData.find(e => e.id === heroID).name}>
								{:else}
									<i class="optionHeroEmpty"></i>
								{/if}
							{/each}
						</div>
					</button>
				</li>
			{/each}
		</ul>
	</div>
	<div class="footer">
		<button type="button" class="footerButton save" on:click={handleSave}>Save</button>
		<button type="button" class="footerButton cancel" on:click={handlePopState}>Cancel</button>
	</div>
</div>

<style lang="scss">
	.addToGroupContainer {
		padding: 10px;
		padding-top: 0px;
		overflow-y: auto;
	}
	h5 {
		font-size: 1.5rem;
		margin: 15px 0px;
		text-align: center;
	}
	.compGrid {
		display: grid;
		grid-gap: 15px 15px;
		grid-template-columns: repeat(auto-fit, minmax(265px, 1fr));
		grid-auto-rows: 100px;
		list-style-type: none;
		margin: 0;
		padding: 0;
		li {
			display: flex;
			justify-content: center;
		}
	}
	.optionButton {
		display: flex;
		background-color: transparent;
		border: none;
		border-radius: 10px;
		box-shadow: var(--neu-med-i-BGColor-shadow);
		cursor: pointer;
		flex-direction: column;
		outline: none;
		padding: 5px;
		width: 265px;
		.optionTitle {
			font-size: 1.2rem;
			font-weight: bold;
			overflow: hidden;
			padding-bottom: 10px;
		}
		.optionHeroes {
			display: flex;
			.optionHero {
				border-radius: 50%;
				margin: 5px;
				max-width: 40px;
			}
			.optionHeroEmpty {
				border: 2px solid var(--appColorPrimary);
				border-radius: 50%;
				height: 40px;
				margin: 5px;
				width: 40px;
			}
		}
		&.claimed {
			background-color: var(--appColorPrimary);
			box-shadow: var(--neu-med-i-BGColor-pressed-shadow);
			color: var(--appBGColor);
		}
	}
	.footer {
		align-items: center;
		display: flex;
		justify-content: flex-end;
		padding-top: 20px;
		.footerButton {
			background-color: var(--appBGColor);
			border: none;
			border-radius: 10px;
			box-shadow: var(--neu-sm-i-BGColor-shadow);
			color: var(--appColorPrimary);
			cursor: pointer;
			font-size: 0.9rem;
			font-weight: bold;
			margin: 0px 8px;
			padding: 5px;
			&.cancel {
				color: var(--appColorBlack);
				margin-right: 0;
			}
		}
	}
	@media only screen and (min-width: 767px) {
		.footer {
			.footerButton {
				&:hover {
					background: var(--neu-convex-BGColor-bg);
				}
			}
		}
	}
</style>
