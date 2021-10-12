<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let min = 0;
	export let max = 100;
	export let value = 0;
	export let enabled = true;

	function handleChange() {
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
	<span>-</span>
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

</style>
