<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let min = 0;
	export let max = 100;
	export let value = 0;
	export let enabled = true;
	let timeout, interval;

	function handleChange() {
		value = value > max ? max : value;
		value = value < min ? min : value;
		if(value === null) value = 0;
		dispatch('change', { value: value });
	}

	function changeValue(type) {
		switch(type) {
			case 'minus':
				value = value - 1 < min ? min : value - 1;
				break;
			case 'plus':
				value = value + 1 > max ? max : value + 1;
				break;
			default:
				break;
		}
		if(value <= min | value >= max) clearTimers();
		dispatch('change', { value: value });
	}

	function handleInteract(type) {
		if(enabled) {
			changeValue(type);
			timeout = setTimeout(function() {
				interval = setInterval(function() {
					changeValue(type);
				}, 50);
			}, 500);
		}
	}

	function clearTimers() {
		clearTimeout(timeout);
		clearInterval(interval);
	}
</script>

<button
	type="button"
	class="counterButton subButton"
	disabled={!enabled || value <= min}
	on:mousedown={() => handleInteract('minus')}
	on:touchstart={(e) => { e.preventDefault(); handleInteract('minus'); }}
	on:mouseup={clearTimers}
	on:mouseleave={clearTimers}
	on:touchend={clearTimers}>
	<span>–</span>
</button>
<input
	type="number"
	class="numInput"
	{min}
	{max}
	bind:value={value}
	disabled={!enabled}
	on:change={handleChange}>
<button
	type="button"
	class="counterButton subButton"
	disabled={!enabled || value >= max}
	on:mousedown={() => handleInteract('plus')}
	on:touchstart={(e) => { e.preventDefault(); handleInteract('plus'); }}
	on:mouseup={clearTimers}
	on:mouseleave={clearTimers}
	on:touchend={clearTimers}>
	<span>+</span>
</button>

<style lang="scss">
	.counterButton {
		align-items: center;
		background-color: transparent;
		border: none;
		color: var(--appColorPrimary);
		cursor: pointer;
		display: inline-flex;
		font-size: 1.2rem;
		font-weight: bold;
		height: 25px;
		justify-content: center;
		margin: 0;
		user-select: none;
		width: 25px;
		&:disabled {
			color: var(--appColorDisabled);
			cursor: default;
		}
	}
	.numInput {
		background-color: var(--appBGColor);
		border: none;
		border-radius: 5px;
		box-shadow: var(--neu-sm-i-BGColor-shadow);
		color: var(--appColorBlack);
		height: 25px;
		outline: none;
		text-align: center;
		width: 40px;
		-moz-appearance:textfield;
		&::-webkit-outer-spin-button,
		&::-webkit-inner-spin-button {
			display: none;
			appearance: none;
			margin: 0;
		}
		&:focus {
			background-color: var(--appTextInputFocusBG);
		}
		&:disabled {
			background-color: var(--appBGColor);
			color: var(--appColorDisabled);
			border-color: var(--appColorPriAccent);
		}
	}
</style>
