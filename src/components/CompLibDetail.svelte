<script>
	import AppData from '../stores/AppData.js';
	import LoadingPage from '../shared/LoadingPage.svelte';
	import ErrorDisplay from './ErrorDisplay.svelte';
	import { gql_GET_COMP } from '../gql/queries.svelte';
	import { getCompAuthor } from '../rest/RESTFunctions.svelte';
	import { query } from 'svelte-apollo';
	import JSONURL from 'json-url';

	export let params = {};
	let svrComp;
	let comp;
	let author;
	let showErrorDisplay = false;
	let errorDisplayConf = {};
	const jsurl = JSONURL('lzma'); // json-url compressor

	const compQuery = query(gql_GET_COMP, {
		variables: { uuid: params.uuid }
	});

	$: if(!$compQuery.loading) {
		svrComp = $compQuery.data.comps.data[0];
		populateAuthor();
	}
	$: compQuery.refetch({ uuid: params.uuid });

	function reload() {
		compQuery.refetch({ uuid: params.uuid });
	}

	async function populateAuthor() {
		const response = await getCompAuthor(svrComp.attributes.uuid);
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

	async function unpackComp(comp_string) {
		// unpack and decompress data
		let data;
		try {
			const json = await jsurl.decompress(comp_string);
			data = JSON.parse(json);
		} catch(err) {
			errorDisplayConf = {
				errorCode: 400,
				headText: 'Unable to process comp',
				detailText: 'See console for details',
				showHomeButton: false,
			};
			console.log(err);
			showErrorDisplay = true;
			return;
		}

		// run consistency checks on data
		const returnObj = await validateComp(data);
		if(returnObj.retCode !== 0) {
			// validation error occurred
			errorDisplayConf = {
				errorCode: 400,
				headText: 'Unable to process comp',
				detailText: `${returnObj.message}`,
				showHomeButton: false,
			};
			showErrorDisplay = true;
		} else {
			// validation successful, import the comp
			comp = returnObj.message;
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
		{#await Promise.all([populateAuthor(), unpackComp(svrComp.comp_string)])}
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
					{svrComp.attributes.name}
					{author.username}
					{comp.heroes}
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
