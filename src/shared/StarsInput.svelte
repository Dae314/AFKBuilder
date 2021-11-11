<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	const star_array = [ 1, 2, 3, 4, 5 ]
	let hover = -1;
	export let value = 0;
	export let enabled = true;

	function handleStarClick(starid) {
		if(enabled) {
			if(value === starid) {
				value = 0; // reset stars to 0 if user clicks on the exact same stars
			} else {
				value = starid; // set stars to whatever the user clicked on otherwise
			}
			dispatch('change', { value: value });
		}
	}

	function handleStarHover(starid) {
		if(enabled) hover = starid;
	}
</script>

<div class="starsContainer" on:mouseleave={() => hover = -1}>
	{#each star_array as starid}
		<div class="singleStarContainer" class:enabled on:click={(e) => handleStarClick(starid)} on:mouseenter={() => handleStarHover(starid)}>
			<i class="star"
				class:enabled
				class:active={value >= starid}
				class:hovered={hover >= starid}>
			</i>
		</div>
	{/each}
</div>

<style lang="scss">
	.starsContainer {
		width: fit-content;
	}
	.singleStarContainer {
		display: inline-block;
		&.enabled {
			cursor: pointer;
		}
	}
	.star {
		border-bottom: .7em solid lightgray;
		border-left: .3em solid transparent;
		border-right: .3em solid transparent;
		display: inline-block;
		font-size: 0.7rem;
		height: 0;
		margin-bottom: 1.2em;
		margin-left: .9em;
		margin-right: .9em;
		position: relative;
		width: 0;
		&:before {
			border-bottom: .7em solid lightgray;
			border-left: 1em solid transparent;
			border-right: 1em solid transparent;
			content: '';
			display: block;
			height: 0;
			left: -1em;
			position: absolute;
			top: .6em;
			transform: rotate(-35deg);
			width: 0;
		}
		&:after {
			border-bottom: .7em solid lightgray;
			border-left: 1em solid transparent;
			border-right: 1em solid transparent;
			content: '';
			display: block;
			height: 0;
			left: -1em;
			position: absolute;
			top: .6em;
			transform: rotate(-35deg);
			width: 0;
			transform: rotate(35deg);
		}
	}
	.star.enabled {
		border-bottom: .7em solid gray;
		&:before {
			border-bottom: .7em solid gray;
		}
		&:after {
			border-bottom: .7em solid gray;
		}
	}
	.star.hovered {
		border-bottom-color: rgb(255, 226, 132);
		&:before {
			border-bottom-color: rgb(255, 226, 132);
		}
		&:after {
			border-bottom-color: rgb(255, 226, 132);
		}
	}
	.star.active {
		border-bottom-color: var(--legendColor);
		&:before {
			border-bottom-color: var(--legendColor);
		}
		&:after {
			border-bottom-color: var(--legendColor);
		}
	}
</style>
