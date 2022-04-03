<script>
	import { onMount, getContext } from 'svelte';
	import AppData from '../stores/AppData.js';
	
	const { close } = getContext('simple-modal');

	const changelog = [
		{ version: 'v1.13.46',
			changes: [
				'Added new hero Audrae',
			],
		},
		{ version: 'v1.13.45',
			changes: [
				'Added new hero Alaro',
				'Updated Kren benchmark to E44',
			],
		},
		{ version: 'v1.13.43',
			changes: [
				'Added new hero Ezizh (Awakened)',
				'Fix Talene (Awakened) signature item skill descriptions',
			],
		},
		{ version: 'v1.13.41',
			changes: [
				'Added new hero Fane',
				'Updated Mishka benchmark to 209',
				'Updated Astar benchmark to e60',
				'Updated Lucius skill Divine Strike description',
				'Updated Gorvo\'s SI description',
				'Updated Mehira\'s SI description',
				'Updated Cecilia\'s Furniture description',
				'Updated Safiya Spectral Disruption skill description',
				'Updated Tasi Slumber skill description',
				'Updated Treznor\'s SI description',
				'Fixed typo on Satrana 3f',
			],
		},
		{ version: 'v1.13.30',
			changes: [
				'Added new hero Melusina',
				'Updated LDV benchmark to E36',
				'Adjusted spacing on Ainz skill Magic Caster',
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
