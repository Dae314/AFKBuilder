<script>
	import { onMount } from 'svelte';
	import Beasts from '../stores/Beasts.js';
	import ModalCloseButton from './ModalCloseButton.svelte';

	export let config = {};

	let close = () => {};
	let onSuccess = () => {};
	let lineIdx = 0;

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
	<div id="beastEditor" class="beastEditorContainer" on:click={(e) => e.stopPropagation()}>
		<p>Beast Editor Here</p>
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
	.beastEditorContainer {
		background: var(--appBGColor);
		border-radius: 10px;
		color: var(--appColorBlack);
		height: 70%;
		overflow-x: hidden;
		overflow-y: auto;
		padding: 10px;
		position: relative;
		width: 50%;
	}

	@media only screen and (min-width: 767px) {
		.modalCloseContainer {
			right: 25%;
		}
	}
</style>
