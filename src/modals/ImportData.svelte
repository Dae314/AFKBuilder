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
		history.pushState({view: $AppData.activeView, modal: true}, "Import Data", `?modal=true${window.location.hash}`);
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
		margin-bottom: 5px;
		user-select: none;
	}
	.dataInput {
		background-color: var(--appBGColor);
		border: none;
		border-radius: 10px;
		box-shadow: var(--neu-sm-i-BGColor-shadow);
		height: 250px;
		margin: 0 auto;
		outline: 0;
		padding: 5px;
		width: 95%;
		&:focus {
			background-color: white;
		}
	}
	.footer {
		display: flex;
		flex-direction: row;
		justify-content: right;
		padding-top: 15px;
		width: 100%;
	}
	.status {
		width: 75%;
	}
	.statusText {
		background-color: #a7fc92;
		border: none;
		border-radius: 5px;
		box-shadow: var(--neu-sm-ni-BGColor-shadow);
		color: var(--appColorBlack);
		padding: 3px 10px;
		visibility: hidden;
		width: fit-content;
		&.visible {
			visibility: visible;
		}
		&.error {
			background-color: var(--appDelColor);
			color: var(--appBGColor);
		}
	}
	.submitArea {
		margin-left: auto;
	}
	.submitButton {
		background-color: var(--appBGColor);
		border: none;
		border-radius: 5px;
		box-shadow: var(--neu-sm-i-BGColor-shadow);
		color: var(--appColorPrimary);
		cursor: pointer;
		font-weight: bold;
		padding: 5px;
		transition: transform 0.2s;
		width: 100px;
	}
	@media only screen and (min-width: 767px) {
		.submitButton {
			&:hover {
				background: var(--neu-convex-BGColor-bg);
			}
		}
	}
</style>
