<script>
	import AppData from '../stores/AppData.js';
	import LoadingPage from '../shared/LoadingPage.svelte';
	import { gql_GET_COMP } from '../gql/queries.svelte';
	import { validateJWT } from '../rest/RESTFunctions.svelte';
	import { query } from 'svelte-apollo';

	export let params = {};
	let comp = {};

	let compResult;

	async function loadComp() {
		const valid = await validateJWT($AppData.user.jwt);
		if(valid) {
			compResult = query(gql_GET_COMP, {
				variables: { uuid: params.uuid }
			});
			console.log($compResult);
		}
	}

	
</script>

{#await loadComp()}
	<LoadingPage />
{:then _}
	<div class="compLibDetailContainer">
		blarg
	</div>
{/await}

<style lang="scss">
	
</style>
