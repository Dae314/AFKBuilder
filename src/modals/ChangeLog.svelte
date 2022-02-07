<script>
	import { onMount, getContext } from 'svelte';
	import AppData from '../stores/AppData.js';
	
	const { close } = getContext('simple-modal');

	const changelog = [
		{ version: 'v1.13.30',
			changes: [
				'Added new hero Melusina',
				'Updated LDV benchmark to E36',
				'Adjusted spacing on Ainz skill Magic Caster',
			],
		},
		{ version: 'v1.13.27',
			changes: [
				'Added Scarlet with accurate skill descriptions (Thanks Bob49)',
				'Fixed typo on Khazard SI +30 description',
			],
		},
		{ version: 'v1.13.25',
			changes: [
				'Added Talene - The Resurging Flame',
				'Re-translated Ezizh\'s SI descriptions (Thanks Bob49)',
				'Changed fodder hero class icons to generic icons',
				'Updated Rigby\'s skill descriptions',
				'Updated Fawkes\' SI',
				'Update Ezizh E60 effect',
				'Updated Framton\'s ult description',
				'Fixed typo on Mishka "Dire Wolves" skill',
				'Fixed typo on Khaz SI30 skill',
			],
		},
		{ version: 'v1.13.16',
			changes: [
				'Add new hero Astar',
				'Update Hodgkin, Daimon, Estrilda, Mortas, Albedo, Flora, Treznor engraving benchmark: E30',
				'Update Twins, Leondardo, Rosaline, Merlin engraving benchmark: E33',
				'Update Antandra, Ferael, Zolrath engraving benchmark: E41',
				'Update Haelus, Mishka, Drez, Thane, Theowyn, Zaphrael, Ezizh, Athalia, Belinda, Arthur, Alna engraving benchmark: E60',
				'Update Tasi Teleportation ability description',
				'Fix typo on Hodgkin skill 4',
				'Fix typo on Framton 9f and skill 1',
			],
		},
		{ version: 'v1.13.8',
			changes: [
				'Add new hero Framton',
				'Update Haelus benchmark -> 203',
				'Update Skriath SI description',
				'Update Warek skill descriptions - thanks Bob!',
				'Add engraving benchmarks for Silas, Izold, and Skriath',
				'Don\'t take search input on MH and HL when ctrl or cmd are held',
				'Transition to svelte-spa-router for history handling',
				'Fix Warek\'s 4th skill name',
				'Fix Cecilia ult description',
			],
		},
	]

	onMount(async () => {
		history.pushState({view: $AppData.activeView, modal: true}, "Change Log", `?modal=true${window.location.hash}`);
	});

	function handlePopState() {
		close();
	}
</script>

<svelte:window on:popstate={handlePopState} />

<div class="container">
	{#each changelog as item}
		<h4>{item.version}</h4>
		<ul>
		{#each item.changes as change}
			<li>{@html change}</li>
		{/each}
		</ul>
	{/each}
</div>

<style lang="scss">
	.container {
		padding: 10px;
		padding-top: 0px;
	}
	h4 {
		margin: 0;
		padding-top: 10px;
	}
	ul {
		margin: 0;
	}
	em, :global(em) {
		color: var(--appColorPrimary);
		font-style: normal;
		font-weight: bold;
	}
</style>
