<script>
	import NumPicker from './NumPicker.svelte';

	let min = 0;
	let max = 100;
	export let value = 0;
	export let enabled = true;
</script>

<div class="title" class:disabled={!enabled}>Copies</div>
<NumPicker 
	{min}
	{max}
	bind:value={value}
	{enabled}
	on:change
/>

<style lang="scss">
	.title {
		font-weight: bold;
		margin-bottom: 3px;
		text-align: center;
		&.disabled {
			color: rgba(0, 0, 0, 0.5);
		}
	}
</style>
