<script>
	// https://loading.io/css/
</script>

<div class="loadingContainer">
	<div class="lds-dual-ring"></div>
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
		.lds-dual-ring {
			display: inline-block;
			height: 80px;
			width: 80px;
			&:after {
				content: '';
				display: block;
				width: 64px;
				height: 64px;
				margin: 8px;
				border-radius: 50%;
				border: 6px solid #fff;
				border-color: #fff transparent #fff transparent;
				animation: lds-dual-ring 1.2s linear infinite;
			}
		}
	}
	@keyframes lds-dual-ring {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
