<script>
	import { onMount, getContext } from 'svelte';
	import AppData from '../stores/AppData.js';
	
	const { close } = getContext('simple-modal');

	const changelog = [
		{ version: 'v2.0.23',
			changes: [
				'Added new hero Aw!Thane',
				'Updated contributor profile image',
				'Fixed Tidus skill 3 typo',
				'Fixed Aw!Ezizh Mind Flay typo',
			],
		},
		{ version: 'v2.0.19',
			changes: [
				'Fixed author pages not loading',
				'Reversed direction of enemy line switch',
				'Fixed typo on Alaro skill 4',
				'Adjusted wording on Cecilia ult description',
			],
		},
		{ version: 'v2.0.15',
			changes: [
				'Added switch to change line mode from player to enemy',
				'Modified thicker outline for SI30 icon',
				'Added autofocus search bar in Hero Finder only on desktop',
			],
		},
		{ version: 'v2.0.12',
			changes: [
				'Changed comp preview cards to show first line',
				'Left aligned comp preview card titles',
				'Updated Astar benchmark E41',
			],
		},
		{ version: 'v2.0.9',
			changes: [
				'Fixed "Restore to Comps" button styling',
				'Disabled publishing of draft comps',
				'Added draft indicator in comp details',
				'Fixed comp name pushing comp line off of library card',
				'Fixed explore grid spacing',
				'Updated import confirm window with neumorphic design',
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
		color: var(--appColorBlack);
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
