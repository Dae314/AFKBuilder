<script>
	import { onMount, getContext } from 'svelte';
	import AppData from '../stores/AppData.js';
	
	const { close } = getContext('simple-modal');

	const changelog = [
		{ version: 'v2.3.25',
			changes: [
				'Add Crassio',
				'Add Emilia',
				'Add Rem',
				'Add awAthalia',
				'Add Ginneas',
				'Add Daemia',
				'Add Trishea',
				'Add Savage Soufle',
				'Add Slumber Seal',
				'Add Fox Fatale',
				'Update awBaden SP skill',
				'Fix Maetria naming',
				'Fix Phantasmoth first skill icon',
				'Fix Torne S2 description',
				'Fix typo on Olgath S4',
			],
		},
		{ version: 'v2.3.10',
			changes: [
				'Added Phantasmoth',
				'Added Edwin',
				'Added Olgath',
				'Added Materia',
				'Updated Awakened Ezizh benchmark to 000e0',
				'Updated all Canisa & Ruke descriptions',
				'Updated Tamrus e60 description',
				'Updated Tamrus ult lv3 description',
				'Updated Hendrik furniture description',
				'Fixed Vei S4 picture',
				'Fixed typo on JOA ult',
				'Fixed typo on Wutus e60',
				'Fixed typo on Nara ult',
				'Fixed typo on Silas +0',
				'Fixed typo on Rock Crown Lizard lv15 skill',
				'Fixed typo on Rock Crown Lizard lv18 skill',
				'Fixed typo on Bladeridge lv6 skill',
			],
		},
		{ version: 'v2.3.0',
			changes: [
				'<em>Added tables for Beasts and Artifacts in Hero List area</em>',
				'Added Awakened Belinda',
				'Added Mulan',
				'Added Veithael',
				'Added Talismane',
				'Added Tamrus',
				'Updated Palmer benchmark to 209e44',
				'Updated C&R benchmark to 309e30',
				'Updated Gwyneth benchmark to 200e0',
				'Updated Torne benchmark to 203e0',
				'Updated Mezoth, Zikis, Leofric, Thali, and Thane benchmark to 000e0',
				'Updated Kelthur skill 2 name',
				'Updated Saurus skill 4 name',
				'Updated npm packages',
				'Fixed typos on Kelthur and Nevanthi',
				'Fixed filters now reset if you reload the page',
				'Fixed Firefox no longer shows number input arrows',
			],
		},
		{ version: 'v2.2.4',
			changes: [
				'Added Palmer',
				'Added Flutterplume Owl',
				'Fixed typo on Baden +20',
				'Fixed typo on Canisa & Ruke skill 3',
			],
		},
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
