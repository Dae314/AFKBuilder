<script>
	import { onMount, getContext } from 'svelte';
	import Beasts from '../stores/Beasts.js';
	import AppData from '../stores/AppData.js';
	
	const { close } = getContext('simple-modal');

	export let beastID;
	const beast = $Beasts.find(e => e.id === beastID);

	onMount(async () => {
		const queryString = window.location.search;
		const urlParams = new URLSearchParams(queryString);
		if(urlParams.has('comp')) {
			history.pushState({view: $AppData.activeView, modal: true, comp: true}, "Beast Detail", `?comp=true&modal=true${window.location.hash}`);
		} else {
			history.pushState({view: $AppData.activeView, modal: true, comp: false}, "Beast Detail", `?modal=true${window.location.hash}`);
		}
	});

	function handlePopState() {
		close();
	}
</script>

<svelte:window on:popstate={handlePopState} />

<div class="container">
	<section class="headerSection">
		<h3 class="beastName">{beast.name}</h3>
		<div class="imageContainer">
			<div class="portraitContainer">
				<img draggable="false" class="portrait" src={beast.portrait} alt={beast.name}>
			</div>
		</div>
	</section>
</div>

<style lang="scss">
	.container {
		color: var(--appColorBlack);
		position: relative;
		padding: 0px 10px;
	}
	.beastName {
		color: var(--appColorBlack);
		font-family: 'Roboto' sans-serif;
		font-size: 2.0rem;
		font-weight: bold;
		letter-spacing: 1px;
		margin: 0;
		padding: 10px 0px;
		padding-left: 10px;
		text-align: center;
		text-transform: uppercase;
	}
	.portraitContainer {
		align-items: center;
		display: flex;
		justify-content: center;
	}
	.portrait {
		border-radius: 50%;
		transition: all 0.2s;
		width: 100%;
	}
	.expanderButton {
		background-color: var(--appBGColor);
		border: none;
		border-radius: 10px;
		box-shadow: var(--neu-med-i-BGColor-shadow);
		color: var(--appColorBlack);
		cursor: pointer;
		font-size: 1.1rem;
		outline: none;
		padding: 10px;
		text-align: left;
		width: 100%;
		.expanderArrow {
			border: solid var(--appColorBlack);
			border-width: 0 3px 3px 0;
			display: inline-block;
			margin-right: 16px;
			padding: 3px;
			transition: transform 0.2s ease-out;
			&.right {
				transform: rotate(-45deg);
			}
			&.down {
				transform: rotate(45deg);
			}
		}
	}
	.mobileExpander {
		margin-bottom: 10px;
		max-height: 0;
		overflow: hidden;
		transition: max-height 0.2s ease-out;
	}
	.mobileExpander.isOpen {
		max-height: 1000px;
	}
	@media only screen and (min-width: 767px) {
	}
</style>
