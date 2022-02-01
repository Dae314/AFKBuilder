<script>
	import { onMount, createEventDispatcher, tick, getContext } from 'svelte';
	import AppData from '../stores/AppData.js';
	import { validateJWT, getReceivedUpvotes } from '../rest/RESTFunctions.svelte';
	import { gql_UPDATE_USERNAME, gql_UPDATE_AVATAR } from '../gql/queries.svelte';
	import { mutation } from "svelte-apollo";
	import AvatarInput from '../shared/AvatarInput.svelte';
	import Confirm from '../modals/Confirm.svelte';

	export let isMobile = false;

	const gqlUpdateUsername = mutation(gql_UPDATE_USERNAME);
	const gqlUpdateAvatar = mutation(gql_UPDATE_AVATAR);
	const dispatch = createEventDispatcher();
	const { open } = getContext('simple-modal');

	let receivedLikes = '';
	let username = $AppData.user.username;
	let avatar = $AppData.user.avatar;
	let editUsernameDisabled = true;

	onMount(async () => {
		// check user's JWT before making queries
		const valid = await validateJWT($AppData.user.jwt);
		if(valid) {
			// user is valid, perform query
			receivedLikes = await getReceivedUpvotes($AppData.user.jwt);
		} else {
			$AppData.user.jwt = '';
		}
		$AppData.activeView = 'profile';
		dispatch('routeEvent', {action: 'saveData'});
	});

	async function handleUsernameEditClick() {
		editUsernameDisabled = false;
		await tick();
		document.getElementById('usernameInput').focus();
	}

	async function handleUsernameBlur() {
		editUsernameDisabled = true;
		if($AppData.user.username !== username) {
			try {
				const response = await gqlUpdateUsername({variables: { id: $AppData.user.id, username: username }});
				$AppData.user.username = response.data.updateUsersPermissionsUser.data.attributes.username;
				dispatch('routeEvent', {action: 'saveData'});
			} catch (error) {
				console.log(error);
			}
		}
	}

	function handleUsernameKeyup(event) {
		if (event.keyCode === 13) {
			editUsernameDisabled = true; // save will be handled by blur function
		}
	}

	async function handleAvatarChange(event) {
		avatar = event.detail.avatar;
		if($AppData.user.avatar !== avatar) {
			try {
				const response = await gqlUpdateAvatar({variables: { id: $AppData.user.id, avatar: avatar }});
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

	function handleLogoutClick() {
		open(Confirm,
			{onConfirm: handleLogout, message: "Are you sure you want to logout?"},
			{ closeButton: false,
				closeOnEsc: true,
				closeOnOuterClick: true,
				styleWindow: { width: 'fit-content', },
				styleContent: { width: 'fit-content', },
			});
	}
</script>

<div class="profileContainer">
	<section class="titleArea">
		<div class="usernameInputArea" on:click={handleUsernameEditClick} >
			<input id="usernameInput"
				type="text"
				minlength="3"
				maxlength="20"
				bind:value={username}
				disabled={editUsernameDisabled}
				on:blur={handleUsernameBlur}
				on:keyup={handleUsernameKeyup} />
			<span class="usernameEdit">
				<button class="usernameEditButton" on:click={handleUsernameEditClick}>
					<img src="./img/utility/pencil.png" alt="edit username">
				</button>
			</span>
		</div>
		<div class="avatarInputArea">
			<AvatarInput avatar={avatar} on:avatarChanged={handleAvatarChange} />
		</div>
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
	<section class="logoutArea">
		<button type="button" class="logoutButton" on:click={handleLogoutClick}>Logout</button>
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
		align-items: center;
		display: flex;
		flex-direction: column;
		justify-content: center;
		.usernameInputArea {
			padding: 10px;
			position: relative;
			input {
				background: transparent;
				border: none;
				border-bottom: 3px solid var(--appColorPrimary);
				margin-bottom: 5px;
				outline: none;
				&:disabled {
					border-bottom: 3px solid var(--appColorPriOpaque);
				}
				&:invalid {
					border-bottom: 3px solid var(--appDelColorOpaque);
				}
			}
		}
		.usernameEdit {
			display: inline-block;
			position: absolute;
			right: -35px;
			.usernameEditButton {
				border: none;
				background: transparent;
				outline: none;
				img {
					max-width: 29px;
					filter: invert(1);
					opacity: 0.7;
				}
			}
		}
		#usernameInput {
			font-size: 1.5rem;
			font-weight: bold;
			height: fit-content;
			text-align: center;
			width: 275px;
		}
		.avatarInputArea {
			margin-bottom: 10px;
		}
	}
	.headlineArea {
		align-items: center;
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
			max-width: 300px;
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
	.logoutArea {
		border-top: 1px solid black;
		margin-top: auto;
		padding: 15px;
		.logoutButton {
			background-color: transparent;
			border: 3px solid var(--appDelColor);
			border-radius: 10px;
			color: var(--appDelColor);
			cursor: pointer;
			font-size: 1rem;
			font-weight: bold;
			outline: none;
			padding: 10px;
			transition: all 0.2s;
			&:hover {
				background-color: var(--appDelColor);
				color: white;
			}
		}
	}
	@media only screen and (min-width: 767px) {
		.titleArea {
			.usernameInputArea {
				&:hover > .usernameEdit {
					opacity: 1;
					visibility: visible;
				}
			}
			.usernameEdit {
				opacity: 0;
				transition: all 0.1s;
				visibility: hidden;
			}
		}
		.headlineArea {
			flex-direction: row;
			justify-content: center;
			.headBox {
				margin: 0px 20px;
			}
		}
	}
</style>
