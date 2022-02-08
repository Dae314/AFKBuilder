<script>
	import { onMount, createEventDispatcher } from 'svelte';
	import AppData from '../stores/AppData.js';
	import AvatarInput from '../shared/AvatarInput.svelte';
	import {getAuthorDetails} from '../rest/RESTFunctions.svelte';
	
	export let params = {};
	const dispatch = createEventDispatcher();

	let username = '';
	let user = {};
	let comps = {};

	onMount(async () => {
		username = params.username;
		const response = await getAuthorDetails(username);
		if(response.status !== 200) {
			throw new Error(`ERROR: received ${response.status} when querying for author public profile: ${response.data}`);
		}
		comps = response.data.comps;
		user = response.data.author;

		$AppData.activeView = 'user';
		dispatch('routeEvent', {action: 'saveData'});
	});
</script>

<div class="userContainer">
	<section class="titleArea">
		<div class="userArea">
			<AvatarInput avatar={user.avatar} editable={false} />
			<h3>{user.username}</h3>
		</div>
	</section>
</div>

<style lang="scss">
	.userContainer {
		display: flex;
		flex-direction: column;
		height: calc(100vh - var(--headerHeight));
		overflow-y: auto;
		width: 100%;
	}
</style>
