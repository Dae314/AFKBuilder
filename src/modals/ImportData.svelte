<script>
	import { onMount, getContext } from 'svelte';
	import TutorialBox from '../shared/TutorialBox.svelte';
	import AppData from '../stores/AppData.js';
	export let dataHandler = () => {};
	export let saveAppData = () => {};
	export let title = "Paste Data:";

	const { close } = getContext('simple-modal');

	let data;
	let status = -1;
	let statusMsg = 'Awaiting data import';

	onMount(async () => {
		history.pushState({view: $AppData.activeView, modal: true}, "Import Data", `?modal=true`);
	});

	async function handleImport() {
		if(!data) {
			status = 1;
			statusMsg = "Import data cannot be empty";
			return;
		}
		const returnObj = await dataHandler(data.trim());
		if(returnObj.retCode !== 0) {
			// data import error occurred
			status = returnObj.retCode;
			statusMsg = returnObj.message;
		} else {
			// data import successful
			status = 0;
			statusMsg = returnObj.message;
			setTimeout(() => close(), 400);
		}
	}

	function dismissWarn() {
		$AppData.dismissImportWarn = true;
		saveAppData();
	}

	function handlePopState() {
		close();
	}
</script>

<svelte:window on:popstate={handlePopState} />

<div class="container" on:keyup={e => e.stopPropagation()}>
	{#if !$AppData.dismissImportWarn}
		<TutorialBox warning={true} onClick={dismissWarn} clickable={true}>
			Warning: Importing bad data may introduce corruption, make the app unusable, or introduce unwanted information. Make sure you are importing data from a trusted source and you have a current backup of your data.
		</TutorialBox>
	{/if}
	<div class="titleContainer">
		<h3 class="title">{title}</h3>
	</div>
	<textarea class="dataInput" bind:value={data}></textarea>
	<div class="footer">
		<div class="status">
			<div class="statusText" class:error={status > 0} class:visible={status >= 0}><span>{statusMsg}</span></div>
		</div>
		<div class="submitArea">
			<button type="button" class="submitButton" on:click={handleImport}>Import</button>
		</div>
	</div>
</div>

<style lang="scss">
	.container {
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: 10px;
		width: 100%;
	}
	.titleContainer {
		display: flex;
		justify-content: left;
		padding-bottom: 10px;
	}
	.title {
		font-size: 1.3rem;
		margin: 0;
		user-select: none;
	}
	.dataInput {
		height: 250px;
		width: 100%;
	}
	.footer {
		display: flex;
		flex-direction: row;
		justify-content: right;
		padding-top: 10px;
		width: 100%;
	}
	.status {
		width: 75%;
	}
	.statusText {
		background-color: rgba(173, 255, 159, 0.7);
		border-radius: 5px;
		color: black;
		padding: 3px 10px;
		visibility: hidden;
		width: fit-content;
	}
	.statusText.visible {
		visibility: visible;
	}
	.statusText.error {
		background-color: rgba(255, 0, 0, 0.5);
	}
	.submitArea {
		margin-left: auto;
	}
	.submitButton {
		background-color: transparent;
		border: 3px solid var(--appColorPrimary);
		border-radius: 10px;
		color: var(--appColorPrimary);
		padding: 5px;
		transition: transform 0.2s;
		width: 100px;
		&:active {
			transform: scale(0.9);
		}
	}
	@media only screen and (min-width: 767px) {
		.submitButton {
			&:hover {
				background-color: var(--appColorPrimary);
				color: white;
			}
		}
	}
</style>
