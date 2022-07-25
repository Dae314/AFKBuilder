<script>
	import { onMount, getContext } from 'svelte';
	import AppData from '../stores/AppData.js';
	
	const { close } = getContext('simple-modal');

	const changelog = [
		{ version: 'v2.1.28',
			changes: [
				'Added Awakened Brutus',
				'Added Joan of Arc',
				'Updated Oden skill 4',
				'Updated Talene benchmark e38',
				'Updated Thesku skill 4 and SI +10',
				'Fixed AwThane endeavor icon',
				'Fixed Albedo 3f typo',
				'Fixed Raine skill 3 typo',
				'Fixed Joker e30 typo',
				'Fixed Orthros s4 typo',
				'Fixed Framton e30 typo',
			],
		},
		{ version: 'v2.1.17',
			changes: [
				'Added new hero Kalene',
				'Updated Gwyneth skills 2 and 3 descriptions',
				'Updated Grez skill 3 description',
				'Updated Fawkes skill 2 description',
				'Updated Titus, Leofric, and Mehira engraving effects',
				'Updated Satrana benchmark to 200',
				'Fixed Audrae furniture image',
				'Fixed typo on Vyloris skill 3',
				'Fixed typo on Satrana skill 2',
				'Fixed typo on Skreg 3f typo',
			],
		},
		{ version: 'v2.1.7',
			changes: [
				'Added new hero Sonja',
				'Added new hero Anasta',
				'Fixed date filtering for new comps in explore',
				'Updated Queen benchmark to 209e33',
				'Updated Torne benchmark to 200e0',
				'Fixed typo on Skreg e30 and ult lv3',
				'Fixed typo on Fawkes 3f',
			],
		},
		{ version: 'v2.1.0',
			changes: [
				'Added dark theme',
				'Added new hero Vyloris',
				'Updated Hodgekin benchmark to e33',
				'Fixed formatting on Framton skill 4',
			],
		},
		{ version: 'v2.0.23',
			changes: [
				'Added new hero Aw!Thane',
				'Updated contributor profile image',
				'Fixed Tidus skill 3 typo',
				'Fixed Aw!Ezizh Mind Flay typo',
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
