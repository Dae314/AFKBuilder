<script>
	import { onMount, getContext } from 'svelte';
	import { mutation } from "svelte-apollo";
	import AppData from '../stores/AppData.js';
	import { gql_CREATE_REPORT } from '../gql/queries.svelte';
	import LoadingSpinner from '../shared/LoadingSpinner.svelte';

	export let target = {};

	const gqlCreateReport = mutation(gql_CREATE_REPORT);
	const { close } = getContext('simple-modal');
	
	const reportTypes = [
		'Copyright Violation',
		'Harassment',
		'Hate',
		'Impersonation',
		'Malware',
		'Misinformation',
		'Self-harm or Suicide',
		'Sexual Content',
		'Sharing Personal Information',
		'Spam',
		'Threatening/Violence',
	];
	let reportType = reportTypes[8]; // default report type to Spam
	let showErrorDisplay = false;
	let errorMessage = '';
	let showSuccess = false;
	let showLoading = false;

	$: name = target.type === 'comp' ? target.data.attributes.name : target.data.username;

	onMount(async () => {
		history.pushState({view: $AppData.activeView, modal: true}, "Report Modal", `?modal=true${window.location.hash}`);
	});

	async function onSubmit(event) {
		const formData = new FormData(event.target);
		const type = formData.get('repType');
		const desc = formData.get('desc');
		const target_type = target.type;
		const target_id = target.data.id;
		const target_name = name;

		try {
			showLoading = true;
			const response = await gqlCreateReport({
				variables: {
					type: type,
					description: desc,
					target_type: target_type,
					target_id: `${target_id}`,
					target_name: target_name,
				}
			});
			showLoading = false;
			showSuccess = true;
			setTimeout(() => close(), 2000);
		} catch(error) {
			showLoading = false;
			errorMessage = error;
			showErrorDisplay = true;
		}
	}

	function handleCancelClick() {
		close();
	}
</script>

<div class="reportContainer">
	{#if showLoading}
		<div class="loadingDiv">
			<LoadingSpinner type="dual-ring" size="medium" color={window.getComputedStyle(document.documentElement).getPropertyValue('--appColorPrimary')} />
		</div>
	{:else}
		<h5>Report {name}</h5>
		<form on:submit|preventDefault={onSubmit}>
			<label for="repType">Report for...</label>
			<select bind:value={reportType} name="repType">
				{#each reportTypes as type}
					<option value={type}>
						{type}
					</option>
				{/each}
			</select>
			<label for="desc">Description (optional):</label>
			<textarea name="desc" rows="4"></textarea>
			{#if showErrorDisplay}
				<div class="errorMessage">
					Submission failed, please close this window and try again.
					<br/>
					<br/>
					{errorMessage}
				</div>
			{:else if showSuccess}
				<div class="successMessage">
					Report submitted successfully!
				</div>
			{:else}
				<div class="submitArea">
					<button type="submit" class="submitButton">Submit</button>
					<button type="button" on:click={handleCancelClick} class="cancelButton">Cancel</button>
				</div>
			{/if}
		</form>
		<div class="detailText">After submission, your report will be reviewed by one of our moderators.</div>
	{/if}
</div>

<style lang="scss">
	.reportContainer {
		padding: 10px;
	}
	.loadingDiv {
		align-items: center;
		display: flex;
		height: 100%;
		justify-content: center;
		width: 100%;
	}
	h5 {
		font-size: 1.5rem;
		margin: 0;
		margin-bottom: 10px;
		padding: 0;
		text-align: center;
	}
	form {
		display: flex;
		flex-direction: column;
		label {
			padding-top: 10px;
			padding-bottom: 3px;
		}
		select {
			border: 1px solid var(--appColorPrimary);
			border-radius: 5px;
			outline: none;
			padding: 3px;
			width: fit-content;
		}
		textarea {
			border: 1px solid var(--appColorPrimary);
			border-radius: 5px;
			outline: none;
			padding: 3px;
		}
		.submitArea {
			display: flex;
			margin-left: auto;
			padding-top: 10px;
			button {
				background-color: var(--appColorPrimary);
				border: 2px solid var(--appColorPrimary);
				border-radius: 5px;
				color: var(--appBGColor);
				cursor: pointer;
				margin: 0px 3px;
				outline: none;
				padding: 5px;
				&.cancelButton {
					background-color: var(--appColorDisabled);
					border-color: var(--appColorDisabled);
				}
			}
		}
		.successMessage {
			color: var(--appColorQuaternary);
			font-weight: bold;
			padding-top: 10px;
			text-align: center;
			user-select: none;
		}
		.errorMessage {
			color: var(--appDelColor);
			font-weight: bold;
			padding-top: 10px;
			text-align: center;
		}
	}
	.detailText {
		padding-top: 10px;
		text-align: center;
	}
</style>
