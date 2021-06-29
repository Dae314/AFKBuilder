<script>
	export let options = ['on', 'off'];
	export let curOption = 0;
	export let optionStyles;
	export let onClick;

	let playAni = false;

	function handleClick() {
		playAni = true;
		if(++curOption >= options.length) {
			curOption = 0;
		}
		setTimeout(() => playAni = false, 400)
		onClick();
	}
</script>

<button
	type="button"
	class="flipButton"
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
		&:active {
			box-shadow: none;
		}
		span {
			user-select: none;
		}
	}
	.playAni {
		animation: MoveUpInitial 0.2s forwards, MoveUpEnd 0.2s forwards 0.2s;
		display: inline-block;
	}
	@media only screen and (min-width: 767px) {
		.flipButton {
			&:hover {
				box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.25);
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
