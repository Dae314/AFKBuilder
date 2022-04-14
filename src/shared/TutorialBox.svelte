<script>
	export let noMargin = false;
	export let warning = false;
	export let error = false;
	export let clickable = false;
	export let onClick = () => {};

	function handleBoxClick() {
		onClick();
	}
</script>

<div class="infoBox" class:warning={warning} class:error={error} class:noMargin={noMargin} on:click={handleBoxClick} class:clickable={clickable}>
	{#if error}
		<span class="errorIcon">!</span>
	{:else if warning}
		<span class="warningIcon"></span>
	{:else}
		<span class="infoIcon">i</span>
	{/if}
	<div class="textArea">
		<span class="infoText"><slot></slot></span>
	</div>
</div>

<style lang="scss">
	.infoBox {
		border-radius: 10px;
		box-shadow: var(--neu-med-ni-BGColor-shadow);
		margin: 10px;
		padding: 5px;
	}
	.infoBox.noMargin {
		margin: 0;
	}
	.infoBox.warning {
		background-color: #f5e6bd;
	}
	.infoBox.error {
		background-color: #f0b6b6;
	}
	.infoBox.clickable {
		cursor: pointer;
	}
	.infoIcon {
		align-items: center;
		background-color: var(--appColorPrimary);
		border-radius: 50%;
		color: var(--appBGColor);
		display: flex;
		font-family: 'Times New Roman';
		font-weight: bold;
		height: 23px;
		justify-content: center;
		margin: 5px;
		padding: 3px;
		width: 23px;
	}
	.warningIcon {
		margin: 0;
		padding: 0;
		position: relative;
		color: transparent;
		font-size: 1.25rem;
		margin-left: 3px;
		background-color: transparent;
		border: none;
		border-radius: 0.625em;
		display: inline-block;
		height: 1.15em;
		overflow: hidden;
		top: 0.225em;
		width: 1.15em;
		&::before {
			margin: 0;
			padding: 0;
			position: relative;
			border: transparent 0.6em solid;
			border-bottom-color: #fd3;
			border-bottom-width: 1em;
			border-top-width: 0;
			box-shadow: 0 1px 1px #ccccce;
			content: "";
			display: block;
			left: 0.0em;
			position: absolute;
			top: -0.08em;
		}
		&::after {
			margin: 0;
			padding: 0;
			position: relative;
			color: #333;
			content: "!";
			display: block;
			font-family: "Garamond";
			font-size: 0.65em;
			font-weight: bold;
			left: 0;
			padding: 0 1px;
			position: absolute;
			text-align: center;
			top: 0.3em;
			width: 100%;
		}
	}
	.errorIcon {
		align-items: center;
		background-color: var(--appDelColor);
		border-radius: 50%;
		color: var(--appBGColor);
		display: flex;
		font-family: 'Times New Roman';
		font-weight: bold;
		height: 23px;
		justify-content: center;
		margin: 5px;
		padding: 3px;
		width: 23px;
	}
	.textArea {
		padding: 10px;
		padding-top: 0px;
		width: 100%;
	}
	.infoText {
		user-select: none;
	}
</style>
