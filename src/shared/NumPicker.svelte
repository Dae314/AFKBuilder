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
</script>

<button type="button" class="counterButton subButton" disabled={!enabled}>
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
<button type="button" class="counterButton subButton" disabled={!enabled}>
	<span>+</span>
</button>

<style lang="scss">

</style>
