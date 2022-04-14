<script>
	import { createEventDispatcher } from 'svelte';
	import AppData from '../stores/AppData.js';
	import {querystring} from 'svelte-spa-router';
	import LoadingPage from '../shared/LoadingPage.svelte';
	import ErrorDisplay from '../components/ErrorDisplay.svelte';
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
			} else {
				throw new Error(`Login did not complete successfully, please try again.`);
			}
			setTimeout(() => window.location.assign(`${window.location.origin}/#/profile`), 2000);
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
	<ErrorDisplay
		errorCode="500"
		headText="Something went wrong"
		detailText="{error.message}"
		showHomeButton={true}
	/>
{/await}


<style lang="scss">
	.postLoginContainer {
		display: flex;
		flex-direction: column;
		height: 100%;
		height: calc(var(--vh, 1vh) * 100 - var(--headerHeight)); /* gymnastics to set height for mobile browsers */
		overflow-y: auto;
		padding: 10px;
		width: 100%;
		h2 {
			margin-top: 100px;
			text-align: center;
		}
	}
	@media only screen and (min-width: 767px) {
		.postLoginContainer {
			height: 100vh;
			h2 {
				margin-top: 10px;
			}
		}
	}
</style>
