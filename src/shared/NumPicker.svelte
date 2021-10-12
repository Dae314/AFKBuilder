<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let min = 0;
	export let max = 100;
	export let value = 0;
	export let enabled = true;

	function handleChange() {
		value = value > max ? max : value;
		value = value < min ? min : value;
		dispatch('change', { value: value });
	}

	function handleClick(type) {
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
		dispatch('change', { value: value });
	}
</script>

<button type="button" class="counterButton subButton" disabled={!enabled || value <= min} on:click={() => handleClick('minus')}>
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
<button type="button" class="counterButton subButton" disabled={!enabled || value >= max} on:click={() => handleClick('plus')}>
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
		width: 25px;
	}
	.numInput {
		border: 2px solid var(--appColorPrimary);
		border-radius: 5px;
		height: 25px;
		outline: none;
		text-align: center;
		width: 65px;
		&::-webkit-outer-spin-button,
		&::-webkit-inner-spin-button {
			display: none;
			appearance: none;
			margin: 0;
		}
	}
</style>
