<script>
	// spinners from https://loading.io/css/

	export let type = '';
	export let size = 'medium';

	const root = document.documentElement;

	switch(size) {
		case 'small':
			root.style.setProperty('--dual-ring-size', "30px");
			root.style.setProperty('--dual-ring-border-size', "3px");
			break;
		case 'medium':
			root.style.setProperty('--dual-ring-size', "80px");
			root.style.setProperty('--dual-ring-border-size', "6px");
			break;
		case 'large':
			root.style.setProperty('--dual-ring-size', "130px");
			root.style.setProperty('--dual-ring-border-size', "10px");
			break;
		default:
			throw new Error(`ERROR: Invalid size property sent to LoadingSpinner component: ${size}`);
	}
	
</script>

{#if type === 'dual ring'}
	<div class="lds-dual-ring"></div>
{:else} <!-- show dual ring by default -->
	<div class="lds-dual-ring"></div>
{/if}

<style lang="scss">
	.lds-dual-ring {
		display: inline-block;
		height: var(--dual-ring-size);
		width: var(--dual-ring-size);
		&:after {
			content: '';
			display: block;
			width: calc(var(--dual-ring-size)*0.8);
			height: calc(var(--dual-ring-size)*0.8);
			margin: 8px;
			border-radius: 50%;
			border: var(--dual-ring-border-size) solid #fff;
			border-color: #fff transparent #fff transparent;
			animation: lds-dual-ring 1.2s linear infinite;
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
