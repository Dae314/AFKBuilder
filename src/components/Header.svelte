<script>
	import { onMount, createEventDispatcher, getContext } from 'svelte';
	import ModalCloseButton from '../modals/ModalCloseButton.svelte';
	import ChooseLogin from '../modals/ChooseLogin.svelte';
	import AppData from '../stores/AppData.js';
	import HeroData from '../stores/HeroData.js';

	export let menu = [];
	const dispatch = createEventDispatcher();
	let showMobileMenu = false;
	let expandMenu = false;
	const { open } = getContext('simple-modal');
	let userAvatar = '';
	let userAvatarName = '';

	$: if($AppData.user.avatar) userAvatar = $HeroData.find(e => e.id === $AppData.user.avatar).portrait;
	$: if($AppData.user.avatar) userAvatarName = $HeroData.find(e => e.id === $AppData.user.avatar).name;

	onMount(async () => {
		const mediaListener = window.matchMedia("(max-width: 767px)");
		mediaListener.addEventListener('change', mediaQueryHandler);
	});

	function handleMenuChange(item) {
		// navigate to the correct route
		// note: clears all extraneous URL parameters
		window.location.assign(`${window.location.origin}/#/${item}`);
		dispatch('routeEvent', {action: 'saveData'});
		showMobileMenu = false;
	}

	function handleMobileIconClick() {
		showMobileMenu = !showMobileMenu;
	}

	function handleExpandButtonClick() {
		expandMenu = !expandMenu;
	}

	function mediaQueryHandler(e) {
		// Reset mobile state
		if(!e.matches) {
			showMobileMenu = false;
		}
	}

	function handleUserClick() {
		// navigate to the user's profile
		// note: clears all extraneous URL parameters
		window.location.assign(`${window.location.origin}/#/profile`);
		dispatch('routeEvent', {action: 'saveData'});
		showMobileMenu = false;
	}

	function handleLoginClick() {
		open(ChooseLogin, {}, { closeButton: ModalCloseButton, });
	}
</script>

<nav class:minimized={!expandMenu}>
	<div class="inner">
		<button class="mobileButton" on:click={() => handleMobileIconClick()}>
			<div class="mobile-icon {showMobileMenu ? 'active' : ''}">
				<div class="middle-line"></div>
			</div>
		</button>
		<button class="expandButton" on:click={handleExpandButtonClick}>
			<i class="arrow" class:right={!expandMenu} class:left={expandMenu}></i>
		</button>
		<ul class="navbar-list {showMobileMenu ? 'mobile' : ''}">
			<li class="logoContainer" on:click={() => handleMenuChange(menu[0].name.toLowerCase().replace(/\s/g, ''))}>
				<button type="button" class="logo"><img src="./img/app/afkbuilder_logo.png" alt="AFKBuilder"></button>
			</li>
			{#each menu as item}
				<li on:click={() => handleMenuChange(item.name.toLowerCase().replace(/\s/g, ''))}>
					<button type="button" class:selected={$AppData.activeView === item.name.toLowerCase().replace(/\s/g, '')}>
						{#if item.icon}<img class="menuIcon" src={item.icon} alt={item.name}>{/if}
						<span>{item.name}</span>
					</button>
				</li>
			{/each}
			{#if $AppData.user.jwt}
				<li class="mobileUserItem" on:click={handleUserClick}>
					<button type="button" class:selected={$AppData.activeView === 'profile'}>{$AppData.user.username || 'Profile'}</button>
				</li>
			{:else}
				<li class="mobileUserItem" on:click={handleLoginClick}>
					<button type="button" class="userButton">Login</button>
				</li>
			{/if}
			<li class="discordArea">
				<button class="discordButton" on:click={() => window.open('https://discord.com/invite/sjxgnmkvSf', '_blank')}>
					<img src="./img/app/discord-logo-white.png" alt="Discord"><span>Join the Discord!</span>
				</button>
			</li>
		</ul>
		{#if $AppData.user.jwt}
			<div class="desktopUserItem" on:click={handleUserClick}>
				<button type="button" class:selected={$AppData.activeView === 'profile'} class="desktopUserButton">
					<img class="desktopUserAvatar" src={userAvatar} alt={userAvatarName}>
					<span>{$AppData.user.username || 'Profile'}</span>
				</button>
			</div>
		{:else}
			<div class="desktopUserItem" on:click={handleLoginClick}>
				<button type="button" class="desktopUserButton">
					<img class="desktopUserAvatar" src="./img/portraits/unavailable.png" alt="Login">
					<span>Login</span>
				</button>
			</div>
		{/if}
	</div>
</nav>

<style lang="scss">
	nav {
		background-color: var(--appColorTertiary);
		font-family: "Helvetica Neue", "Helvetica", "Arial", sans-serif;
		height: var(--headerHeight);
		min-height: var(--headerHeight);
		padding: 5px;
		position: fixed;
		top: 0;
		width: 100%;
		z-index: 10;
	}
	.inner {
		align-items: center;
		box-sizing: border-box;
		display: flex;
		height: 100%;
		padding-left: 20px;
		padding-right: 20px;
	}
	.logoContainer {
		display: none;
		visibility: hidden;
	}
	.mobileButton {
		background: transparent;
		border: none;
		cursor: pointer;
		margin: 0;
		outline: none;
		padding: 0;
		.mobile-icon {
			height: 35px;
			position: relative;
			width: 35px;
			&:after {
				background-color: var(--appBGColor);
				content: "";
				height: 3px;
				left: 0px;
				position: absolute;
				transform-origin: center;
				transition: all 0.4s;
				width: 100%;
				bottom: 7px;
				width: 33%;
			}
			&:before {
				background-color: var(--appBGColor);
				content: "";
				height: 3px;
				left: 0px;
				position: absolute;
				transform-origin: center;
				transition: all 0.4s;
				width: 100%;
				top: 7px;
				width: 66%;
			}
			&:hover {
				&:before {
					width: 100%;
				}
				&:after {
					width: 100%;
				}
			}
			.middle-line {
				background-color: var(--appBGColor);
				content: "";
				height: 3px;
				position: absolute;
				transform-origin: center;
				transition: all 0.4s;
				width: 100%;
				top: 7px;
				bottom: 7px;
				margin: auto;
			}
		}
		.mobile-icon.active {
			&:before {
				width: 100%;
				top: 50%;
				transform: rotate(-45deg);
			}
			&:after {
				width: 100%;
				top: 50%;
				transform: rotate(-45deg);
			}
			.middle-line {
				width: 100%;
				transform: rotate(45deg);
			}
		}
	}
	.expandButton {
		display: none;
	}
	.navbar-list {
		display: none;
		justify-content: space-between;
		margin: 0;
		padding-left: 10px;
		padding-top: 10px;
		width: 100%;
		li {
			cursor: pointer;
			list-style-type: none;
			padding-bottom: 15px;
			padding-top: 15px;
			position: relative;
			&:before {
				background-color: #424245;
				bottom: 0;
				content: "";
				height: 1px;
				left: 0;
				position: absolute;
				width: 100%;
			}
			&:hover {
				button {
					color: rgba(240, 240, 242, 1.0);
					.menuIcon {
						opacity: 1;
					}
				}
			}
		}
		button {
			align-items: center;
			background: none;
			border: none;
			color: rgba(240, 240, 242, 0.7);
			cursor: pointer;
			display: flex;
			font-size: 20px;
			margin-left: 20px;
			padding: 4px 10px;
			text-align: center;
			text-decoration: none;
			transition: all 0.1s;
			.menuIcon {
				max-width: 25px;
				margin-right: 10px;
				opacity: 0.7;
				transition: all 0.1s;
			}
			&:focus {
				outline: 0;
				.menuIcon {
					opacity: 1;
				}
			}
		}
		button.selected {
			color: rgba(240, 240, 242, 1.0);
			.menuIcon {
				opacity: 1;
			}
		}
		.mobileUserItem {
			align-items: center;
			display: flex;
		}
		.discordArea {
			align-items: center;
			display: flex;
			font-size: 20px;
			padding: 0;
			.discordButton {
				align-items: center;
				color: rgba(240, 240, 242, 0.7);
				display: flex;
				height: 100%;
				margin: 0;
				padding: 15px 0px;
				text-decoration: none;
				width: 100%;
				img {
					margin-left: 31px;
					max-width: 30px;
					opacity: 0.7;
					transition: all 0.1s;
				}
				span {
					margin-left: 10px;
				}
				&:hover {
					.discordButton {
						color: rgba(240, 240, 242, 1.0);
					}
					img {
						opacity: 1.0;
					}
				}
			}
		}
	}
	.navbar-list.mobile {
		background-color: rgba(0, 0, 0, 0.9);
		bottom: 0;
		display: block;
		height: calc(100% - var(--headerHeight));
		left: 0;
		position: fixed;
	}
	.desktopUserItem {
		cursor: pointer;
		display: none;
		height: 100%;
		margin-left: auto;
		button {
			background: none;
			border: none;
			color: rgba(240, 240, 242, 0.7);
			cursor: pointer;
			display: block;
			font-size: 20px;
			padding: 4px 10px;
			text-align: center;
			text-decoration: none;
			&:focus {
				outline: 0;
			}
			&.selected {
				color: rgba(240, 240, 242, 1.0);
			}
		}
		&:hover {
			button {
				color: rgba(240, 240, 242, 1.0);
			}
		}
	}
	@media only screen and (min-width: 767px) {
		.mobileButton {
			display: none;
		}
		.expandButton {
			align-items: center;
			background-color: transparent;
			border: none;
			cursor: pointer;
			display: flex;
			height: 25px;
			justify-content: center;
			margin-left: auto;
			outline: none;
			transition: all 0.2s;
			width: 25px;
			.arrow {
				border: solid var(--appBGColor);
				border-width: 0 3px 3px 0;
				display: inline-block;
				padding: 3px;
				&.right {
					transform: rotate(-45deg);
				}
				&.left {
					transform: rotate(135deg);
				}
			}
		}
		nav {
			background-color: var(--appColorTertiary);
			height: 100vh;
			overflow: hidden;
			min-width: 260px;
			padding: 0;
			position: static;
			transition: all 0.2s;
			width: 260px;
		}
		.inner {
			align-items: flex-start;
			flex-direction: column;
			min-height: 100%;
			padding: 0;
		}
		.navbar-list {
			display: flex;
			flex-direction: column;
			justify-content: left;
			padding: 0;
			li {
				align-items: center;
				display: flex;
				padding: 0;
				width: 100%;
				transition: background-color 0.2s;
				&:first-child {
					margin-left: 0;
				}
				&:hover {
					button {
						background-color: var(--appColorTertiary);
						color: var(--appBGColor);
					}
				}
				&:before {
					display: none;
				}
			}
			button {
				border-radius: 10px;
				box-shadow: 11px 11px 22px #2e4588, -11px -11px 22px #4263c4;
				color: var(--appBGColor);
				margin: 10px 0px;
				padding: 10px 0px 10px 15px;
				width: 100%;
			}
			button.selected {
				background-color: var(--appColorTertiary);
				color: var(--appBGColor);
			}
			.mobileUserItem {
				display: none;
			}
			.discordArea {
				.discordButton {
					margin: 10px 0px;
					padding: 3px 0px 3px 15px;
					img {
						margin: 0;
					}
				}
			}
		}
		.desktopUserItem {
			align-items: center;
			display: flex;
			height: 70px;
			justify-content: center;
			margin: 0;
			margin-top: auto;
			width: 100%;
			.desktopUserButton {
				align-items: center;
				background-color: var(--appColorTertiary);
				box-shadow: 11px 11px 22px #2e4588, -11px -11px 22px #4263c4;
				display: flex;
				height: 100%;
				justify-content: center;
				transition: background-color 0.2s;
				width: 100%;
				.desktopUserAvatar {
					border-radius: 50%;
					flex-grow: 0;
					flex-shrink: 0;
					height: 40px;
					margin-right: 10px;
					width: 40px;
				}
				&:hover {
					background-color: rgba(56, 83, 166, 0.753);
				}
			}
		}
		.logoContainer {
			display: block;
			visibility: visible;
			.logo {
				display: flex;
				box-shadow: none;
				justify-content: center;
				align-items: center;
				background-color: transparent;
				outline: 0;
				border: 0;
				padding: 5px 0px;
				margin: 0;
				img {
					max-width: 35px;
					transition: transform 0.4s;
				}
				&:hover {
					background-color: transparent;
					img {
						transform: rotateZ(360deg);
					}
				}
			}
		}
		nav.minimized {
			min-width: 60px;
			width: 60px;
			.inner {
				.navbar-list {
					li {
						align-items: center;
						display: flex;
						justify-content: center;
						width: 100%;
						button {
							align-items: center;
							border-radius: 50%;
							display: flex;
							height: 50px;
							justify-content: center;
							padding: 0;
							width: 50px;
							img {
								margin: 0;
							}
							span {
								display: none;
							}
						}
					}
					.mobileUserItem {
						display: none;
					}
				}
				.desktopUserItem {
					.desktopUserButton {
						.desktopUserAvatar {
							margin: 0;
						}
						span {
							display: none;
						}
					}
				}
			}
		}
	}
</style>
