<script>
	export let min = 0;
	export let max = 100;
	export let value = 0;
	export let enabled = true;
</script>

<button type="button" class="counterButton subButton" disabled={!enabled}><span>-</span></button>
<input type="number" class="numInput" min={min} max={max} bind:value={value} disabled={!enabled}>
<button type="button" class="counterButton subButton" disabled={!enabled}><span>-</span></button>

<style lang="scss">

</style>
