<script>
	import { onMount, getContext } from 'svelte';
	import AppData from '../stores/AppData.js';

	export let message = "Are you sure?";
	export let onCancel = () => {};
	export let onConfirm = () => {};
	export let confirmData = 0;

	const { close } = getContext('simple-modal');

	onMount(async () => {
		history.pushState({view: $AppData.activeView, modal: true}, "Confirm", `?modal=true${window.location.hash}`);
	});

	function handleCancel() {
		onCancel();
		close();
	}

	function handleConfirm() {
		onConfirm(confirmData);
		close();
	}

	function handlePopState() {
		close();
	}
</script>

<svelte:window on:popstate={handlePopState} />

<div class="confirmContainer">
	<div class="text"><span>{@html message}</span></div>
	<div class="optionsArea">
		<button type="button" class="optionButton confirmButton" on:click={handleConfirm}>Yes</button>
		<button type="button" class="optionButton cancelButton" on:click={handleCancel}>Cancel</button>
	</div>
</div>

<style lang="scss">
	.text {
		display: flex;
		font-size: 1.2rem;
		justify-content: center;
		max-width: 500px;
		padding-bottom: 20px;
		text-align: center;
		width: 100%;
	}
	.optionsArea {
		display: flex;
		flex-direction: row;
		justify-content: flex-end;
		width: 100%;
		.optionButton {
			background: var(--appBGColor);
			border: none;
			border-radius: 10px;
			box-shadow: var(--neu-sm-i-BGColor-shadow);
			color: black;
			cursor: pointer;
			font-size: 0.9rem;
			font-weight: bold;
			outline: none;
			padding: 5px;
			transition: all 0.2s;
			&.confirmButton {
				color: var(--appDelColor);
				margin-right: 15px;
			}
		}
	}
	@media only screen and (min-width: 767px) {
		.optionsArea {
			.optionButton {
				&:hover {
					background: var(--neu-convex-BGColor-bg);
				}
			}
		}
	}
</style>
