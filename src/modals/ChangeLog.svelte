<script>
	import { onMount, getContext } from 'svelte';
	import AppData from '../stores/AppData.js';
	
	const { close } = getContext('simple-modal');

	const changelog = [
		{ version: 'v2.2.0',
			changes: [
				'Added Beast support in Comps',
				'Added Nevanthi',
				'Added Salaki',
				'Added Awakened Baden',
				'Added missing furniture skill images',
				'Updated Kaz, Respen, Theowyn, Kalene, Nako, and Melu benchmarks to 000e0',
				'Updated Ezizh SI',
				'Fixed Awakened heroes can now have SI 40',
				'Fixed typos on Anasta skills',
			],
		},
		{ version: 'v2.1.60',
			changes: [
				'Added Awakened Solise',
				'Added Yennifer and Geralt',
				'Added Canisa & Ruke',
				'Added Tarnos furniture icon',
				'Updated Cecilia skill 4',
				'Updated Anoki SI skill description',
				'Updated Skriath skill 2 and 4',
				'Updated Mezoth ultimate skill',
				'Updated Khazard SI',
				'Updated Grez skill 4',
				'Updated Morrow furniture',
				'Updated Anasta SI',
				'Updated Estrilda skill 3',
				'Updated Tasi skill 3',
				'Updated Lucretia skill 3',
				'Updated Anasta benchmark e44',
				'Updated Morael benchmark e36',
				'Updated node packages',
				'Fixed Framton skill 2 typo',
				'Fixed Skreg skill 2 typo',
			],
		},
		{ version: 'v2.1.40',
			changes: [
				'Added new hero Eorin',
				'Added new hero Tarnos',
				'Added missing furniture skill icons',
				'Added Treasure Scramble into Endeavor list',
				'Optimized skill descriptions (thanks Bob49!)',
				'Updated Hero Benchmarks (thanks Bob49!)',
				'Updated Hendrik\'s furniture description',
				'Updated Anasta SI description',
				'Fixed AwThane ult typo',
				'Fixed Melusina SI typos',
				'Fixed Alaro skill 2 typo',
				'Fixed scarlet SI typo',
			],
		},
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
