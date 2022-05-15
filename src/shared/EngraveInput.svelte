<script>
	import NumPicker from './NumPicker.svelte';

	let min = 0;
	export let max = 100;
	export let value = 0;
	export let enabled = true;
</script>

<div class="title" class:disabled={!enabled}>Engraving</div>
<NumPicker 
	{min}
	{max}
	bind:value={value}
	{enabled}
	on:change
/>

<style lang="scss">
	.title {
		color: var(--appColorBlack);
		font-weight: bold;
		margin-bottom: 3px;
		text-align: center;
		user-select: none;
		&.disabled {
			color: var(--appColorDisabled);
		}
	}
</style>
