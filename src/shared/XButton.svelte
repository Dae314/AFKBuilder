<script>
	export let size = "small"
	export let hoverable = false;
	export let clickCallback = () => {};
	export let colorProfile = 'default';
</script>

<button
	type="button"
	class="xButton"
	class:small={size === 'sm' || size === 'small' }
	class:med={ size === 'med' || size === 'medium' }
	class:large={size === 'lg' || size === 'large' }
	class:hoverable={hoverable}
	class:light={colorProfile === 'light'}
	on:click|stopPropagation={clickCallback}>
</button>

<style lang="scss">
	.xButton{
		align-items: center;
		color: var(--appDelColor);
		cursor: pointer;
		display: flex;
		justify-content: center;
		background: var(--appBGColor);
		border-radius: 50%;
		flex-grow: 0;
		flex-shrink: 0;
		font-weight: bold;
		text-align: center;
		transition: all 0.2s;
		user-select: none;
		&.light {
			background: var(--appBGColorLight);
		}
	}
	.xButton:before {
		content: "×";
	}
	.xButton.large {
		border: none;
		box-shadow: var(--neu-sm-i-BGColor-shadow);
		font-size: 1.3rem;
		height: 25px;
		line-height: 1.3rem;
		padding: 2px;
		padding-bottom: 0px;
		width: 25px;
		&.light {
			box-shadow: var(--neu-sm-i-BGLight-shadow);
		}
	}
	.xButton.med {
		border: none;
		box-shadow: var(--neu-sm-i-BGColor-pressed-shadow);
		font-size: 0.8rem;
		height: 18px;
		line-height: 0.8rem;
		padding: 2px;
		width: 18px;
		&.light {
			box-shadow: var(--neu-sm-i-BGLight-pressed-shadow);
		}
	}
	.xButton.small {
		border: none;
		box-shadow: var(--neu-sm-i-BGColor-pressed-shadow);
		font-size: 0.4rem;
		height: 10px;
		line-height: 0.4rem;
		padding: 1px;
		width: 10px;
		&.light {
			box-shadow: var(--neu-sm-i-BGLight-pressed-shadow);
		}
	}
	@media only screen and (min-width: 767px) {
		.xButton.hoverable:hover {
			background: var(--appDelColor);
			color: var(--appBGColor);
		}
	}
</style>
