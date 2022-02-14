<script>
	import { createEventDispatcher } from 'svelte';
	import AppData from '../stores/AppData.js';
	import {querystring} from 'svelte-spa-router';
	import LoadingPage from '../shared/LoadingPage.svelte';
	import { postLoginProvider, validateJWT } from '../rest/RESTFunctions.svelte';

	export let params = {};

	const dispatch = createEventDispatcher();

	async function processPostLogin() {
		const provider = params.provider;
		const urlParams = new URLSearchParams($querystring);
		const token = urlParams.get('access_token');
		const response = await postLoginProvider(token, provider);
		if(response.status !== 200) {
			throw new Error(response.data.message);
		} else {
			const jwt = response.data.jwt;
			const valid = await validateJWT(jwt);
			if(valid) { // login successful, populate user data
				$AppData.user.jwt = jwt;
				dispatch('routeEvent', {action: 'populateUserData'});
				dispatch('routeEvent', {action: 'saveData'});
			} else {
				throw new Error(`Login did not complete successfully, please try again.`);
			}
			setTimeout(() => window.location.assign(`${window.location.origin}/#/`), 2000);
		}
	}
</script>

{#await processPostLogin()}
	<LoadingPage />
{:then _}
	<div class="postLoginContainer">
		<h2 class="success">Login successful! You will be redirected shortly...</h2>
	</div>
{:catch error}
	<div class="postLoginContainer">
		<h2 class="error">{error.message}</h2>
	</div>
{/await}


<style lang="scss">
	.postLoginContainer {
		display: flex;
		flex-direction: column;
		height: calc(100vh - var(--headerHeight));
		overflow-y: auto;
		padding: 10px;
		width: 100%;
	}
	.error {
		color: var(--appDelColor);
	}
</style>
