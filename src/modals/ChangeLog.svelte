<script>
	import { onMount, getContext } from 'svelte';
	import AppData from '../stores/AppData.js';
	
	const { close } = getContext('simple-modal');

	const changelog = [
		{ version: 'v1.12.3 - Twinkleshine',
		changes: [
			'<em>NEW Stars and Engravings now supported for heroes in Comps and My Heroes!</em>',
			'<em>NEW Track copies of heroes below Ascended in My Heroes!</em>',
			'<em>NEW Sort My Heroes list based on name, ascension, copies, or engraving!</em>',
			'<em>NEW Get engraving recommendations in the Recommendations area based on starred comps!</em>',
			'<em>NEW Engraving benchmarks listed on Hero List (desktop only) or in Hero Details (tap on a hero).</em>',
			'NOTE Engraving benchmarks are a work in progress and not definitive.',
			'Added new hero Treznor',
			'Updated Daimon\'s 3rd skill "Stitchy converts 100% of the damage he DEALT...", thanks Bob49!',
			'Updated Ulmus\'s ultimate skill description',
			],
		},
		{ version: 'v1.8.18',
		changes: [
			'Updated npm packages',
			'Add new hero Haelus',
			'Updated Izold\'s furniture description',
			'Updated Belinda\'s furniture description',
			'Updated Albedo\'s 4th skill description',
			'Updated Ainz\'s 4th skill description',
			'Updated QUEEN\'s SI description',
			'Updated Walker\'s 4th skill description',
			'Updated Khasos\' furniture description',
			'Updated Warek\'s furniture description',
			'Updated Drez\'s 4th skill description',
			'Updated Respen\'s SI description',
			'Updated Lucretia\'s 4th skill description',
			'Updated Ezio\'s 3rd skill description',
			'Updated Gwyneth\'s 4th skill description',
			'Updated Leonardo\'s benchmark to 303',
			],
		},
		{ version: 'v1.8.14',
			changes: [
				'Added new hero Mishka',
				'Added Graveborn engraving information',
				'Added Dual Divinity artifact',
				'Updated Walker ultimate skill description',
				'Updated Oden Eye of Evil skill description',
				'Updated Theowyn Spectral Curse skill description',
				'Updated Safiya Spectral Disruption skill description',
				'Optimized Granit SI description',
			],
		},
		{ version: 'v1.8.6',
			changes: [
				'<em>Added Legendary tier heroes into the app</em>',
				'<em>Setup dynamic disabling of SI/Furniture buttons based on hero tier and ascension level</em>',
				'<em>Updated ascension markers and menus for Legendary tier heroes</em>',
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
