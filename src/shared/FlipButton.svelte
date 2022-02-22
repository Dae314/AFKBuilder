<script>
	export let options = ['on', 'off'];
	export let curOption = 0;
	export let optionStyles = [];
	export let onClick = () => {};
	export let disabled = false;

	let playAni = false;

	function handleClick() {
		if(!disabled) {
			playAni = true;
			if(++curOption >= options.length) {
				curOption = 0;
			}
			setTimeout(() => playAni = false, 400)
			onClick();
		}
	}
</script>

<button
	type="button"
	class="flipButton"
	class:disabled={disabled}
	on:click={handleClick}
	style="{ Array.isArray(optionStyles) && optionStyles[curOption] !== null ? optionStyles[curOption] : ''}"
	>
		<span class:playAni="{playAni}">{options[curOption]}</span>
</button>

<style lang="scss">
	.flipButton {
		background-color: transparent;
		border: 2px solid var(--appColorPrimary);
		border-radius: 10px;
		color: var(--appColorPrimary);
		cursor: pointer;
		overflow: hidden;
		padding: 7px;
		text-decoration: none;
		transition: all .3s;
		span {
			user-select: none;
		}
	}
	.flipButton.disabled {
		background-color: #BEBEBE;
		border-color: #BEBEBE;
		color: white;
		cursor: default;
	}
	.playAni {
		animation: MoveUpInitial 0.2s forwards, MoveUpEnd 0.2s forwards 0.2s;
		display: inline-block;
	}
	@media only screen and (min-width: var(--mobileWidthBreakpoint)) {
		.flipButton {
			&:hover {
				background-color: var(--appColorPrimary);
				color: white;
			}
			&:active {
				box-shadow: none;
			}
		}
		.flipButton.disabled {
			&:hover {
				background-color: #BEBEBE;
			}
		}
	}
	@keyframes MoveUpInitial {
		to {
			transform: translate3d(0,-125%,0);
		}
	}
	@keyframes MoveUpEnd {
		from {
			transform: translate3d(0,100%,0);
		}
		to {
			transform: translate3d(0,0,0);
		}
	}
</style>
