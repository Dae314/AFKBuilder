<script>
	import { onMount, createEventDispatcher } from 'svelte';
	import AppData from '../stores/AppData.js'

	const menu = [ 'Comps', 'Recommendations', 'My Heroes', 'Hero List', 'About' ];
	const dispatch = createEventDispatcher();
	let showMobileMenu = false;

	function handleMenuChange(item) {
		$AppData.activeView = item;
		dispatch('saveData');
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

	onMount(async () => {
		const mediaListener = window.matchMedia("(max-width: 767px)");
		mediaListener.addListener(mediaQueryHandler);
	});
</script>

<nav>
	<div class="inner">
		<div on:click={() => handleMobileIconClick()} class="mobile-icon {showMobileMenu ? 'active' : ''}">
			<div class="middle-line"></div>
		</div>
		<ul class="navbar-list {showMobileMenu ? 'mobile' : ''}">
			<li class="logoContainer" on:click={() => handleMenuChange('comps')}>
				<button class="logo"><img src="./img/app/afkbuilder_logo.png" alt="AFKBuilder"></button>
			</li>
			{#each menu as item}
				<li on:click={() => handleMenuChange(item.toLowerCase())}>
					<button class="{$AppData.activeView === item.toLowerCase() ? 'selected' : ''}">{item}</button>
				</li>
			{/each}
		</ul>
	</div>
</nav>

<style>
	nav {
		background-color: var(--appColorTertiary);
		font-family: "Helvetica Neue", "Helvetica", "Arial", sans-serif;
		height: 45px;
		min-height: 45px;
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
		max-width: 980px;
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
	}
	.mobile-icon:after,
		.mobile-icon:before,
		.middle-line {
		background-color: var(--appBGColor);
		content: "";
		height: 3px;
		position: absolute;
		transform-origin: center;
		transition: all 0.4s;
		width: 100%;
	}
	.mobile-icon:before,
		.middle-line {
		top: 7px;
	}
	.mobile-icon:after,
		.middle-line {
		bottom: 7px;
	}
	.mobile-icon:before {
		width: 66%;
	}
	.mobile-icon:after {
		width: 33%;
	}
	.middle-line {
		margin: auto;
	}
	.mobile-icon:hover:before,
		.mobile-icon:hover:after,
		.mobile-icon.active:before,
		.mobile-icon.active:after,
		.mobile-icon.active .middle-line {
		width: 100%;
	}
	.mobile-icon.active:before,
		.mobile-icon.active:after {
		top: 50%;
		transform: rotate(-45deg);
	}
	.mobile-icon.active .middle-line {
		transform: rotate(45deg);
	}
	.navbar-list {
		display: none;
		justify-content: space-between;
		margin: 0;
		padding-left: 10px;
		padding-top: 10px;
		width: 100%;
	}
	.navbar-list.mobile {
		background-color: rgba(0, 0, 0, 0.8);
		bottom: 0;
		display: block;
		height: calc(100% - 45px);
		left: 0;
		position: fixed;
	}
	.navbar-list li {
		cursor: pointer;
		list-style-type: none;
		padding-bottom: 20px;
		padding-top: 20px;
		position: relative;
	}
	.navbar-list li:before {
		background-color: #424245;
		bottom: 0;
		content: "";
		height: 1px;
		left: 0;
		position: absolute;
		width: 100%;
	}
	.navbar-list button {
		background: none;
		border: none;
		color: rgba(240, 240, 242, 0.7);
		cursor: pointer;
		display: block;
		font-size: 20px;
		margin-left: 20px;
		padding: 4px 10px;
		text-align: center;
		text-decoration: none;
	}
	.navbar-list button:focus {
		outline: 0;
	}
	.navbar-list button.selected {
		color: rgba(240, 240, 242, 1.0);
	}
	.navbar-list li:hover button {
		color: rgba(240, 240, 242, 1.0);
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
			max-width: 75%;
			min-height: 100%;
			padding-left: 10px;
		}
		.navbar-list {
			display: flex;
			height: 100%;
			padding: 0;
			width: fit-content;
		}
		.navbar-list li {
			align-items: center;
			display: flex;
			height: 100%;
			justify-content: center;
			margin-left: 20px;
			padding: 0px;
		}
		.navbar-list li:first-child {
			margin-left: 0;
		}
		.navbar-list button {
			color: rgba(240, 240, 242, 0.7);
			margin: 0;
		}
		.navbar-list button.selected {
			color: rgba(240, 240, 242, 1.0);
		}
		.navbar-list li:hover button {
			color: rgba(240, 240, 242, 1.0);
		}
		.navbar-list li:before {
			display: none;
		}
		.logoContainer {
			display: block;
			visibility: visible;
		}
		.logoContainer .logo {
			display: flex;
			justify-content: center;
			align-items: center;
			background-color: transparent;
			outline: 0;
			border: 0;
			padding: 0;
			margin: 0;
		}
		.logo img {
			max-width: 35px;
		}
	}
</style>
