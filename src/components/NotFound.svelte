<script>

	function handleHomeClick() {
		// navigate to /
		// note: clears all extraneous URL parameters
		window.location.assign(`${window.location.origin}/#/`);
	}

</script>

<div class="notFoundContainer">
	<div class="header">
		<h3>404</h3>
		<div class="headText">We couldn't find that</div>
	</div>
	<div class="divider"></div>
	<div class="navigation">
		<div class="detailText">Sorry about that!</div>
		<button type="button" class="homeButton" on:click={handleHomeClick}>Return Home?</button>
	</div>
</div>

<style lang="scss">
	.notFoundContainer {
		align-items: center;
		display: flex;
		height: calc(100vh - var(--headerHeight));
		justify-content: center;
		position: relative;
		width: 100%;
	}
	.header {
		position: relative;
		height: 150px;
		left: -42px;
		text-align: right;
		h3 {
			color: var(--appBGColor);
			font-size: 5rem;
			margin: 0;
			padding: 0;
			text-shadow: 4px 5px 0px rgba(0, 0, 0, 0.8);
		}
		.headText {
			margin-top: -3px;
		}
	}
	.divider {
		background-color: var(--appDelColor);
		height: 250px;
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: 10px;
	}
	.navigation {
		align-items: flex-start;
		display: flex;
		flex-direction: column;
		position: relative;
		height: 150px;
		justify-content: center;
		left: 25px;
		.detailText {
			font-size: 1.0rem;
		}
		.homeButton {
			border: none;
			background-color: transparent;
			color: var(--appColorPrimary);
			cursor: pointer;
			font-size: 1.2rem;
			font-weight: bold;
			margin: 0;
			margin-top: 10px;
			outline: none;
			padding: 0;
		}
	}
</style>
