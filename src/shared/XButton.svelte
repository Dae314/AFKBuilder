<script>
	export let size = "small"
	export let hoverable = false;
	export let clickCallback = () => {};
</script>

<button
	type="button"
	class="xButton"
	class:small={size === 'sm' || size === 'small' }
	class:med={ size === 'med' || size === 'medium' }
	class:large={size === 'lg' || size === 'large' }
	class:hoverable={hoverable}
	on:click={e => {clickCallback(); e.stopPropagation();}}>
</button>

<style lang="scss">
	.xButton{
		align-items: center;
		color: white;
		cursor: pointer;
		display: flex;
		justify-content: center;
		background: var(--appDelColor);
		border-radius: 50%;
		flex-grow: 0;
		flex-shrink: 0;
		font-weight: bold;
		text-align: center;
		transition: all 0.2s;
		user-select: none;
	}
	.xButton:before {
		content: "×";
	}
	.xButton.large {
		border: 2px solid var(--appDelColor);
		font-size: 1.3rem;
		height: 25px;
		line-height: 1.3rem;
		padding: 2px;
		padding-bottom: 0px;
		width: 25px;
	}
	.xButton.med {
		border: 2px solid var(--appDelColor);
		font-size: 0.8rem;
		height: 18px;
		line-height: 0.8rem;
		padding: 2px;
		width: 18px;
	}
	.xButton.small {
		border: 1px solid var(--appDelColor);
		font-size: 0.4rem;
		height: 10px;
		line-height: 0.4rem;
		padding: 1px;
		width: 10px;
	}
	@media only screen and (min-width: var(--mobileWidthBreakpoint)) {
		.xButton.hoverable:hover {
			background: transparent;
			color: var(--appDelColor);
		}
	}
</style>
