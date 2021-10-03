<script>
	import { onMount, getContext } from 'svelte';
	import AppData from '../stores/AppData.js';
	
	const { close } = getContext('simple-modal');

	const changelog = [
		{ version: 'v1.8.6',
			changes: [
				'Added Legendary tier heroes into the app',
				'Setup dynamic disabling of SI/Furniture buttons based on hero tier and ascension level',
				'Updated ascension markers and menus for Legendary tier heroes',
				'Updated images with de-noised versions',
				'Added Leonardo',
				'Fixed Mezoth, Demonic Hunger ability description',
				'Updated Rosaline furniture skill descriptions',
				'Added Mauler engraving info',
				'Added Endeavor skill descriptions to all engraved heroes',
			],
		},
		{ version: 'v1.7.32',
			changes: [
				'Added new hero Granit',
				'Added Lightbearer engraving information',
				'Hero benchmarks changed: Ezio 209, Hodgkin 209, Lyca 200, Tidus 203, Zol 203, Zikis, 209, Morrow 203',
				'Fix ToastUI editor z-index value was too high',
				'Updated NPM packages',
				'Fixed various typos',
			],
		},
		{ version: 'v1.7.26',
			changes: [
				'Added Zikis',
				'Added Wilder engraving info',
				'All heroes in a line or sub-line are now cleaned up when the line or sub-line is deleted',
				'Fixed Hogkin\'s third skill image',
				'Fixed code blocks displaying in description without linebreaks',
			],
		},
		{ version: 'v1.7.21',
			changes: [
				'Added the Oceanic Strings artifact',
				'Fixed typo on Twins\' class',
				'Changed artifact remove buttons to match the rest of the app',
				'Added Morrow to hero database',
				'Adjusted Raku\'s furn benchmark to 3',
			],
		},
		{ version: 'v1.7.16 - Cherry Berry',
			changes: [
				'<em>Completely overhauled the My Heroes area.</em>',
				'<em>New radial menu used to select SI and Furn.</em>',
				'<em>Added Hodgkin to the hero database.</em>',
				'<em>Added engraving skill details to all CHaD heroes in detail popup.</em>',
				'<em>Added link to new Discord for sharing comps!</em>',
				'Converted Hero Finder filter logic to exclude all categories aside from the one that was clicked. My Heroes and Hero List remain unchanged.',
				'Added mobile export button to comp detail and remove buttons from comp cards (too hard to touch)',
				'Added SI OFF to indicate SI isn\'t activated at all.',
				'Added changelog to the About page if you click version number.',
				'Newly claimed heroes are now ascended with 0SI and 0F.',
				'Added lodash to debounce some listeners.',
				'Standardized delete button design.',
				'Standardized mobile viewport listener.',
				'Disabled autofocus in the comp editor.',
				'Updated benchmark numbers for several heroes (thanks Bob!)',
				'Changed design of core marks.',
				'Updated all NPM packages.',
				'Fixed desktop filters display on My Heroes and Hero List.',
				'Fixed info icon displaying above filters in My Heroes.',
				'Fixed scrolling issue on mobile with URL bar open.',
				'Fixed weird button padding on iOS Safari.',
				'Fixed iOS Safari gradient display.',
				'Fixed various typos in hero data.',
			]
		},
	]

	onMount(async () => {
		history.pushState({view: $AppData.activeView, modal: true}, "Change Log", `?view=${$AppData.activeView}&modal=true`);
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
