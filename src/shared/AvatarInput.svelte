<script>
	import { createEventDispatcher, getContext } from 'svelte';
	import HeroData from '../stores/HeroData.js';
	import AvatarPicker from '../modals/AvatarPicker.svelte';
	import ModalCloseButton from '../modals/ModalCloseButton.svelte';
	import LoadingSpinner from '../shared/LoadingSpinner.svelte';

	const dispatch = createEventDispatcher();
	const { open } = getContext('simple-modal');

	export let avatar = 'hogan';
	export let editable = true;
	export let size = '70px';
	export let loading = false;
	export let success = false;

	$: avatarHero = $HeroData.find(e => e.id === avatar);

	function handleAvatarChange(id) {
		dispatch('avatarChanged', {avatar: id});
	}

	function openAvatarPicker() {
		if(editable) {
			open(AvatarPicker, { onChange: handleAvatarChange, }, { closeButton: ModalCloseButton });
		}
	}
</script>

<div class="avatarInputContainer">
	<button type="button" class="avatarButton" on:click={openAvatarPicker} disabled={!editable}>
		<img
			class="avatar"
			class:success={success}
			src="{avatarHero.portrait}"
			alt="{avatarHero.name}"
			style="max-width: {size}"
			draggable="false">
	</button>
	<span class="avatarEdit" class:loading={loading} class:editLock={!editable}>
		{#if loading}
			<LoadingSpinner type="dual-ring" size="small" color="{window.getComputedStyle(document.documentElement).getPropertyValue('--appColorPrimary')}" />
		{:else}
			<button type="button" class="pencilButton" on:click={openAvatarPicker} disabled={!editable}>
				<img src="./img/utility/pencil_white.png" alt="edit avatar">
			</button>
		{/if}
	</span>
</div>

<style lang="scss">
	.avatarInputContainer {
		position: relative;
	}
	.avatarButton {
		background: transparent;
		border: none;
		cursor: pointer;
		outline: none;
		.avatar {
			border-radius: 50%;
			transition: outline 0.2s;
			&.success {
				outline: 2px solid var(--appColorQuaternary);
			}
		}
		&:disabled {
			cursor: default;
		}
	}
	.avatarEdit {
		bottom: 0px;
		display: inline-block;
		position: absolute;
		right: -20px;
		.pencilButton {
			background-color: transparent;
			border: none;
			cursor: pointer;
			outline: none;
			img {
				max-width: 20px;
				filter: invert(1);
				opacity: 0.7;
			}
		}
		&.editLock {
			display: none;
		}
	}
	@media only screen and (min-width: 767px) {
		.avatarInputContainer {
			&:hover > .avatarEdit {
				opacity: 1;
				visibility: visible;
			}
		}
		.avatarEdit {
			opacity: 0;
			transition: all 0.1s;
			visibility: hidden;
			&.loading {
				opacity: 1;
				visibility: visible;
			}
			&.editLock {
				display: none;
			}
		}
	}
</style>
