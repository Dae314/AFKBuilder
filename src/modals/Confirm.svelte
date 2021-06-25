<script>
	import { onMount, getContext } from 'svelte';
	import AppData from '../stores/AppData.js';

	export let message = "Are you sure?";
	export let onCancel = () => {};
	export let onConfirm = () => {};
	export let confirmData = 0;

	const { close } = getContext('simple-modal');

	onMount(async () => {
		history.pushState({view: $AppData.activeView, modal: true}, "Confirm", `?view=${$AppData.activeView}&modal=true`);
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
	<div class="text"><span>{message}</span></div>
	<div class="optionsArea">
		<button class="optionButton confirmButton" on:click={handleConfirm}>Yes</button>
		<button class="optionButton cancelButton" on:click={handleCancel}>Cancel</button>
	</div>
</div>

<style lang="scss">
	.text {
		display: flex;
		font-size: 1.2rem;
		justify-content: center;
		padding-bottom: 20px;
		text-align: center;
		width: 100%;
	}
	.optionsArea {
		bottom: 0;
		display: flex;
		flex-direction: row;
		justify-content: right;
		position: relative;
		width: 100%;
	}
	.optionButton {
		background: transparent;
		border: 3px solid var(--appColorPrimary);
		border-radius: 10px;
		color: var(--appColorPrimary);
		font-size: 1rem;
		&:first-child {
			margin-left: auto;
			margin-right: 10px;
		}
	}
	.confirmButton {
		border: 3px solid var(--appDelColor);
		color: var(--appDelColor);
	}
	@media only screen and (min-width: 767px) {
		.confirmButton {
			&:hover {
				background-color: var(--appDelColor);
				color: white;
			}
		}
		.cancelButton {
			&:hover {
				background-color: var(--appColorPriAccent);
				color: white;
			}
		}
	}
</style>
