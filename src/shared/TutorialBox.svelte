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

<style>
	.infoBox {
		border: 2px solid var(--appColorPrimary);
		border-radius: 10px;
		margin: 10px;
	}
	.infoBox.noMargin {
		margin: 0;
	}
	.infoBox.warning {
		border: 2px solid var(--legendColor);
	}
	.infoBox.error {
		border: 2px solid var(--appDelColor);
	}
	.infoBox.clickable {
		cursor: pointer;
	}
	.infoIcon {
		align-items: center;
		background-color: var(--appColorPrimary);
		border: 3px solid var(--appColorPrimary);
		border-radius: 50%;
		color: white;
		display: flex;
		font-family: 'Times New Roman';
		font-weight: bold;
		height: 20px;
		justify-content: center;
		margin: 5px;
		padding: 3px;
		width: 20px;
	}
	.warningIcon,
		.warningIcon::before,
		.warningIcon::after {
		margin: 0;
		padding: 0;
		position: relative;
	}
	.warningIcon {
		color: transparent;
		font-size: 1.25rem;
		margin-left: 3px;
	}
	.warningIcon {
		background-color: transparent;
		border: none;
		border-radius: 0.625em;
		display: inline-block;
		height: 1.15em;
		overflow: hidden;
		top: 0.225em;
		width: 1.15em;
	}
	.warningIcon::before {
		border: transparent 0.6em solid;
		border-bottom-color: #fd3;
		border-bottom-width: 1em;
		border-top-width: 0;
		box-shadow: 0 1px 1px #999;
		content: "";
		display: block;
		left: 0.0em;
		position: absolute;
		top: -0.08em;
	}
	.warningIcon::after {
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
	.errorIcon {
		align-items: center;
		background-color: var(--appDelColor);
		border: 3px solid black;
		border-radius: 50%;
		color: black;
		display: flex;
		font-family: 'Times New Roman';
		font-weight: bold;
		height: 20px;
		justify-content: center;
		margin: 5px;
		padding: 3px;
		width: 20px;
	}
	.textArea {
		padding: 10px;
		padding-top: 0px;
		width: 100%;
	}
	.infoText {
		-ms-user-select: none;
		user-select: none;
		-webkit-user-select: none;
	}
</style>
