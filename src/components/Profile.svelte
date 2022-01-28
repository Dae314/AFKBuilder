<script>
	import { onMount, createEventDispatcher } from 'svelte';
	import AppData from '../stores/AppData.js';
	import { validateJWT, getReceivedUpvotes } from '../rest/RESTFunctions.svelte';
	import { gql_UPDATE_USER } from '../gql/queries.svelte';
	import { mutation } from "svelte-apollo";
	import AvatarInput from '../shared/AvatarInput.svelte';

	export let isMobile = false;

	const gqlUpdateUser = mutation(gql_UPDATE_USER);
	const dispatch = createEventDispatcher();

	let receivedLikes = '';
	let username = $AppData.user.username;
	let avatar = $AppData.user.avatar;

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

	function handleAvatarChange(event) {
		avatar = event.detail.avatar;
	}

	async function updateUser() {
		if($AppData.user.username !== username || $AppData.user.avatar !== avatar) {
			try {
				const response = await gqlUpdateUser({variables: { id: $AppData.user.id, username: username, avatar: avatar }});
				$AppData.user.username = response.data.updateUsersPermissionsUser.data.attributes.username;
				$AppData.user.avatar = response.data.updateUsersPermissionsUser.data.attributes.avatar;
				dispatch('routeEvent', {action: 'saveData'});
			} catch (error) {
				console.log(error);
			}
		}
	}

	function handleLogout() {
		$AppData.user.avatar = '';
		$AppData.user.username = '';
		$AppData.user.id = '';
		$AppData.user.jwt = '';
		$AppData.user.liked_comps = [];
		$AppData.user.local_comps = [];
		$AppData.user.published_comps = [];
		dispatch('routeEvent', {action: 'saveData'});
		window.location.assign(`${window.location.origin}/#/`);
	}
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
	<section class="settingsArea">
		<h3>Settings</h3>
		<form on:submit|preventDefault="{updateUser}">
			<label for="usernameInput">Input new username:</label>
			<input id="usernameInput" type="text" bind:value={username} />
			<label for="avatarInput">Choose an avatar:</label>
			<div id="avatarInput">
				<AvatarInput avatar={avatar} on:avatarChanged={handleAvatarChange} />
			</div>
			<button method="submit">Save</button>
		</form>
	</section>
	<section class="logoutArea">
		<button type="button" class="logoutButton" on:click={handleLogout}>Logout</button>
	</section>
</div>

<style lang="scss">
	.profileContainer {
		display: flex;
		flex-direction: column;
		height: calc(100vh - var(--headerHeight));
		overflow-y: auto;
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
	.settingsArea {
		border-top: 2px solid black;
		padding: 10px;
		form {
			label {
				display: block;
			}
		}
	}
	.logoutArea {
		border-top: 2px solid black;
		padding: 10px;
	}
	@media only screen and (min-width: 767px) {
		.headlineArea {
			flex-direction: row;
			.headBox {
				margin: 0px 20px;
			}
		}
	}
</style>
