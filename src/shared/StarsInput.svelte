<script>
	import NumPicker from './NumPicker.svelte';

	let min = 0;
	let max = 5;
	export let value = 0;
	export let enabled = true;
</script>

<label>Stars</label>
<NumPicker 
	{min}
	{max}
	{value}
	{enabled}
/>

<style lang="scss">

</style>
