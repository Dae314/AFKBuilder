<script>
	// spinners from https://loading.io/css/

	export let type = '';
	export let size = 'medium';
	export let color = 'white';

	const root = document.documentElement;
	root.style.setProperty('--spinner-color', color);

	switch(size) {
		case 'small':
			root.style.setProperty('--spinner-size', "30px");
			root.style.setProperty('--spinner-border-size', "3px");
			root.style.setProperty('--spinner-thickness', "8px");
			root.style.setProperty('--spinner-gap', "12px");
			break;
		case 'medium':
			root.style.setProperty('--spinner-size', "80px");
			root.style.setProperty('--spinner-border-size', "6px");
			root.style.setProperty('--spinner-thickness', "16px");
			root.style.setProperty('--spinner-gap', "24px");
			
			break;
		case 'large':
			root.style.setProperty('--spinner-size', "130px");
			root.style.setProperty('--spinner-border-size', "10px");
			root.style.setProperty('--spinner-thickness', "24px");
			root.style.setProperty('--spinner-gap', "36px");
			break;
		default:
			throw new Error(`ERROR: Invalid size property sent to LoadingSpinner component: ${size}`);
	}
	
</script>

{#if type === 'dual-ring'}
	<div class="lds-dual-ring"></div>
{:else if type === 'ripple'}
	<div class="lds-ripple"><div></div><div></div></div>
{:else if type === 'facebook'}
	<div class="lds-facebook"><div></div><div></div><div></div></div>
{:else} <!-- show dual ring by default -->
	<div class="lds-dual-ring"></div>
{/if}

<style lang="scss">
	.lds-dual-ring {
		display: inline-block;
		// height: var(--spinner-size);
		// width: var(--spinner-size);
		&:after {
			content: '';
			display: block;
			width: calc(var(--spinner-size)*0.8);
			height: calc(var(--spinner-size)*0.8);
			margin: 8px;
			border-radius: 50%;
			border: var(--spinner-border-size) solid var(--spinner-color);
			border-color: var(--spinner-color) transparent var(--spinner-color) transparent;
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
	.lds-ripple {
		display: inline-block;
		position: relative;
		width: var(--spinner-size);
		height: var(--spinner-size);
		div {
			position: absolute;
			border: calc(var(--spinner-border-size) - 1px) solid var(--spinner-color);
			opacity: 1;
			border-radius: 50%;
			animation: lds-ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
			&:nth-child(2) {
				animation-delay: -0.5s;
			}
		}
	}
	@keyframes lds-ripple {
		0% {
			top: calc(var(--spinner-size)*0.425);
			left: calc(var(--spinner-size)*0.425);
			width: 0;
			height: 0;
			opacity: 1;
		}
		100% {
			top: 0px;
			left: 0px;
			width: calc(var(--spinner-size)*0.9);
			height: calc(var(--spinner-size)*0.9);
			opacity: 0;
		}
	}
	.lds-facebook {
		display: inline-block;
		position: relative;
		width: var(--spinner-size);
		height: var(--spinner-size);
		div {
			display: inline-block;
			position: absolute;
			left: 8px;
			width: var(--spinner-thickness);
			background: #fff;
			animation: lds-facebook 1.2s cubic-bezier(0, 0.5, 0.5, 1) infinite;
			&:nth-child(1) {
				left: calc(var(--spinner-gap) * 0 + 8px);
				animation-delay: -0.24s;
			}
			&:nth-child(2) {
				left: calc(var(--spinner-gap) * 1 + 8px);
				animation-delay: -0.12s;
			}
			&:nth-child(3) {
				left: calc(var(--spinner-gap) * 2 + 8px);
				animation-delay: 0;
			}
		}
	}
	@keyframes lds-facebook {
		0% {
			top: calc(var(--spinner-size)*0.1);
			height: calc(var(--spinner-size)*0.8);
		}
		50%, 100% {
			top: calc(var(--spinner-size)*0.3);
			height: calc(var(--spinner-size)*0.4);
		}
	}
</style>
