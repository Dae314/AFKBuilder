<script>
	import { onMount } from 'svelte';

	export let containerWidth = '80px';
	export let containerHeight = '80px';
	export let menuItems = [];
	export let menuItemsStyle = [];
	export let fullItems = [];
	export let fullItemsStyle = [];
	export let activeItem = 0;
	export let menuItemClickCallback = () => {};
	export let zIndexBase = 1;
	export let centerMenu = false;
	export let active = true;

	let menuOpen = false;
	let xOffset = 0; // px
	let yOffset = 0; // px
	const menuMaxRadius = 125; // px

	onMount(async () => {
		if(menuItems.length !== fullItems.length) throw new Error('menuItems must be the same length as fullItems.');
		if(menuItemsStyle.length !== menuItems.length) throw new Error('menuItemsStyle must be the same length as menuItems.');
		if(fullItemsStyle.length !== fullItems.length) throw new Error('fullItemsStyle must be the same length as fullItems.');
	});

	function calculateOffset(node) {
		if(centerMenu) {
			xOffset = '50%';
			yOffset = '50%';
		} else {
			const rect = node.getBoundingClientRect();
			const h = window.innerHeight;
			const w = window.innerWidth;

			if(rect.top < menuMaxRadius) {
				// offset from top if menu is too close to the top
				yOffset = (menuMaxRadius + 45) - rect.top; // 45px for nav bar
			} else if(h - rect.bottom < menuMaxRadius) {
				// offset from bottom if menu is too close to the bottom
				yOffset = -1 * ((menuMaxRadius + 45) - (h - rect.bottom)); // 45px for bottom filters
			}

			if(rect.left < menuMaxRadius) {
				// offset from left if menu is too close to the left
				xOffset = menuMaxRadius - rect.left;
			} else if(w - rect.right < menuMaxRadius) {
				// offset from right if menu is too close to the right
				xOffset = -1 * (menuMaxRadius - (w - rect.right));
			}

			xOffset = xOffset + 'px';
			yOffset = yOffset + 'px';
		}
	}

	function handleMenuClick(event) {
		event.stopPropagation();
		if(active) {
			menuOpen = !menuOpen;
			if(menuOpen) {
				calculateOffset(event.target);
			} else {
				xOffset = '0px';
				yOffset = '0px';
			}
		}
	}

	function handleOptionClick(event, index) {
		event.stopPropagation();
		menuOpen = false;
		menuItemClickCallback(index);
	}
</script>

<div
	class="background"
	class:menu-open={menuOpen}
	on:click={e => {e.stopPropagation(); menuOpen = false;}}
	style="z-index: {parseInt(zIndexBase)+1}"
>
</div>
<div
	class="menu"
	class:menu-open={menuOpen}
	class:center-menu={centerMenu}
	style="
		width: {containerWidth};
		height: {containerHeight};
		z-index: {menuOpen ? parseInt(zIndexBase)+1 : parseInt(zIndexBase)};
		top: {yOffset};
		left: {xOffset};
	">
	<button
		type="button"
		class="menu-open-button menu-len-{menuItems.length}"
		class:menu-open={menuOpen}
		on:click={handleMenuClick}
		style="{fullItemsStyle[activeItem]};"
		disabled={!active}
		>
		{#if menuOpen}
			<span class="lines line-1"></span>
			<span class="lines line-2"></span>
			<span class="lines line-3"></span>
		{:else}
			<span>{fullItems[activeItem]}</span>
		{/if}
	</button>

	{#each menuItems as item, i}
		<button
			type="button"
			class="menu-item"
			on:click={e => handleOptionClick(e, i)}
			style={menuItemsStyle[i]}
		>
			{item}
		</button>
	{/each}
</div>

<style lang="scss">
	.background {
		backdrop-filter: blur(2px);
		background-color: rgba(0, 0, 0, 0.5);
		height: 100vh;
		left: 0;
		opacity: 0;
		position: fixed;
		top: 0;
		transition: opacity 0.2s;
		visibility: hidden;
		width: 100vw;
		&.menu-open {
			opacity: 1;
			visibility: visible;
		}
	}
	.menu {
		align-items: center;
		display: flex;
		height: 80px;
		justify-content: center;
		text-align: center;
		width: 80px;
		&.menu-open {
			position: relative;
		}
		&.menu-open.center-menu {
			position: fixed;
			transform: translate(-50%, -50%);
		}
		&.inactive {
			background-color: gray;
			color: white;
		}
	}
	.menu-item {
		align-items: center;
		border: 2px solid #333;
		border-radius: 50%;
		color: #333;
		cursor: pointer;
		display: flex;
		font-size: 1.05rem;
		font-weight: bold;
		height: 55px;
		justify-content: center;
		line-height: 55px;
		outline: none;
		padding: 0;
		position: absolute;
		opacity: 0;
		text-align: center;
		transition: transform ease-out 180ms;
		visibility: hidden;
		width: 55px;
	}
	.menu-open-button {
		border: 2px solid #333;
		border-radius: 10px;
		box-shadow: var(--neu-sm-i-BGColor-shadow);
		cursor: pointer;
		font-size: 1.1rem;
		font-weight: bold;
		height: fit-content;
		line-height: 1.1rem;
		padding: 5px;
		transition: all 0.2s;
		transition-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.275);
		transform: scale(1.1, 1.1) translate3d(0, 0, 0);
		width: fit-content;
		.lines {
			background: var(--appColorBlack);
			display: block;
			height: 3px;
			left: 50%;
			margin-left: -12.5px;
			margin-top: -1.5px;
			position: absolute;
			top: 50%;
			transition: transform 200ms;
			width: 25px;
		}
		.line-1 {
			transform: translate3d(0, -8px, 0);
		}
		.line-2 {
			transform: translate3d(0, 0, 0);
		}
		.line-3 {
			transform: translate3d(0, 8px, 0);
		}
		&.menu-open {
			border-radius: 50%;
			box-shadow: none;
			height: 55px;
			line-height: 55px;
			transition-duration: 200ms;
			transition-timing-function: linear;
			transform: scale(0.9, 0.9) translate3d(0, 0, 0);
			width: 55px;
			~ .menu-item {
				opacity: 1;
				visibility: visible;
			}
		}
		&.menu-open .line-1 {
			transform: translate3d(0, 0, 0) rotate(45deg);
		}
		&.menu-open .line-2 {
			transform: translate3d(0, 0, 0) scale(0.1, 1);
		}
		&.menu-open .line-3 {
			transform: translate3d(0, 0, 0) rotate(-45deg);
		}
		&.menu-open ~ .menu-item {
			transition-timing-function: cubic-bezier(0.935, 0, 0.34, 1.33);
		}
		&.menu-open {
			&.menu-len-1 {
				~ .menu-item:nth-child(2) {
					transition-duration: 50ms;
					transform: rotate(0deg) translateY(-70px) rotate(-0deg);
				}
			}
			&.menu-len-2 {
				~ .menu-item:nth-child(2) {
					transition-duration: 50ms;
					transform: rotate(0deg) translateY(-70px) rotate(-0deg);
				}
				~ .menu-item:nth-child(3) {
					transition-duration: 100ms;
					transform: rotate(90deg) translateY(-70px) rotate(-90deg);
				}
			}
			&.menu-len-3 {
				~ .menu-item:nth-child(2) {
					transition-duration: 50ms;
					transform: rotate(0deg) translateY(-70px) rotate(-0deg);
				}
				~ .menu-item:nth-child(3) {
					transition-duration: 100ms;
					transform: rotate(90deg) translateY(-70px) rotate(-90deg);
				}
				~ .menu-item:nth-child(4) {
					transition-duration: 150ms;
					transform: rotate(180deg) translateY(-70px) rotate(-180deg);
				}
			}
			&.menu-len-4 {
				~ .menu-item:nth-child(2) {
					transition-duration: 50ms;
					transform: rotate(0deg) translateY(-70px) rotate(-0deg);
				}
				~ .menu-item:nth-child(3) {
					transition-duration: 100ms;
					transform: rotate(90deg) translateY(-70px) rotate(-90deg);
				}
				~ .menu-item:nth-child(4) {
					transition-duration: 150ms;
					transform: rotate(180deg) translateY(-70px) rotate(-180deg);
				}
				~ .menu-item:nth-child(5) {
					transition-duration: 200ms;
					transform: rotate(270deg) translateY(-70px) rotate(-270deg);
				}
			}
			&.menu-len-5 {
				~ .menu-item:nth-child(2) {
					transition-duration: 50ms;
					transform: rotate(0deg) translateY(-80px) rotate(-0deg);
				}
				~ .menu-item:nth-child(3) {
					transition-duration: 100ms;
					transform: rotate(72deg) translateY(-80px) rotate(-72deg);
				}
				~ .menu-item:nth-child(4) {
					transition-duration: 150ms;
					transform: rotate(144deg) translateY(-80px) rotate(-144deg);
				}
				~ .menu-item:nth-child(5) {
					transition-duration: 200ms;
					transform: rotate(216deg) translateY(-80px) rotate(-216deg);
				}
				~ .menu-item:nth-child(6) {
					transition-duration: 250ms;
					transform: rotate(288deg) translateY(-80px) rotate(-288deg);
				}
			}
			&.menu-len-6 {
				~ .menu-item:nth-child(2) {
					transition-duration: 50ms;
					transform: rotate(0deg) translateY(-80px) rotate(-0deg);
				}
				~ .menu-item:nth-child(3) {
					transition-duration: 100ms;
					transform: rotate(60deg) translateY(-80px) rotate(-60deg);
				}
				~ .menu-item:nth-child(4) {
					transition-duration: 150ms;
					transform: rotate(120deg) translateY(-80px) rotate(-120deg);
				}
				~ .menu-item:nth-child(5) {
					transition-duration: 200ms;
					transform: rotate(180deg) translateY(-80px) rotate(-180deg);
				}
				~ .menu-item:nth-child(6) {
					transition-duration: 250ms;
					transform: rotate(240deg) translateY(-80px) rotate(-240deg);
				}
				~ .menu-item:nth-child(7) {
					transition-duration: 300ms;
					transform: rotate(300deg) translateY(-80px) rotate(-300deg);
				}
			}
			&.menu-len-7 {
				~ .menu-item:nth-child(2) {
					transition-duration: 50ms;
					transform: rotate(0deg) translateY(-90px) rotate(-0deg);
				}
				~ .menu-item:nth-child(3) {
					transition-duration: 100ms;
					transform: rotate(51.4deg) translateY(-90px) rotate(-51.4deg);
				}
				~ .menu-item:nth-child(4) {
					transition-duration: 150ms;
					transform: rotate(102.9deg) translateY(-90px) rotate(-102.9deg);
				}
				~ .menu-item:nth-child(5) {
					transition-duration: 200ms;
					transform: rotate(154.3deg) translateY(-90px) rotate(-154.3deg);
				}
				~ .menu-item:nth-child(6) {
					transition-duration: 250ms;
					transform: rotate(205.7deg) translateY(-90px) rotate(-205.7deg);
				}
				~ .menu-item:nth-child(7) {
					transition-duration: 300ms;
					transform: rotate(257.1deg) translateY(-90px) rotate(-257.1deg);
				}
				~ .menu-item:nth-child(8) {
					transition-duration: 350ms;
					transform: rotate(308.6deg) translateY(-90px) rotate(-308.6deg);
				}
			}
			&.menu-len-8 {
				~ .menu-item:nth-child(2) {
					transition-duration: 50ms;
					transform: rotate(0deg) translateY(-90px) rotate(-0deg);
				}
				~ .menu-item:nth-child(3) {
					transition-duration: 100ms;
					transform: rotate(45deg) translateY(-90px) rotate(-45deg);
				}
				~ .menu-item:nth-child(4) {
					transition-duration: 150ms;
					transform: rotate(90deg) translateY(-90px) rotate(-90deg);
				}
				~ .menu-item:nth-child(5) {
					transition-duration: 200ms;
					transform: rotate(135deg) translateY(-90px) rotate(-135deg);
				}
				~ .menu-item:nth-child(6) {
					transition-duration: 250ms;
					transform: rotate(180deg) translateY(-90px) rotate(-180deg);
				}
				~ .menu-item:nth-child(7) {
					transition-duration: 300ms;
					transform: rotate(225deg) translateY(-90px) rotate(-225deg);
				}
				~ .menu-item:nth-child(8) {
					transition-duration: 350ms;
					transform: rotate(270deg) translateY(-90px) rotate(-270deg);
				}
				~ .menu-item:nth-child(9) {
					transition-duration: 400ms;
					transform: rotate(315deg) translateY(-90px) rotate(-315deg);
				}
			}
			&.menu-len-9 {
				~ .menu-item:nth-child(2) {
					transition-duration: 50ms;
					transform: rotate(0deg) translateY(-100px) rotate(-0deg);
				}
				~ .menu-item:nth-child(3) {
					transition-duration: 100ms;
					transform: rotate(40deg) translateY(-100px) rotate(-40deg);
				}
				~ .menu-item:nth-child(4) {
					transition-duration: 150ms;
					transform: rotate(80deg) translateY(-100px) rotate(-80deg);
				}
				~ .menu-item:nth-child(5) {
					transition-duration: 200ms;
					transform: rotate(120deg) translateY(-100px) rotate(-120deg);
				}
				~ .menu-item:nth-child(6) {
					transition-duration: 250ms;
					transform: rotate(160deg) translateY(-100px) rotate(-160deg);
				}
				~ .menu-item:nth-child(7) {
					transition-duration: 300ms;
					transform: rotate(200deg) translateY(-100px) rotate(-200deg);
				}
				~ .menu-item:nth-child(8) {
					transition-duration: 350ms;
					transform: rotate(240deg) translateY(-100px) rotate(-240deg);
				}
				~ .menu-item:nth-child(9) {
					transition-duration: 400ms;
					transform: rotate(280deg) translateY(-100px) rotate(-280deg);
				}
				~ .menu-item:nth-child(10) {
					transition-duration: 450ms;
					transform: rotate(320deg) translateY(-100px) rotate(-320deg);
				}
			}
			&.menu-len-10 {
				~ .menu-item:nth-child(2) {
					transition-duration: 50ms;
					transform: rotate(0deg) translateY(-100px) rotate(-0deg);
				}
				~ .menu-item:nth-child(3) {
					transition-duration: 100ms;
					transform: rotate(36deg) translateY(-100px) rotate(-36deg);
				}
				~ .menu-item:nth-child(4) {
					transition-duration: 150ms;
					transform: rotate(72deg) translateY(-100px) rotate(-72deg);
				}
				~ .menu-item:nth-child(5) {
					transition-duration: 200ms;
					transform: rotate(108deg) translateY(-100px) rotate(-108deg);
				}
				~ .menu-item:nth-child(6) {
					transition-duration: 250ms;
					transform: rotate(144deg) translateY(-100px) rotate(-144deg);
				}
				~ .menu-item:nth-child(7) {
					transition-duration: 300ms;
					transform: rotate(180deg) translateY(-100px) rotate(-180deg);
				}
				~ .menu-item:nth-child(8) {
					transition-duration: 350ms;
					transform: rotate(216deg) translateY(-100px) rotate(-216deg);
				}
				~ .menu-item:nth-child(9) {
					transition-duration: 400ms;
					transform: rotate(252deg) translateY(-100px) rotate(-252deg);
				}
				~ .menu-item:nth-child(10) {
					transition-duration: 450ms;
					transform: rotate(288deg) translateY(-100px) rotate(-288deg);
				}
				~ .menu-item:nth-child(11) {
					transition-duration: 450ms;
					transform: rotate(324deg) translateY(-100px) rotate(-324deg);
				}
			}
		}
		&:disabled {
			background-color: var(--appColorDisabled) !important;
			border-color: var(--appColorDisabled) !important;
			color: white !important;
			cursor: default;
		}
	}
	@media only screen and (min-width: 767px) {
	}
</style>
