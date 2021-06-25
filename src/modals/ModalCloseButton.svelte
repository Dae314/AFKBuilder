<script>
	// This property is used by Modal.svelte to pass down the close function
  export let onClose;
</script>

<div class="outer" on:click={onClose}>
	<div class="inner">
		<div class="label">Close</div>
	</div>
</div>

<style lang="scss">
	.outer {
		cursor: pointer;
		height: 25px;
		position: absolute;
		right: 0px;
		top: -30px;
		width: 25px;
		z-index: 1;
		&:hover {
			.label {
				opacity: 1;
			}
			.inner {
				&:before {
					transform: rotate(0);
					top: 0;
				}
				&:after {
					transform: rotate(0);
					bottom: 0;
				}
			}
		}
	}
	.inner {
		height: inherit;
		text-align: center;
		width: inherit;
		&:before {
			background-color: var(--appBGColor);
			content: '';
			height: 2px;
			left: 0;
			position: absolute;
			transition: all 0.3s ease-in;
			width: inherit;
			top: 47.5%;
			transform: rotate(45deg);
		}
		&:after {
			background-color: var(--appBGColor);
			content: '';
			height: 2px;
			left: 0;
			position: absolute;
			transition: all 0.3s ease-in;
			width: inherit;
			bottom: 47.5%;
			transform: rotate(-45deg);
		}
	}
	.label {
		bottom: 20px;
		color: var(--appBGColor);
		cursor: pointer;
		font-size: 0.6rem;
		height: inherit;
		line-height: 4rem;
		opacity: 0;
		position: relative;
		text-transform: uppercase;
		transition: all 0.3s ease-in;
		user-select: none;
	}
</style>
