<script>
	import { createEventDispatcher } from 'svelte';
	import HeroData from '../stores/HeroData.js';

	const dispatch = createEventDispatcher();

	export let avatar = 'hogan';
	let pickerVisible = false;
	let avatarList = $HeroData.map(e => e.id);

	$: avatarHero = $HeroData.find(e => e.id === avatar);

	function handleAvatarChange(id) {
		dispatch('avatarChanged', {avatar: id});
		const menu = document.getElementById('avatarPicker');
		menu.scrollTop = 0;
		pickerVisible = false;
	}
</script>

<div class="avatarInputContainer">
	<button type="button" class="avatarButton" on:click={() => pickerVisible = !pickerVisible}>
		<img class="avatar" src="{avatarHero.portrait}" alt="{avatarHero.name}">
	</button>
	<div id="avatarPicker" class="avatarPicker" class:visible={pickerVisible}>
		{#each avatarList as avatarID}
			<div class="optionContainer">
				<button type="button" class="avatarButton" on:click={() => handleAvatarChange(avatarID)}>
					<img class="avatar" src="{$HeroData.find(e => e.id === avatarID).portrait}" alt="{$HeroData.find(e => e.id === avatarID).name}">
				</button>
			</div>
		{/each}
	</div>
</div>

<style lang="scss">
	.avatarInputContainer {
		position: relative;
	}
	.avatarButton {
		.avatar {
			border-radius: 50%;
			max-width: 70px;
		}
	}
	.avatarPicker {
		display: none;
		height: 250px;
		overflow-y: auto;
		width: 500px;
		&.visible {
			display: grid;
			grid-auto-rows: 90px;
			grid-template-columns: repeat(auto-fill, minmax(90px, 90px));
			position: relative;
		}
	}
</style>
