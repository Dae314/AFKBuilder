<script>
	import AppData from '../stores/AppData.js';
	import LoadingPage from '../shared/LoadingPage.svelte';
	import ErrorDisplay from './ErrorDisplay.svelte';
	import { gql_GET_COMP } from '../gql/queries.svelte';
	import { getCompAuthor } from '../rest/RESTFunctions.svelte';
	import { query } from 'svelte-apollo';

	export let params = {};
	let comp;
	let author;
	let showErrorDisplay = false;
	let errorDisplayConf = {};

	const compQuery = query(gql_GET_COMP, {
		variables: { uuid: params.uuid }
	});

	$: if(!$compQuery.loading) {
		comp = $compQuery.data.comps.data[0];
		loadAuthor();
	}
	$: compQuery.refetch({ uuid: params.uuid });

	function reload() {
		compQuery.refetch({ uuid: params.uuid });
	}

	async function loadAuthor() {
		const response = await getCompAuthor(comp.attributes.uuid);
		if(response.status !== 200) {
			errorDisplayConf = {
				errorCode: response.status,
				headText: 'Something went wrong',
				detailText: response.data,
				showHomeButton: true,
			};
			showErrorDisplay = true;
		} else {
			author = response.data.author;
		}
	}
</script>

{#if $compQuery.loading}
	<LoadingPage />
{:else if $compQuery.error}
	<ErrorDisplay
		errorCode="503"
		headText="Something went wrong"
		detailText="Check the console for details."
		showHomeButton={false}
	/>
	{console.log($compQuery.error.message)}
{:else}
	{#if $compQuery.data.comps.data.length === 0}
		<ErrorDisplay
			errorCode="404"
			headText="We couldn't find that comp"
			detailText="Sorry about that!"
			showHomeButton={false}
		/>
	{:else}
		{#await loadAuthor()}
			<LoadingPage />
		{:then _}
			{#if showErrorDisplay}
				<ErrorDisplay
					errorCode={errorDisplayConf.errorCode}
					headText={errorDisplayConf.headText}
					detailText={errorDisplayConf.detailText}
					showHomeButton={errorDisplayConf.showHomeButton}
				/>
			{:else}
				<div class="compLibDetailContainer">
					{comp.attributes.name}
					{author.username}
				</div>
			{/if}
		{/await}
	{/if}
{/if}

<style lang="scss">
	.compLibDetailContainer {
		height: calc(100vh - var(--headerHeight));
		width: 100%;
	}
</style>
