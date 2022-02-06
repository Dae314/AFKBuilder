<script>
	import { onMount, createEventDispatcher } from 'svelte';
	import AppData from '../stores/AppData.js';
	import {querystring} from 'svelte-spa-router';
	import {
		postLoginProvider,
		validateJWT,
		getUserDetails,
		getLikedComps,
		getDislikedComps,
		getPublishedComps,
		getSavedComps,
	} from '../rest/RESTFunctions.svelte';

	export let params = {};

	const dispatch = createEventDispatcher();

	let provider = '';

	onMount(async () => {
		provider = params.provider;
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

				const user = await getUserDetails($AppData.user.jwt);
				$AppData.user.id = user.id;
				$AppData.user.username = user.username;
				$AppData.user.local_comps = user.local_comps;
				$AppData.user.avatar = user.avatar;
				
				const likedComps = await getLikedComps($AppData.user.jwt);
				$AppData.user.liked_comps = likedComps;

				const dislikedComps = await getDislikedComps($AppData.user.jwt);
				$AppData.user.disliked_comps = dislikedComps;

				const publishedComps = await getPublishedComps($AppData.user.jwt);
				$AppData.user.published_comps = publishedComps;

				const savedComps = await getSavedComps($AppData.user.jwt);
				$AppData.user.saved_comps = savedComps;

				dispatch('routeEvent', {action: 'saveData'});
			} else {
				throw new Error(`Login invalid, please try again.`);
			}
			setTimeout(() => window.location.assign(`${window.location.origin}/#/`), 3000);
		}
	});
</script>

<div class="postLoginContainer">
	<h2>PostLogin page for {provider}, you will be redirected shortly...</h2>
</div>

<style lang="scss">
	.postLoginContainer {
		display: flex;
		flex-direction: column;
		height: calc(100vh - var(--headerHeight));
		overflow-y: auto;
		width: 100%;
	}
</style>
