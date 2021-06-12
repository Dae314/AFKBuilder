<script>
	// This property is used by Modal.svelte to pass down the close function
  export let onClose;
</script>

<div class="outer" on:click={onClose}>
	<div class="inner">
		<div class="label">Close</div>
	</div>
</div>

<style>
	.outer {
		cursor: pointer;
		height: 25px;
		position: absolute;
		right: 0px;
		top: -30px;
		width: 25px;
		z-index: 1;
	}
	.inner {
		height: inherit;
		text-align: center;
		width: inherit;
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
	}
	.inner:before, .inner:after {
		background-color: var(--appBGColor);
		content: '';
		height: 2px;
		left: 0;
		position: absolute;
		transition: all 0.3s ease-in;
		width: inherit;
	}
	.inner:before {
		top: 47.5%;
		transform: rotate(45deg);
	}
	.inner:after {
		bottom: 47.5%;
		transform: rotate(-45deg);
	}
	.outer:hover .label {
		opacity: 1;
	}
	.outer:hover .inner:before,
		.outer:hover .inner:after {
		transform: rotate(0);
	}
	.outer:hover .inner:before {
		top: 0;
	}
	.outer:hover .inner:after {
		bottom: 0;
	}
</style>
