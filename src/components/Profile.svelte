<script>
	import { onMount } from 'svelte';
	import AppData from '../stores/AppData.js';
	import { validateJWT, getReceivedUpvotes } from '../rest/RESTFunctions.svelte';

	export let isMobile = false;
	let receivedLikes = 0;

	onMount(async () => {
		// check user's JWT before making queries
		const valid = await validateJWT($AppData.user.jwt);
		if(valid) {
			// user is valid, perform query
			receivedLikes = await getReceivedUpvotes($AppData.user.jwt);
		} else {
			$AppData.user.jwt = '';
		}
	});
</script>

<div class="profileContainer">
	<section class="titleArea">
		<h2>{$AppData.user.username}</h2>
	</section>
	<section class="headlineArea">
		<div class="headBox publishedCompsBox">
			<div class="headNumber">{$AppData.user.published_comps.length}</div>
			<div class="headText">Published Comps</div>
		</div>
		<div class="headBox likedCompsBox">
			<div class="headNumber">{$AppData.user.liked_comps.length}</div>
			<div class="headText">Liked Comps</div>
		</div>
		<div class="headBox totalLikesBox">
			<div class="headNumber">{receivedLikes}</div>
			<div class="headText">Received Likes</div>
		</div>
	</section>
</div>

<style lang="scss">
	.profileContainer {
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 100%;
	}
	.titleArea {
		display: flex;
		justify-content: center;
	}
	.headlineArea {
		display: flex;
		flex-direction: column;
		padding: 5px;
		width: 100%;
		.headBox {
			align-items: center;
			background-color: var(--appColorPrimary);
			border: 2px solid var(--appColorSecondary);
			border-radius: 10px;
			color: white;
			display: flex;
			flex-direction: column;
			height: 120px;
			margin: 10px 0px;
			justify-content: center;
			width: 100%;
			.headNumber {
				font-size: 2.0rem;
				font-weight: bold;
			}
			.headText {
				font-size: 1.3rem;
				font-weight: bold;
			}
		}
	}
</style>
