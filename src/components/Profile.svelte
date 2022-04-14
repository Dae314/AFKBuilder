<script>
	import { onMount, createEventDispatcher, tick, getContext } from 'svelte';
	import AppData from '../stores/AppData.js';
	import { validateJWT, getReceivedUpvotes, deleteUser } from '../rest/RESTFunctions.svelte';
	import { gql_UPDATE_USERNAME, gql_UPDATE_AVATAR } from '../gql/queries.svelte';
	import { mutation } from "svelte-apollo";
	import AvatarInput from '../shared/AvatarInput.svelte';
	import LoadingPage from '../shared/LoadingPage.svelte';
	import ErrorDisplay from '../components/ErrorDisplay.svelte';
	import Confirm from '../modals/Confirm.svelte';

	const gqlUpdateUsername = mutation(gql_UPDATE_USERNAME);
	const gqlUpdateAvatar = mutation(gql_UPDATE_AVATAR);
	const dispatch = createEventDispatcher();
	const { open } = getContext('simple-modal');

	let receivedLikes = '';
	let username = $AppData.user.username;
	let avatar = $AppData.user.avatar;
	let editUsernameDisabled = true;
	const usernameError = {state: false, text: ''};
	let showErrorDisplay = false;
	let errorDisplayConf = {};
	let showUsernameSuccess = false;
	let showAvatarSuccess = false;

	onMount(async () => {
		$AppData.activeView = 'profile';
		dispatch('routeEvent', {action: 'saveData'});
	});

	async function handleUsernameEditClick() {
		editUsernameDisabled = false;
		await tick();
		document.getElementById('usernameInput').focus();
	}

	async function populateReceivedUpvotes() {
		// check user's JWT before making queries
		const valid = await validateJWT($AppData.user.jwt);
		if(valid) {
			// user is valid, perform query
			const response = await getReceivedUpvotes($AppData.user.jwt);
			if(response.status !== 200) {
				errorDisplayConf = {
					errorCode: response.status,
					headText: 'Something went wrong',
					detailText: response.data,
					showHomeButton: true,
				};
				showErrorDisplay = true;
			} else {
				receivedLikes = response.data;
			}
		} else {
			dispatch('routeEvent', {action: 'logout'});
		}
	}

	async function handleUsernameBlur() {
		editUsernameDisabled = true;
		usernameError.state = false;
		usernameError.text = '';
		if($AppData.user.username !== username) {
			try {
				// check user's JWT before making queries
				dispatch('routeEvent', {action: 'showNotice', data: { noticeConf: {type: 'loading'}}});
				const valid = await validateJWT($AppData.user.jwt);
				if(valid) {
					const response = await gqlUpdateUsername({variables: { id: $AppData.user.id, username: username }});
					$AppData.user.username = response.data.updateUsersPermissionsUser.data.attributes.username;
					dispatch('routeEvent', {action: 'clearNotice'});
					showUsernameSuccess = true;
					setTimeout(() => showUsernameSuccess = false, 1000);
					dispatch('routeEvent', {action: 'saveData'});
				} else {
					dispatch('routeEvent', {action: 'clearNotice'});
					dispatch('routeEvent', {action: 'logout'});;
				}
			} catch (error) {
				dispatch('routeEvent', {action: 'clearNotice'});
				switch(error.graphQLErrors[0].extensions.code) {
					case 'BAD_USER_INPUT':
					case 'FORBIDDEN':
					case 'STRAPI_APPLICATION_ERROR':
						usernameError.state = true;
						usernameError.text = error.graphQLErrors[0].message;
						break;
					default:
						// an unexpected error occurred
						errorDisplayConf = {
							errorCode: 500,
							headText: 'Something went wrong',
							detailText: error.graphQLErrors[0].message,
							showHomeButton: false,
						};
						showErrorDisplay = true;
				}
				console.log(error.graphQLErrors[0]);
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
				// check user's JWT before making queries
				dispatch('routeEvent', {action: 'showNotice', data: { noticeConf: {type: 'loading'}}});
				const valid = await validateJWT($AppData.user.jwt);
				if(valid) {
					const response = await gqlUpdateAvatar({variables: { id: $AppData.user.id, avatar: avatar }});
					$AppData.user.avatar = response.data.updateUsersPermissionsUser.data.attributes.avatar;
					dispatch('routeEvent', {action: 'clearNotice'});
					showAvatarSuccess = true;
					setTimeout(() => showAvatarSuccess = false, 1000);
					dispatch('routeEvent', {action: 'saveData'});
				} else {
					dispatch('routeEvent', {action: 'clearNotice'});
					dispatch('routeEvent', {action: 'logout'});;
				}
			} catch (error) {
				dispatch('routeEvent', {action: 'clearNotice'});
				errorDisplayConf = {
					errorCode: 500,
					headText: 'Something went wrong',
					detailText: error.graphQLErrors[0].message,
					showHomeButton: false,
				};
				showErrorDisplay = true;
			}
		}
	}

	function handleLogout() {
		dispatch('routeEvent', {action: 'logout'});
	}

	function handleLogoutClick() {
		open(Confirm,
			{onConfirm: handleLogout, message: "Are you sure you want to logout?"},
			{ closeButton: false,
				closeOnEsc: true,
				closeOnOuterClick: true,
				styleWindow: { width: 'fit-content' },
				styleContent: { width: 'fit-content', background: '#F0F0F2', borderRadius: '10px' },
			});
	}

	function handleDeleteUserClick() {
		open(Confirm,
			{onConfirm: handleDeleteUser, message: "Are you sure you want to permanently delete your account?<br/><br/>This action cannot be undone. Your published comps will remain published but will be owned by an anonymous user, and you will no longer be able to update them.<br/><br/>If you do not want your comps to be available, please unpublish your comps before you delete your account."},
			{ closeButton: false,
				closeOnEsc: true,
				closeOnOuterClick: true,
				styleWindow: { width: 'fit-content' },
				styleContent: { width: 'fit-content', background: '#F0F0F2', borderRadius: '10px' },
			});
	}

	async function handleDeleteUser() {
		// check user's JWT before making queries
		const valid = await validateJWT($AppData.user.jwt);
		if(valid) {
			// user is valid, attempt delete
			const response = await deleteUser($AppData.user.jwt, $AppData.user.id);
			if(response.status !== 200) {
				errorDisplayConf = {
					errorCode: response.status,
					headText: 'Something went wrong',
					detailText: response.data,
					showHomeButton: true,
				};
				showErrorDisplay = true;
			} else {
				dispatch('routeEvent', {action: 'logout'});
			}
		} else {
			dispatch('routeEvent', {action: 'logout'});
		}
	}

	function handlePublicProfileButtonClick() {
		// note: clears all extraneous URL parameters
		window.location.assign(`${window.location.origin}/#/users/${encodeURIComponent($AppData.user.username)}`);
	}

	function handleFavoriteCompsClick() {
		// navigate to comps
		// note: clears all extraneous URL parameters
		window.location.assign(`${window.location.origin}/#/comps`);
	}
</script>

{#await populateReceivedUpvotes()}
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
		<div class="profileContainer">
			{#if $AppData.user.jwt}
				<section class="titleArea">
					<div class="usernameInputArea" on:click={handleUsernameEditClick} >
						<input id="usernameInput"
							type="text"
							minlength="3"
							maxlength="20"
							class:error={usernameError.state}
							class:success={showUsernameSuccess}
							bind:value={username}
							disabled={editUsernameDisabled}
							on:blur={handleUsernameBlur}
							on:keyup={handleUsernameKeyup} />
						<span class="usernameEdit">
							<button class="usernameEditButton" on:click={handleUsernameEditClick}>
								<img src="./img/utility/pencil_white.png" alt="edit username">
							</button>
						</span>
						<div class="usernameErrorText" class:visible={usernameError.state}><span>{usernameError.text}</span></div>
					</div>
					<div class="avatarInputArea">
						<AvatarInput
							success={showAvatarSuccess}
							avatar={avatar}
							on:avatarChanged={handleAvatarChange}
						/>
					</div>
				</section>
				<section class="headlineArea">
					<div class="headBox publishedCompsBox">
						<button type="button" class="headButton" on:click={handlePublicProfileButtonClick}>
							<div class="headNumber">{$AppData.user.published_comps.length}</div>
							<div class="headText">Published Comps</div>
						</button>
					</div>
					<div class="headBox favoriteCompsBox">
						<button type="button" class="headButton" on:click={handleFavoriteCompsClick}>
							<div class="headNumber">{$AppData.user.saved_comps.length}</div>
							<div class="headText">Favorite Comps</div>
						</button>
					</div>
					<div class="headBox totalLikesBox">
						<div class="headNumber">{receivedLikes}</div>
						<div class="headText">Received Likes</div>
					</div>
				</section>
				<section class="logoutArea">
					<button type="button" class="logoutButton" on:click={handleLogoutClick}>Logout</button>
					<button type="button" class="logoutButton deleteButton" on:click={handleDeleteUserClick}>Delete Account</button>
				</section>
			{:else}
				<div class="noLoginContainer">
					<h3 class="noLogin">Login to view your profile</h3>
				</div>
			{/if}
		</div>
	{/if}
{/await}

<style lang="scss">
	.noLoginContainer {
		height: 100%;
		text-align: center;
		width: 100%;
		.noLogin {
			color: rgba(0, 0, 0, 0.6);
			font-size: 2.5rem;
		}
	}
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
				transition: border 0.2s;
				&:disabled {
					border-bottom: 3px solid var(--appColorPriOpaque);
				}
				&.success {
					border-bottom: 3px solid var(--appColorQuaternary);
				}
				&.error {
					border-bottom: 3px solid var(--appDelColorOpaque);
				}
			}
			.usernameErrorText {
				color: var(--appDelColor);
				display: none;
				font-size: 0.7rem;
				max-width: 270px;
				text-align: center;
				&.visible {
					display: block;
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
				cursor: pointer;
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
			background-color: var(--appBGColor);
			border: none;
			border-radius: 10px;
			box-shadow: var(--neu-med-i-BGColor-shadow);
			display: flex;
			flex-direction: column;
			height: 120px;
			margin: 10px 0px;
			max-width: 300px;
			justify-content: center;
			user-select: none;
			width: 100%;
			.headButton {
				background-color: transparent;
				border: none;
				color: var(--appColorPrimary);
				cursor: pointer;
				height: 100%;
				outline: none;
				width: 100%;
			}
			.headNumber {
				font-size: 2.0rem;
				font-weight: bold;
				height: 37px;
			}
			.headText {
				font-size: 1.3rem;
				font-weight: bold;
			}
		}
	}
	.logoutArea {
		border-top: 1px solid black;
		display: flex;
		margin-top: auto;
		padding: 15px;
		.logoutButton {
			background-color: var(--appBGColor);
			border: none;
			border-radius: 10px;
			box-shadow: var(--neu-sm-i-BGColor-shadow);
			color: var(--appDelColor);
			cursor: pointer;
			font-size: 1rem;
			font-weight: bold;
			outline: none;
			padding: 10px;
			transition: all 0.2s;
			&.deleteButton {
				margin-left: auto;
			}
		}
	}
	@media only screen and (min-width: 767px) {
		.profileContainer {
			height: 100vh;
		}
		.titleArea {
			margin-top: 10%;
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
				.headButton {
					&:hover {
						background: var(--neu-convex-BGColor-bg);
					}
				}
			}
		}
		.logoutArea {
			.logoutButton {
				&:hover {
					background: var(--neu-convex-BGColor-bg);
				}
			}
		}
	}
</style>
