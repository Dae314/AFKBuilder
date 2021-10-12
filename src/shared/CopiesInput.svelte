<script>
	import NumPicker from './NumPicker.svelte';

	let min = 0;
	let max = 100;
	export let value = 0;
	export let enabled = true;
</script>

<div class="title">Copies</div>
<NumPicker 
	{min}
	{max}
	bind:value={value}
	{enabled}
/>

<style lang="scss">

</style>
