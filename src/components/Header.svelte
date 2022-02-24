<script>
	import { onMount, createEventDispatcher, getContext } from 'svelte';
	import ModalCloseButton from '../modals/ModalCloseButton.svelte';
	import ChooseLogin from '../modals/ChooseLogin.svelte';
	import AppData from '../stores/AppData.js';

	export let menu = [];
	const dispatch = createEventDispatcher();
	let showMobileMenu = false;
	const { open } = getContext('simple-modal');

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

<nav>
	<div class="inner">
		<div on:click={() => handleMobileIconClick()} class="mobile-icon {showMobileMenu ? 'active' : ''}">
			<div class="middle-line"></div>
		</div>
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
			<li class="discordButton" on:click={() => window.open('https://discord.com/invite/sjxgnmkvSf', '_blank')}>
				<div><img src="./img/app/discord-logo-white.png" alt="Discord"><span>Join the Discord!</span></div>
			</li>
		</ul>
		{#if $AppData.user.jwt}
			<div class="desktopUserItem" on:click={handleUserClick}>
				<button type="button" class:selected={$AppData.activeView === 'profile'} class="desktopUserButton">{$AppData.user.username || 'Profile'}</button>
			</div>
		{:else}
			<div class="desktopUserItem" on:click={handleLoginClick}>
				<button type="button" class="desktopUserButton">Login</button>
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
	.mobile-icon {
		cursor: pointer;
		height: 35px;
		position: relative;
		width: 35px;
		&:after {
			background-color: var(--appBGColor);
			content: "";
			height: 3px;
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
		.discordButton {
			align-items: center;
			display: flex;
			font-size: 20px;
			div {
				align-items: center;
				color: rgba(240, 240, 242, 0.7);
				display: flex;
				text-decoration: none;
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
					div {
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
		background-color: rgba(0, 0, 0, 0.8);
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
		.mobile-icon {
			display: none;
		}
		nav {
			padding: 0;
			position: static;
		}
		.inner {
			min-height: 100%;
		}
		.navbar-list {
			display: flex;
			height: 100%;
			padding: 0;
			width: fit-content;
			li {
				align-items: center;
				display: flex;
				height: 100%;
				justify-content: center;
				margin-left: 20px;
				padding: 0px;
				&:first-child {
					margin-left: 0;
				}
				&:hover {
					button {
						color: rgba(240, 240, 242, 1.0);
					}
				}
				&:before {
					display: none;
				}
			}
			button {
				color: rgba(240, 240, 242, 0.7);
				margin: 0;
			}
			button.selected {
				color: rgba(240, 240, 242, 1.0);
			}
			.mobileUserItem {
				display: none;
			}
			.discordButton {
				div {
					img {
						margin-left: 0;
					}
					span {
						display: none;
					}
				}
			}
		}
		.desktopUserItem {
			display: flex;
		}
		.logoContainer {
			display: block;
			visibility: visible;
			.logo {
				display: flex;
				justify-content: center;
				align-items: center;
				background-color: transparent;
				outline: 0;
				border: 0;
				padding: 0;
				margin: 0;
			}
		}
		.logo {
			img {
				max-width: 35px;
				transition: transform 0.4s;
			}
			&:hover {
				img {
					transform: rotateZ(360deg);
				}
			}
		}
	}
</style>
