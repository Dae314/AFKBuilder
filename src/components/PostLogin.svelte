<script>
	import { onMount } from 'svelte';
	export let params = {};
	export let isMobile = false;

	let provider = '';

	onMount(async () => {
		provider = params.provider;
	});
</script>

<div class="postLoginContainer">
	<h2>PostLogin page for {provider}</h2>
</div>

<style lang="scss">

</style>
