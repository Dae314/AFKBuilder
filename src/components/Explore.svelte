<script>
	import { onMount } from 'svelte';
	import AppData from '../stores/AppData.js';

	onMount(async () => {
		$AppData.activeView = 'explore';
	});
</script>

<div class="exploreContainer">
	<h2>Explore!</h2>
</div>

<style lang="scss">
	.exploreContainer {
		height: calc(100vh - var(--headerHeight));
		overflow-y: auto;
		width: 100%;
	}
</style>
