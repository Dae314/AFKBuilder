<script>
	import { onMount, getContext } from 'svelte';
	import AppData from '../stores/AppData.js';
	
	const { close } = getContext('simple-modal');

	const changelog = [
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
		{ version: 'v2.0.3 - Lily Valley',
			changes: [
				'<em>Explore area now available to view, share, favorite, and vote on community comps!</em>',
				'<em>Find exactly what you want. Deep searching and filtering available for comps</em>',
				'<em>Login and profiles now enabled. Sync My Heroes and Comps across devices!</em>',
				'<em>New look! Comprehensive redesign for SoftUI</em>',
				'<em>New comp editing options: duplicate comps, import lines from other comps</em>',
				'<em>New comp organization options: groups and hidden comps</em>',
				'Added new hero Oku',
				'Updated Morael benchmark e38',
				'Fixed typo on LDV +30 description',
				'Updated Twins\' skill descriptions',
				'Updated Cecilia\'s ult description',
				'Updated Thane\'s ult description',
			],
		},
		{ version: 'v1.13.51',
			changes: [
				'Added Terms of Service',
				'Added Privacy Policy',
				'Updated Haelus benchmark E36',
				'Updated Awakened Ezizh benchmark E60',
			],
		},
		{ version: 'v1.13.46',
			changes: [
				'Added new hero Audrae',
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
