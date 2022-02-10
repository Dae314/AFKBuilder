<script>
	import LoadingSpinner from './LoadingSpinner.svelte';
</script>

<div class="loadingContainer">
	<LoadingSpinner />
</div>

<style lang="scss">
	.loadingContainer {
		align-items: center;
		background-color: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(2px);
		display: flex;
		height: 100%;
		justify-content: center;
		left: 0px;
		position: fixed;
		top: 0px;
		width: 100%;
		z-index: 10;
	}
</style>
