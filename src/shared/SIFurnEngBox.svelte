<script>
	export let num = 0;
	export let type = "si";
	export let maxWidth = '60px';
	export let fontSize = '1.5rem';
	export let fullName = false;

	switch(type.toLowerCase()) {
		case 'si':
			switch(num) {
				case -1: break;
				case 0: break;
				case 5: break;
				case 10: break;
				case 15: break;
				case 20: break;
				case 25: break;
				case 30: break;
				case 35: break;
				case 40: break;
				default:
					throw new Error(`Invalid num specfified for SIFurnEngBox of si type: ${num}. Must be -1, 0, 5, 10, 15, 20, 25, 30, 35, or 40`);
			}
			break;
		case 'furn':
			switch(num) {
				case 0: break;
				case 3: break;
				case 9: break;
				default:
					throw new Error(`Invalid num specfified for SIFurnEngBox of furn type: ${num}. Must be 0, 3, or 9`);
			}
			break;
		default:
			throw new Error(`Invalid type specified for SIFurnEngBox: ${type}. Must be 'si' or 'furn'`);
	}
</script>

<div class="box {type === 'si' ? 'si' : 'furn'} lv-{num}" style="max-width: {maxWidth}; font-size: {fontSize}; width: {maxWidth};">
	{#if type === 'si'}
		{#if fullName}
			{#if num < 0}
				<p class="num">SI OFF</p>
			{:else}
				<p class="num">SI +{num}</p>
			{/if}
		{:else}
			{#if num < 0}
				<p class="num">OFF</p>
			{:else}
			<p class="num">+{num}</p>
			{/if}
		{/if}
	{:else}
		<p class="num">{num}f</p>
	{/if}
</div>

<style lang="scss">
	.box {
		align-items: center;
		background-color: var(--appColorPrimary);
		border: 5px solid var(--appColorPrimary);
		border-radius: 10px;
		color: white;
		display: flex;
		font-weight: bold;
		justify-content: center;
		margin: 0 auto;
		max-height: max-content;
		padding: 2px;
	}
	.num {
		margin: 0;
		padding: 0;
		user-select: none;
	}
	/* .si.lv-0 {
		border-color: #9F6F50;
		background-color: #9F6F50;
	}
	.si.lv-5 {
		border-color: #39AA39;
		background-color: #39AA39;
	}
	.si.lv-10 {
		border-color: #375C8B;
		background-color: #375C8B;
	}
	.si.lv-15 {
		border-color: #513C92;
		background-color: #513C92;
	}
	.si.lv-20 {
		border-color: #D49F47;
		background-color: #D49F47;
	}
	.si.lv-25 {
		border-color: #D44747;
		background-color: #D44747;
	}
	.si.lv-30 {
		border-color: #BF64C5;
		background-color: #BF64C5;
	}
	.furn.lv-0 {
		border-color: #375C8B;
		background-color: #375C8B;
	}
	.furn.lv-3 {
		border-color: #D44747;
		background-color: #D44747;
	}
	.furn.lv-9 {
		border-color: #BF64C5;
		background-color: #BF64C5;
	} */
</style>
