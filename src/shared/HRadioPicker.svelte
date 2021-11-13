<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let options = [];
	export let curOption = 0;
	export let onClick = () => {};
	export let disabled = false;
	
	function changeHandler(event) {
		if(!disabled) {
			curOption = event.target.value;
			onClick();
			dispatch('change', { value: curOption });
		}
	}
</script>

<div class="wrapper">
	<div class="toggle_radio" class:disabled>
		{#each options as opt, i}
			<input type="radio" class="toggle_option" id="toggle{i}" name="option" group="option" on:change={changeHandler} value={i} checked={curOption === i} disabled={disabled}/>
			<label for="toggle{i}"><p>{opt}</p></label>
		{/each}
		<div class="toggle_option_slider">
		 </div>
	</div>
</div>

<style lang="scss">
	.toggle_radio {
		display: flex;
		width: fit-content;
	}
	.toggle_radio {
		input[type=radio] {
			display: none;
			&:checked + label {
				background-color: var(--appColorPriAccent);
				color: white;
			}
		}
		label {
			align-items: center;
			border-radius: 4px;
			cursor: pointer;
			display: flex;
			justify-content: center;
			margin: 0;
			padding: 2px 8px;
			text-align: center;
			transition: all 0.2s;
			user-select: none;
			p {
				margin: 0;
				padding: 0;
			}
		}
	}
	.toggle_radio.disabled {
		border: 2px solid var(--appColorDisabled);
		input[type=radio]:checked + label {
			background-color: var(--appColorDisabled);
		}
		label {
			cursor: default;
		}
	}
</style>
