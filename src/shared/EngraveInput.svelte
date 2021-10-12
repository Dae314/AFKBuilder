<script>
	import EngraveInput from './EngraveInput.svelte';

	let min = 0;
	let max = 100;
	export let value = 0;
	export let enabled = true;
</script>

<EngraveInput 
	{min}
	{max}
	{value}
	{enabled}
/>

<style lang="scss">

</style>
