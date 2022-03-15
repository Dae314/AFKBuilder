<script>
	import { onMount, tick } from 'svelte';
	import HeroData from '../stores/HeroData.js';
	import AppData from '../stores/AppData.js';
	import ModalCloseButton from '../modals/ModalCloseButton.svelte';

	export let config = {};
	export let isMobile = false;

	$: displayComps = $AppData.Comps.filter(e => !e.hidden);

	let close = () => {};
	let onSuccess = () => {};
	let lineIdx = 0;
	let section = 1;

	onMount(async () => {
		close = config.close;
		lineIdx = config.idx;
		onSuccess = config.onSuccess;
	});
</script>

<div class="background">
	<div class="modalCloseContainer">
		<ModalCloseButton onClose={close} />
	</div>
	<div id="ilContainer" class="importLineContainer" on:click={(e) => e.stopPropagation()}>
		{#if section === 1}
			<div class="compBrowser">
				<ul>
					{#each displayComps as comp}
						<li>
							<button type="button" class="compCardButton">
								<div class="compCardTitle">
									{comp.name}
								</div>
								<div class="compCardHeroes">
									{#each comp.lines[0].heroes as heroID}
										{#if $HeroData.some(e => e.id === heroID)}
											<img draggable="false" class="compCardHero" src={$HeroData.find(e => e.id === heroID).portrait} alt={$HeroData.find(e => e.id === heroID).name}>
										{:else}
											<i class="compCardHeroEmpty"></i>
										{/if}
									{/each}
								</div>
							</button>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
	.background {
		align-items: center;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		flex-direction: column;
		height: 100%;
		justify-content: center;
		width: 100%;
	}
	.modalCloseContainer {
		margin-left: auto;
		position: relative;
		right: 10%;
	}
	.importLineContainer {
		background: var(--appBGColor);
		border-radius: 10px;
		height: 70%;
		overflow-x: hidden;
		overflow-y: auto;
		position: relative;
		width: 80%;
	}
	@media only screen and (min-width: 767px) {
		.modalCloseContainer {
			right: 25%;
		}
		.importLineContainer {
			width: 50%;
		}
	}
</style>
