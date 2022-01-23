<script>
	import AppData from '../stores/AppData.js';
	export let isMobile = false;
</script>

<div class="profileContainer">
	<section class="titleArea">
		<h2>{$AppData.username}</h2>
	</section>
	<section class="headlineArea">
		<div class="headBox publishedCompsBox">
			<div class="headNumber">0</div>
			<div class="headText">Published Comps</div>
		</div>
		<div class="headBox likedCompsBox">
			<div class="headNumber">0</div>
			<div class="headText">Liked Comps</div>
		</div>
		<div class="headBox totalLikesBox">
			<div class="headNumber">0</div>
			<div class="headText">Total Likes</div>
		</div>
	</section>
</div>

<style lang="scss">
	.profileContainer {
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 100%;
	}
	.titleArea {
		display: flex;
		justify-content: center;
	}
	.headlineArea {
		display: flex;
		flex-direction: column;
		padding: 5px;
		width: 100%;
		.headBox {
			align-items: center;
			background-color: var(--appColorPrimary);
			border: 2px solid var(--appColorSecondary);
			border-radius: 10px;
			color: white;
			display: flex;
			flex-direction: column;
			height: 120px;
			margin: 10px 0px;
			justify-content: center;
			width: 100%;
			.headNumber {
				font-size: 2.0rem;
				font-weight: bold;
			}
			.headText {
				font-size: 1.3rem;
				font-weight: bold;
			}
		}
	}
</style>
