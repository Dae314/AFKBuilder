<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import AppData from '../stores/AppData.js';


	const dispatch = createEventDispatcher();

	let showRetirement;

	onMount(async () => {
		showRetirement = !$AppData.dismissRetirement;
	});

	function closeRetirement() {
		showRetirement = false;
		$AppData.dismissRetirement = true;
		dispatch('routeEvent', {action: 'saveData'});
	}

	function init(el) {
		el.focus();
	}
</script>

{#if showRetirement}
	<div class="retirementBackground" on:click={closeRetirement} on:keyup={(event) => event.key === 'Escape' && closeRetirement()} use:init tabindex="0">
		<div class="retirementContainer" transition:fly="{{ y: 100, duration: 600 }}">
			<div class="retirementText">AFK Builder will be officially sunset on <em>January 15, 2024</em>. Life has gotten busy for me, and I've moved on from the game. All data, including comps, login information & other details will be deleted. I appreciate the support from this amazing community, and I hope my tool was useful.</div>
			<div class="retirementText">Dae314</div>
			<button type="button" class="closeButton" on:click={closeRetirement}>Dismiss</button>
		</div>
	</div>
{/if}

<style lang="scss">
	.retirementBackground {
		align-items: center;
		background-color: rgba(0, 0, 0, 0.25);
		backdrop-filter: blur(10px);
		display: flex;
		height: 100%;
		position: absolute;
		justify-content: center;
		left: 0;
		top: 0;
		width: 100%;
		z-index: 9;
	}
	.retirementContainer {
		background-color: var(--appBGColor);
		border-radius: 10px;
		box-shadow: var(--neu-large-ni-BGColor-shadow);
		color: var(--appColorBlack);
		height: fit-content;
		left: 5%;
		max-width: 500px;
		padding: 10px;
		text-align: center;
		width: 90%;
		z-index: 5;
		.retirementText {
			padding: 10px;
		}
		.closeButton {
			background-color: var(--appBGColor);
			border: none;
			border-radius: 10px;
			box-shadow: var(--neu-med-i-BGColor-shadow);
			color: var(--appColorPrimary);
			cursor: pointer;
			font-size: 1rem;
			font-weight: bold;
			margin-top: 20px;
			outline: none;
			padding: 10px;
			text-align: center;
			transition: all 0.2s;
			width: 140px;
		}
	}
	@media only screen and (min-width: 767px) {
		.retirementContainer {
			.closeButton {
				&:hover {
					background: var(--neu-convex-BGColor-wide-bg);
				}
			}
		}
	}
</style>
