<script>
	import { onMount, getContext } from 'svelte';
	import Artifacts from '../stores/Artifacts.js';
	import AppData from '../stores/AppData.js';

	const { close } = getContext('simple-modal');

	onMount(async () => {
		history.pushState({view: $AppData.activeView, modal: true}, "Artifact Detail", `${window.location.hash}?&modal=true`);
	});

	export let artifactID = "";
	let artifact = $Artifacts[artifactID];

	function handlePopState() {
		close();
	}
</script>

<svelte:window on:popstate={handlePopState} />

<div class="container">
	<section class="headerSection">
		<h3 class="name">{artifact.name}</h3>
		<div class="imgContainer">
			<img draggable="false" class="artifactImg" src={artifact.image} alt={artifact.name}>
		</div>
	</section>
	<section class="attributes">
		<div class="classContainer">
			{#if artifact.class === 'Any'}
				<div class="allCircle classImg"><span>All</span></div>
				<div class="tooltip classTooltip"><span class="tooltipText">All Classes</span></div>
			{:else}
				<img draggable="false" class="classImg" src="./img/classes/{artifact.class.toLowerCase()}.png" alt={artifact.class}>
				<div class="tooltip"><span class="tooltipText">{artifact.class}</span></div>
			{/if}
		</div>
		<div class="attrContainer">
			{#each artifact.attributes as attr}
				<div class="attrBox">
					<span>{attr}</span>
				</div>
			{/each}
		</div>
	</section>
	<section class="descContainer">
		{#each artifact.upgrades as upgrade}
			<div class="descArea">
				<h4>Unlocked at {upgrade.unlock}:</h4>
				<div class="descText">{@html upgrade.desc}</div>
			</div>
		{/each}
	</section>
</div>

<style lang="scss">
	.container {
		height: 100%;
		position: relative;
		width: 100%;
	}
	.headerSection {
		h3 {
			background-color: var(--appColorPrimary);
			color: white;
			font-family: 'Roboto' sans-serif;
			font-size: 2.0rem;
			font-weight: bold;
			letter-spacing: 1px;
			margin: 0;
			margin-bottom: 10px;
			text-align: center;
			text-transform: uppercase;
			width: 100%;
		}
	}
	.imgContainer {
		display: flex;
		justify-content: center;
		width: 100%;
	}
	.artifactImg {
		border-radius: 50%;
		max-width: 100px;
	}
	.attributes {
		align-items: center;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: center;
		padding: 10px;
		width: 100%;
	}
	.classContainer {
		position: relative;
	}
	.classImg {
		margin-right: 10px;
		max-width: 50px;
	}
	.allCircle {
		align-items: center;
		background-color: var(--appColorPrimary);
		border: 2px solid var(--appColorPrimary);
		border-radius: 50%;
		color: white;
		display: flex;
		flex-grow: 0;
		flex-shrink: 0;
		font-weight: bold;
		height: 50px;
		justify-content: center;
		margin-right: 10px;
		user-select: none;
		width: 50px;
	}
	.attrContainer {
		display: flex;
		flex-direction: row;
	}
	.attrBox {
		background-color: var(--appColorPrimary);
		border: 2px solid var(--appColorPrimary);
		border-radius: 10px;
		color: white;
		font-size: 1rem;
		font-weight: bold;
		margin: 5px;
		padding: 10px;
		user-select: none;
	}
	.descContainer {
		padding: 10px;
		padding-bottom: 20px;
		padding-top: 0px;
		.descArea {
			h4 {
				font-size: 1rem;
				margin: 0;
				margin-bottom: 5px;
				margin-top: 10px;
			}
		}
	}
	.descText {
		margin-left: 20px;
		:global(em) {
			color: var(--appColorPrimary);
			font-style: normal;
			font-weight: bold;
		}
	}
	.tooltip {
		display: none;
	}
	@media only screen and (min-width: 767px) {
		.tooltip {
			bottom: -35px;
			display: flex;
			justify-content: center;
			left: -75px;
			opacity: 0;
			position: absolute;
			transition: opacity 0.2s;
			visibility: hidden;
			width: 200px;
			z-index: 4;
			.tooltipText {
				background-color: var(--appColorPrimary);
				border-radius: 6px;
				color: white;
				padding: 5px;
				text-align: center;
				user-select: none;
			}
		}
		.classImg:hover+.tooltip {
			opacity: 1;
			visibility: visible;
		}
	}
</style>
