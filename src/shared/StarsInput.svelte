<script>
	import NumPicker from './NumPicker.svelte';

	let min = 0;
	let max = 5;
	export let value = 0;
	export let enabled = true;
</script>

<div class="title">Stars</div>
<NumPicker 
	{min}
	{max}
	bind:value={value}
	{enabled}
	on:change
/>

<style lang="scss">

</style>
