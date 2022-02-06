<script>
	export let params = {};
	let username = params.username;
</script>

<div class="userContainer">
	<h4>{username} public profile page</h4>
</div>

<style lang="scss">
	.userContainer {
		display: flex;
		flex-direction: column;
		height: calc(100vh - var(--headerHeight));
		overflow-y: auto;
		width: 100%;
	}
</style>
