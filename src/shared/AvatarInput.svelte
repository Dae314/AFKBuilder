<script>
	import { createEventDispatcher, getContext } from 'svelte';
	import AppData from '../stores/AppData';
	import HeroData from '../stores/HeroData.js';
	import AvatarPicker from '../modals/AvatarPicker.svelte';
	import ModalCloseButton from '../modals/ModalCloseButton.svelte';

	const dispatch = createEventDispatcher();
	const { open } = getContext('simple-modal');

	export let avatar = 'hogan';
	export let editable = true;
	export let size = '70px';
	export let success = false;

	$: avatarHero = $HeroData.find(e => e.id === avatar);

	function handleAvatarChange(id) {
		dispatch('avatarChanged', {avatar: id});
	}

	function openAvatarPicker() {
		const bgColor = window.getComputedStyle(document.documentElement).getPropertyValue('--appBGColor');
		if(editable) {
			open(AvatarPicker,
			{ onChange: handleAvatarChange, },
			{ closeButton: ModalCloseButton,
				styleWindow: { background: bgColor },
				styleContent: {background: bgColor, borderRadius: '10px'},}
			);
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
	<span class="avatarEdit" class:editLock={!editable}>
		<button type="button" class="pencilButton" on:click={openAvatarPicker} disabled={!editable}>
			<img class:light={$AppData.colorProfile === 'light'} src="./img/utility/pencil_white.png" alt="edit avatar">
		</button>
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
				opacity: 0.7;
				&.light {
					filter: invert(1);
				}
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
			&.editLock {
				display: none;
			}
		}
	}
</style>
