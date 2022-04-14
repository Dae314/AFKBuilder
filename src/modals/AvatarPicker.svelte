<script>
	import {onMount, getContext} from 'svelte';
	import HeroData from '../stores/HeroData.js';
	import AppData from '../stores/AppData.js';

	let avatarList = $HeroData.map(e => e.id).sort();
	const { close } = getContext('simple-modal');

	export let onChange = () => {};

	onMount(async () => {
		history.pushState({view: $AppData.activeView, modal: true}, "Avatar Picker", `?modal=true${window.location.hash}`);
	});

	function handleAvatarChange(id) {
		onChange(id);
		close();
	}
</script>

<div id="avatarPicker" class="avatarPicker">
	{#each avatarList as avatarID}
		<div class="optionContainer">
			<button type="button" class="avatarButton" on:click={() => handleAvatarChange(avatarID)}>
				<img class="avatar" src="{$HeroData.find(e => e.id === avatarID).portrait}" alt="{$HeroData.find(e => e.id === avatarID).name}">
			</button>
		</div>
	{/each}
</div>

<style lang="scss">
	.avatarPicker {
		display: grid;
		grid-auto-rows: 85px;
		grid-template-columns: repeat(auto-fill, minmax(85px, 85px));
		justify-content: space-evenly;
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
</style>
