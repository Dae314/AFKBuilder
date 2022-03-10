<script>
	export let target = {};
	
	const reportTypes = [
		'Copyright Violation',
		'Harassment',
		'Hate',
		'Impersonation',
		'Misinformation',
		'Self-harm or Suicide',
		'Sexual Content',
		'Sharing Personal Information',
		'Spam',
		'Threatening/Violence',
	];
	let reportType = reportTypes[8];

	$: name = target.type === 'comp' ? target.data.attributes.name : target.data.attributes.username;

	async function onSubmit(event) {
		const formData = new FormData(event.target);
		const type = formData.get('repType');
		const desc = formData.get('desc');
		const target_type = target.type;
		const target_id = target.data.id;
		const target_name = name;

		console.log(type)
		console.log(desc)
		console.log(target_type)
		console.log(target_id)
		console.log(target_name)
	}

	function handleCancelClick() {

	}
</script>

<div class="reportContainer">
	<h5>Report {name}</h5>
	<form on:submit|preventDefault={onSubmit}>
		<label for="repType">Type of violation</label>
		<select bind:value={reportType} name="repType">
			{#each reportTypes as type}
				<option value={type}>
					{type}
				</option>
			{/each}
		</select>
		<label for="desc">Description (optional):</label>
		<textarea name="desc" rows="4"></textarea>
		<div class="submitArea">
			<button type="submit">Submit</button>
			<button type="button" on:click={handleCancelClick}>Cancel</button>
		</div>
	</form>
	<div class="detailText">After submission, the report will be reviewed by one of our moderators.</div>
</div>

<style lang="scss">
	.reportContainer {
		padding: 10px;
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
		}
		.submitArea {
			display: flex;
			margin-left: auto;
			padding-top: 10px;
		}
	}
	.detailText {
		padding-top: 10px;
		text-align: center;
	}
</style>
