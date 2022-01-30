<script>
	import { createEventDispatcher, getContext } from 'svelte';
	import HeroData from '../stores/HeroData.js';
	import AvatarPicker from '../modals/AvatarPicker.svelte';
	import ModalCloseButton from '../modals/ModalCloseButton.svelte';

	const dispatch = createEventDispatcher();
	const { open } = getContext('simple-modal');

	export let avatar = 'hogan';

	$: avatarHero = $HeroData.find(e => e.id === avatar);

	function handleAvatarChange(id) {
		dispatch('avatarChanged', {avatar: id});
	}

	function openAvatarPicker() {
		open(AvatarPicker, { onChange: handleAvatarChange, }, { closeButton: ModalCloseButton });
	}
</script>

<div class="avatarInputContainer">
	<button type="button" class="avatarButton" on:click={openAvatarPicker}>
		<img class="avatar" src="{avatarHero.portrait}" alt="{avatarHero.name}">
	</button>
	<span class="avatarEdit">
		<img src="./img/utility/pencil.png" alt="edit avatar">
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
			max-width: 70px;
		}
	}
	.avatarEdit {
		bottom: 0px;
		display: inline-block;
		position: absolute;
		right: -20px;
		img {
			max-width: 20px;
			filter: invert(1);
		}
	}
	@media only screen and (min-width: 767px) {
		.avatarInputContainer {
			&:hover > .avatarEdit {
				display: inline-block;
			}
		}
		.avatarEdit {
			display: none;
		}
	}
</style>
