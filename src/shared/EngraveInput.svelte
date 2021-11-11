<script>
	import NumPicker from './NumPicker.svelte';

	let min = 0;
	export let max = 100;
	export let value = 0;
	export let enabled = true;
</script>

<div class="title">Engraving</div>
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
	}
</style>
