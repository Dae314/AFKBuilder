<script>
	import { onMount, createEventDispatcher } from 'svelte';
	import AppData from '../stores/AppData.js'

	export let menu = [];
	const dispatch = createEventDispatcher();
	let showMobileMenu = false;

	function handleMenuChange(item) {
		const queryString = window.location.search;
		const urlParams = new URLSearchParams(queryString);
		if(urlParams.has('view')) {
			if(urlParams.get('view') === item) {
				history.replaceState({view: item, modal: false}, item, `?view=${item}`);
			} else {
				history.pushState({view: item, modal: false}, item, `?view=${item}`);
			}
		} else {
			history.pushState({view: item, modal: false}, item, `?view=${item}`);
		}
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
		mediaListener.addEventListener('change', mediaQueryHandler);
	});
</script>

<nav>
	<div class="inner">
		<div on:click={() => handleMobileIconClick()} class="mobile-icon {showMobileMenu ? 'active' : ''}">
			<div class="middle-line"></div>
		</div>
		<ul class="navbar-list {showMobileMenu ? 'mobile' : ''}">
			<li class="logoContainer" on:click={() => handleMenuChange(menu[0].toLowerCase())}>
				<button type="button" class="logo"><img src="./img/app/afkbuilder_logo.png" alt="AFKBuilder"></button>
			</li>
			{#each menu as item}
				<li on:click={() => handleMenuChange(item.toLowerCase())}>
					<button type="button" class="{$AppData.activeView === item.toLowerCase() ? 'selected' : ''}">{item}</button>
				</li>
			{/each}
		</ul>
	</div>
</nav>

<style lang="scss">
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
			padding-bottom: 20px;
			padding-top: 20px;
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
				}
			}
		}
		button {
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
			&:focus {
				outline: 0;
			}
		}
		button.selected {
			color: rgba(240, 240, 242, 1.0);
		}
	}
	.navbar-list.mobile {
		background-color: rgba(0, 0, 0, 0.8);
		bottom: 0;
		display: block;
		height: calc(100% - 45px);
		left: 0;
		position: fixed;
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