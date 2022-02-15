<script>
	import AppData from '../stores/AppData.js';
	import LoadingPage from '../shared/LoadingPage.svelte';
	import { gql_GET_COMP } from '../gql/queries.svelte';
	import { getCompAuthor } from '../rest/RESTFunctions.svelte';
	import { query } from 'svelte-apollo';

	export let params = {};
	let comp;
	let author;

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
			throw new Error(`ERROR: received ${response.status} when retrieving comp's author: ${response.data}`);
		} else {
			author = response.data.author;
		}
	}
</script>

{#if $compQuery.loading}
	<LoadingPage />
{:else if $compQuery.error}
	<div class="compLibDetailContainer compDetailError">
		<div class="header">
			<h3>503</h3>
			<div class="headText">Something went wrong</div>
		</div>
		<div class="divider"></div>
		<div class="navigation">
			<div class="detailText">Check the console for details.</div>
		</div>
	</div>
	{console.log($compQuery.error.message)}
{:else}
	{#if $compQuery.data.comps.data.length === 0}
		<div class="compLibDetailContainer compDetailError">
			<div class="header">
				<h3>404</h3>
				<div class="headText">We couldn't find that</div>
			</div>
			<div class="divider"></div>
			<div class="navigation">
				<div class="detailText">Sorry about that!</div>
			</div>
		</div>
	{:else}
		{#await loadAuthor()}
			<LoadingPage />
		{:then _}
			<div class="compLibDetailContainer">
				{comp.attributes.name}
				{author.username}
			</div>
		{/await}
	{/if}
{/if}

<style lang="scss">
	.compLibDetailContainer {
		height: calc(100vh - var(--headerHeight));
		width: 100%;
		&.compDetailError {
			align-items: center;
			display: flex;
			justify-content: center;
			position: relative;
			.header {
				position: relative;
				height: 150px;
				left: -42px;
				text-align: right;
				h3 {
					color: var(--appBGColor);
					font-size: 5rem;
					margin: 0;
					padding: 0;
					text-shadow: 4px 5px 0px rgba(0, 0, 0, 0.8);
				}
				.headText {
					margin-top: -3px;
				}
			}
			.divider {
				background-color: var(--appDelColor);
				height: 250px;
				position: absolute;
				left: 50%;
				top: 50%;
				transform: translate(-50%, -50%);
				width: 10px;
			}
			.navigation {
				align-items: flex-start;
				display: flex;
				flex-direction: column;
				position: relative;
				height: 150px;
				justify-content: center;
				left: 11px;
				.detailText {
					font-size: 1.0rem;
				}
			}
		}
	}
</style>
