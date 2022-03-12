<script>
	// adapted from https://danklammer.com/articles/simple-css-toggle-switch/
	import { createEventDispatcher } from 'svelte';

	export let size = 'medium';
	export let state = false;
	export let onColor = window.getComputedStyle(document.documentElement).getPropertyValue('--appColorPrimary');
	export let offColor = window.getComputedStyle(document.documentElement).getPropertyValue('--appColorDisabled');
	const root = document.documentElement;
	const dispatch = createEventDispatcher();
	
	root.style.setProperty('--toggle-on-color', onColor);
	root.style.setProperty('--toggle-off-color', offColor);

	switch(size) {
		case 'small':
			root.style.setProperty('--toggle-width', "41px");
			root.style.setProperty('--toggle-height', "21px");
			root.style.setProperty('--toggle-radius', "33px");
			root.style.setProperty('--toggle-inner-size', "17.5px");
			root.style.setProperty('--toggle-movement', "21px");
			break;
		case 'medium':
			root.style.setProperty('--toggle-width', "62px");
			root.style.setProperty('--toggle-height', "32px");
			root.style.setProperty('--toggle-radius', "50px");
			root.style.setProperty('--toggle-inner-size', "28px");
			root.style.setProperty('--toggle-movement', "32px");
			break;
		case 'large':
			root.style.setProperty('--toggle-width', "93px");
			root.style.setProperty('--toggle-height', "48px");
			root.style.setProperty('--toggle-radius', "75px");
			root.style.setProperty('--toggle-inner-size', "44px");
			root.style.setProperty('--toggle-movement', "48px");
			break;
		default:
			throw new Error(`ERROR: Invalid size property sent to LoadingSpinner component: ${size}`);
	}

	function handleToggleChange() {
		dispatch('toggleEvent', {data: { state }});
	}
</script>

<input class="toggle" type="checkbox" bind:checked={state} on:change={handleToggleChange} />

<style lang="scss">
	.toggle {
		appearance: none;
		width: var(--toggle-width);
		height: var(--toggle-height);
		display: inline-block;
		position: relative;
		border-radius: var(--toggle-radius);
		overflow: hidden;
		outline: none;
		border: none;
		cursor: pointer;
		background-color: var(--toggle-off-color);
		transition: background-color ease 0.3s;
		&:before {
			content: "";
			display: block;
			position: absolute;
			z-index: 1;
			width: var(--toggle-inner-size);
			height: var(--toggle-inner-size);
			background: var(--appBGColor);
			left: 2px;
			top: 2px;
			border-radius: 50%;
			white-space: nowrap;
			box-shadow: 0 1px 2px rgba(0,0,0,0.2);
			transition: all cubic-bezier(0.3, 1.5, 0.7, 1) 0.3s;
		}
		&:checked {
			background-color: var(--toggle-on-color);
			&:before {
				left: var(--toggle-movement);
			}
		}
	}
</style>
